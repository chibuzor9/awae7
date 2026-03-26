'use client'

import { Suspense, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

function LoginForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const redirectTo = searchParams.get('redirect') || '/evaluate'

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const supabase = createClient()
			const { error: authError } = await supabase.auth.signInWithPassword(
				{
					email,
					password,
				}
			)

			if (authError) {
				setError(authError.message)
				return
			}

			router.push(redirectTo)
			router.refresh()
		} catch {
			setError('An unexpected error occurred. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-[70vh] items-center justify-center bg-transparent px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-semibold text-slate-900">
						Welcome back
					</h1>
					<p className="mt-2 text-sm text-slate-600">
						Sign in to your AWAE account
					</p>
				</div>

				<div className="rounded-xl border border-(--border) bg-white p-7 shadow-lg shadow-blue-100/60">
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
						{error && (
							<div
								className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700"
								role="alert"
							>
								{error}
							</div>
						)}

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
								onChange={e => setPassword(e.target.value)}
								required
								autoComplete="current-password"
								placeholder="Enter your password"
								className="block w-full rounded-lg border border-(--border) bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-500 shadow-sm transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent)/20"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full cursor-pointer rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--accent-strong) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading ? 'Signing in...' : 'Sign In'}
						</button>
					</form>
				</div>

				<p className="mt-6 text-center text-sm text-slate-600">
					Don&apos;t have an account?{' '}
					<Link
						href="/signup"
						className="font-semibold text-(--accent) transition-colors hover:text-(--accent-strong)"
					>
						Create one
					</Link>
				</p>
			</div>
		</div>
	)
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-full flex items-center justify-center">
					<p className="text-gray-500">Loading...</p>
				</div>
			}
		>
			<LoginForm />
		</Suspense>
	)
}
