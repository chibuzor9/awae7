import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const THREE_DAYS_IN_SECONDS = 60 * 60 * 24 * 3

export async function createClient() {
	const cookieStore = await cookies()

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookieOptions: {
				maxAge: THREE_DAYS_IN_SECONDS,
			},
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						)
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing sessions.
					}
				},
			},
		}
	)
}
