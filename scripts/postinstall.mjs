import { spawnSync } from 'node:child_process'

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
run('playwright', ['install', 'chromium'], {
	PLAYWRIGHT_BROWSERS_PATH: '0',
})
