'use client'

import {
	CheckCircle2,
	Eye,
	MousePointer,
	BookOpen,
	Shield,
	Lightbulb,
	AlertTriangle,
	ArrowRight,
	type LucideIcon,
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreGauge } from '@/components/ui/ScoreGauge'
import { cn } from '@/lib/utils'
import type {
	EndUserReport as EndUserReportType,
	EndUserCategory,
} from '@/types'

// ---------- Props ----------
interface EndUserReportProps {
	report: EndUserReportType
}

// ---------- Icon Mapping ----------
const ICON_MAP: Record<string, LucideIcon> = {
	eye: Eye,
	'mouse-pointer': MousePointer,
	'book-open': BookOpen,
	shield: Shield,
}

function getCategoryIcon(iconName: string): LucideIcon {
	return ICON_MAP[iconName] ?? Shield
}

// ---------- Helpers ----------
function getScoreBorderColor(score: number): string {
	if (score >= 80) return 'border-green-400'
	if (score >= 50) return 'border-amber-400'
	return 'border-red-400'
}

function getScoreBarColor(score: number): string {
	if (score >= 80) return 'bg-green-500'
	if (score >= 50) return 'bg-amber-500'
	return 'bg-red-500'
}

function getScoreBgColor(score: number): string {
	if (score >= 80) return 'bg-green-50'
	if (score >= 50) return 'bg-amber-50'
	return 'bg-red-50'
}

function getScoreTextColor(score: number): string {
	if (score >= 80) return 'text-green-700'
	if (score >= 50) return 'text-amber-700'
	return 'text-red-700'
}

function getIssueBadgeVariant(count: number): 'success' | 'warning' | 'error' {
	if (count === 0) return 'success'
	if (count <= 3) return 'warning'
	return 'error'
}

function getInterpretation(score: number): {
	heading: string
	description: string
} {
	if (score >= 90) {
		return {
			heading: 'Excellent Accessibility',
			description:
				'This website does a great job of being accessible to everyone. Most people, including those who use assistive technologies like screen readers or keyboard navigation, should be able to use it with little to no difficulty. Only minor improvements may be needed.',
		}
	}
	if (score >= 70) {
		return {
			heading: 'Good Accessibility',
			description:
				'This website is fairly accessible, but there are some areas that could be improved. Most users will be able to navigate it without major issues, though people relying on assistive technologies may encounter occasional difficulties with certain features or content.',
		}
	}
	if (score >= 50) {
		return {
			heading: 'Needs Improvement',
			description:
				'This website has noticeable accessibility gaps that may make it difficult for some users to access content or complete tasks. People using screen readers, keyboard navigation, or other assistive tools may face significant barriers on certain parts of the site.',
		}
	}
	if (score >= 30) {
		return {
			heading: 'Poor Accessibility',
			description:
				'This website has significant accessibility problems that will prevent many users from being able to use it effectively. People with disabilities are likely to encounter serious barriers when trying to navigate, read content, or interact with features on this site.',
		}
	}
	return {
		heading: 'Critical Accessibility Issues',
		description:
			'This website has severe accessibility problems that make it very difficult or impossible for many users with disabilities to use. Urgent improvements are needed to ensure the site can be accessed by everyone, including those who depend on assistive technologies.',
	}
}

