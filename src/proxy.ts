import { auth } from '@/lib/neon-auth'

export const proxy = auth.middleware({ loginUrl: '/login' })

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/auth/callback',
		'/history/:path*',
	],
}
