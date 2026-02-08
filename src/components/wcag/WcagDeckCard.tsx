'use client'

import { useState, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { WcagCard, WcagPrinciple } from '@/types'

/* ---- Principle colour mapping (exact accents from SVG card assets) ---- */

const principleAccentHex: Record<WcagPrinciple, string> = {
	Perceivable: '#B60000', // red
	Operable: '#1651A9', // blue
	Understandable: '#186312', // green
	Robust: '#535035', // brown
}

const principleBackBg: Record<WcagPrinciple, string> = {
	Perceivable: '#B60000',
	Operable: '#1651A9',
	Understandable: '#186312',
	Robust: '#535035',
}

const principleTextAccent: Record<WcagPrinciple, string> = {
	Perceivable: '#B60000',
	Operable: '#1651A9',
	Understandable: '#186312',
	Robust: '#535035',
}

/* ---- Helper: derive SVG path from criterion number ---- */

const principleFolder: Record<WcagPrinciple, string> = {
	Perceivable: '1-Perceivable',
	Operable: '2-Operable',
	Understandable: '3-Understandable',
	Robust: '4-Robust',
}

function getSvgPath(
	criterionNumber: string,
	principle: WcagPrinciple,
	level: string
): string {
	return `/cards/${principleFolder[principle]}/${level}/EN${criterionNumber}.svg`
}

/* ---- Props ---- */

export interface WcagDeckCardProps {
	card: WcagCard
}

/* ---- Component ---- */

export default function WcagDeckCard({ card }: WcagDeckCardProps) {
	const [isFlipped, setIsFlipped] = useState(false)

	const accentHex = principleAccentHex[card.principle]
	const backBgHex = principleBackBg[card.principle]
	const textAccentHex = principleTextAccent[card.principle]

	const toggleFlip = useCallback(() => {
		setIsFlipped(prev => !prev)
	}, [])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				toggleFlip()
			}
		},
		[toggleFlip]
	)

	return (
		<div
			className="group h-[420px] w-full cursor-pointer"
			style={{ perspective: '1000px' }}
			onClick={toggleFlip}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
			aria-label={`WCAG ${card.criterionNumber} ${card.title}. ${
				isFlipped
					? 'Showing description. Press Enter to flip back.'
					: 'Press Enter to see description.'
			}`}
		>
			{/* Card wrapper for 3D flip transform */}
			<div
				className={cn(
					'relative h-full w-full transition-transform duration-500 ease-in-out',
					isFlipped && '[transform:rotateY(180deg)]'
				)}
				style={{ transformStyle: 'preserve-3d' }}
			>
				{/* ======== FRONT SIDE — SVG Card Image ======== */}
				<div
					className="absolute inset-0 overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2"
					style={{
						backfaceVisibility: 'hidden',
						borderColor: accentHex,
					}}
					aria-hidden={isFlipped}
				>
					<Image
						src={getSvgPath(
							card.criterionNumber,
							card.principle,
							card.level
						)}
						alt={`WCAG ${card.criterionNumber} — ${card.title}`}
						fill
						className="object-contain p-1"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
					/>

					{/* Flip hint overlay */}
					<span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs text-gray-500 backdrop-blur-sm">
						<RotateCcw className="h-3 w-3" aria-hidden="true" />
						Flip
					</span>
				</div>

				{/* ======== BACK SIDE — Comprehensive Description ======== */}
				<div
					className="absolute inset-0 flex flex-col gap-3 overflow-y-auto rounded-xl border-2 p-5 shadow-sm transition-shadow group-hover:shadow-md"
					style={{
						backfaceVisibility: 'hidden',
						transform: 'rotateY(180deg)',
						borderColor: accentHex,
						backgroundColor: `${backBgHex}0D`,
					}}
					aria-hidden={!isFlipped}
				>
					{/* Header */}
					<div className="flex items-start justify-between gap-2">
						<h3
							className="text-sm font-bold"
							style={{ color: textAccentHex }}
						>
							{card.criterionNumber} &mdash; {card.title}
						</h3>
						<span className="shrink-0 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white">
							{card.level}
						</span>
					</div>

					{/* Principle tag */}
					<span
						className="self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
						style={{
							color: textAccentHex,
							backgroundColor: `${backBgHex}1A`,
						}}
					>
						{card.principle}
					</span>

					{/* Description */}
					<p className="flex-1 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
						{card.description}
					</p>

					{/* Explanation (if available) */}
					{card.explanation && (
						<p className="border-t border-gray-200 pt-2 text-xs italic leading-relaxed text-gray-600">
							{card.explanation}
						</p>
					)}

					{/* Flip-back hint */}
					<span className="mt-auto flex items-center gap-1 self-end text-xs text-gray-400">
						<RotateCcw className="h-3 w-3" aria-hidden="true" />
						Click to flip back
					</span>
				</div>
			</div>
		</div>
	)
}
