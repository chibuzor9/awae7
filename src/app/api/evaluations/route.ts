import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/evaluations  --  List evaluation history for the authenticated user
// Supports pagination via ?page=1&limit=10
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
	try {
		// ---- Authenticate ----
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json(
				{ error: 'You must be signed in to view evaluation history.' },
				{ status: 401 }
			)
		}

		// ---- Parse pagination params ----
		const { searchParams } = new URL(request.url)
		const page = Math.max(
			1,
			parseInt(searchParams.get('page') ?? '1', 10) || 1
		)
		const limit = Math.min(
			50,
			Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10) || 10)
		)
		const skip = (page - 1) * limit

		// ---- Fetch evaluations with count ----
		const [evaluations, total] = await Promise.all([
			prisma.evaluation.findMany({
				where: { userId: user.id },
				orderBy: { timestamp: 'desc' },
				skip,
				take: limit,
				select: {
					id: true,
					targetUrl: true,
					timestamp: true,
					overallScore: true,
					totalViolations: true,
					criticalCount: true,
					seriousCount: true,
					moderateCount: true,
					minorCount: true,
				},
			}),
			prisma.evaluation.count({
				where: { userId: user.id },
			}),
		])

		const totalPages = Math.ceil(total / limit)

		return NextResponse.json(
			{
				evaluations,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			},
			{ status: 200 }
		)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		console.error('[GET /api/evaluations] Error:', message)
		return NextResponse.json(
			{
				error: 'Failed to fetch evaluation history. Please try again later.',
			},
			{ status: 500 }
		)
	}
}
