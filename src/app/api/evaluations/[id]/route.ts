import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import {
	transformRawResults,
	generateDeveloperReport,
	generateAuditorReport,
	generateEndUserReport,
} from '@/lib/axe/transform'
import type { EvaluationResult, ViolationItem } from '@/types'

// ---------------------------------------------------------------------------
// GET /api/evaluations/[id]  --  Full evaluation detail with reports
// ---------------------------------------------------------------------------

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		// ---- Authenticate ----
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json(
				{ error: 'You must be signed in to view this evaluation.' },
				{ status: 401 }
			)
		}

		// ---- Fetch evaluation with violations ----
		const evaluation = await prisma.evaluation.findUnique({
			where: { id },
			include: { violations: true },
		})

		if (!evaluation) {
			return NextResponse.json(
				{ error: 'Evaluation not found.' },
				{ status: 404 }
			)
		}

		// ---- Verify ownership ----
		if (evaluation.userId !== user.id) {
			return NextResponse.json(
				{ error: 'Evaluation not found.' },
				{ status: 404 }
			)
		}

		// ---- Build the EvaluationResult & generate reports ----
		let evaluationResult: EvaluationResult

		if (evaluation.rawResults) {
			// Re-generate from the original raw axe-core output
			evaluationResult = transformRawResults(evaluation.rawResults)
			evaluationResult.id = evaluation.id
		} else {
			// Construct a basic EvaluationResult from the stored data
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const violations: ViolationItem[] = evaluation.violations.map(
				(v: any) => ({
					id: v.id,
					ruleId: v.ruleId,
					description: v.description,
					helpUrl: '',
					wcagCriterion: v.wcagCriterion,
					wcagLevel: v.wcagLevel as 'A' | 'AA',
					wcagPrinciple: v.wcagPrinciple as
						| 'Perceivable'
						| 'Operable'
						| 'Understandable'
						| 'Robust',
					severity: v.severity as
						| 'critical'
						| 'serious'
						| 'moderate'
						| 'minor',
                    category: 'other' as const,
					nodes: v.elementSelector
						? [
								{
									html: v.htmlSnippet ?? '',
									target: [v.elementSelector],
									failureSummary: v.description,
                                impact: null,
                                any: [],
                                all: [],
                                none: [],
								},
							]
						: [],
				})
			)

			evaluationResult = {
				id: evaluation.id,
				targetUrl: evaluation.targetUrl,
				timestamp: evaluation.timestamp.toISOString(),
				axeCoreVersion: evaluation.axeCoreVersion,
                testEnvironment: {
                    userAgent: '',
                    windowWidth: 0,
                    windowHeight: 0,
                    orientationAngle: 0,
                    orientationType: '',
                },
				overallScore: evaluation.overallScore,
				totalViolations: evaluation.totalViolations,
                totalIncomplete: 0,
                totalPasses: 0,
                totalInapplicable: 0,
				criticalCount: evaluation.criticalCount,
				seriousCount: evaluation.seriousCount,
				moderateCount: evaluation.moderateCount,
				minorCount: evaluation.minorCount,
				violations,
				passes: [],
                incomplete: [],
                inapplicable: [],
			}
		}

		const developerReport = generateDeveloperReport(evaluationResult)
		const auditorReport = generateAuditorReport(evaluationResult)
		const endUserReport = generateEndUserReport(evaluationResult)

		return NextResponse.json(
			{
				evaluation: evaluationResult,
				developerReport,
				auditorReport,
				endUserReport,
			},
			{ status: 200 }
		)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		console.error('[GET /api/evaluations/[id]] Error:', message)
		return NextResponse.json(
			{
				error: 'Failed to fetch evaluation details. Please try again later.',
			},
			{ status: 500 }
		)
	}
}
