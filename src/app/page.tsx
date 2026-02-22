import Link from 'next/link'
import {
	BarChart3,
	ShieldCheck,
	Layers,
	ArrowRight,
	Code2,
	FileText,
	User,
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
		index: '01',
		icon: BarChart3,
		title: 'Multi-Level Reports',
		description:
			'Get tailored accessibility reports for three distinct audiences: developers, auditors, and end-users, each with the right level of technical detail.',
	},
	{
		index: '02',
		icon: ShieldCheck,
		title: 'WCAG 2.2 Compliance',
		description:
			'Powered by axe-core, evaluate websites against the latest WCAG 2.2 Level A and AA success criteria with comprehensive coverage.',
	},
	{
		index: '03',
		icon: Layers,
		title: 'Interactive WCAG Cards',
		description:
			'Learn about all WCAG 2.2 criteria through interactive deck cards with code examples, common violations, and remediation strategies.',
	},
]

const steps = [
	{
		number: '01',
		icon: Globe,
		title: 'Enter a URL',
		description: 'Paste any website URL to start the evaluation.',
	},
	{
		number: '02',
		icon: Search,
		title: 'Get Results',
		description:
			'Our engine analyses the page against WCAG 2.2 criteria using the industry-standard axe-core library.',
	},
	{
		number: '03',
		icon: CheckCircle2,
		title: 'View Reports',
		description:
			'Switch between developer, auditor, and end-user views to get insights tailored to your role.',
	},
]

const reportTypes = [
	{
		icon: Code2,
		role: 'Developer',
		label: 'DEV',
		description:
			'Detailed CSS selectors, HTML snippets, and remediation code examples to fix accessibility issues quickly.',
	},
	{
		icon: FileText,
		role: 'Auditor',
		label: 'AUD',
		description:
			'Compliance matrices, principle breakdowns, and formal violation descriptions for thorough auditing.',
	},
	{
		icon: User,
		role: 'End-User',
		label: 'END',
		description:
			'Plain-language summaries, accessibility scores, and priority recommendations anyone can understand.',
	},
]

