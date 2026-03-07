'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

const navLinks = [
	{ href: '/evaluate', label: 'Evaluate' },
	{ href: '/wcag-cards', label: 'WCAG Cards' },
	{ href: '/history', label: 'History' },
]

const PREFERRED_ROLE_STORAGE_KEY = 'awae_preferred_role'
type PreferredRole = 'end-user' | 'developer' | 'designer' | 'auditor'

const ROLE_OPTIONS: { value: PreferredRole; label: string }[] = [
	{ value: 'end-user', label: 'End User' },
	{ value: 'developer', label: 'Developer' },
	{ value: 'designer', label: 'Designer' },
	{ value: 'auditor', label: 'Auditor' },
]

export default function Navbar() {
	const router = useRouter()
	const pathname = usePathname()
	const [user, setUser] = useState<User | null>(null)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [loggingOut, setLoggingOut] = useState(false)
	const [preferredRole, setPreferredRole] = useState<PreferredRole>('end-user')
	const [prefDropdownOpen, setPrefDropdownOpen] = useState(false)

	useEffect(() => {
		const supabase = createClient()

		// Get initial session
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user)
		})

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	useEffect(() => {
		setMobileMenuOpen(false)
	}, [pathname])

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(PREFERRED_ROLE_STORAGE_KEY)
			if (stored && ['end-user', 'developer', 'designer', 'auditor'].includes(stored)) {
				setPreferredRole(stored as PreferredRole)
			}
		} catch {
			// Ignore localStorage errors
		}
	}, [])

	useEffect(() => {
		if (!mobileMenuOpen) return
		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previousOverflow
		}
	}, [mobileMenuOpen])

	async function handleLogout() {
		setLoggingOut(true)
		try {
			const supabase = createClient()
			await supabase.auth.signOut()
			router.push('/login')
			router.refresh()
		} finally {
			setLoggingOut(false)
		}
	}

	async function handlePreferenceChange(role: PreferredRole) {
		setPreferredRole(role)
		setPrefDropdownOpen(false)
		try {
			window.localStorage.setItem(PREFERRED_ROLE_STORAGE_KEY, role)
			window.dispatchEvent(new Event('awae-preference-changed'))
		} catch {
			// Ignore localStorage errors
		}
		try {
			await fetch('/api/preferences', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ preferredRole: role }),
			})
		} catch {
			// Silent fail for API sync
		}
	}

	return (
		<nav className="sticky top-0 z-50 border-b border-(--border)/90 bg-white/90 backdrop-blur-xl">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left: Brand */}
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="text-xl font-semibold tracking-tight text-slate-900"
						>
							AWAE
						</Link>

						{/* Desktop Nav Links */}
						<div className="hidden md:flex items-center gap-1">
							{navLinks.map(link => (
								<Link
									key={link.href}
									href={link.href}
									className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-(--accent-soft) hover:text-(--accent)"
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>

					{/* Right: Auth Section (Desktop) */}
					<div className="hidden md:flex items-center gap-3">
						{user ? (
							<div className="flex items-center gap-3">
								{/* Preference Dropdown */}
								<div className="relative">
									<button
										type="button"
										onClick={() => setPrefDropdownOpen(!prefDropdownOpen)}
										className="flex items-center gap-1.5 rounded-lg border border-(--border) bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-(--accent-soft) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2"
									>
										<span className="text-xs text-slate-500">View:</span>
										<span className="font-medium">
											{ROLE_OPTIONS.find(r => r.value === preferredRole)?.label ?? 'End User'}
										</span>
										<ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', prefDropdownOpen && 'rotate-180')} aria-hidden="true" />
									</button>
									{prefDropdownOpen && (
										<>
											<button
												type="button"
												className="fixed inset-0 z-40"
												aria-label="Close preference dropdown"
												onClick={() => setPrefDropdownOpen(false)}
											/>
											<div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-(--border) bg-white py-1 shadow-lg">
												{ROLE_OPTIONS.map(option => (
													<button
														key={option.value}
														type="button"
														onClick={() => handlePreferenceChange(option.value)}
														className={cn(
															'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-(--accent-soft)',
															preferredRole === option.value
																? 'font-semibold text-(--accent)'
																: 'text-slate-700'
														)}
													>
														{option.label}
													</button>
												))}
											</div>
										</>
									)}
								</div>

								<span className="max-w-48 truncate text-sm text-slate-600">
									{user.email}
								</span>
								<button
									onClick={handleLogout}
									disabled={loggingOut}
									className="cursor-pointer rounded-lg border border-(--border) bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-(--accent-soft) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2 disabled:opacity-50"
								>
									{loggingOut ? 'Logging out...' : 'Logout'}
								</button>
							</div>
						) : (
							<>
								<Link
									href="/login"
									className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-(--accent-soft) hover:text-(--accent)"
								>
									Login
								</Link>
								<Link
									href="/signup"
									className="rounded-lg bg-(--accent) px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--accent-strong)"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="cursor-pointer inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition-colors hover:bg-(--accent-soft) focus:outline-none focus:ring-2 focus:ring-(--accent) md:hidden"
						aria-label="Toggle navigation menu"
					>
						{mobileMenuOpen ? (
							<svg
								className="h-6 w-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						) : (
							<svg
								className="h-6 w-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<>
					<button
						type="button"
						aria-label="Close mobile menu"
						onClick={() => setMobileMenuOpen(false)}
						className="fixed inset-0 top-16 z-40 bg-slate-900/15 backdrop-blur-[1px] md:hidden"
					/>
					<div className="absolute left-0 right-0 top-full z-50 border-t border-(--border) bg-white shadow-lg md:hidden">
						<div className="space-y-1 px-4 py-3">
							{navLinks.map(link => (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-(--accent-soft) hover:text-(--accent)"
								>
									{link.label}
								</Link>
							))}
						</div>

						<div className="border-t border-(--border) px-4 py-3">
							{user ? (
								<div className="space-y-3">
									<p className="truncate px-3 text-sm text-slate-600">
										{user.email}
									</p>
									{/* Mobile preference selector */}
									<div className="space-y-2 px-3">
										<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Report Preference</p>
										<div className="flex flex-wrap gap-1">
											{ROLE_OPTIONS.map(option => (
												<button
													key={option.value}
													type="button"
													onClick={() => handlePreferenceChange(option.value)}
													className={cn(
														'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
														preferredRole === option.value
															? 'bg-(--accent) text-white'
															: 'bg-(--accent-soft) text-slate-700'
													)}
												>
													{option.label}
												</button>
											))}
										</div>
									</div>
									<button
										onClick={() => {
											setMobileMenuOpen(false)
											handleLogout()
										}}
										disabled={loggingOut}
										className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-(--accent-soft) disabled:opacity-50"
									>
										{loggingOut
											? 'Logging out...'
											: 'Logout'}
									</button>
								</div>
							) : (
								<div className="space-y-2">
									<Link
										href="/login"
										onClick={() => setMobileMenuOpen(false)}
										className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-(--accent-soft)"
									>
										Login
									</Link>
									<Link
										href="/signup"
										onClick={() => setMobileMenuOpen(false)}
										className="block rounded-lg bg-(--accent) px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-(--accent-strong)"
									>
										Sign Up
									</Link>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</nav>
	)
}
