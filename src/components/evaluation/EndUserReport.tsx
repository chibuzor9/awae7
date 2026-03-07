'use client'

import {
	Eye,
	MousePointer,
	BookOpen,
	Shield,
	Lightbulb,
	AlertTriangle,
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
	} = report
	const interpretation = getInterpretation(score)

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

			{/* ============ WHAT THIS MEANS ============ */}
			<section aria-labelledby="interpretation-heading">
				<Card className="transition-all duration-200 hover:shadow-md">
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
					How This Site Performs
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
					<Card className="transition-all duration-200 hover:shadow-md">
						<CardHeader>
							<h2
								id="priorities-heading"
								className="text-lg font-semibold text-gray-900"
							>
								What Users Are Likely to Experience
							</h2>
							<p className="text-sm text-gray-500 mt-1">
								These are the most noticeable accessibility pain
								points people may run into first.
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
										className="flex items-start gap-4 px-6 py-4 transition-all duration-200 hover:bg-blue-50/60"
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

										<AlertTriangle
											className="h-4 w-4 text-blue-300 shrink-0 mt-0.5"
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
				'border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
				getScoreBorderColor(category.score)
			)}
		>
			<CardBody className="flex h-full flex-col gap-3">
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
							? 'No Issues Detected'
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
				<div className="mt-auto space-y-1">
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
