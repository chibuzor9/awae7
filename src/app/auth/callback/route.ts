import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/neon-auth'
import { linkMigratedAccount } from '@/lib/auth-migration'

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url)
	const next = searchParams.get('next') ?? '/evaluate'

	const user = await getAuthenticatedUser()
	if (user) {
		const migration = await linkMigratedAccount(user, 'oauth')
		if (migration.showWelcomeBack) {
			return NextResponse.redirect(`${origin}/welcome-back`)
		}
		return NextResponse.redirect(`${origin}${next}`)
	}

	// Auth error — redirect to an error page or login
	return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
