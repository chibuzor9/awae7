import { spawnSync } from 'node:child_process'

const isCi =
	process.env.CI === 'true' ||
	process.env.VERCEL === '1' ||
	process.env.VERCEL_ENV !== undefined

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
		process.exit(result.status ?? 1)
	}
}

run('prisma', ['generate'])

if (isCi) {
	run('npx', ['playwright', 'install', 'chromium'], {
		PLAYWRIGHT_BROWSERS_PATH: '0',
	})
}
