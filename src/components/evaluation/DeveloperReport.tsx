'use client'

import { useState, useMemo, useCallback } from 'react'
import {
	AlertTriangle,
	AlertCircle,
	Info,
	ShieldAlert,
	Calendar,
	Globe,
	Layers,
	Filter,
	SearchX,
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreGauge } from '@/components/ui/ScoreGauge'
import { cn, formatDate } from '@/lib/utils'
import { ViolationCard } from '@/components/evaluation/ViolationCard'
import type {
	DeveloperReport as DeveloperReportType,
	Severity,
	WcagPrinciple,
	WcagLevel,
} from '@/types'

/* ---- Types ---- */

export interface DeveloperReportProps {
	report: DeveloperReportType
	onWcagCardClick?: (criterionNumber: string) => void
}

/* ---- Constants ---- */

const ALL_SEVERITIES: Severity[] = ['critical', 'serious', 'moderate', 'minor']
const ALL_PRINCIPLES: WcagPrinciple[] = [
	'Perceivable',
	'Operable',
	'Understandable',
	'Robust',
]
const ALL_LEVELS: WcagLevel[] = ['A', 'AA']

const severityConfig: Record<
	Severity,
	{ icon: typeof AlertTriangle; colorClass: string; bgClass: string }
> = {
	critical: {
		icon: ShieldAlert,
		colorClass: 'text-red-600',
		bgClass: 'bg-red-50',
	},
	serious: {
		icon: AlertTriangle,
		colorClass: 'text-orange-600',
		bgClass: 'bg-orange-50',
	},
	moderate: {
		icon: AlertCircle,
		colorClass: 'text-amber-600',
		bgClass: 'bg-amber-50',
	},
	minor: {
		icon: Info,
		colorClass: 'text-blue-600',
		bgClass: 'bg-blue-50',
	},
}

/* ---- Filter Pill Component ---- */

interface FilterPillProps {
	label: string
	isActive: boolean
	onToggle: () => void
	activeClass?: string
}

function FilterPill({
	label,
	isActive,
	onToggle,
	activeClass = 'bg-blue-600 text-white',
}: FilterPillProps) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={isActive}
			onClick={onToggle}
			className={cn(
				'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
				isActive
					? cn('border-transparent', activeClass)
					: 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
			)}
		>
			{label}
		</button>
	)
}

/* ---- Severity Count Card ---- */

interface SeverityCountProps {
	severity: Severity
	count: number
}

function SeverityCount({ severity, count }: SeverityCountProps) {
	const config = severityConfig[severity]
	const Icon = config.icon

	return (
		<div
			className={cn(
				'flex items-center gap-2 rounded-lg px-4 py-3',
				config.bgClass
			)}
		>
			<Icon
				className={cn('h-5 w-5', config.colorClass)}
				aria-hidden="true"
			/>
			<div>
				<p className={cn('text-lg font-bold', config.colorClass)}>
					{count}
				</p>
				<p className="text-xs capitalize text-gray-600">{severity}</p>
			</div>
		</div>
	)
}

/* ---- Main Component ---- */

