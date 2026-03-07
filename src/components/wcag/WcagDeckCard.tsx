'use client'

import { useState, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
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

	const handleReferenceClick = useCallback(
		(
			e:
				| React.MouseEvent<HTMLAnchorElement>
				| React.KeyboardEvent<HTMLAnchorElement>
		) => {
			e.preventDefault()
			e.stopPropagation()

			const shouldRedirect = window.confirm(
				`You are about to leave AWAE and open the WCAG reference for ${card.criterionNumber}. Continue?`
			)

			if (!shouldRedirect) return

			window.open(card.url, '_blank', 'noopener,noreferrer')
		},
		[card.criterionNumber, card.url]
	)

	return (
		<div
			className={cn(
				'group aspect-2/3 w-full cursor-pointer perspective-[1000px]'
			)}
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
					onClick={toggleFlip}
				>
					<object
						data={getSvgPath(
							card.criterionNumber,
							card.principle,
							card.level
						)}
						type="image/svg+xml"
						aria-hidden="true"
						tabIndex={-1}
						className="pointer-events-none h-full w-full"
						onLoad={() => setImageLoaded(true)}
					/>

					{/* Flip hint overlay */}
					<button
						type="button"
						onClick={e => {
							e.stopPropagation()
							toggleFlip()
						}}
						className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/55 px-2 py-1 text-xs text-gray-600 backdrop-blur-[1px] transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						aria-label={`Flip WCAG ${card.criterionNumber} card to details`}
					>
						<RotateCcw className="h-3 w-3" aria-hidden="true" />
						Flip
					</button>
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
						onClick={toggleFlip}
						aria-label={`Details for WCAG ${card.criterionNumber} ${card.title}`}
						className="flex h-full flex-col gap-3 overflow-y-auto rounded-[calc(5.2%-2px)] p-5 pr-4 [scrollbar-gutter:stable] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
					>
						{/* Header */}
						<div className="flex items-start justify-between gap-2">
							<a
								href={card.url}
								target="_blank"
								rel="noopener noreferrer"
								onClick={handleReferenceClick}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										handleReferenceClick(e)
									}
								}}
								className={cn(
									'cursor-pointer text-left text-sm font-bold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
									textClass
								)}
								aria-label={`Open external reference for WCAG ${card.criterionNumber} ${card.title}`}
							>
								{card.criterionNumber} &mdash; {card.title}
							</a>
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
						<button
							type="button"
							onClick={e => {
								e.stopPropagation()
								toggleFlip()
							}}
							className="mt-auto flex items-center gap-1 self-end text-xs text-gray-600 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
							aria-label={`Flip WCAG ${card.criterionNumber} card back to artwork`}
						>
							<RotateCcw className="h-3 w-3" aria-hidden="true" />
							Click to flip back
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
