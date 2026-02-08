import type {
	EvaluationResult,
	ViolationItem,
	DeveloperReport,
	DeveloperViolation,
	AuditorReport,
	EndUserReport,
	ReportSummary,
	ComplianceEntry,
	PrincipleBreakdown,
	AuditorViolation,
	EndUserCategory,
	PassItem,
	Severity,
	WcagPrinciple,
	WcagLevel,
} from '@/types'

// ===========================================================================
// Helpers  --  WCAG tag parsing
// ===========================================================================

/**
 * Extract a WCAG criterion number from an array of axe-core tags.
 * Tags look like "wcag111", "wcag143", "wcag412", etc.
 * We convert "wcag111" -> "1.1.1", "wcag143" -> "1.4.3".
 */
function extractWcagCriterion(tags: string[]): string {
	for (const tag of tags) {
		// Match tags like "wcag111", "wcag143", "wcag412", "wcag1412"
		const match = tag.match(/^wcag(\d)(\d{1,2})(\d{1,2})$/)
		if (match) {
			return `${match[1]}.${match[2]}.${match[3]}`
		}
	}
	return 'unknown'
}

/**
 * Determine the WCAG level from axe-core tags.
 */
function extractWcagLevel(tags: string[]): WcagLevel {
	if (tags.includes('wcag2aa') || tags.includes('wcag22aa')) return 'AA'
	if (tags.includes('wcag2a')) return 'A'
	// Default to A if indeterminable
	return 'A'
}

/**
 * Map a WCAG criterion to its principle.
 * 1.x.x = Perceivable, 2.x.x = Operable, 3.x.x = Understandable, 4.x.x = Robust.
 */
function mapToPrinciple(criterion: string): WcagPrinciple {
	if (criterion.startsWith('1.')) return 'Perceivable'
	if (criterion.startsWith('2.')) return 'Operable'
	if (criterion.startsWith('3.')) return 'Understandable'
	if (criterion.startsWith('4.')) return 'Robust'
	return 'Perceivable' // safe fallback
}

/**
 * Map axe-core impact string to our Severity type.
 */
function mapImpactToSeverity(impact: string | undefined | null): Severity {
	switch (impact) {
		case 'critical':
			return 'critical'
		case 'serious':
			return 'serious'
		case 'moderate':
			return 'moderate'
		case 'minor':
		default:
			return 'minor'
	}
}

/**
 * Points deducted per severity bucket.
 */
const SEVERITY_WEIGHT: Record<Severity, number> = {
	critical: 15,
	serious: 10,
	moderate: 5,
	minor: 2,
}

// ===========================================================================
// 1.  transformRawResults
// ===========================================================================

/**
 * Transform the raw axe-core output (as returned by `evaluateUrl`) into the
 * application's canonical `EvaluationResult` shape.
 */
export function transformRawResults(rawResults: any): EvaluationResult {
	// -- Map violations --
	const violations: ViolationItem[] = (rawResults.violations ?? []).map(
		(v: any) => {
			const criterion = extractWcagCriterion(v.tags ?? [])
			const level = extractWcagLevel(v.tags ?? [])
			const principle = mapToPrinciple(criterion)
			const severity = mapImpactToSeverity(v.impact)

			return {
				ruleId: v.id,
				description: v.description ?? v.help ?? '',
				helpUrl: v.helpUrl ?? '',
				wcagCriterion: criterion,
				wcagLevel: level,
				wcagPrinciple: principle,
				severity,
				nodes: (v.nodes ?? []).map((n: any) => ({
					html: n.html ?? '',
					target: Array.isArray(n.target) ? n.target.map(String) : [],
					failureSummary: n.failureSummary ?? '',
				})),
			} satisfies ViolationItem
		}
	)

	// -- Map passes --
	const passes: PassItem[] = (rawResults.passes ?? []).map((p: any) => {
		const criterion = extractWcagCriterion(p.tags ?? [])
		const level = extractWcagLevel(p.tags ?? [])
		const principle = mapToPrinciple(criterion)

		return {
			ruleId: p.id,
			description: p.description ?? p.help ?? '',
			wcagCriterion: criterion,
			wcagLevel: level,
			wcagPrinciple: principle,
		} satisfies PassItem
	})

	// -- Severity counts --
	const criticalCount = violations.filter(
		v => v.severity === 'critical'
	).length
	const seriousCount = violations.filter(v => v.severity === 'serious').length
	const moderateCount = violations.filter(
		v => v.severity === 'moderate'
	).length
	const minorCount = violations.filter(v => v.severity === 'minor').length

	// -- Overall score --
	let score = 100
	for (const v of violations) {
		score -= SEVERITY_WEIGHT[v.severity] ?? 2
	}
	score = Math.max(0, score)

	return {
		targetUrl: rawResults.url ?? '',
		timestamp: rawResults.timestamp ?? new Date().toISOString(),
		axeCoreVersion: rawResults.axeCoreVersion ?? 'unknown',
		overallScore: score,
		totalViolations: violations.length,
		criticalCount,
		seriousCount,
		moderateCount,
		minorCount,
		violations,
		passes,
	}
}

