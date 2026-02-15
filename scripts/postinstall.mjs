import { spawnSync } from 'node:child_process'

const isCi =
	process.env.CI === 'true' ||
	process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV !== undefined ||
    process.env.RAILWAY_ENVIRONMENT !== undefined ||
    process.env.RENDER !== undefined ||
    process.env.NODE_ENV === 'production'

const isLocal = !isCi && process.env.NODE_ENV !== 'production'

const run = (command, args, extraEnv = {}) => {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		shell: process.platform === 'win32',
		env: {
			...process.env,
			...extraEnv,
		},
	})

	if (result.status !== 0) {
        console.error(`Command failed: ${command} ${args.join(' ')}`)
        // Don't exit on Playwright install failure to allow build to continue
        if (!command.includes('playwright')) {
            process.exit(result.status ?? 1)
        }
	}
}

console.log('Running postinstall...')
run('prisma', ['generate'])

// Always install Playwright browsers in production/CI environments
if (isCi) {
    console.log('Installing Playwright browsers for production...')
    run('npx', ['playwright', 'install', '--with-deps', 'chromium'], {
		PLAYWRIGHT_BROWSERS_PATH: '0',
	})
} else if (isLocal) {
    console.log('Skipping Playwright browser installation in local development.')
    console.log('Run "npx playwright install chromium" manually if needed.')
}
