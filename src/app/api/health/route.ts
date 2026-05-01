import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public health check endpoint
 * Can be used for monitoring and daily automated visits
 * No authentication required - intentionally public for external monitoring
 */
export async function GET() {
	try {
		// Quick database check to ensure Supabase connection is active
		await prisma.$queryRaw`SELECT 1`

		return NextResponse.json(
			{
				status: 'healthy',
				timestamp: new Date().toISOString(),
				database: 'connected',
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Health check failed:', error)
		return NextResponse.json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : 'Database connection failed',
			},
			{ status: 503 }
		)
	}
}
