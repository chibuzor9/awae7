import Link from 'next/link'
import {
	BarChart3,
	ShieldCheck,
	Layers,
	ArrowRight,
	ChevronDown,
	Code2,
	FileText,
	User,
	Palette,
	Globe,
	Search,
	CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

/* ================================================================
   Data
   ================================================================ */

const features = [
	{
		icon: BarChart3,
		title: 'Multi-Level Reports',
		description:
			'Get tailored accessibility reports for four distinct audiences: developers, designers, auditors, and end-users, each with the right level of technical detail.',
	},
	{
		icon: ShieldCheck,
		title: 'WCAG 2.2 Compliance',
		description:
			'Powered by axe-core, evaluate websites against the latest WCAG 2.2 Level A and AA success criteria with comprehensive coverage.',
	},
	{
		icon: Layers,
		title: 'Interactive WCAG Cards',
		description:
			'Learn about all WCAG 2.2 criteria through interactive deck cards with code examples, common violations, and remediation strategies.',
	},
]

const steps = [
	{
		number: 1,
		icon: Globe,
		title: 'Enter a URL',
		description: 'Paste any website URL to start the evaluation.',
	},
	{
		number: 2,
		icon: Search,
		title: 'Get Results',
		description:
			'Our engine analyzes the page against WCAG 2.2 criteria using the industry-standard axe-core library.',
	},
	{
		number: 3,
		icon: CheckCircle2,
		title: 'View Reports',
		description:
			'Switch between developer, designer, auditor, and end-user views to get insights tailored to your role.',
	},
]

const reportTypes = [
	{
		icon: Code2,
		role: 'Developer',
		description:
			'Detailed CSS selectors, HTML snippets, and remediation code examples to fix accessibility issues quickly.',
		accent: 'border-blue-200 bg-blue-50 text-slate-900',
		iconAccent: 'text-blue-700',
	},
	{
		icon: Palette,
		role: 'Designer',
		description:
			'Live visual previews, color-contrast analysis, and design-oriented guidance to improve accessibility at the design level.',
		accent: 'border-blue-200 bg-blue-50 text-slate-900',
		iconAccent: 'text-blue-700',
	},
	{
		icon: FileText,
		role: 'Auditor',
		description:
			'Compliance matrices, principle breakdowns, and formal violation descriptions for thorough auditing.',
		accent: 'border-blue-200 bg-blue-50 text-slate-900',
		iconAccent: 'text-blue-700',
	},
	{
		icon: User,
		role: 'End-User',
		description:
			'Plain-language summaries, accessibility scores, and priority recommendations anyone can understand.',
		accent: 'border-blue-200 bg-blue-50 text-slate-900',
		iconAccent: 'text-blue-700',
	},
]

const footerLinks = [
	{ href: '/evaluate', label: 'Evaluate' },
	{ href: '/wcag-cards', label: 'WCAG Cards' },
	{ href: '/privacy-policy', label: 'Privacy Policy' },
]

/* ================================================================
   Component
   ================================================================ */

export default async function Home() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const footerAuthLink = user
		? { href: '/history', label: 'History' }
		: { href: '/login', label: 'Login' }

	const currentYear = new Date().getFullYear()

	return (
		<div className="flex flex-col">
			{/* ─── Hero Section ─── */}
			<section aria-label="Hero" className="relative flex min-h-[calc(100vh-4rem)] items-center bg-white">
				<div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
					<div className="mx-auto max-w-6xl text-center">
						<p className="inline-flex items-center rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-semibold text-(--accent)">
							WCAG 2.2 Multi-Audience Reports
						</p>
						<h1 className="mx-auto mt-4 max-w-5xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
							Automated Web{' '}
							<span className="text-blue-700">Accessibility</span>{' '}
							Evaluator
						</h1>

						<p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-slate-700 sm:text-lg">
							Evaluate any website against WCAG 2.2 standards and
							get tailored reports for developers, designers,
							auditors, and end-users.
						</p>

						<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
							<Link
								href="/evaluate"
								className={cn(
									'inline-flex items-center gap-2 rounded-lg bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white shadow-sm',
									'transition-all hover:-translate-y-0.5 hover:bg-(--accent-strong) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2'
								)}
							>
								Start Evaluating
								<ArrowRight
									className="h-4 w-4"
									aria-hidden="true"
								/>
							</Link>
							<Link
								href="/wcag-cards"
								className={cn(
									'inline-flex items-center gap-2 rounded-lg border border-(--border) bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm',
									'transition-all hover:-translate-y-0.5 hover:bg-(--accent-soft) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2'
								)}
							>
								Browse WCAG Cards
							</Link>
						</div>

						<div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
							<span className="rounded-md bg-white px-2.5 py-1">
								Developer View
							</span>
							<span className="rounded-md bg-white px-2.5 py-1">
								Designer View
							</span>
							<span className="rounded-md bg-white px-2.5 py-1">
								Auditor View
							</span>
							<span className="rounded-md bg-white px-2.5 py-1">
								End-User View
							</span>
						</div>
					</div>
				</div>

				<Link
					href="#features"
					aria-label="Scroll to features"
					className="absolute bottom-8 right-8 hidden h-8 w-8 items-center justify-center rounded-full border border-(--border) bg-white text-(--accent) shadow-sm transition-colors hover:bg-(--accent-soft) motion-safe:animate-[scroll-nudge_2.2s_ease-in-out_infinite] md:inline-flex lg:bottom-10 lg:right-10"
				>
					<ChevronDown className="h-4 w-4" aria-hidden="true" />
				</Link>
			</section>

			{/* ─── Features Section ─── */}
			<section id="features" aria-label="Features" className="bg-white py-16 sm:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
							Everything you need for accessibility evaluation
						</h2>
						<p className="mt-3 text-base text-slate-700 sm:text-lg">
							A complete toolkit to audit, understand, and improve
							web accessibility.
						</p>
					</div>

					<div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{features.map(feature => (
							<div
								key={feature.title}
								className="group rounded-xl border border-blue-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100">
									<feature.icon
										className="h-5 w-5"
										aria-hidden="true"
									/>
								</div>
								<h3 className="mt-4 text-lg font-semibold text-slate-900">
									{feature.title}
								</h3>
								<p className="mt-1.5 text-sm leading-6 text-slate-600">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── How It Works Section ─── */}
			<section aria-label="How it works" className="bg-linear-to-b from-white to-blue-50/40 py-16 sm:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
							How it works
						</h2>
						<p className="mt-3 text-base text-slate-700 sm:text-lg">
							Three simple steps to a more accessible website.
						</p>
					</div>

					<div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{steps.map(step => (
							<div
								key={step.number}
								className="rounded-xl border border-blue-100 bg-white p-6 text-center shadow-sm"
							>
								{/* Step icon circle */}
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
									<step.icon
										className="h-5 w-5"
										aria-hidden="true"
									/>
								</div>

								<span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
									Step {step.number}
								</span>

								<h3 className="mt-3 text-lg font-semibold text-slate-900">
									{step.title}
								</h3>
								<p className="mt-1.5 text-sm leading-6 text-slate-600">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Report Types Section ─── */}
			<section aria-label="Report types" className="bg-white py-16 sm:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
							Reports tailored to your role
						</h2>
						<p className="mt-3 text-base text-slate-700 sm:text-lg">
							Every stakeholder gets the information they need, in
							the format that works for them.
						</p>
					</div>

					<div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{reportTypes.map(report => (
							<div
								key={report.role}
								className={cn(
									'rounded-xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-md',
									report.accent
								)}
							>
								<report.icon
									className={cn('h-7 w-7', report.iconAccent)}
									aria-hidden="true"
								/>
								<h3 className="mt-3 text-lg font-semibold">
									{report.role}
								</h3>
								<p className="mt-1.5 text-sm leading-6 text-slate-700">
									{report.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Footer CTA ─── */}
			<section aria-label="Call to action" className="bg-linear-to-r from-slate-800 via-blue-800 to-blue-700 py-14 sm:py-16">
				<div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
						Ready to evaluate your website?
					</h2>
					<p className="mx-auto mt-3 max-w-xl text-base text-blue-100/95 sm:text-lg">
						Start a free accessibility evaluation now and get
						actionable reports in seconds.
					</p>
					<div className="mt-6">
						<Link
							href="/evaluate"
							className={cn(
								'inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm',
								'transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800'
							)}
						>
							Start Evaluating
							<ArrowRight
								className="h-4 w-4"
								aria-hidden="true"
							/>
						</Link>
					</div>
				</div>
			</section>

			{/* ─── Footer ─── */}
			<footer className="border-t border-blue-100 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
						{/* Brand */}
						<div className="flex flex-col items-center gap-1 sm:items-start">
							<span className="text-lg font-semibold tracking-tight text-blue-700">
								AWAE
							</span>
							<span className="text-sm text-slate-600">
								Automated Web Accessibility Evaluator
							</span>
						</div>

						{/* Links */}
						<nav aria-label="Footer navigation">
							<ul className="flex items-center gap-6">
								{[...footerLinks, footerAuthLink].map(link => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>

					<div className="mt-8 border-t border-blue-100 pt-6 text-center">
						<p className="text-sm text-slate-500">
							Copyright © {currentYear} Group 5, Babcock
							University 25/26 Undergraduate Finalists
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
