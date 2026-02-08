'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Code2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Severity, WcagLevel, WcagPrinciple, WcagCategory } from '@/types'

/* ---- Types ---- */

interface CheckData {
	contrastRatio?: number
	fgColor?: string
	bgColor?: string
	fontSize?: string
	fontWeight?: string
	expectedContrastRatio?: string
	[key: string]: unknown
}

interface ViolationElement {
	selector: string
	htmlSnippet: string
	failureSummary: string
	checkData?: CheckData
}

export interface ViolationCardProps {
	ruleId: string
	severity: Severity
	description: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	helpUrl: string
	elements: ViolationElement[]
	remediation: string
	category?: WcagCategory
	onWcagCardClick?: (criterionNumber: string) => void
}

/* ---- Helpers ---- */

const severityBadgeVariant: Record<Severity, 'error' | 'warning' | 'info'> = {
	critical: 'error',
	serious: 'warning',
	moderate: 'warning',
	minor: 'info',
}

const severityBorderColor: Record<Severity, string> = {
	critical: 'border-l-red-500',
	serious: 'border-l-orange-500',
	moderate: 'border-l-amber-500',
	minor: 'border-l-blue-500',
}

/* ---- Component ---- */

export function ViolationCard({
	ruleId,
	severity,
	description,
	wcagCriterion,
	wcagLevel,
	wcagPrinciple,
	helpUrl,
	elements,
	remediation,
	category,
	onWcagCardClick,
}: ViolationCardProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	const toggle = useCallback(() => {
		setIsExpanded(prev => !prev)
	}, [])

	const handleWcagClick = useCallback(() => {
		onWcagCardClick?.(wcagCriterion)
	}, [onWcagCardClick, wcagCriterion])

	const handleWcagKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				onWcagCardClick?.(wcagCriterion)
			}
		},
		[onWcagCardClick, wcagCriterion]
	)

	const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

	return (
		<Card
			className={cn(
				'border-l-4 transition-shadow hover:shadow-md',
				severityBorderColor[severity]
			)}
		>
			{/* Collapsed header -- always visible */}
			<button
				type="button"
				onClick={toggle}
				aria-expanded={isExpanded ? 'true' : 'false'}
				aria-controls={`violation-details-${ruleId}`}
				className="flex w-full items-start gap-3 px-6 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
			>
				<ChevronIcon
					className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
					aria-hidden="true"
				/>

				<div className="flex flex-1 flex-wrap items-start gap-2">
					{/* Rule ID + description */}
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-gray-900">
							<code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
								{ruleId}
							</code>
						</p>
						<p className="mt-1 text-sm text-gray-600 leading-snug">
							{description}
						</p>
					</div>

					{/* Badges + element count */}
					<div className="flex shrink-0 flex-wrap items-center gap-2">
						<Badge variant={severityBadgeVariant[severity]}>
							{severity}
						</Badge>

						<Badge variant="info">
							{wcagLevel === 'best-practice'
								? 'Best Practice'
								: `WCAG ${wcagCriterion} (${wcagLevel})`}
						</Badge>

						{category && (
							<Badge variant="default">{category}</Badge>
						)}

						<span className="text-xs text-gray-500">
							({elements.length}{' '}
							{elements.length === 1 ? 'instance' : 'instances'})
						</span>
					</div>
				</div>
			</button>

			{/* Expanded details */}
			{isExpanded && (
				<div
					id={`violation-details-${ruleId}`}
					role="region"
					aria-label={`Details for ${ruleId}`}
				>
					<CardBody className="space-y-5 border-t border-gray-100 pt-4">
						{/* Meta row: principle + help link */}
						<div className="flex flex-wrap items-center gap-4 text-sm">
							{/* WCAG criterion -- clickable */}
							{onWcagCardClick ? (
								<span
									role="button"
									tabIndex={0}
									onClick={handleWcagClick}
									onKeyDown={handleWcagKeyDown}
									className="cursor-pointer font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-sm"
								>
									WCAG {wcagCriterion} - {wcagPrinciple}
								</span>
							) : (
								<span className="font-medium text-gray-700">
									WCAG {wcagCriterion} - {wcagPrinciple}
								</span>
							)}

							<a
								href={helpUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-sm"
							>
								Learn more
								<ExternalLink
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								<span className="sr-only">
									(opens in a new tab)
								</span>
							</a>
						</div>

						{/* Affected elements */}
						<div>
							<h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
								<Code2
									className="h-4 w-4 text-gray-500"
									aria-hidden="true"
								/>
								Affected Elements ({elements.length})
							</h4>

							<ul className="space-y-3" role="list">
								{elements.map((el, index) => (
									<li
										key={`${el.selector}-${index}`}
										className="rounded-lg border border-gray-200 bg-gray-50 p-3"
									>
										{/* Selector */}
										<p className="mb-1 text-xs font-medium text-gray-500">
											Selector
										</p>
										<code className="block break-all rounded bg-white px-2 py-1 font-mono text-xs text-gray-800 border border-gray-200">
											{el.selector}
										</code>

										{/* HTML snippet */}
										<p className="mb-1 mt-3 text-xs font-medium text-gray-500">
											HTML Snippet
										</p>
										<pre className="overflow-x-auto rounded bg-gray-900 px-3 py-2 font-mono text-xs text-green-400 leading-relaxed">
											<code>{el.htmlSnippet}</code>
										</pre>

										{/* Failure summary */}
										<p className="mb-1 mt-3 text-xs font-medium text-gray-500">
											Failure Summary
										</p>
										<p className="text-sm text-gray-700 leading-relaxed">
											{el.failureSummary}
										</p>

										{/* Check data (e.g. color contrast) */}
										{el.checkData &&
											Object.keys(el.checkData).length >
												0 && (
												<div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
													<p className="mb-1.5 text-xs font-medium text-blue-700">
														Measured Values
													</p>
													<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
														{el.checkData
															.contrastRatio !=
															null && (
															<>
																<span className="text-gray-600">
																	Contrast
																	Ratio
																</span>
																<span className="font-mono font-semibold text-gray-900">
																	{Number(
																		el
																			.checkData
																			.contrastRatio
																	).toFixed(
																		2
																	)}
																	:1
																</span>
															</>
														)}
														{el.checkData
															.expectedContrastRatio && (
															<>
																<span className="text-gray-600">
																	Required
																</span>
																<span className="font-mono text-gray-900">
																	{
																		el
																			.checkData
																			.expectedContrastRatio
																	}
																</span>
															</>
														)}
														{el.checkData
															.fgColor && (
															<>
																<span className="text-gray-600">
																	Foreground
																</span>
																<span className="flex items-center gap-1.5 font-mono text-gray-900">
																	<span
																		className="inline-block h-3 w-3 rounded border border-gray-300"
																		style={{
																			backgroundColor:
																				el
																					.checkData
																					.fgColor,
																		}}
																		aria-hidden="true"
																	/>
																	{
																		el
																			.checkData
																			.fgColor
																	}
																</span>
															</>
														)}
														{el.checkData
															.bgColor && (
															<>
																<span className="text-gray-600">
																	Background
																</span>
																<span className="flex items-center gap-1.5 font-mono text-gray-900">
																	<span
																		className="inline-block h-3 w-3 rounded border border-gray-300"
																		style={{
																			backgroundColor:
																				el
																					.checkData
																					.bgColor,
																		}}
																		aria-hidden="true"
																	/>
																	{
																		el
																			.checkData
																			.bgColor
																	}
																</span>
															</>
														)}
														{el.checkData
															.fontSize && (
															<>
																<span className="text-gray-600">
																	Font Size
																</span>
																<span className="font-mono text-gray-900">
																	{
																		el
																			.checkData
																			.fontSize
																	}
																</span>
															</>
														)}
														{el.checkData
															.fontWeight && (
															<>
																<span className="text-gray-600">
																	Font Weight
																</span>
																<span className="font-mono text-gray-900">
																	{
																		el
																			.checkData
																			.fontWeight
																	}
																</span>
															</>
														)}
													</div>
												</div>
											)}
									</li>
								))}
							</ul>
						</div>

						{/* Remediation guidance */}
						<div>
							<h4 className="mb-2 text-sm font-semibold text-gray-900">
								Remediation Guidance
							</h4>
							<div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
								<p className="text-sm text-green-900 leading-relaxed whitespace-pre-line">
									{remediation}
								</p>
							</div>
						</div>
					</CardBody>
				</div>
			)}
		</Card>
	)
}
