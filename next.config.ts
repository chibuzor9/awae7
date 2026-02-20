import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	serverExternalPackages: ['playwright', 'playwright-core', '@axe-core/playwright'],
	outputFileTracingIncludes: {
		'/**': [
			'./node_modules/playwright-core/.local-browsers/**/*',
		],
	},
}

export default nextConfig
