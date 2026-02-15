import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type PreferredRole = 'end-user' | 'developer' | 'auditor'

function isPreferredRole(value: unknown): value is PreferredRole {
	return value === 'end-user' || value === 'developer' || value === 'auditor'
}

function deriveUsername(email: string): string {
	const base = email.split('@')[0]?.trim().toLowerCase()
	return base && base.length > 0 ? base : 'user'
}

async function getAuthenticatedUser() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	return user
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

		const userRecord = await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email,
			},
			create: {
				id: user.id,
				email: user.email,
				username:
					typeof user.user_metadata?.username === 'string' &&
					user.user_metadata.username.trim().length > 0
						? user.user_metadata.username
						: deriveUsername(user.email),
			},
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
					error: 'Invalid preferredRole. Use end-user, developer, or auditor.',
				},
				{ status: 400 }
			)
		}

		const updatedUser = await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email,
				preferredRole,
			},
			create: {
				id: user.id,
				email: user.email,
				username:
					typeof user.user_metadata?.username === 'string' &&
					user.user_metadata.username.trim().length > 0
						? user.user_metadata.username
						: deriveUsername(user.email),
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
