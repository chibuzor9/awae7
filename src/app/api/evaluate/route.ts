import { NextRequest, NextResponse } from 'next/server'
import { evaluateUrl } from '@/lib/axe/evaluate'
import {
	transformRawResults,
	generateDeveloperReport,
	generateAuditorReport,
	generateEndUserReport,
} from '@/lib/axe/transform'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// POST /api/evaluate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
	// ---- Parse body ----
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

	// ---- Validate URL ----
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

	// ---- Run evaluation ----
	let rawResults
	try {
		rawResults = await evaluateUrl(trimmedUrl)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)

		// Distinguish user-caused errors from internal failures
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