// ===========================================================================
// Shared: build a ReportSummary from an EvaluationResult
// ===========================================================================

function buildSummary(result: EvaluationResult): ReportSummary {
	return {
		targetUrl: result.targetUrl,
		evaluationDate: result.timestamp,
		totalViolations: result.totalViolations,
		overallScore: result.overallScore,
		criticalCount: result.criticalCount,
		seriousCount: result.seriousCount,
		moderateCount: result.moderateCount,
		minorCount: result.minorCount,
		axeCoreVersion: result.axeCoreVersion,
	}
}

// ===========================================================================
// 2.  generateDeveloperReport
// ===========================================================================

const SEVERITY_ORDER: Record<Severity, number> = {
	critical: 0,
	serious: 1,
	moderate: 2,
	minor: 3,
}

export function generateDeveloperReport(
	result: EvaluationResult
): DeveloperReport {
	const violations: DeveloperViolation[] = result.violations
		.map(v => ({
			ruleId: v.ruleId,
			severity: v.severity,
			description: v.description,
			wcagCriterion: v.wcagCriterion,
			wcagLevel: v.wcagLevel,
			wcagPrinciple: v.wcagPrinciple,
			helpUrl: v.helpUrl,
			elements: v.nodes.map(n => ({
				selector: n.target.join(', '),
				htmlSnippet: n.html,
				failureSummary: n.failureSummary,
			})),
			remediation: getRemediation(v.ruleId),
		}))
		.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

	return {
		summary: buildSummary(result),
		violations,
		filters: {
			severity: ['critical', 'serious', 'moderate', 'minor'],
			principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'],
			level: ['A', 'AA'],
		},
	}
}

// ===========================================================================
// 3.  generateAuditorReport
// ===========================================================================

