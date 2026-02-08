import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	serverExternalPackages: ['playwright', '@axe-core/playwright'],
}

export default nextConfig
