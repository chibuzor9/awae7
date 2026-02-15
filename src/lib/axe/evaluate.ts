import {
	chromium,
	type Browser,
	type BrowserContext,
	type Page,
} from 'playwright'
import AxeBuilder from '@axe-core/playwright'

// ---------------------------------------------------------------------------
// Types for raw axe-core output returned by this module
// ---------------------------------------------------------------------------

/** Individual check result returned by axe-core per node. */
export interface RawAxeCheck {
	id: string
	impact: string | null
	message: string
	data: Record<string, unknown> | null
	relatedNodes: { html: string; target: string[] }[]
}

export interface RawAxeNode {
	html: string
	target: string[]
	ancestry: string[]
	sourceContext?: string[]
	impact: string | null
	failureSummary: string
	any: RawAxeCheck[]
	all: RawAxeCheck[]
	none: RawAxeCheck[]
}

export interface RawAxeViolation {
	id: string
	impact: string
	description: string
	help: string
	helpUrl: string
	tags: string[]
	nodes: RawAxeNode[]
}

export interface RawAxePass {
	id: string
	description: string
	help: string
	helpUrl: string
	tags: string[]
	nodes: { html: string; target: string[]; ancestry: string[] }[]
}

export interface RawAxeIncomplete {
	id: string
	impact: string
	description: string
	help: string
	helpUrl: string
	tags: string[]
	nodes: RawAxeNode[]
}

export interface RawAxeInapplicable {
	id: string
	description: string
	help: string
	helpUrl: string
	tags: string[]
}

export interface RawTestEnvironment {
	userAgent: string
	windowWidth: number
	windowHeight: number
	orientationAngle: number
	orientationType: string
}

export interface RawEvaluationResult {
	url: string
	timestamp: string
	axeCoreVersion: string
	testEnvironment: RawTestEnvironment
	fullSourceHtml?: string
	violations: RawAxeViolation[]
	passes: RawAxePass[]
	incomplete: RawAxeIncomplete[]
	inapplicable: RawAxeInapplicable[]
}

// ---------------------------------------------------------------------------
// URL validation helper
// ---------------------------------------------------------------------------
function isValidUrl(input: string): boolean {
	try {
		const parsed = new URL(input)
		return parsed.protocol === 'http:' || parsed.protocol === 'https:'
	} catch {
		return false
	}
}

async function resolveNodeHtmlFromPage(
	page: Page,
	rawNode: any
): Promise<string> {
	const selectors = Array.isArray(rawNode?.target)
		? rawNode.target.map(String)
		: []

	for (const selector of selectors) {
		if (!selector) continue

		try {
			const outerHtml = await page.evaluate(sel => {
				try {
					const element = document.querySelector(sel)
					return element?.outerHTML ?? null
				} catch {
					return null
				}
			}, selector)

			if (outerHtml && outerHtml.trim()) {
				return outerHtml
			}
		} catch {
			continue
		}
	}

	return rawNode?.html ?? ''
}

async function resolveAncestorHtmlContext(
	page: Page,
	rawNode: any,
	currentNodeHtml: string
): Promise<string[]> {
	const ancestry = Array.isArray(rawNode?.ancestry)
		? rawNode.ancestry.map(String)
		: []

	if (ancestry.length === 0) return []

	const contextSnippets: string[] = []
	const seen = new Set<string>()

	for (let index = ancestry.length - 1; index >= 0; index -= 1) {
		const selector = ancestry[index]
		if (!selector || seen.has(selector)) continue
		seen.add(selector)

		try {
			const outerHtml = await page.evaluate(sel => {
				try {
					const element = document.querySelector(sel)
					return element?.outerHTML ?? null
				} catch {
					return null
				}
			}, selector)

			if (!outerHtml || !outerHtml.trim()) continue
			if (outerHtml === currentNodeHtml) continue

			contextSnippets.push(
				outerHtml.length > 4000
					? `${outerHtml.slice(0, 4000)}\n<!-- truncated -->`
					: outerHtml
			)

			if (contextSnippets.length >= 3) break
		} catch {
			continue
		}
	}

	return contextSnippets
}

