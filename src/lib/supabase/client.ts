import { createBrowserClient } from '@supabase/ssr'

const THREE_DAYS_IN_SECONDS = 60 * 60 * 24 * 3

export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookieOptions: {
				maxAge: THREE_DAYS_IN_SECONDS,
			},
		}
	)
}
