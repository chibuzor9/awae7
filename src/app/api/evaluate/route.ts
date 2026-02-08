import { NextRequest, NextResponse } from 'next/server'
import { evaluateUrl, evaluateHtml } from '@/lib/axe/evaluate'
import {
	transformRawResults,
	generateDeveloperReport,
	generateAuditorReport,
	generateEndUserReport,
} from '@/lib/axe/transform'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// POST /api/evaluate  —  accepts JSON { url } or FormData with an HTML file
// ---------------------------------------------------------------------------

/** Max HTML file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024

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
			return NextResponse.json(
				{
					error: 'Accessibility evaluation of the HTML file failed. Please try again.',
				},
				{ status: 500 }
			)
		}
	}
	// ================================================================
	// Branch B — URL evaluation (application/json)
	// ================================================================
	else {
		let body: { url?: string }
		try {
			body = await request.json()
		} catch {
			return NextResponse.json(
				{ error: 'Invalid JSON in request body.' },
				{ status: 400 }
			)
		}

		const { url } = body

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
			rawResults = await evaluateUrl(trimmedUrl)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err)

			if (
				message.includes('Invalid URL') ||
				message.includes('Unable to reach') ||
				message.includes('timed out')
			) {
				return NextResponse.json({ error: message }, { status: 400 })
			}

			console.error('[/api/evaluate] Evaluation failed:', message)
			return NextResponse.json(
				{
					error: 'Accessibility evaluation failed. Please try again later.',
				},
				{ status: 500 }
			)
		}
	}

	// ---- Transform ----
	const evaluation = transformRawResults(rawResults)
	const developerReport = generateDeveloperReport(evaluation)
	const auditorReport = generateAuditorReport(evaluation)
	const endUserReport = generateEndUserReport(evaluation)

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
		},
		{ status: 200 }
	)
}