// ---------- Component ----------
export default function EndUserReport({ report }: EndUserReportProps) {
	const {
		score,
		scoreLabel,
		categories,
		priorities,
		needsReviewCount,
		summary,
	} = report
	const interpretation = getInterpretation(score)

	const attentionCategories = [...categories]
		.filter(category => category.issueCount > 0 || category.score < 80)
		.sort((a, b) => b.issueCount - a.issueCount)

	return (
		<div className="space-y-8">
			{/* ============ LARGE SCORE DISPLAY ============ */}
			<section
				aria-labelledby="score-heading"
				className="flex flex-col items-center text-center"
			>
				<h2 id="score-heading" className="sr-only">
					Accessibility Score
				</h2>
				<ScoreGauge score={score} size={180} />
				<p className="mt-3 text-xl font-semibold text-gray-900">
					{scoreLabel}
				</p>
				<p className="mt-1 text-sm text-gray-500">
					out of 100 possible points
					{(needsReviewCount ?? 0) > 0 && (
						<span className="block mt-1 text-amber-600">
							{needsReviewCount}{' '}
							{needsReviewCount === 1 ? 'area' : 'areas'} need
							manual review
						</span>
					)}
				</p>
			</section>

			{/* ============ ISSUE SNAPSHOT ============ */}
			<section aria-labelledby="snapshot-heading">
				<Card>
					<CardHeader>
						<h2
							id="snapshot-heading"
							className="text-lg font-semibold text-gray-900"
						>
							Issue Snapshot
						</h2>
						<p className="text-sm text-gray-500 mt-1">
							Quick summary of what needs attention now.
						</p>
					</CardHeader>
					<CardBody className="space-y-4">
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div className="rounded-lg border border-red-200 bg-red-50 p-3">
								<p className="text-xs text-red-700">Critical</p>
								<p className="text-lg font-bold text-red-700">
									{summary.criticalCount}
								</p>
							</div>
							<div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
								<p className="text-xs text-orange-700">
									Serious
								</p>
								<p className="text-lg font-bold text-orange-700">
									{summary.seriousCount}
								</p>
							</div>
							<div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
								<p className="text-xs text-amber-700">
									Moderate
								</p>
								<p className="text-lg font-bold text-amber-700">
									{summary.moderateCount}
								</p>
							</div>
							<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
								<p className="text-xs text-blue-700">Minor</p>
								<p className="text-lg font-bold text-blue-700">
									{summary.minorCount}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
							<div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
								<AlertTriangle
									className="h-4 w-4"
									aria-hidden="true"
								/>
								<span>
									{summary.totalViolations} detected issues,{' '}
									{needsReviewCount} require manual review
								</span>
							</div>
							<div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
								<CheckCircle2
									className="h-4 w-4"
									aria-hidden="true"
								/>
								<span>
									{summary.totalPasses} accessibility checks
									passed
								</span>
							</div>
						</div>

						{attentionCategories.length > 0 && (
							<div>
								<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
									Areas needing attention first
								</p>
								<ul className="space-y-2">
									{attentionCategories
										.slice(0, 4)
										.map(category => (
											<li
												key={category.name}
												className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
											>
												<span className="font-medium text-gray-800">
													{category.name}
												</span>
												<span className="tabular-nums text-gray-600">
													{category.issueCount} issues
													· {category.score}/100
												</span>
											</li>
										))}
								</ul>
							</div>
						)}
					</CardBody>
				</Card>
			</section>

			{/* ============ WHAT THIS MEANS ============ */}
			<section aria-labelledby="interpretation-heading">
				<Card>
					<CardBody>
						<h2
							id="interpretation-heading"
							className="text-lg font-semibold text-gray-900 mb-2"
						>
							What This Means
						</h2>
						<div
							className={cn(
								'rounded-lg p-4',
								getScoreBgColor(score)
							)}
						>
							<p
								className={cn(
									'text-sm font-semibold mb-1',
									getScoreTextColor(score)
								)}
							>
								{interpretation.heading}
							</p>
							<p className="text-sm text-gray-700 leading-relaxed">
								{interpretation.description}
							</p>
						</div>
					</CardBody>
				</Card>
			</section>

			{/* ============ CATEGORY CARDS ============ */}
			<section aria-labelledby="categories-heading">
				<h2
					id="categories-heading"
					className="text-lg font-semibold text-gray-900 mb-4"
				>
					How Your Site Performs
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{categories.map(cat => (
						<CategoryCard key={cat.name} category={cat} />
					))}
				</div>
			</section>

			{/* ============ PRIORITY ACTIONS ============ */}
			{priorities.length > 0 && (
				<section aria-labelledby="priorities-heading">
					<Card>
						<CardHeader>
							<h2
								id="priorities-heading"
								className="text-lg font-semibold text-gray-900"
							>
								What to Fix First
							</h2>
							<p className="text-sm text-gray-500 mt-1">
								These are the most important steps to improve
								accessibility on your site.
							</p>
						</CardHeader>
						<CardBody className="p-0">
							<ol
								className="divide-y divide-gray-100"
								role="list"
							>
								{priorities.map((priority, index) => (
									<li
										key={index}
										className="flex items-start gap-4 px-6 py-4 hover:bg-amber-50/50 transition-colors"
									>
										{/* Number badge */}
										<span
											className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0 mt-0.5"
											aria-hidden="true"
										>
											{index + 1}
										</span>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start gap-2">
												<Lightbulb
													className="h-4 w-4 text-amber-500 mt-0.5 shrink-0"
													aria-hidden="true"
												/>
												<p className="text-sm text-gray-800 leading-relaxed">
													{priority}
												</p>
											</div>
										</div>

										<ArrowRight
											className="h-4 w-4 text-gray-300 shrink-0 mt-0.5"
											aria-hidden="true"
										/>
									</li>
								))}
							</ol>
						</CardBody>
					</Card>
				</section>
			)}
		</div>
	)
}

// ---------- Category Card Sub-Component ----------
function CategoryCard({ category }: { category: EndUserCategory }) {
	const Icon = getCategoryIcon(category.icon)

	return (
		<Card
			className={cn(
				'border-l-4 transition-shadow hover:shadow-md',
				getScoreBorderColor(category.score)
			)}
		>
			<CardBody className="space-y-3">
				{/* Header row: icon + name + issue badge */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div
							className={cn(
								'flex items-center justify-center h-9 w-9 rounded-lg',
								getScoreBgColor(category.score)
							)}
						>
							<Icon
								className={cn(
									'h-5 w-5',
									getScoreTextColor(category.score)
								)}
								aria-hidden="true"
							/>
						</div>
						<h3 className="text-sm font-semibold text-gray-900">
							{category.name}
						</h3>
					</div>
					<Badge variant={getIssueBadgeVariant(category.issueCount)}>
						{category.issueCount === 0
							? 'No issues'
							: `${category.issueCount} ${category.issueCount === 1 ? 'issue' : 'issues'}`}
					</Badge>{' '}
					{(category.needsReviewCount ?? 0) > 0 && (
						<Badge variant="warning">
							{category.needsReviewCount} to review
						</Badge>
					)}{' '}
				</div>

				{/* Description */}
				<p className="text-sm text-gray-600 leading-relaxed">
					{category.description}
				</p>

				{/* Score bar */}
				<div className="space-y-1">
					<div className="flex items-center justify-between text-xs">
						<span className="text-gray-500">Score</span>
						<span
							className={cn(
								'font-semibold tabular-nums',
								getScoreTextColor(category.score)
							)}
						>
							{category.score}/100
						</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
						<svg
							className="h-full w-full"
							viewBox="0 0 100 2"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							<rect
								x="0"
								y="0"
								width={Math.max(
									0,
									Math.min(100, category.score)
								)}
								height="2"
								className={cn(
									'transition-all duration-500',
									getScoreBarColor(category.score)
								)}
							/>
						</svg>
					</div>
				</div>
			</CardBody>
		</Card>
	)
}