export function generateAuditorReport(result: EvaluationResult): AuditorReport {
	// ---- Compliance matrix ----
	// Gather all unique criteria from both violations and passes.
	const criteriaMap = new Map<
		string,
		{
			title: string
			level: WcagLevel
			principle: WcagPrinciple
			status: 'pass' | 'fail' | 'not-tested'
			violationCount: number
		}
	>()

	// Seed passes first
	for (const p of result.passes) {
		if (!criteriaMap.has(p.wcagCriterion)) {
			criteriaMap.set(p.wcagCriterion, {
				title: p.description,
				level: p.wcagLevel,
				principle: p.wcagPrinciple,
				status: 'pass',
				violationCount: 0,
			})
		}
	}

	// Overlay violations (overrides pass status)
	for (const v of result.violations) {
		const existing = criteriaMap.get(v.wcagCriterion)
		if (existing) {
			existing.status = 'fail'
			existing.violationCount += 1
		} else {
			criteriaMap.set(v.wcagCriterion, {
				title: v.description,
				level: v.wcagLevel,
				principle: v.wcagPrinciple,
				status: 'fail',
				violationCount: 1,
			})
		}
	}

	const complianceMatrix: ComplianceEntry[] = Array.from(
		criteriaMap.entries()
	)
		.map(([criterion, data]) => ({
			criterion,
			title: data.title,
			level: data.level,
			principle: data.principle,
			status: data.status,
			violationCount: data.violationCount,
		}))
		.sort((a, b) =>
			a.criterion.localeCompare(b.criterion, undefined, { numeric: true })
		)

	// ---- Principle breakdown ----
	const principles: WcagPrinciple[] = [
		'Perceivable',
		'Operable',
		'Understandable',
		'Robust',
	]

	const principleBreakdown: PrincipleBreakdown[] = principles.map(
		principle => {
			const entries = complianceMatrix.filter(
				e => e.principle === principle
			)
			const total = entries.length
			const passed = entries.filter(e => e.status === 'pass').length
			const failed = entries.filter(e => e.status === 'fail').length
			const compliancePercentage =
				total > 0 ? Math.round((passed / total) * 100) : 100

			return {
				principle,
				totalCriteria: total,
				passedCriteria: passed,
				failedCriteria: failed,
				compliancePercentage,
			}
		}
	)

	// ---- Violations (auditor-oriented) ----
	const violations: AuditorViolation[] = result.violations
		.map(v => ({
			ruleId: v.ruleId,
			severity: v.severity,
			description: v.description,
			wcagCriterion: v.wcagCriterion,
			wcagLevel: v.wcagLevel,
			wcagPrinciple: v.wcagPrinciple,
			instanceCount: v.nodes.length,
			formalDescription: buildFormalDescription(v),
		}))
		.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

	return {
		summary: buildSummary(result),
		complianceMatrix,
		principleBreakdown,
		violations,
		filters: {
			severity: ['critical', 'serious', 'moderate', 'minor'],
			principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'],
			level: ['A', 'AA'],
		},
	}
}

/**
 * Produce a formal, audit-appropriate description of a violation.
 */
function buildFormalDescription(v: ViolationItem): string {
	const levelStr = `WCAG 2.2 Level ${v.wcagLevel}`
	const principleStr = v.wcagPrinciple
	const instanceStr =
		v.nodes.length === 1 ? '1 instance' : `${v.nodes.length} instances`

	return (
		`Non-conformance with ${levelStr}, Success Criterion ${v.wcagCriterion} ` +
		`(${principleStr}). ${v.description}. ` +
		`${instanceStr} identified with ${v.severity} impact.`
	)
}

// ===========================================================================
// 4.  generateEndUserReport
// ===========================================================================