export default function DeveloperReport({
	report,
	onWcagCardClick,
}: DeveloperReportProps) {
	const { summary, violations } = report

	/* -- Filter state -- */
	const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(
		() => new Set(ALL_SEVERITIES)
	)
	const [activePrinciples, setActivePrinciples] = useState<
		Set<WcagPrinciple>
	>(() => new Set(ALL_PRINCIPLES))
	const [activeLevels, setActiveLevels] = useState<Set<WcagLevel>>(
		() => new Set(ALL_LEVELS)
	)

	/* -- Toggle helpers -- */
	const toggleFilter = useCallback(
		<T,>(
			setter: React.Dispatch<React.SetStateAction<Set<T>>>,
			value: T
		) => {
			setter(prev => {
				const next = new Set(prev)
				if (next.has(value)) {
					next.delete(value)
				} else {
					next.add(value)
				}
				return next
			})
		},
		[]
	)

	const toggleSeverity = useCallback(
		(s: Severity) => toggleFilter(setActiveSeverities, s),
		[toggleFilter]
	)
	const togglePrinciple = useCallback(
		(p: WcagPrinciple) => toggleFilter(setActivePrinciples, p),
		[toggleFilter]
	)
	const toggleLevel = useCallback(
		(l: WcagLevel) => toggleFilter(setActiveLevels, l),
		[toggleFilter]
	)

	/* -- Filtered violations -- */
	const filteredViolations = useMemo(
		() =>
			violations.filter(
				v =>
					activeSeverities.has(v.severity) &&
					activePrinciples.has(v.wcagPrinciple) &&
					activeLevels.has(v.wcagLevel)
			),
		[violations, activeSeverities, activePrinciples, activeLevels]
	)

	const activeFilterCount =
		ALL_SEVERITIES.length -
		activeSeverities.size +
		(ALL_PRINCIPLES.length - activePrinciples.size) +
		(ALL_LEVELS.length - activeLevels.size)

	const hasActiveFilters = activeFilterCount > 0

	const clearAllFilters = useCallback(() => {
		setActiveSeverities(new Set(ALL_SEVERITIES))
		setActivePrinciples(new Set(ALL_PRINCIPLES))
		setActiveLevels(new Set(ALL_LEVELS))
	}, [])

	/* ---- Render ---- */

	return (
		<div className="space-y-6">
			{/* ==================== Summary Section ==================== */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold text-gray-900">
						Developer Report
					</h2>
					<p className="mt-0.5 text-sm text-gray-500">
						Technical accessibility evaluation for developers
					</p>
				</CardHeader>

				<CardBody className="space-y-6">
					{/* Score + meta info */}
					<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
						{/* Score gauge */}
						<div className="shrink-0">
							<ScoreGauge
								score={summary.overallScore}
								size={140}
							/>
						</div>

						{/* Meta info grid */}
						<div className="flex-1 space-y-4">
							{/* URL */}
							<div className="flex items-center gap-2 text-sm">
								<Globe
									className="h-4 w-4 shrink-0 text-gray-400"
									aria-hidden="true"
								/>
								<span className="font-medium text-gray-900">
									Target:
								</span>
								<span className="truncate text-gray-600">
									{summary.targetUrl}
								</span>
							</div>

							{/* Date */}
							<div className="flex items-center gap-2 text-sm">
								<Calendar
									className="h-4 w-4 shrink-0 text-gray-400"
									aria-hidden="true"
								/>
								<span className="font-medium text-gray-900">
									Evaluated:
								</span>
								<span className="text-gray-600">
									{formatDate(summary.evaluationDate)}
								</span>
							</div>

							{/* axe-core version */}
							<div className="flex items-center gap-2 text-sm">
								<Layers
									className="h-4 w-4 shrink-0 text-gray-400"
									aria-hidden="true"
								/>
								<span className="font-medium text-gray-900">
									Engine:
								</span>
								<Badge variant="default">
									axe-core v{summary.axeCoreVersion}
								</Badge>
							</div>

							{/* Total violations */}
							<p className="text-sm text-gray-700">
								<span className="font-semibold">
									{summary.totalViolations}
								</span>{' '}
								accessibility{' '}
								{summary.totalViolations === 1
									? 'violation'
									: 'violations'}{' '}
								found
							</p>
						</div>
					</div>

					{/* Severity breakdown */}
					<div>
						<h3 className="mb-3 text-sm font-semibold text-gray-900">
							Severity Breakdown
						</h3>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<SeverityCount
								severity="critical"
								count={summary.criticalCount}
							/>
							<SeverityCount
								severity="serious"
								count={summary.seriousCount}
							/>
							<SeverityCount
								severity="moderate"
								count={summary.moderateCount}
							/>
							<SeverityCount
								severity="minor"
								count={summary.minorCount}
							/>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* ==================== Filters Section ==================== */}
			<Card>
				<CardBody className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
							<Filter
								className="h-4 w-4 text-gray-500"
								aria-hidden="true"
							/>
							Filters
							{hasActiveFilters && (
								<Badge variant="info">
									{activeFilterCount} active
								</Badge>
							)}
						</h3>

						{hasActiveFilters && (
							<button
								type="button"
								onClick={clearAllFilters}
								className="text-xs font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-sm"
							>
								Clear all filters
							</button>
						)}
					</div>

					{/* Severity filters */}
					<fieldset>
						<legend className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
							Severity
						</legend>
						<div
							className="flex flex-wrap gap-2"
							role="group"
							aria-label="Filter by severity"
						>
							{ALL_SEVERITIES.map(s => (
								<FilterPill
									key={s}
									label={
										s.charAt(0).toUpperCase() + s.slice(1)
									}
									isActive={activeSeverities.has(s)}
									onToggle={() => toggleSeverity(s)}
									activeClass={cn(
										s === 'critical' &&
											'bg-red-600 text-white',
										s === 'serious' &&
											'bg-orange-600 text-white',
										s === 'moderate' &&
											'bg-amber-500 text-white',
										s === 'minor' &&
											'bg-blue-600 text-white'
									)}
								/>
							))}
						</div>
					</fieldset>

					{/* Principle filters */}
					<fieldset>
						<legend className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
							WCAG Principle
						</legend>
						<div
							className="flex flex-wrap gap-2"
							role="group"
							aria-label="Filter by WCAG principle"
						>
							{ALL_PRINCIPLES.map(p => (
								<FilterPill
									key={p}
									label={p}
									isActive={activePrinciples.has(p)}
									onToggle={() => togglePrinciple(p)}
								/>
							))}
						</div>
					</fieldset>

					{/* Level filters */}
					<fieldset>
						<legend className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
							Conformance Level
						</legend>
						<div
							className="flex flex-wrap gap-2"
							role="group"
							aria-label="Filter by conformance level"
						>
							{ALL_LEVELS.map(l => (
								<FilterPill
									key={l}
									label={`Level ${l}`}
									isActive={activeLevels.has(l)}
									onToggle={() => toggleLevel(l)}
								/>
							))}
						</div>
					</fieldset>
				</CardBody>
			</Card>

			{/* ==================== Violations List ==================== */}
			<section aria-label="Violation results">
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-sm font-semibold text-gray-900">
						Violations
						<span className="ml-1.5 text-gray-500 font-normal">
							({filteredViolations.length} of {violations.length})
						</span>
					</h3>
				</div>

				{filteredViolations.length > 0 ? (
					<div className="space-y-3">
						{filteredViolations.map(violation => (
							<ViolationCard
								key={violation.ruleId}
								ruleId={violation.ruleId}
								severity={violation.severity}
								description={violation.description}
								wcagCriterion={violation.wcagCriterion}
								wcagLevel={violation.wcagLevel}
								wcagPrinciple={violation.wcagPrinciple}
								helpUrl={violation.helpUrl}
								elements={violation.elements}
								remediation={violation.remediation}
								onWcagCardClick={onWcagCardClick}
							/>
						))}
					</div>
				) : (
					/* Empty state */
					<Card>
						<CardBody className="flex flex-col items-center justify-center py-12 text-center">
							<SearchX
								className="h-10 w-10 text-gray-300"
								aria-hidden="true"
							/>
							<p className="mt-3 text-sm font-medium text-gray-700">
								No violations match the current filters
							</p>
							<p className="mt-1 text-xs text-gray-500">
								Try adjusting or clearing the filters to see
								results.
							</p>
							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearAllFilters}
									className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
								>
									Clear all filters
								</button>
							)}
						</CardBody>
					</Card>
				)}
			</section>
		</div>
	)
}
