'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navLinks = [
	{ href: '/evaluate', label: 'Evaluate' },
	{ href: '/wcag-cards', label: 'WCAG Cards' },
	{ href: '/history', label: 'History' },
]

export default function Navbar() {
	const router = useRouter()
	const [user, setUser] = useState<User | null>(null)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [loggingOut, setLoggingOut] = useState(false)

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

	return (
		<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left: Brand */}
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="text-xl font-bold text-indigo-600 tracking-tight"
						>
							AWAE
						</Link>

						{/* Desktop Nav Links */}
						<div className="hidden md:flex items-center gap-1">
							{navLinks.map(link => (
								<Link
									key={link.href}
									href={link.href}
									className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>

					{/* Right: Auth Section (Desktop) */}
					<div className="hidden md:flex items-center gap-3">
						{user ? (
							<>
								<span className="text-sm text-gray-600 truncate max-w-48">
									{user.email}
								</span>
								<button
									onClick={handleLogout}
									disabled={loggingOut}
									className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors cursor-pointer"
								>
									{loggingOut ? 'Logging out...' : 'Logout'}
								</button>
							</>
						) : (
							<>
								<Link
									href="/login"
									className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
								>
									Login
								</Link>
								<Link
									href="/signup"
									className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
						aria-expanded={mobileMenuOpen}
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
				<div className="md:hidden border-t border-gray-200 bg-white">
					<div className="px-4 py-3 space-y-1">
						{navLinks.map(link => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setMobileMenuOpen(false)}
								className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
							>
								{link.label}
							</Link>
						))}
					</div>

					<div className="border-t border-gray-200 px-4 py-3">
						{user ? (
							<div className="space-y-3">
								<p className="px-3 text-sm text-gray-600 truncate">
									{user.email}
								</p>
								<button
									onClick={() => {
										setMobileMenuOpen(false)
										handleLogout()
									}}
									disabled={loggingOut}
									className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
								>
									{loggingOut ? 'Logging out...' : 'Logout'}
								</button>
							</div>
						) : (
							<div className="space-y-2">
								<Link
									href="/login"
									onClick={() => setMobileMenuOpen(false)}
									className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
								>
									Login
								</Link>
								<Link
									href="/signup"
									onClick={() => setMobileMenuOpen(false)}
									className="block px-3 py-2.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white text-center hover:bg-indigo-500 transition-colors"
								>
									Sign Up
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	)
}
