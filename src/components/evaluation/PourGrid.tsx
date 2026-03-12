'use client'

import type { PrincipleScore } from '@/types'

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
	return (
		<table className="w-full text-sm border-separate border-spacing-0">
			<thead>
				<tr>
					<th className="border-b border-r border-gray-200 px-5 py-2.5 text-left text-xs font-medium text-gray-500">
						Principle
					</th>
					<th className="border-b border-r border-gray-200 px-5 py-2.5 text-right text-xs font-medium text-gray-500">
						Score
					</th>
					<th className="border-b border-r border-gray-200 px-5 py-2.5 text-right text-xs font-medium text-gray-500">
						Issues
					</th>
					<th className="border-b border-gray-200 px-5 py-2.5 text-right text-xs font-medium text-gray-500">
						Review
					</th>
				</tr>
			</thead>
			<tbody>
				{principleScores.map((ps, i) => {
					const displayName = useFriendlyNames
						? (FRIENDLY_NAMES[ps.principle] ?? ps.principle)
						: ps.principle
					const isLast = i === principleScores.length - 1
					const bottomBorder = isLast
						? ''
						: 'border-b border-gray-200'

					return (
						<tr key={ps.principle}>
							<td
								className={`border-r border-gray-200 px-5 py-3 font-medium text-gray-900 ${bottomBorder}`}
							>
								{displayName}
							</td>
							<td
								className={`border-r border-gray-200 px-5 py-3 text-right font-bold tabular-nums text-gray-900 ${bottomBorder}`}
							>
								{ps.score}%
							</td>
							<td
								className={`border-r border-gray-200 px-5 py-3 text-right tabular-nums text-gray-700 ${bottomBorder}`}
							>
								{ps.issueCount === 0 ? '\u2014' : ps.issueCount}
							</td>
							<td
								className={`px-5 py-3 text-right tabular-nums text-gray-700 ${bottomBorder}`}
							>
								{ps.needsReviewCount === 0
									? '\u2014'
									: ps.needsReviewCount}
							</td>
						</tr>
					)
				})}
			</tbody>
		</table>
	)
}
