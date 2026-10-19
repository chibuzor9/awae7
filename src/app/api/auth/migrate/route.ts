import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/neon-auth'
import {
	linkMigratedAccount,
	type MigrationProvider,
} from '@/lib/auth-migration'

function isProvider(value: unknown): value is MigrationProvider {
	return value === 'password' || value === 'oauth'
}

export async function POST(request: Request) {
	try {
		const user = await getAuthenticatedUser()
		if (!user) {
			return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
		}

		const body = (await request.json().catch(() => ({}))) as {
			provider?: unknown
		}
		const provider = isProvider(body.provider) ? body.provider : 'oauth'
		const result = await linkMigratedAccount(user, provider)

		return NextResponse.json(result)
	} catch (error) {
		console.error('[POST /api/auth/migrate] Error:', error)
		return NextResponse.json(
			{ error: 'Unable to complete account migration.' },
			{ status: 500 }
		)
	}
}
