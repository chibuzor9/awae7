import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser as getNeonUser } from '@/lib/neon-auth'
import { resolveApplicationUser } from '@/lib/auth-migration'

type PreferredRole = 'end-user' | 'developer' | 'designer' | 'auditor'

function isPreferredRole(value: unknown): value is PreferredRole {
	return value === 'end-user' || value === 'developer' || value === 'designer' || value === 'auditor'
}

async function getAuthenticatedUser() {
	return getNeonUser()
}

export async function GET() {
	try {
		const user = await getAuthenticatedUser()

		if (!user || !user.email) {
			return NextResponse.json(
				{ error: 'You must be signed in to access preferences.' },
				{ status: 401 }
			)
		}

		const applicationUser = await resolveApplicationUser(user)
		const userRecord = await prisma.user.update({
			where: { id: applicationUser.id },
			data: { email: user.email },
			select: {
				preferredRole: true,
			},
		})

		return NextResponse.json(
			{ preferredRole: userRecord.preferredRole },
			{ status: 200 }
		)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error)
		console.error('[GET /api/preferences] Error:', message)
		return NextResponse.json(
			{ error: 'Failed to load preferences.' },
			{ status: 500 }
		)
	}
}

export async function PUT(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser()

		if (!user || !user.email) {
			return NextResponse.json(
				{ error: 'You must be signed in to update preferences.' },
				{ status: 401 }
			)
		}

		let body: unknown
		try {
			body = await request.json()
		} catch {
			return NextResponse.json(
				{ error: 'Invalid JSON body.' },
				{ status: 400 }
			)
		}

		const preferredRole =
			typeof body === 'object' && body !== null
				? (body as { preferredRole?: unknown }).preferredRole
				: undefined

		if (!isPreferredRole(preferredRole)) {
			return NextResponse.json(
				{
					error: 'Invalid preferredRole. Use end-user, developer, designer, or auditor.',
				},
				{ status: 400 }
			)
		}

		const applicationUser = await resolveApplicationUser(user)
		const updatedUser = await prisma.user.update({
			where: { id: applicationUser.id },
			data: {
				email: user.email,
				preferredRole,
			},
			select: {
				preferredRole: true,
			},
		})

		return NextResponse.json(
			{ preferredRole: updatedUser.preferredRole },
			{ status: 200 }
		)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error)
		console.error('[PUT /api/preferences] Error:', message)
		return NextResponse.json(
			{ error: 'Failed to update preferences.' },
			{ status: 500 }
		)
	}
}
