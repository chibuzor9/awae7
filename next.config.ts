import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    serverExternalPackages: ['playwright', 'playwright-core', '@axe-core/playwright', '@sparticuz/chromium'],
	outputFileTracingIncludes: {
        '/api/evaluate': [
            './node_modules/@sparticuz/chromium/bin/**',
		],
	},
	headers: async () => [
		{
			source: '/(.*)',
			headers: [
				{ key: 'X-Content-Type-Options', value: 'nosniff' },
				{ key: 'X-Frame-Options', value: 'DENY' },
				{ key: 'X-DNS-Prefetch-Control', value: 'on' },
				{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
				{
					key: 'Permissions-Policy',
					value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
				},
				{
					key: 'Strict-Transport-Security',
					value: 'max-age=63072000; includeSubDomains; preload',
				},
			],
		},
	],
}

export default nextConfig