const footerLinks = [
	{ href: '/evaluate', label: 'Evaluate' },
	{ href: '/wcag-cards', label: 'WCAG Cards' },
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
		? { href: '/dashboard', label: 'Dashboard' }
		: { href: '/login', label: 'Login' }

	const currentYear = new Date().getFullYear()

	return (
		<div className="flex flex-col">
			{/* ─── Hero Section ─── */}
			<section className="relative flex min-h-[calc(100vh-4rem)] items-center bg-background">
				{/* Geometric background accent */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute right-0 top-0 h-full w-1/2 overflow-hidden"
				>
					<div className="absolute right-[-5%] top-[10%] h-125 w-125 rounded-full border border-(--border) opacity-40" />
					<div className="absolute right-[10%] top-[5%] h-75 w-75 rounded-full border border-(--accent) opacity-10" />
					{/* eslint-disable-next-line react/forbid-component-props */}
					<div
						className="font-display absolute right-0 top-1/2 -translate-y-1/2 font-extrabold text-(--accent) opacity-[0.04] select-none leading-none"
						style={{ fontSize: 'clamp(140px, 20vw, 320px)' }}
					>
						2.2
					</div>
				</div>

				<div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
					<div className="lg:col-span-7">
						{/* Overline */}
						<div className="flex items-center gap-3 mb-6">
							<span className="h-px w-8 bg-(--accent)" />
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
								WCAG 2.2 — Multi-Audience Reports
							</p>
						</div>

						<h1
							className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-(--ink) sm:text-6xl lg:text-7xl"
						>
							Automated{' '}
							<span className="relative inline-block">
								<span className="relative z-10 text-(--accent)">
									Web
								</span>
							</span>
							<br />
							Accessibility
							<br />
							Evaluator
						</h1>

						<p className="mt-6 max-w-xl text-base leading-7 text-(--muted) sm:text-lg">
							Evaluate any website against WCAG 2.2 standards and
							get tailored reports for developers, auditors, and
							end-users — in seconds.
						</p>

						<div className="mt-10 flex flex-wrap items-center gap-4">
							<Link
								href="/evaluate"
								className={cn(
									'inline-flex items-center gap-2.5 bg-(--accent) px-6 py-3 text-sm font-semibold text-white',
									'transition-all hover:-translate-y-px hover:bg-(--accent-strong) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2'
								)}
							>
								Start Evaluating
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
							<Link
								href="/wcag-cards"
								className={cn(
									'inline-flex items-center gap-2 border border-(--border-strong) bg-white px-6 py-3 text-sm font-semibold text-(--ink)',
									'transition-all hover:-translate-y-px hover:border-(--ink) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2'
								)}
							>
								Browse WCAG Cards
							</Link>
						</div>

						{/* Stat pills */}
						<div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
							{[
								{ stat: '78', label: 'WCAG Criteria' },
								{ stat: '3', label: 'Report Types' },
								{ stat: '2.2', label: 'WCAG Version' },
							].map(({ stat, label }) => (
								<div key={label} className="flex flex-col">
									<span
											className="font-display text-3xl font-extrabold text-(--ink) leading-none"
									>
										{stat}
									</span>
									<span className="mt-0.5 text-xs font-medium uppercase tracking-widest text-(--muted)">
										{label}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="hidden lg:col-span-5 lg:block">
						<div className="border border-(--border) bg-white p-6 shadow-sm">
							<div className="mb-5 flex items-center justify-between">
								<p
									className="font-display text-sm font-bold uppercase tracking-widest text-(--ink)"
								>
									Report Snapshot
								</p>
								<span className="border border-(--accent) px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-(--accent)">
									WCAG 2.2
								</span>
							</div>
							<p className="mb-5 text-xs text-(--muted)">
								Preview of the three report types generated after
								evaluation.
							</p>

							<div className="space-y-3">
								{[
									{ role: 'End User', detail: 'Score + plain-language priorities', delay: '0s' },
									{ role: 'Developer', detail: '12 issues with code-level fixes', delay: '2s' },
									{ role: 'Auditor', detail: 'Compliance matrix + pass/fail summary', delay: '4s' },
								].map(({ role, detail, delay }) => (
									<div
										key={role}
										className="border-l-2 border-(--accent) bg-(--surface-elevated) p-4 motion-safe:animate-[hero-card-focus_6s_ease-in-out_infinite]"
										// eslint-disable-next-line react/forbid-component-props
										style={{ animationDelay: delay }}
									>
										<p
												className="font-display text-xs font-bold uppercase tracking-widest text-(--accent)"
										>
											{role}
										</p>
										<p className="mt-1 text-sm text-(--ink)">{detail}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─── Features Section ─── */}
			<section id="features" className="bg-white py-20 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Section header */}
					<div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
								Capabilities
							</span>
							<h2
								className="mt-2 text-4xl font-extrabold tracking-tight text-(--ink) sm:text-5xl"

							>
								Everything you need
								<br />
								for accessibility evaluation
							</h2>
						</div>
						<p className="max-w-xs text-sm leading-6 text-(--muted) sm:text-right">
							A complete toolkit to audit, understand, and improve
							web accessibility.
						</p>
					</div>

					<div className="border-t border-(--border)">
						{features.map((feature, i) => (
							<div
								key={feature.title}
								className={cn(
									'group grid grid-cols-[3rem_1fr] gap-6 border-b border-(--border) py-8 transition-colors hover:bg-(--surface-soft) sm:grid-cols-[4rem_1fr_2fr] lg:py-10',
									i === 0 && 'mt-0'
								)}
							>
								<span
									className="font-display text-sm font-bold text-(--accent) opacity-60 pt-0.5"

								>
									{feature.index}
								</span>
								<div className="sm:border-r sm:border-(--border) sm:pr-6">
									<div className="flex h-10 w-10 items-center justify-center border border-(--border) bg-(--surface-elevated) text-(--accent) transition-colors group-hover:border-(--accent) group-hover:bg-(--accent-soft)">
										<feature.icon className="h-5 w-5" aria-hidden="true" />
									</div>
									<h3
										className="mt-4 text-lg font-bold text-(--ink)"

									>
										{feature.title}
									</h3>
								</div>
								<p className="hidden text-sm leading-7 text-(--muted) sm:block sm:pt-0.5">
									{feature.description}
								</p>
								<p className="col-span-2 text-sm leading-7 text-(--muted) sm:hidden">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── How It Works Section ─── */}
			<section className="bg-background py-20 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-16">
						<span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
							Process
						</span>
						<h2
							className="mt-2 text-4xl font-extrabold tracking-tight text-(--ink) sm:text-5xl"

						>
							Three steps to a more
							<br />
							accessible website
						</h2>
					</div>

					<div className="grid gap-0 sm:grid-cols-3">
						{steps.map((step, i) => (
							<div
								key={step.number}
								className={cn(
									'relative border-t border-(--border) pt-8 pb-10',
									i !== steps.length - 1 &&
										'sm:border-r sm:border-(--border) sm:pr-10',
									i !== 0 && 'sm:pl-10'
								)}
							>
								<span
									className="font-display block text-6xl font-extrabold leading-none text-(--accent) opacity-20 select-none"

									aria-hidden="true"
								>
									{step.number}
								</span>
								<div className="mt-4 flex h-10 w-10 items-center justify-center bg-(--accent) text-white">
									<step.icon className="h-5 w-5" aria-hidden="true" />
								</div>
								<h3
									className="mt-4 text-lg font-bold text-(--ink)"

								>
									{step.title}
								</h3>
								<p className="mt-2 text-sm leading-6 text-(--muted)">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Report Types Section ─── */}
			<section className="bg-white py-20 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-16">
						<span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
							Reports
						</span>
						<h2
							className="mt-2 text-4xl font-extrabold tracking-tight text-(--ink) sm:text-5xl"

						>
							Tailored to your role
						</h2>
						<p className="mt-4 max-w-2xl text-base text-(--muted)">
							Every stakeholder gets the information they need, in
							the format that works for them.
						</p>
					</div>

					<div className="grid gap-px bg-(--border) sm:grid-cols-3">
						{reportTypes.map(report => (
							<div
								key={report.role}
								className="group bg-white p-8 transition-colors hover:bg-(--surface-soft)"
							>
								<span
									className="font-display block text-5xl font-extrabold leading-none text-(--border) select-none transition-colors group-hover:text-(--accent) group-hover:opacity-30"

									aria-hidden="true"
								>
									{report.label}
								</span>
								<div className="mt-5 flex h-10 w-10 items-center justify-center border border-(--border) text-(--accent) transition-colors group-hover:border-(--accent) group-hover:bg-(--accent-soft)">
									<report.icon className="h-5 w-5" aria-hidden="true" />
								</div>
								<h3
									className="mt-4 text-xl font-bold text-(--ink)"

								>
									{report.role}
								</h3>
								<p className="mt-2 text-sm leading-6 text-(--muted)">
									{report.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── CTA Section ─── */}
			<section className="bg-(--ink) py-16 sm:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
								Get Started
							</span>
							<h2
								className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"

							>
								Ready to evaluate
								<br />
								your website?
							</h2>
							<p className="mt-3 max-w-lg text-sm text-white/60">
								Start a free accessibility evaluation now and get
								actionable reports in seconds.
							</p>
						</div>
						<Link
							href="/evaluate"
							className={cn(
								'inline-flex shrink-0 items-center gap-2.5 bg-(--accent) px-7 py-3.5 text-sm font-bold text-white',
								'transition-all hover:-translate-y-px hover:bg-(--accent-strong) focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-(--ink)'
							)}
						>
							Start Evaluating
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</section>

			{/* ─── Footer ─── */}
			<footer className="border-t border-(--border) bg-background">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
						{/* Brand */}
						<div>
							<span
								className="font-display text-xl font-extrabold tracking-tight text-(--ink)"

							>
								<span className="text-(--accent)">A</span>WAE
							</span>
							<p className="mt-0.5 text-xs text-(--muted)">
								Automated Web Accessibility Evaluator
							</p>
						</div>

						{/* Links */}
						<nav aria-label="Footer navigation">
							<ul className="flex flex-wrap items-center gap-6">
								{[...footerLinks, footerAuthLink].map(link => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm font-medium text-(--muted) transition-colors hover:text-(--accent)"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>

					<div className="mt-8 border-t border-(--border) pt-6">
						<p className="text-xs text-(--muted)">
							© {currentYear} Group 7 — Babcock University
							25/26 Undergraduate Finalists
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}


/* ================================================================
   Data
   ================================================================ */
