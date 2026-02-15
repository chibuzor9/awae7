import { spawnSync } from 'node:child_process'

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
const isCi =
	process.env.CI === 'true' ||
	isVercel ||
    process.env.RAILWAY_ENVIRONMENT !== undefined ||
    process.env.RENDER !== undefined ||
    process.env.NODE_ENV === 'production'

const isLocal = !isCi && process.env.NODE_ENV !== 'production'

const run = (command, args, extraEnv = {}, allowFailure = false) => {
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
        if (!allowFailure) {
            process.exit(result.status ?? 1)
        } else {
            console.log('Continuing despite failure...')
        }
	}
}

console.log('Running postinstall...')
run('prisma', ['generate'])

// Always install Playwright browsers in production/CI environments
if (isCi) {
    console.log('Installing Playwright browsers for production...')
    
    // Vercel doesn't allow --with-deps (no apt-get access)
    // Other platforms may need system dependencies
    const installArgs = isVercel 
        ? ['playwright', 'install', 'chromium']
        : ['playwright', 'install', '--with-deps', 'chromium']
    
    // Allow Playwright installation to fail without breaking the build
    run('npx', installArgs, {
		PLAYWRIGHT_BROWSERS_PATH: '0',
	}, true)
} else if (isLocal) {
    console.log('Skipping Playwright browser installation in local development.')
    console.log('Run "npx playwright install chromium" manually if needed.')
}