// ---------------------------------------------------------------------------
// Core evaluation function
// ---------------------------------------------------------------------------

/**
 * Launches a headless Chromium browser via Playwright, navigates to `url`,
 * and runs an axe-core accessibility audit scoped to WCAG 2.2 Level A & AA.
 *
 * Returns structured results that can be fed into the transform layer.
 */
export async function evaluateUrl(url: string): Promise<RawEvaluationResult> {
	// ---- Pre-flight validation ----
	if (!url || typeof url !== 'string') {
		throw new Error('A valid URL string is required.')
	}

	const trimmedUrl = url.trim()

	if (!isValidUrl(trimmedUrl)) {
		throw new Error(
			`Invalid URL: "${trimmedUrl}". The URL must start with http:// or https://.`
		)
	}

	let browser: Browser | null = null
	let context: BrowserContext | null = null
	let page: Page | null = null

	try {
		// ---- Launch browser ----
		browser = await chromium.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
			],
		})

		context = await browser.newContext({
			userAgent:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
				'(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			viewport: { width: 1280, height: 720 },
			ignoreHTTPSErrors: true,
		})

		page = await context.newPage()

		// ---- Navigate ----
		try {
			const response = await page.goto(trimmedUrl, {
				waitUntil: 'domcontentloaded',
				timeout: 30_000,
			})

			if (response) {
				const status = response.status()

				if (status === 404) {
					throw new Error(
						`Resource not found (404) for "${trimmedUrl}". The page does not exist.`
					)
				}

				if (status === 401 || status === 403) {
					throw new Error(
						`Access denied (${status}) for "${trimmedUrl}". The site blocked access or requires authentication.`
					)
				}

				if (status >= 500) {
					throw new Error(
						`Server returned ${status} for "${trimmedUrl}". The site may be temporarily unavailable.`
					)
				}

				if (status >= 400) {
					throw new Error(
						`Failed to retrieve page. Server returned ${status} for "${trimmedUrl}".`
					)
				}
			}

			// Wait for the page to fully settle (handles redirects, late JS navigations)
			await page
				.waitForLoadState('networkidle', { timeout: 15_000 })
				.catch(() => {
					// networkidle may not fire on busy pages — fall through
				})
		} catch (navError: unknown) {
			const message =
				navError instanceof Error ? navError.message : String(navError)

			if (message.includes('Timeout') || message.includes('timeout')) {
				throw new Error(
					`Navigation timed out after 30 seconds for URL: "${trimmedUrl}". ` +
						'The page may be too slow to load or unreachable.'
				)
			}

			if (
				message.includes('net::ERR_NAME_NOT_RESOLVED') ||
				message.includes('net::ERR_DNS')
			) {
				throw new Error(
					`DNS lookup failed for "${trimmedUrl}". Check the domain name and try again.`
				)
			}

			if (
				message.includes('net::ERR_CONNECTION_REFUSED') ||
				message.includes('net::ERR_ADDRESS_UNREACHABLE')
			) {
				throw new Error(
					`Connection refused by "${trimmedUrl}". The host is reachable but not accepting connections.`
				)
			}

			if (message.includes('net::ERR_CONNECTION_TIMED_OUT')) {
				throw new Error(
					`Connection timed out while reaching "${trimmedUrl}". The host may be slow or unreachable.`
				)
			}

			if (message.includes('net::ERR_INTERNET_DISCONNECTED')) {
				throw new Error(
					'Network is offline. Please check your internet connection and try again.'
				)
			}

			if (
				message.includes('net::ERR_SSL') ||
				message.includes('net::ERR_CERT')
			) {
				throw new Error(
					`Secure connection failed for "${trimmedUrl}" due to an SSL/TLS certificate issue.`
				)
			}

			throw new Error(`Failed to navigate to "${trimmedUrl}": ${message}`)
		}

		// ---- Wait for the page to stabilize ----
		await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {
			// Some pages never fully fire 'load' — continue anyway
		})
		await page.waitForTimeout(1_500)

		// ---- Run axe-core (retry once if context is destroyed by late navigation) ----
		// Tags: WCAG 2.0 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA + best-practice rules
		const axeTags = [
			'wcag2a',
			'wcag2aa',
			'wcag21a',
			'wcag21aa',
			'wcag22aa',
			'best-practice',
		]

		let axeResults
		const axeOptions = {
			resultTypes: [
				'violations',
				'passes',
				'incomplete',
				'inapplicable',
			] as const,
			ancestry: true,
			preload: true,
		}

		try {
			axeResults = await new AxeBuilder({ page })
				.withTags(axeTags)
				.options(axeOptions as any)
				.analyze()
		} catch (axeError: unknown) {
			const msg =
				axeError instanceof Error ? axeError.message : String(axeError)
			if (
				msg.includes('context was destroyed') ||
				msg.includes('navigation')
			) {
				// A late redirect happened — wait for the new page and retry
				await page
					.waitForLoadState('load', { timeout: 15_000 })
					.catch(() => {})
				await page.waitForTimeout(1_000)
				axeResults = await new AxeBuilder({ page })
					.withTags(axeTags)
					.options(axeOptions as any)
					.analyze()
			} else {
				throw axeError
			}
		}

		// ---- Helper: map axe check results ----
		const mapChecks = (checks: any[]): RawAxeCheck[] =>
			(checks ?? []).map((c: any) => ({
				id: c.id ?? '',
				impact: c.impact ?? null,
				message: c.message ?? '',
				data: c.data ?? null,
				relatedNodes: (c.relatedNodes ?? []).map((rn: any) => ({
					html: rn.html ?? '',
					target: Array.isArray(rn.target)
						? rn.target.map(String)
						: [],
				})),
			}))

		// ---- Build result ----
		const violations: RawAxeViolation[] = await Promise.all(
			axeResults.violations.map(async v => ({
				id: v.id,
				impact: v.impact ?? 'minor',
				description: v.description,
				help: v.help,
				helpUrl: v.helpUrl,
				tags: v.tags,
				nodes: await Promise.all(
					v.nodes.map(async n => {
						const nodeHtml = await resolveNodeHtmlFromPage(page, n)
						const sourceContext = await resolveAncestorHtmlContext(
							page,
							n,
							nodeHtml
						)

						return {
							html: nodeHtml,
							target: n.target.map(String),
							ancestry: Array.isArray((n as any).ancestry)
								? (n as any).ancestry.map(String)
								: [],
							sourceContext,
							impact: (n as any).impact ?? null,
							failureSummary: n.failureSummary ?? '',
							any: mapChecks((n as any).any),
							all: mapChecks((n as any).all),
							none: mapChecks((n as any).none),
						}
					})
				),
			}))
		)

		const passes: RawAxePass[] = axeResults.passes.map(p => ({
			id: p.id,
			description: p.description,
			help: p.help,
			helpUrl: p.helpUrl,
			tags: p.tags,
			nodes: p.nodes.map(n => ({
				html: n.html,
				target: n.target.map(String),
				ancestry: Array.isArray((n as any).ancestry)
					? (n as any).ancestry.map(String)
					: [],
			})),
		}))

		const incomplete: RawAxeIncomplete[] = await Promise.all(
			(axeResults.incomplete ?? []).map(async (i: any) => ({
				id: i.id,
				impact: i.impact ?? 'moderate',
				description: i.description,
				help: i.help,
				helpUrl: i.helpUrl,
				tags: i.tags,
				nodes: await Promise.all(
					(i.nodes ?? []).map(async (n: any) => {
						const nodeHtml = await resolveNodeHtmlFromPage(page, n)
						const sourceContext = await resolveAncestorHtmlContext(
							page,
							n,
							nodeHtml
						)

						return {
							html: nodeHtml,
							target: Array.isArray(n.target)
								? n.target.map(String)
								: [],
							ancestry: Array.isArray(n.ancestry)
								? n.ancestry.map(String)
								: [],
							sourceContext,
							impact: n.impact ?? null,
							failureSummary: n.failureSummary ?? '',
							any: mapChecks(n.any),
							all: mapChecks(n.all),
							none: mapChecks(n.none),
						}
					})
				),
			}))
		)

		const inapplicable: RawAxeInapplicable[] = (
			axeResults.inapplicable ?? []
		).map((r: any) => ({
			id: r.id,
			description: r.description,
			help: r.help,
			helpUrl: r.helpUrl,
			tags: r.tags,
		}))

		// ---- Test environment ----
		const testEnv: RawTestEnvironment = {
			userAgent: axeResults.testEnvironment?.userAgent ?? '',
			windowWidth: axeResults.testEnvironment?.windowWidth ?? 0,
			windowHeight: axeResults.testEnvironment?.windowHeight ?? 0,
			orientationAngle: axeResults.testEnvironment?.orientationAngle ?? 0,
			orientationType: axeResults.testEnvironment?.orientationType ?? '',
		}

		const fullSourceHtml = await page.content()

		return {
			url: trimmedUrl,
			timestamp: new Date().toISOString(),
			axeCoreVersion: axeResults.testEngine.version,
			testEnvironment: testEnv,
			fullSourceHtml,
			violations,
			passes,
			incomplete,
			inapplicable,
		}
	} catch (error: unknown) {
		// Re-throw our own errors as-is; wrap unexpected errors
		if (error instanceof Error) {
			const knownPrefix = [
				'Invalid URL',
				'Navigation timed out',
				'DNS lookup failed',
				'Connection refused',
				'Connection timed out',
				'Network is offline',
				'Secure connection failed',
				'Resource not found',
				'Access denied',
				'Server returned',
				'Failed to retrieve page',
				'Failed to navigate',
			]

			if (knownPrefix.some(prefix => error.message.startsWith(prefix))) {
				throw error
			}
		}

		const msg = error instanceof Error ? error.message : String(error)
		throw new Error(`Evaluation failed for "${url}": ${msg}`)
	} finally {
		// ---- Cleanup ----
		try {
			if (page) await page.close()
		} catch {
			/* swallow */
		}

		try {
			if (context) await context.close()
		} catch {
			/* swallow */
		}

		try {
			if (browser) await browser.close()
		} catch {
			/* swallow */
		}
	}
}

