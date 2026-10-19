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
	updateUser(input: {
		password?: string
	}): Promise<{ error: { message: string } | null }>
	signOut(): Promise<{ error: { message: string } | null }>
	onAuthStateChange(
		callback: (
			event: string,
			session: AuthSession
		) => void
	): { data: { subscription: { unsubscribe(): void } } }
}

export const client = {
	auth: createAuthClient(process.env.NEXT_PUBLIC_NEON_AUTH_URL!, {
		adapter: SupabaseAuthAdapter(),
	}) as unknown as NeonAuthClient,
}
