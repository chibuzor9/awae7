import { prisma } from '@/lib/prisma'

export const AUTH_MIGRATION_CUTOFF = new Date(
	'2026-10-19T17:47:07.236+01:00'
)

export type MigrationProvider = 'password' | 'oauth'

type AuthUser = {
	id: string
	email?: string | null
}

export async function resolveApplicationUser(authUser: AuthUser) {
	if (!authUser.email) {
		throw new Error('The authenticated account does not have an email address.')
	}

	const existing = await prisma.user.findFirst({
		where: {
			OR: [{ authUserId: authUser.id }, { email: authUser.email }],
		},
	})

	if (existing) {
		if (
			existing.authUserId !== authUser.id ||
			existing.lastLogin === null ||
			existing.migrationRequired
		) {
			return prisma.user.update({
				where: { id: existing.id },
				data: {
					authUserId: authUser.id,
					lastLogin: new Date(),
					migrationRequired: false,
				},
			})
		}
		return existing
	}

	return prisma.user.create({
		data: {
			id: authUser.id,
			email: authUser.email,
			username: authUser.email.split('@')[0] || 'user',
			authUserId: authUser.id,
			authProvider: 'password',
			migrationRequired: false,
			lastLogin: new Date(),
		},
	})
}

export async function linkMigratedAccount(
	authUser: AuthUser,
	provider: MigrationProvider
) {
	if (!authUser.email) {
		throw new Error('The authenticated account does not have an email address.')
	}

	const existing = await prisma.user.findUnique({
		where: { email: authUser.email },
		select: {
			id: true,
			authUserId: true,
			authProvider: true,
			migrationRequired: true,
			lastLogin: true,
		},
	})

	if (!existing) {
		return {
			isExistingAccount: false,
			requiresPasswordReset: false,
			showWelcomeBack: false,
		}
	}

	const shouldResetPassword =
		provider === 'password' &&
		existing.migrationRequired &&
		existing.lastLogin !== null &&
		existing.lastLogin > AUTH_MIGRATION_CUTOFF

	const showWelcomeBack = existing.migrationRequired

	await prisma.user.update({
		where: { id: existing.id },
		data: {
			authUserId: authUser.id,
			authProvider: provider,
			lastLogin: new Date(),
			migrationRequired: false,
		},
	})

	return {
		isExistingAccount: true,
		requiresPasswordReset: shouldResetPassword,
		showWelcomeBack,
	}
}
