'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navLinks = [
	{ href: '/evaluate', label: 'Evaluate' },
	{ href: '/wcag-cards', label: 'WCAG Cards' },
	{ href: '/history', label: 'History' },
]

export default function Navbar() {
	const router = useRouter()
	const pathname = usePathname()
	const [user, setUser] = useState<User | null>(null)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [loggingOut, setLoggingOut] = useState(false)

	useEffect(() => {
		const supabase = createClient()

		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user)
		})

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

	return (
		<nav className="sticky top-0 z-50 border-b border-(--border) bg-white/95 backdrop-blur-xl">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left: Brand */}
					<div className="flex items-center gap-10">
						<Link
							href="/"
							className="font-display text-xl font-800 tracking-tight text-(--ink)"
							style={{
								fontFamily:
									'var(--font-syne), system-ui, sans-serif',
								fontWeight: 800,
							}}
						>
							<span className="text-(--accent)">A</span>WAE
						</Link>

						{/* Desktop Nav Links */}
						<div className="hidden md:flex items-center gap-0.5">
							{navLinks.map(link => (
								<Link
									key={link.href}
									href={link.href}
									className={`relative px-4 py-2 text-sm font-medium transition-colors ${
										pathname === link.href
											? 'text-(--accent)'
											: 'text-(--muted) hover:text-(--ink)'
									}`}
								>
									{pathname === link.href && (
										<span className="absolute inset-x-4 bottom-0 h-0.5 bg-(--accent) rounded-full" />
									)}
									{link.label}
								</Link>
							))}
						</div>
					</div>

					{/* Right: Auth Section (Desktop) */}
					<div className="hidden md:flex items-center gap-3">
						{user ? (
							<>
								<span className="max-w-48 truncate text-sm text-(--muted)">
									{user.email}
								</span>
								<button
									onClick={handleLogout}
									disabled={loggingOut}
									className="cursor-pointer rounded-none border border-(--border) bg-white px-4 py-2 text-sm font-medium text-(--ink) transition-colors hover:border-(--ink) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2 disabled:opacity-50"
								>
									{loggingOut ? 'Logging out…' : 'Logout'}
								</button>
							</>
						) : (
							<>
								<Link
									href="/login"
									className="px-4 py-2 text-sm font-medium text-(--muted) transition-colors hover:text-(--ink)"
								>
									Login
								</Link>
								<Link
									href="/signup"
									className="rounded-none bg-(--accent) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--accent-strong)"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="cursor-pointer inline-flex items-center justify-center p-2 text-(--ink) transition-colors hover:text-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent) md:hidden"
						aria-label="Toggle navigation menu"
					>
						{mobileMenuOpen ? (
							<svg
								className="h-5 w-5"
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
								className="h-5 w-5"
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
						className="fixed inset-0 top-16 z-40 bg-black/10 md:hidden"
					/>
					<div className="absolute left-0 right-0 top-full z-50 border-t border-(--border) bg-white shadow-lg md:hidden">
						<div className="px-4 py-4 space-y-1">
							{navLinks.map(link => (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className={`block px-3 py-2.5 text-sm font-medium transition-colors ${
										pathname === link.href
											? 'text-(--accent)'
											: 'text-(--ink) hover:text-(--accent)'
									}`}
								>
									{link.label}
								</Link>
							))}
						</div>

						<div className="border-t border-(--border) px-4 py-4">
							{user ? (
								<div className="space-y-3">
									<p className="truncate px-3 text-sm text-(--muted)">
										{user.email}
									</p>
									<button
										onClick={() => {
											setMobileMenuOpen(false)
											handleLogout()
										}}
										disabled={loggingOut}
										className="w-full cursor-pointer border border-(--border) px-3 py-2.5 text-left text-sm font-medium text-(--ink) transition-colors hover:border-(--ink) disabled:opacity-50"
									>
										{loggingOut ? 'Logging out…' : 'Logout'}
									</button>
								</div>
							) : (
								<div className="space-y-2">
									<Link
										href="/login"
										onClick={() => setMobileMenuOpen(false)}
										className="block px-3 py-2.5 text-sm font-medium text-(--muted) transition-colors hover:text-(--ink)"
									>
										Login
									</Link>
									<Link
										href="/signup"
										onClick={() => setMobileMenuOpen(false)}
										className="block bg-(--accent) px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-(--accent-strong)"
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
