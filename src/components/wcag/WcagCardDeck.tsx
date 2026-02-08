'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, Filter, Layers } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import WcagDeckCard from '@/components/wcag/WcagDeckCard'
import { wcagCards } from '@/data/wcag-cards'
import type { WcagPrinciple, WcagLevel } from '@/types'

/* ---- Constants ---- */

const principles: WcagPrinciple[] = [
	'Perceivable',
	'Operable',
	'Understandable',
	'Robust',
]

const levels: WcagLevel[] = ['A', 'AA', 'AAA']

const principleOrder: Record<WcagPrinciple, number> = {
	Perceivable: 1,
	Operable: 2,
	Understandable: 3,
	Robust: 4,
}

const levelOrder: Record<string, number> = {
	A: 1,
	AA: 2,
	AAA: 3,
}

const principleActiveColors: Record<WcagPrinciple, string> = {
	Perceivable: 'bg-blue-600 text-white',
	Operable: 'bg-green-700 text-white',
	Understandable: 'bg-purple-600 text-white',
	Robust: 'bg-orange-600 text-white',
}

const principleHoverColors: Record<WcagPrinciple, string> = {
	Perceivable: 'hover:bg-blue-100 hover:text-blue-800',
	Operable: 'hover:bg-green-100 hover:text-green-800',
	Understandable: 'hover:bg-purple-100 hover:text-purple-800',
	Robust: 'hover:bg-orange-100 hover:text-orange-800',
}

/* ---- Sort helper ---- */

function parseCriterion(num: string): number[] {
	return num.split('.').map(Number)
}

/* ---- Component ---- */

export default function WcagCardDeck() {
	/* State */
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedPrinciple, setSelectedPrinciple] =
		useState<WcagPrinciple | null>(null)
	const [selectedLevel, setSelectedLevel] = useState<WcagLevel | null>(null)

	/* Filter & sort cards: principle → level → criterion number */
	const filteredCards = useMemo(() => {
		const query = searchQuery.toLowerCase().trim()

		const filtered = wcagCards.filter(card => {
			/* Principle filter */
			if (selectedPrinciple && card.principle !== selectedPrinciple)
				return false

			/* Level filter */
			if (selectedLevel && card.level !== selectedLevel) return false

			/* Search filter */
			if (query) {
				const matchesCriterion = card.criterionNumber
					.toLowerCase()
					.includes(query)
				const matchesTitle = card.title.toLowerCase().includes(query)
				const matchesDescription = card.description
					.toLowerCase()
					.includes(query)
				if (!matchesCriterion && !matchesTitle && !matchesDescription)
					return false
			}

			return true
		})

		/* Sort: Principle (P→O→U→R) → Level (A→AA→AAA) → Criterion number */
		return filtered.sort((a, b) => {
			const pA = principleOrder[a.principle]
			const pB = principleOrder[b.principle]
			if (pA !== pB) return pA - pB

			const lA = levelOrder[a.level] ?? 99
			const lB = levelOrder[b.level] ?? 99
			if (lA !== lB) return lA - lB

			const numsA = parseCriterion(a.criterionNumber)
			const numsB = parseCriterion(b.criterionNumber)
			for (let i = 0; i < Math.max(numsA.length, numsB.length); i++) {
				const diff = (numsA[i] ?? 0) - (numsB[i] ?? 0)
				if (diff !== 0) return diff
			}
			return 0
		})
	}, [searchQuery, selectedPrinciple, selectedLevel])

	/* Principle toggle */
	const handlePrincipleToggle = useCallback((principle: WcagPrinciple) => {
		setSelectedPrinciple(prev => (prev === principle ? null : principle))
	}, [])

	/* Level toggle */
	const handleLevelToggle = useCallback((level: WcagLevel) => {
		setSelectedLevel(prev => (prev === level ? null : level))
	}, [])

	return (
		<div className="space-y-6">
			{/* ======== Search & Filters ======== */}
			<div className="space-y-4">
				{/* Search bar */}
				<Input
					placeholder="Search by criterion number, title, or description..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					icon={<Search className="h-4 w-4" aria-hidden="true" />}
					aria-label="Search WCAG criteria"
				/>

				{/* Filter controls */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					{/* Principle filters */}
					<div
						className="flex flex-wrap items-center gap-2"
						role="group"
						aria-label="Filter by WCAG principle"
					>
						<span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
							<Filter className="h-4 w-4" aria-hidden="true" />
							Principle:
						</span>
						{principles.map(principle => {
							const isActive = selectedPrinciple === principle
							return (
								<button
									key={principle}
									type="button"
									onClick={() =>
										handlePrincipleToggle(principle)
									}
									aria-pressed={isActive}
									className={cn(
										'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
										isActive
											? principleActiveColors[principle]
											: cn(
													'bg-gray-100 text-gray-600',
													principleHoverColors[
														principle
													]
												)
									)}
								>
									{principle}
								</button>
							)
						})}
					</div>

					{/* Level filters */}
					<div
						className="flex items-center gap-2"
						role="group"
						aria-label="Filter by WCAG level"
					>
						<span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
							<Layers className="h-4 w-4" aria-hidden="true" />
							Level:
						</span>
						{levels.map(level => {
							const isActive = selectedLevel === level
							return (
								<button
									key={level}
									type="button"
									onClick={() => handleLevelToggle(level)}
									aria-pressed={isActive}
									className={cn(
										'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
										isActive
											? 'bg-gray-900 text-white'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									)}
								>
									{level}
								</button>
							)
						})}
					</div>
				</div>
			</div>

			{/* ======== Card count ======== */}
			<p
				className="text-sm text-gray-500"
				role="status"
				aria-live="polite"
			>
				Showing{' '}
				<span className="font-semibold text-gray-900">
					{filteredCards.length}
				</span>{' '}
				of{' '}
				<span className="font-semibold text-gray-900">
					{wcagCards.length}
				</span>{' '}
				criteria
			</p>

			{/* ======== Card grid or empty state ======== */}
			{filteredCards.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredCards.map(card => (
						<WcagDeckCard key={card.criterionId} card={card} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="mb-4 rounded-full bg-gray-100 p-4">
						<Search
							className="h-8 w-8 text-gray-400"
							aria-hidden="true"
						/>
					</div>
					<h3 className="text-lg font-semibold text-gray-900">
						No criteria found
					</h3>
					<p className="mt-1 max-w-md text-sm text-gray-500">
						No WCAG criteria match your current search or filters.
						Try adjusting your search term or clearing the filters
						to see more results.
					</p>
					<button
						type="button"
						onClick={() => {
							setSearchQuery('')
							setSelectedPrinciple(null)
							setSelectedLevel(null)
						}}
						className="mt-4 cursor-pointer rounded-sm text-sm font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
					>
						Clear all filters
					</button>
				</div>
			)}
		</div>
	)
}
