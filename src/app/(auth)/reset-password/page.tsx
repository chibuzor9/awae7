'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { client } from '@/auth'

function ResetPasswordForm() {
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [password, setPassword] = useState('')
	const searchParams = useSearchParams()
	const resetToken =
		searchParams.get('token') ?? searchParams.get('resetToken')
	const canSetPassword = Boolean(resetToken)

	useEffect(() => {
		const address = searchParams.get('email')
		if (address) setEmail(address)
	}, [searchParams])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setLoading(true)
		setError(null)
		setMessage(null)

		const resetError = canSetPassword
			? (
					await client.auth.changePassword({
						newPassword: password,
						...(resetToken ? { token: resetToken } : {}),
					})
				).error
			: (
					await client.auth.resetPasswordForEmail(email, {
						redirectTo: `${window.location.origin}/reset-password`,
					})
				).error

		if (resetError) {
			setError(resetError.message)
		} else if (canSetPassword) {
			window.location.assign(
				`/login?reset=success&email=${encodeURIComponent(email)}`
			)
		} else {
			setMessage('Check your email for a secure password reset link.')
		}
		setLoading(false)
	}

	return (
		<div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
			<form
				onSubmit={handleSubmit}
				className="w-full rounded-xl border border-(--border) bg-white p-7 shadow-lg"
			>
				<h1 className="text-2xl font-semibold text-slate-900">
					{canSetPassword ? 'Set a new password' : 'Reset your password'}
				</h1>
				<p className="mt-2 text-sm text-slate-600">
					{canSetPassword
						? 'Choose a new password to finish reconnecting your account.'
						: "Enter your email and we'll send a secure reset link."}
				</p>
				{message && <p className="mt-4 text-sm text-green-700">{message}</p>}
				{error && <p className="mt-4 text-sm text-red-700">{error}</p>}
				{!canSetPassword && (
					<label htmlFor="reset-email" className="mt-6 block text-sm font-medium">
						Email address
					</label>
				)}
				{canSetPassword ? (
					<>
						<label htmlFor="new-password" className="mt-6 block text-sm font-medium">
							New password
						</label>
						<input
							id="new-password"
							type="password"
							required
							minLength={8}
							value={password}
							onChange={event => setPassword(event.target.value)}
							className="mt-1.5 block w-full rounded-lg border border-(--border) px-3.5 py-2.5"
						/>
					</>
				) : (
					<input
						id="reset-email"
						type="email"
						required
						value={email}
						onChange={event => setEmail(event.target.value)}
						className="mt-1.5 block w-full rounded-lg border border-(--border) px-3.5 py-2.5"
					/>
				)}
				<button
					type="submit"
					disabled={loading}
					className="mt-5 w-full rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
				>
					{loading
						? canSetPassword
							? 'Updating password...'
							: 'Sending...'
						: canSetPassword
							? 'Set new password'
							: 'Send reset link'}
				</button>
			</form>
		</div>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[70vh] items-center justify-center">
					<p className="text-gray-500">Loading...</p>
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	)
}
