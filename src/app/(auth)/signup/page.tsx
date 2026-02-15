'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

export default function SignupPage() {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setSuccess(false)
		setLoading(true)

		try {
			const supabase = createClient()
			const { error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						username,
					},
				},
			})

			if (authError) {
				setError(authError.message)
				return
			}

			setSuccess(true)
		} catch {
			setError('An unexpected error occurred. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-[70vh] items-center justify-center bg-transparent px-4 py-12">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-semibold text-slate-900">
						Create an account
					</h1>
					<p className="mt-2 text-sm text-slate-600">
						Get started with AWAE today
					</p>
				</div>

				{/* Form Card */}
				<div className="rounded-xl border border-(--border) bg-white p-7 shadow-lg shadow-blue-100/60">
					{success ? (
						<div className="text-center py-4">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
								<svg
									className="h-6 w-6 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Check your email
							</h3>
							<p className="text-sm text-gray-600 mb-6">
								We&apos;ve sent a confirmation link to{' '}
								<span className="font-medium text-gray-900">
									{email}
								</span>
								. Please check your inbox and click the link to
								activate your account.
							</p>
							<Link
								href="/login"
								className="inline-block rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--accent-strong)"
							>
								Go to Login
							</Link>
						</div>
					) : (
						<>
							<OAuthButtons />

							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-200" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="bg-white px-3 text-gray-500">
										or continue with email
									</span>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Error Message */}
								{error && (
									<div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
										{error}
									</div>
								)}

								{/* Username Field */}
								<div>
									<label
										htmlFor="username"
										className="block text-sm font-medium text-gray-700 mb-1.5"
									>
										Username
									</label>
									<input
										id="username"
										type="text"
										value={username}
										onChange={e =>
											setUsername(e.target.value)
										}
										required
										autoComplete="username"
										placeholder="Choose a username"
										className="block w-full rounded-lg border border-(--border) bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-500 shadow-sm transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent)/20"
									/>
								</div>

								{/* Email Field */}
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 mb-1.5"
									>
										Email address
									</label>
									<input
										id="email"
										type="email"
										value={email}
										onChange={e => setEmail(e.target.value)}
										required
										autoComplete="email"
										placeholder="you@example.com"
										className="block w-full rounded-lg border border-(--border) bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-500 shadow-sm transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent)/20"
									/>
								</div>

								{/* Password Field */}
								<div>
									<label
										htmlFor="password"
										className="block text-sm font-medium text-gray-700 mb-1.5"
									>
										Password
									</label>
									<input
										id="password"
										type="password"
										value={password}
										onChange={e =>
											setPassword(e.target.value)
										}
										required
										autoComplete="new-password"
										minLength={6}
										placeholder="At least 6 characters"
										className="block w-full rounded-lg border border-(--border) bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-500 shadow-sm transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent)/20"
									/>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={loading}
									className="w-full cursor-pointer rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--accent-strong) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{loading
										? 'Creating account...'
										: 'Create Account'}
								</button>
							</form>
						</>
					)}
				</div>

				{/* Footer Link */}
				{!success && (
					<p className="mt-6 text-center text-sm text-slate-600">
						Already have an account?{' '}
						<Link
							href="/login"
							className="font-semibold text-(--accent) transition-colors hover:text-(--accent-strong)"
						>
							Sign in
						</Link>
					</p>
				)}
			</div>
		</div>
	)
}
