'use client'

import { useState, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { WcagCard, WcagPrinciple } from '@/types'

/* ---- Principle colour mapping (exact accents from SVG card assets) ---- */

const principleBorderClass: Record<WcagPrinciple, string> = {
	Perceivable: 'border-[#B60000]',
	Operable: 'border-[#1651A9]',
	Understandable: 'border-[#186312]',
	Robust: 'border-[#535035]',
}

const principleBackBgClass: Record<WcagPrinciple, string> = {
	Perceivable: 'bg-[#B600000D]',
	Operable: 'bg-[#1651A90D]',
	Understandable: 'bg-[#1863120D]',
	Robust: 'bg-[#5350350D]',
}

const principleTextClass: Record<WcagPrinciple, string> = {
	Perceivable: 'text-[#B60000]',
	Operable: 'text-[#1651A9]',
	Understandable: 'text-[#186312]',
	Robust: 'text-[#535035]',
}

const principleTagBgClass: Record<WcagPrinciple, string> = {
	Perceivable: 'bg-[#B600001A]',
	Operable: 'bg-[#1651A91A]',
	Understandable: 'bg-[#1863121A]',
	Robust: 'bg-[#5350351A]',
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
	const [imageLoaded, setImageLoaded] = useState(false)

	const borderClass = principleBorderClass[card.principle]
	const backBgClass = principleBackBgClass[card.principle]
	const textClass = principleTextClass[card.principle]
	const tagBgClass = principleTagBgClass[card.principle]

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
			className={cn(
				'group aspect-2/3 w-full cursor-pointer perspective-[1000px]'
			)}
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
					'relative h-full w-full transform-3d transition-transform duration-500 ease-in-out',
					isFlipped && 'transform-[rotateY(180deg)]'
				)}
			>
				{/* ======== FRONT SIDE — SVG Card Image ======== */}
				<div
					className={cn(
						'absolute inset-0 overflow-hidden rounded-[5.2%] border-2 bg-white shadow-sm transition-colors group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2 backface-hidden',
						imageLoaded ? 'border-transparent' : borderClass
					)}
				>
					<Image
						src={getSvgPath(
							card.criterionNumber,
							card.principle,
							card.level
						)}
						alt={`WCAG ${card.criterionNumber} — ${card.title}`}
						fill
						className="object-contain"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
						onLoad={() => setImageLoaded(true)}
						onError={() => setImageLoaded(false)}
					/>

					{/* Flip hint overlay */}
					<span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs text-gray-500 backdrop-blur-sm">
						<RotateCcw className="h-3 w-3" aria-hidden="true" />
						Flip
					</span>
				</div>

				{/* ======== BACK SIDE — Comprehensive Description ======== */}
				<div
					className={cn(
						'absolute inset-0 overflow-hidden rounded-[5.2%] border-2 shadow-sm transition-shadow group-hover:shadow-md backface-hidden transform-[rotateY(180deg)]',
						borderClass,
						backBgClass
					)}
				>
					<div
						tabIndex={0}
						aria-label={`Details for WCAG ${card.criterionNumber} ${card.title}`}
						className="flex h-full flex-col gap-3 overflow-y-auto rounded-[calc(5.2%-2px)] p-5 pr-4 [scrollbar-gutter:stable] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
					>
						{/* Header */}
						<div className="flex items-start justify-between gap-2">
							<p className={cn('text-sm font-bold', textClass)}>
								{card.criterionNumber} &mdash; {card.title}
							</p>
							<span className="shrink-0 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white">
								{card.level}
							</span>
						</div>

						{/* Principle tag */}
						<span
							className={cn(
								'self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
								textClass,
								tagBgClass
							)}
						>
							{card.principle}
						</span>

						{/* Description */}
						<p className="flex-1 text-sm leading-relaxed whitespace-pre-line text-gray-700">
							{card.description}
						</p>

						{/* Explanation (if available) */}
						{card.explanation && (
							<p className="border-t border-gray-200 pt-2 text-xs italic leading-relaxed text-gray-600">
								{card.explanation}
							</p>
						)}

						{/* Flip-back hint */}
						<span className="mt-auto flex items-center gap-1 self-end text-xs text-gray-600">
							<RotateCcw className="h-3 w-3" aria-hidden="true" />
							Click to flip back
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
