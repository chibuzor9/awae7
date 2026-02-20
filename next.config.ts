import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    serverExternalPackages: ['playwright', 'playwright-core', '@axe-core/playwright', '@sparticuz/chromium'],
	outputFileTracingIncludes: {
        '/api/evaluate': [
            './node_modules/@sparticuz/chromium/bin/**',
		],
	},
}

export default nextConfig
