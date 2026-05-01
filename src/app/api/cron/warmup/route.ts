import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cron endpoint to keep Supabase/Prisma connections warm
 * Prevents instance timeout and cold starts
 * Called periodically via Vercel Cron
 */
export async function GET(request: NextRequest) {
	// Verify the request is from Vercel's cron service
	const authHeader = request.headers.get('authorization')
	const cronSecret = process.env.CRON_SECRET

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json(
			{ error: 'Unauthorized' },
			{ status: 401 }
		)
	}

	try {
		// Perform a lightweight database operation to keep connection alive
		const result = await prisma.evaluation.count()

		return NextResponse.json(
			{
				success: true,
				message: 'Supabase connection warmed up',
				timestamp: new Date().toISOString(),
				evaluationCount: result,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Cron warmup failed:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to warm up connection',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}