export function generateEndUserReport(result: EvaluationResult): EndUserReport {
	const score = result.overallScore

	// Score label and colour
	let scoreLabel: string
	let scoreColor: string
	if (score >= 90) {
		scoreLabel = 'Excellent'
		scoreColor = '#22c55e' // green-500
	} else if (score >= 75) {
		scoreLabel = 'Good'
		scoreColor = '#84cc16' // lime-500
	} else if (score >= 50) {
		scoreLabel = 'Needs Improvement'
		scoreColor = '#f59e0b' // amber-500
	} else if (score >= 25) {
		scoreLabel = 'Poor'
		scoreColor = '#f97316' // orange-500
	} else {
		scoreLabel = 'Critical Issues'
		scoreColor = '#ef4444' // red-500
	}

	// ---- Categories (one per principle) ----
	const principleInfo: {
		principle: WcagPrinciple
		name: string
		icon: string
		emptyDescription: string
	}[] = [
		{
			principle: 'Perceivable',
			name: 'Content Visibility',
			icon: 'eye',
			emptyDescription:
				'All content on this page can be perceived by everyone, including people using screen readers.',
		},
		{
			principle: 'Operable',
			name: 'Navigation & Interaction',
			icon: 'mouse-pointer',
			emptyDescription:
				'All interactive elements on this page work well for everyone, including keyboard-only users.',
		},
		{
			principle: 'Understandable',
			name: 'Clarity & Readability',
			icon: 'book-open',
			emptyDescription:
				'The content and forms on this page are clear and easy to understand.',
		},
		{
			principle: 'Robust',
			name: 'Technical Compatibility',
			icon: 'shield',
			emptyDescription:
				'This page works well with assistive technologies like screen readers.',
		},
	]

	const categories: EndUserCategory[] = principleInfo.map(info => {
		const relViolations = result.violations.filter(
			v => v.wcagPrinciple === info.principle
		)

		const issueCount = relViolations.length

		// Per-category score: deduct from 100
		let catScore = 100
		for (const v of relViolations) {
			catScore -= SEVERITY_WEIGHT[v.severity] ?? 2
		}
		catScore = Math.max(0, catScore)

		let description: string
		if (issueCount === 0) {
			description = info.emptyDescription
		} else {
			// Pick the most impactful issue to describe
			const sorted = [...relViolations].sort(
				(a, b) =>
					SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
			)
			const plainParts = sorted
				.slice(0, 3)
				.map(v => getPlainLanguage(v.ruleId))
			description = plainParts.join(' ')
		}

		return {
			name: info.name,
			icon: info.icon,
			score: catScore,
			description,
			issueCount,
		}
	})

	// ---- Priority recommendations ----
	const allSorted = [...result.violations].sort(
		(a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
	)

	const seen = new Set<string>()
	const priorities: string[] = []
	for (const v of allSorted) {
		if (seen.has(v.ruleId)) continue
		seen.add(v.ruleId)
		priorities.push(getPlainLanguage(v.ruleId))
		if (priorities.length >= 5) break
	}

	return {
		summary: buildSummary(result),
		score,
		scoreLabel,
		scoreColor,
		categories,
		priorities,
	}
}

// ===========================================================================
// Remediation guidance (developer-facing)
// ===========================================================================

const REMEDIATION_MAP: Record<string, string> = {
	'image-alt':
		'Add an alt attribute to all <img> elements that describes the image content. For decorative images use alt="".',
	'color-contrast':
		'Ensure text has a sufficient contrast ratio against its background. WCAG requires at least 4.5:1 for normal text and 3:1 for large text.',
	label: "Add a <label> element associated with each form input using the 'for' attribute matching the input's 'id', or wrap the input inside a <label>.",
	'link-name':
		'Ensure all links have descriptive text content, an aria-label, or an aria-labelledby attribute so users know where the link goes.',
	'heading-order':
		'Use heading levels (h1-h6) in sequential, descending order without skipping levels. Every page should start with an h1.',
	'button-name':
		'Ensure all <button> elements have discernible text, either as text content, an aria-label, or aria-labelledby attribute.',
	'html-has-lang':
		'Add a lang attribute to the <html> element (e.g., <html lang="en">) to specify the document language.',
	'html-lang-valid':
		"Ensure the lang attribute on the <html> element uses a valid BCP 47 language tag (e.g., 'en', 'fr', 'es').",
	'document-title':
		'Add a descriptive <title> element inside the <head> of the document to help users identify the page.',
	'meta-viewport':
		'Do not use user-scalable=no in the <meta name="viewport"> tag, and ensure maximum-scale is not set below 2. Users must be able to zoom.',
	list: 'Ensure that <li> elements are contained within a <ul>, <ol>, or <menu> parent element.',
	listitem:
		'Ensure list items (<li>) are used inside proper list containers (<ul>, <ol>, or <menu>).',
	region: 'Ensure all page content is contained within landmark regions (e.g., <main>, <nav>, <header>, <footer>, or ARIA landmarks).',
	bypass: 'Provide a "skip to main content" link as the first focusable element on the page so keyboard users can bypass repetitive navigation.',
	'aria-allowed-attr':
		"Ensure ARIA attributes used on an element are appropriate for the element's role. Remove any ARIA attributes that are not valid for the assigned role.",
	'aria-valid-attr-value':
		"Ensure all ARIA attribute values are valid. For example, aria-hidden should be 'true' or 'false', not an empty string.",
	'aria-valid-attr':
		'Ensure all ARIA attributes are valid and correctly spelled. Remove any unsupported or misspelt ARIA attributes.',
	'aria-required-attr':
		"Add all required ARIA attributes for the element's role. For example, role='checkbox' requires aria-checked.",
	'aria-roles':
		'Ensure all role attribute values are valid ARIA roles. Remove or correct any misspelt or non-existent role values.',
	'aria-hidden-focus':
		"Do not apply aria-hidden='true' to elements that are focusable. Either remove aria-hidden or make the element non-focusable.",
	tabindex:
		"Avoid using tabindex values greater than 0. Use tabindex='0' to add elements to the natural tab order or tabindex='-1' for programmatic focus.",
	'input-image-alt':
		'Add an alt attribute to all <input type="image"> elements that describes the button action.',
	'select-name':
		'Ensure all <select> elements have an associated <label> or an aria-label attribute.',
	'frame-title':
		'Add a title attribute to all <iframe> and <frame> elements that describes the embedded content.',
	'td-headers-attr':
		'Ensure td elements in tables with headers use valid headers attributes that reference existing th element ids.',
	'th-has-data-cells':
		'Ensure each <th> element in a data table has associated data cells to maintain proper table structure.',
	'valid-lang':
		'Ensure lang attributes on elements within the page use valid BCP 47 language tags.',
	'empty-heading':
		'Ensure heading elements (h1-h6) contain visible text or an accessible name. Empty headings confuse screen reader users.',
	'form-field-multiple-labels':
		'Ensure each form field has only one associated <label>. Multiple labels can confuse assistive technologies.',
}

/**
 * Return developer-oriented remediation guidance for a given axe-core rule ID.
 */
export function getRemediation(ruleId: string): string {
	return (
		REMEDIATION_MAP[ruleId] ??
		'Review the element and ensure it meets the WCAG requirement. ' +
			'Refer to the help URL for detailed guidance on fixing this issue.'
	)
}

// ===========================================================================
// Plain-language descriptions (end-user-facing)
// ===========================================================================

const PLAIN_LANGUAGE_MAP: Record<string, string> = {
	'image-alt':
		"Some images on this page don't have text descriptions, making them invisible to screen readers.",
	'color-contrast':
		'Some text on this page may be hard to read due to low color contrast.',
	label: 'Some form fields are missing labels, which makes it hard to know what information to enter.',
	'link-name':
		"Some links on this page don't have descriptive text, making it hard to know where they lead.",
	'heading-order':
		'The headings on this page are not in a logical order, which can make it harder to navigate.',
	'button-name':
		"Some buttons on this page don't have labels, so it's unclear what they do.",
	'html-has-lang':
		"The page doesn't specify its language, which can cause screen readers to mispronounce content.",
	'html-lang-valid':
		"The page's language setting is invalid, which may confuse screen readers.",
	'document-title':
		'This page is missing a title, making it harder to identify in browser tabs and bookmarks.',
	'meta-viewport':
		'This page prevents users from zooming in, which is a problem for people with low vision.',
	list: 'Some lists on this page are not structured correctly, which can confuse screen readers.',
	listitem:
		'Some list items on this page are not inside proper list containers.',
	region: 'Some content on this page is not inside clearly defined sections, making navigation harder.',
	bypass: "This page is missing a 'skip to content' link, making keyboard users tab through the entire navigation every time.",
	'aria-allowed-attr':
		'Some interactive elements use incorrect accessibility attributes, which may confuse assistive technologies.',
	'aria-valid-attr-value':
		'Some accessibility settings on this page have incorrect values, which may cause screen readers to behave unexpectedly.',
	'aria-valid-attr':
		'Some elements use invalid accessibility attributes that assistive technologies cannot understand.',
	'aria-required-attr':
		'Some interactive elements are missing required accessibility attributes needed by screen readers.',
	'aria-roles':
		'Some elements have invalid roles assigned, which can confuse assistive technologies.',
	'aria-hidden-focus':
		'Some hidden elements can still receive keyboard focus, which is confusing for keyboard users.',
	tabindex:
		'The keyboard navigation order on this page may not follow the expected visual order.',
	'input-image-alt':
		"Some image buttons on this page don't have text descriptions.",
	'select-name':
		'Some dropdown menus are missing labels, making it hard to know what to select.',
	'frame-title':
		'Some embedded content on this page is missing a description.',
	'empty-heading':
		'Some headings on this page are empty, which can confuse people using screen readers to navigate.',
	'form-field-multiple-labels':
		'Some form fields have multiple labels, which may confuse assistive technologies.',
}

/**
 * Return end-user-friendly, plain-language description for a given axe-core rule ID.
 */
export function getPlainLanguage(ruleId: string): string {
	return (
		PLAIN_LANGUAGE_MAP[ruleId] ??
		'An accessibility issue was found that may affect some users of this page.'
	)
}
