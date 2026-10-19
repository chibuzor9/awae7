import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser as getNeonUser } from '@/lib/neon-auth'

type PreferredRole = 'end-user' | 'developer' | 'designer' | 'auditor'

function isPreferredRole(value: unknown): value is PreferredRole {
	return value === 'end-user' || value === 'developer' || value === 'designer' || value === 'auditor'
}

function deriveUsername(email: string): string {
	const base = email.split('@')[0]?.trim().toLowerCase()
	return base && base.length > 0 ? base : 'user'
}

function getUsernameMetadata(user: Awaited<ReturnType<typeof getNeonUser>>) {
	const metadata = user && 'user_metadata' in user
		? user.user_metadata
		: undefined
	return metadata && typeof metadata === 'object' && 'username' in metadata &&
		typeof metadata.username === 'string' && metadata.username.trim().length > 0
		? metadata.username
		: undefined
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

		const userRecord = await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email,
			},
			create: {
				id: user.id,
				email: user.email,
				username:
					getUsernameMetadata(user) ?? deriveUsername(user.email),
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
					error: 'Invalid preferredRole. Use end-user, developer, designer, or auditor.',
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
					getUsernameMetadata(user) ?? deriveUsername(user.email),
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
