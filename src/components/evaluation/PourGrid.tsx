'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PrincipleScore } from '@/types'

const PRINCIPLE_COLORS: Record<
	string,
	{ border: string; bg: string; text: string; bar: string; label: string }
> = {
	Perceivable: {
		border: 'border-l-[#B60000]',
		bg: 'bg-[#B600000D]',
		text: 'text-[#B60000]',
		bar: 'bg-[#B60000]',
		label: 'Perceivable',
	},
	Operable: {
		border: 'border-l-[#1651A9]',
		bg: 'bg-[#1651A90D]',
		text: 'text-[#1651A9]',
		bar: 'bg-[#1651A9]',
		label: 'Operable',
	},
	Understandable: {
		border: 'border-l-[#186312]',
		bg: 'bg-[#1863120D]',
		text: 'text-[#186312]',
		bar: 'bg-[#186312]',
		label: 'Understandable',
	},
	Robust: {
		border: 'border-l-[#535035]',
		bg: 'bg-[#5350350D]',
		text: 'text-[#535035]',
		bar: 'bg-[#535035]',
		label: 'Robust',
	},
}

const FRIENDLY_NAMES: Record<string, string> = {
	Perceivable: 'Content Visibility',
	Operable: 'Navigation & Interaction',
	Understandable: 'Clarity & Readability',
	Robust: 'Technical Compatibility',
}

interface PourGridProps {
	principleScores: PrincipleScore[]
	useFriendlyNames?: boolean
}

export default function PourGrid({
	principleScores,
	useFriendlyNames = false,
}: PourGridProps) {
	const [expanded, setExpanded] = useState<string | null>(null)

	return (
		<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
			{principleScores.map(ps => {
				const colors = PRINCIPLE_COLORS[ps.principle] ?? PRINCIPLE_COLORS.Perceivable
				const isExpanded = expanded === ps.principle
				const displayName = useFriendlyNames
					? FRIENDLY_NAMES[ps.principle] ?? ps.principle
					: ps.principle

				return (
					<button
						key={ps.principle}
						type="button"
						onClick={() =>
							setExpanded(prev =>
								prev === ps.principle ? null : ps.principle
							)
						}
						className={cn(
							'rounded-xl border border-(--border) border-l-4 p-4 text-left transition-shadow hover:shadow-sm',
							colors.border,
							colors.bg
						)}
						aria-expanded={isExpanded}
					>
						<div className="flex items-center justify-between">
							<span className={cn('text-sm font-semibold', colors.text)}>
								{displayName}
							</span>
							<ChevronDown
								className={cn(
									'h-4 w-4 transition-transform',
									colors.text,
									isExpanded && 'rotate-180'
								)}
								aria-hidden="true"
							/>
						</div>

						<p className="mt-2 text-2xl font-bold text-(--text)">
							{ps.score}%
						</p>
						<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
							<div
								className={cn('h-full rounded-full transition-all', colors.bar)}
								style={{ width: `${ps.score}%` }}
							/>
						</div>

						<p className="mt-2 text-xs text-(--muted-text)">
							{ps.issueCount === 0
								? 'No Issues Detected'
								: `${ps.issueCount} issue${ps.issueCount !== 1 ? 's' : ''} found`}
							{ps.needsReviewCount > 0 &&
								` · ${ps.needsReviewCount} need${ps.needsReviewCount !== 1 ? '' : 's'} review`}
						</p>

						{isExpanded && (
							<div
								className="mt-3 border-t border-(--border) pt-3 text-xs text-(--muted-text)"
								onClick={e => e.stopPropagation()}
							>
								{ps.issueCount === 0 && ps.needsReviewCount === 0 ? (
									<p>All checks passed for this principle.</p>
								) : (
									<p>
										{ps.issueCount} violation{ps.issueCount !== 1 ? 's' : ''} and{' '}
										{ps.needsReviewCount} item{ps.needsReviewCount !== 1 ? 's' : ''} needing
										review. See the report below for details.
									</p>
								)}
							</div>
						)}
					</button>
				)
			})}
		</div>
	)
}
