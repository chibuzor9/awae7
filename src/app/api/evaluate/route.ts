import { NextRequest, NextResponse } from 'next/server'
import { evaluateUrl, evaluateHtml, evaluateSiteCrawl } from '@/lib/axe/evaluate'
import {
	transformRawResults,
	generateDeveloperReport,
	generateAuditorReport,
	generateEndUserReport,
	generateDesignerReport,
} from '@/lib/axe/transform'
import { formatHtmlForReport } from '@/lib/html/format'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// POST /api/evaluate  —  accepts JSON { url } or FormData with an HTML file
// ---------------------------------------------------------------------------

/** Max HTML file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024

function mapEvaluationFailure(message: string): {
	status: number
	error: string
} {
	if (message.startsWith('Invalid URL')) {
		return { status: 400, error: message }
	}

	if (message.startsWith('Resource not found')) {
		return { status: 404, error: message }
	}

	if (message.startsWith('Access denied')) {
		return { status: 403, error: message }
	}

	if (
		message.startsWith('DNS lookup failed') ||
		message.startsWith('Connection refused') ||
		message.startsWith('Connection timed out') ||
		message.startsWith('Network is offline') ||
		message.startsWith('Secure connection failed')
	) {
		return { status: 502, error: message }
	}

	if (message.startsWith('Navigation timed out')) {
		return { status: 504, error: message }
	}

	if (message.startsWith('Server returned')) {
		return { status: 502, error: message }
	}

	if (
		message.startsWith('Failed to retrieve page') ||
		message.startsWith('Failed to navigate')
	) {
		return { status: 502, error: message }
	}

	if (message.startsWith('HTML evaluation failed')) {
		return {
			status: 422,
			error: 'HTML could not be evaluated. The file may be malformed or contain unsupported content.',
		}
	}

	return {
		status: 500,
		error: 'Accessibility evaluation failed. Please try again later.',
	}
}

export async function POST(request: NextRequest) {
	const contentType = request.headers.get('content-type') ?? ''

	let rawResults

	// ================================================================
	// Branch A — HTML file upload (multipart/form-data)
	// ================================================================
	if (contentType.includes('multipart/form-data')) {
		let formData: FormData
		try {
			formData = await request.formData()
		} catch {
			return NextResponse.json(
				{ error: 'Invalid form data.' },
				{ status: 400 }
			)
		}

		const file = formData.get('file')
		if (!file || !(file instanceof File)) {
			return NextResponse.json(
				{ error: "An HTML file is required in the 'file' field." },
				{ status: 400 }
			)
		}

		// Validate file type
		const name = file.name.toLowerCase()
		if (!name.endsWith('.html') && !name.endsWith('.htm')) {
			return NextResponse.json(
				{ error: 'Only .html and .htm files are accepted.' },
				{ status: 400 }
			)
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: 'File is too large. Maximum size is 10 MB.' },
				{ status: 400 }
			)
		}

		const html = await file.text()
		if (!html.trim()) {
			return NextResponse.json(
				{ error: 'The uploaded file is empty.' },
				{ status: 400 }
			)
		}

		try {
			rawResults = await evaluateHtml(html, file.name)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err)
			console.error('[/api/evaluate] HTML evaluation failed:', message)
			const mapped = mapEvaluationFailure(message)
			return NextResponse.json(
				{ error: mapped.error },
				{ status: mapped.status }
			)
		}
	}
	// ================================================================
	// Branch B — URL evaluation (application/json)
	// ================================================================
	else {
        let body: {
            url?: string
            crawlWholeSite?: boolean
            maxPages?: number
        }
		try {
			body = await request.json()
		} catch {
			return NextResponse.json(
				{ error: 'Invalid JSON in request body.' },
				{ status: 400 }
			)
		}

		const { url } = body
        const crawlWholeSite = body.crawlWholeSite === true
        const maxPages =
            typeof body.maxPages === 'number'
                ? Math.min(50, Math.max(1, Math.floor(body.maxPages)))
                : 10
        let cookieHeaderForTarget: string | undefined

		if (!url || typeof url !== 'string') {
			return NextResponse.json(
				{ error: "A 'url' field is required in the request body." },
				{ status: 400 }
			)
		}

		const trimmedUrl = url.trim()

		if (
			!trimmedUrl.startsWith('http://') &&
			!trimmedUrl.startsWith('https://')
		) {
			return NextResponse.json(
				{
					error: 'Invalid URL format. The URL must start with http:// or https://.',
				},
				{ status: 400 }
			)
		}

		try {
			new URL(trimmedUrl)
		} catch {
			return NextResponse.json(
				{ error: 'The provided URL is malformed.' },
				{ status: 400 }
			)
		}

		try {
            const requestOrigin = request.nextUrl.origin
            const targetOrigin = new URL(trimmedUrl).origin
            if (requestOrigin === targetOrigin) {
                const incomingCookieHeader = request.headers.get('cookie')
                if (incomingCookieHeader?.trim()) {
                    cookieHeaderForTarget = incomingCookieHeader
                }
            }
        } catch {
            cookieHeaderForTarget = undefined
        }

        try {
            rawResults = crawlWholeSite
                ? await evaluateSiteCrawl(trimmedUrl, {
                    maxPages,
                    cookieHeader: cookieHeaderForTarget,
                })
                : await evaluateUrl(trimmedUrl, {
                    cookieHeader: cookieHeaderForTarget,
                })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err)
			const mapped = mapEvaluationFailure(message)
			console.error('[/api/evaluate] Evaluation failed:', message)
			return NextResponse.json(
				{ error: mapped.error },
				{ status: mapped.status }
			)
		}
	}

	// ---- Transform ----
	const evaluation = transformRawResults(rawResults)
    if (evaluation.fullSourceHtml?.trim()) {
        evaluation.fullSourceHtml = await formatHtmlForReport(
            evaluation.fullSourceHtml
        )
    }
	const developerReport = generateDeveloperReport(evaluation)
	const auditorReport = generateAuditorReport(evaluation)
	const endUserReport = generateEndUserReport(evaluation)
	const designerReport = generateDesignerReport(evaluation)

	// ---- Optionally persist to database if authenticated ----
	let savedEvaluationId: string | null = null

	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (user) {
			// Look up internal user record
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
			})

			if (dbUser) {
				const savedEvaluation = await prisma.evaluation.create({
					data: {
						userId: dbUser.id,
						targetUrl: evaluation.targetUrl,
						axeCoreVersion: evaluation.axeCoreVersion,
						totalViolations: evaluation.totalViolations,
						criticalCount: evaluation.criticalCount,
						seriousCount: evaluation.seriousCount,
						moderateCount: evaluation.moderateCount,
						minorCount: evaluation.minorCount,
						overallScore: evaluation.overallScore,
						rawResults: rawResults as any,
						violations: {
							create: evaluation.violations.map(v => ({
								ruleId: v.ruleId,
								wcagCriterion: v.wcagCriterion,
								wcagLevel: v.wcagLevel,
								wcagPrinciple: v.wcagPrinciple,
								severity: v.severity,
								elementSelector:
									v.nodes[0]?.target?.join(', ') ?? null,
								htmlSnippet: v.nodes[0]?.html ?? null,
								description: v.description,
								remediationGuidance:
									developerReport.violations.find(
										dv => dv.ruleId === v.ruleId
									)?.remediation ?? null,
							})),
						},
					},
				})

				savedEvaluationId = savedEvaluation.id
			}
		}
	} catch (dbError: unknown) {
		// Database save failure should NOT block the response.
		// The user still gets their evaluation results.
		const message =
			dbError instanceof Error ? dbError.message : String(dbError)
		console.error(
			'[/api/evaluate] Failed to save evaluation to database:',
			message
		)
	}

	// ---- Respond ----
	return NextResponse.json(
		{
			evaluation: {
				...evaluation,
				...(savedEvaluationId ? { id: savedEvaluationId } : {}),
			},
			developerReport,
			auditorReport,
			endUserReport,
			designerReport,
		},
		{ status: 200 }
	)
}