// ---------------------------------------------------------------------------
// HTML content evaluation function
// ---------------------------------------------------------------------------

/**
 * Launches a headless Chromium browser, loads raw HTML content via
 * page.setContent(), and runs an axe-core accessibility audit.
 *
 * @param html     The full HTML string to evaluate
 * @param fileName Optional original filename for display purposes
 */
export async function evaluateHtml(
	html: string,
	fileName?: string
): Promise<RawEvaluationResult> {
	if (!html || typeof html !== 'string' || !html.trim()) {
		throw new Error(
			'HTML content is required and must be a non-empty string.'
		)
	}

	let browser: Browser | null = null
	let context: BrowserContext | null = null
	let page: Page | null = null

	try {
		browser = await chromium.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
			],
		})

		context = await browser.newContext({
			userAgent:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
				'(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			viewport: { width: 1280, height: 720 },
		})

		page = await context.newPage()

		// ---- Load HTML content ----
		await page.setContent(html, {
			waitUntil: 'domcontentloaded',
			timeout: 15_000,
		})

		// Allow small delay for any inline scripts to execute
		await page.waitForTimeout(500)

		// ---- Run axe-core ----
		const axeTags = [
			'wcag2a',
			'wcag2aa',
			'wcag21a',
			'wcag21aa',
			'wcag22aa',
			'best-practice',
		]

		const axeResults = await new AxeBuilder({ page })
			.withTags(axeTags)
			.options({
				resultTypes: [
					'violations',
					'passes',
					'incomplete',
					'inapplicable',
				] as const,
				ancestry: true,
				preload: true,
			} as any)
			.analyze()

		// ---- Helper: map axe check results ----
		const mapChecks = (checks: any[]): RawAxeCheck[] =>
			(checks ?? []).map((c: any) => ({
				id: c.id ?? '',
				impact: c.impact ?? null,
				message: c.message ?? '',
				data: c.data ?? null,
				relatedNodes: (c.relatedNodes ?? []).map((rn: any) => ({
					html: rn.html ?? '',
					target: Array.isArray(rn.target)
						? rn.target.map(String)
						: [],
				})),
			}))

		// ---- Build result ----
		const violations: RawAxeViolation[] = await Promise.all(
			axeResults.violations.map(async v => ({
				id: v.id,
				impact: v.impact ?? 'minor',
				description: v.description,
				help: v.help,
				helpUrl: v.helpUrl,
				tags: v.tags,
				nodes: await Promise.all(
					v.nodes.map(async n => {
						const nodeHtml = await resolveNodeHtmlFromPage(page, n)
						const sourceContext = await resolveAncestorHtmlContext(
							page,
							n,
							nodeHtml
						)

						return {
							html: nodeHtml,
							target: n.target.map(String),
							ancestry: Array.isArray((n as any).ancestry)
								? (n as any).ancestry.map(String)
								: [],
							sourceContext,
							impact: (n as any).impact ?? null,
							failureSummary: n.failureSummary ?? '',
							any: mapChecks((n as any).any),
							all: mapChecks((n as any).all),
							none: mapChecks((n as any).none),
						}
					})
				),
			}))
		)

		const passes: RawAxePass[] = axeResults.passes.map(p => ({
			id: p.id,
			description: p.description,
			help: p.help,
			helpUrl: p.helpUrl,
			tags: p.tags,
			nodes: p.nodes.map(n => ({
				html: n.html,
				target: n.target.map(String),
				ancestry: Array.isArray((n as any).ancestry)
					? (n as any).ancestry.map(String)
					: [],
			})),
		}))

		const incomplete: RawAxeIncomplete[] = await Promise.all(
			(axeResults.incomplete ?? []).map(async (i: any) => ({
				id: i.id,
				impact: i.impact ?? 'moderate',
				description: i.description,
				help: i.help,
				helpUrl: i.helpUrl,
				tags: i.tags,
				nodes: await Promise.all(
					(i.nodes ?? []).map(async (n: any) => {
						const nodeHtml = await resolveNodeHtmlFromPage(page, n)
						const sourceContext = await resolveAncestorHtmlContext(
							page,
							n,
							nodeHtml
						)

						return {
							html: nodeHtml,
							target: Array.isArray(n.target)
								? n.target.map(String)
								: [],
							ancestry: Array.isArray(n.ancestry)
								? n.ancestry.map(String)
								: [],
							sourceContext,
							impact: n.impact ?? null,
							failureSummary: n.failureSummary ?? '',
							any: mapChecks(n.any),
							all: mapChecks(n.all),
							none: mapChecks(n.none),
						}
					})
				),
			}))
		)

		const inapplicable: RawAxeInapplicable[] = (
			axeResults.inapplicable ?? []
		).map((r: any) => ({
			id: r.id,
			description: r.description,
			help: r.help,
			helpUrl: r.helpUrl,
			tags: r.tags,
		}))

		const testEnv: RawTestEnvironment = {
			userAgent: axeResults.testEnvironment?.userAgent ?? '',
			windowWidth: axeResults.testEnvironment?.windowWidth ?? 0,
			windowHeight: axeResults.testEnvironment?.windowHeight ?? 0,
			orientationAngle: axeResults.testEnvironment?.orientationAngle ?? 0,
			orientationType: axeResults.testEnvironment?.orientationType ?? '',
		}

		const fullSourceHtml = await page.content()

		return {
			url: fileName ? `file://${fileName}` : 'file://uploaded.html',
			timestamp: new Date().toISOString(),
			axeCoreVersion: axeResults.testEngine.version,
			testEnvironment: testEnv,
			fullSourceHtml,
			violations,
			passes,
			incomplete,
			inapplicable,
		}
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error)
		throw new Error(`HTML evaluation failed: ${msg}`)
	} finally {
		try {
			if (page) await page.close()
		} catch {
			/* swallow */
		}
		try {
			if (context) await context.close()
		} catch {
			/* swallow */
		}
		try {
			if (browser) await browser.close()
		} catch {
			/* swallow */
		}
	}
}
