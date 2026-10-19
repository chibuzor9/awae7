import { createAuthClient } from '@neondatabase/auth'
import { SupabaseAuthAdapter } from '@neondatabase/auth/vanilla/adapters'

export type AuthUser = {
	id: string
	email: string
	user_metadata?: Record<string, unknown>
}

type AuthSession = { user: AuthUser } | null
type AuthResult<T> = {
	data: T
	error: { message: string } | null
}

type BetterAuthPasswordClient = {
	changePassword(input: {
		newPassword: string
		currentPassword: string
	}): Promise<{ data?: unknown; error?: { message: string } | null }>
	resetPassword(input: {
		newPassword: string
		token: string
	}): Promise<{ data?: unknown; error?: { message: string } | null }>
}

export type NeonAuthClient = {
	getUser(): Promise<AuthResult<{ user: AuthUser | null }>>
	getSession(): Promise<AuthResult<{ session: AuthSession }>>
	signInWithPassword(input: {
		email: string
		password: string
	}): Promise<AuthResult<{ user: AuthUser | null; session: AuthSession }>>
	signUp(input: {
		email: string
		password: string
		options?: { data?: Record<string, unknown> }
	}): Promise<AuthResult<{ user: AuthUser | null; session: AuthSession }>>
	signInWithOAuth(input: {
		provider: 'google' | 'github'
		options?: { redirectTo?: string }
	}): Promise<AuthResult<{ provider: string; url?: string }>>
	resetPasswordForEmail(
		email: string,
		options?: { redirectTo?: string }
	): Promise<{ error: { message: string } | null }>
	changePassword(input: {
		newPassword: string
		currentPassword?: string
		token?: string
	}): Promise<{ error: { message: string } | null }>
	signOut(): Promise<{ error: { message: string } | null }>
	onAuthStateChange(
		callback: (
			event: string,
			session: AuthSession
		) => void
	): { data: { subscription: { unsubscribe(): void } } }
}

const authUrl =
	typeof window === 'undefined'
		? process.env.NEXT_PUBLIC_NEON_AUTH_URL!
		: `${window.location.origin}/api/auth`

const authClient = createAuthClient(authUrl, {
	adapter: SupabaseAuthAdapter(),
}) as unknown as NeonAuthClient & {
	getBetterAuthInstance(): BetterAuthPasswordClient
}

authClient.changePassword = async ({
	newPassword,
	currentPassword,
	token,
}: {
	newPassword: string
	currentPassword?: string
	token?: string
}) => {
	const betterAuth = authClient.getBetterAuthInstance()
	const result = token
		? await betterAuth.resetPassword({ newPassword, token })
		: await betterAuth.changePassword({
				newPassword,
				currentPassword: currentPassword ?? '',
			})
	return { error: result.error ?? null }
}

export const client = {
	auth: authClient,
}
