'use client'

import { useState, useMemo } from 'react'
import {
	CheckCircle2,
	XCircle,
	AlertTriangle,
	FileText,
	Filter,
	ArrowUpDown,
	Globe,
	Calendar,
	Shield,
	ChevronDown,
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreGauge } from '@/components/ui/ScoreGauge'
import { cn, formatDate, getSeverityColor } from '@/lib/utils'
import type {
	AuditorReport as AuditorReportType,
	ComplianceEntry,
	Severity,
	WcagPrinciple,
	WcagLevel,
	CategoryBreakdown,
} from '@/types'

// ---------- Props ----------
interface AuditorReportProps {
	report: AuditorReportType
}

// ---------- Constants ----------
const PRINCIPLES: WcagPrinciple[] = [
	'Perceivable',
	'Operable',
	'Understandable',
	'Robust',
]

const LEVELS: WcagLevel[] = ['A', 'AA', 'AAA', 'best-practice']

const SEVERITIES: Severity[] = ['critical', 'serious', 'moderate', 'minor']

type SortKey = keyof Pick<
	ComplianceEntry,
	'criterion' | 'title' | 'level' | 'principle' | 'status' | 'violationCount'
>

type SortDirection = 'asc' | 'desc'
type SectionKey =
	| 'executive'
	| 'principles'
	| 'matrix'
	| 'violations'
	| 'category'
	| 'incomplete'
	| 'inapplicable'

// ---------- Helpers ----------
function severityBadgeVariant(
	severity: Severity
): 'error' | 'warning' | 'info' | 'default' {
	switch (severity) {
		case 'critical':
			return 'error'
		case 'serious':
			return 'warning'
		case 'moderate':
			return 'warning'
		case 'minor':
			return 'info'
	}
}

function statusBadgeVariant(
	status: ComplianceEntry['status']
): 'success' | 'error' | 'warning' | 'default' {
	switch (status) {
		case 'pass':
			return 'success'
		case 'fail':
			return 'error'
		case 'needs-review':
			return 'warning'
		case 'not-tested':
			return 'default'
	}
}

function statusLabel(status: ComplianceEntry['status']): string {
	switch (status) {
		case 'pass':
			return 'Pass'
		case 'fail':
			return 'Fail'
		case 'needs-review':
			return 'Needs Review'
		case 'not-tested':
			return 'Not Tested'
	}
}

function complianceBarColor(percentage: number): string {
	if (percentage >= 80) return 'bg-green-500'
	if (percentage >= 50) return 'bg-amber-500'
	return 'bg-red-500'
}

function complianceTextColor(percentage: number): string {
	if (percentage >= 80) return 'text-green-700'
	if (percentage >= 50) return 'text-amber-700'
	return 'text-red-700'
}

function SectionToggle({
	open,
	onToggle,
}: {
	open: boolean
	onToggle: () => void
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className="inline-flex items-center rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
		>
			<span className="sr-only">
				{open ? 'Collapse section' : 'Expand section'}
			</span>
			<ChevronDown
				className={cn(
					'h-4 w-4 shrink-0 transition-transform',
					open && 'rotate-180'
				)}
				aria-hidden="true"
			/>
		</button>
	)
}

// ---------- Component ----------
export default function AuditorReport({ report }: AuditorReportProps) {
	const {
		summary,
		principleBreakdown,
		complianceMatrix,
		violations,
		filters,
		categoryBreakdown,
		incompleteItems,
		inapplicableRules,
	} = report

	// --- Compliance Matrix state ---
	const [sortKey, setSortKey] = useState<SortKey>('criterion')
	const [sortDir, setSortDir] = useState<SortDirection>('asc')
	const [filterPrinciple, setFilterPrinciple] = useState<
		WcagPrinciple | 'all'
	>('all')
	const [filterLevel, setFilterLevel] = useState<WcagLevel | 'all'>('all')

	// --- Violations state ---
	const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>(
		'all'
	)
	const [expandedViolation, setExpandedViolation] = useState<string | null>(
		null
	)
	const [openSections, setOpenSections] = useState<
		Record<SectionKey, boolean>
	>({
		executive: true,
		principles: true,
		matrix: true,
		violations: true,
		category: true,
		incomplete: true,
		inapplicable: true,
	})

	// --- Sorted & filtered matrix ---
	const filteredMatrix = useMemo(() => {
		let rows = [...complianceMatrix]

		if (filterPrinciple !== 'all') {
			rows = rows.filter(r => r.principle === filterPrinciple)
		}
		if (filterLevel !== 'all') {
			rows = rows.filter(r => r.level === filterLevel)
		}

		rows.sort((a, b) => {
			const aVal = a[sortKey]
			const bVal = b[sortKey]
			if (typeof aVal === 'number' && typeof bVal === 'number') {
				return sortDir === 'asc' ? aVal - bVal : bVal - aVal
			}
			const aStr = String(aVal).toLowerCase()
			const bStr = String(bVal).toLowerCase()
			return sortDir === 'asc'
				? aStr.localeCompare(bStr)
				: bStr.localeCompare(aStr)
		})

		return rows
	}, [complianceMatrix, filterPrinciple, filterLevel, sortKey, sortDir])

	// --- Filtered violations ---
	const filteredViolations = useMemo(() => {
		if (filterSeverity === 'all') return violations
		return violations.filter(v => v.severity === filterSeverity)
	}, [violations, filterSeverity])

	function handleSort(key: SortKey) {
		if (sortKey === key) {
			setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
		} else {
			setSortKey(key)
			setSortDir('asc')
		}
	}

	function toggleSection(section: SectionKey) {
		setOpenSections(prev => ({
			...prev,
			[section]: !prev[section],
		}))
	}

	// ===========================================
	// RENDER
	// ===========================================
	return (
		<div className="space-y-8">
			{/* ============ EXECUTIVE SUMMARY ============ */}
			<section aria-labelledby="exec-summary-heading">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<FileText
									className="h-5 w-5 text-blue-600"
									aria-hidden="true"
								/>
								<h2
									id="exec-summary-heading"
									className="text-lg font-semibold text-gray-900"
								>
									Executive Summary
								</h2>
							</div>
							<SectionToggle
								open={openSections.executive}
								onToggle={() => toggleSection('executive')}
							/>
						</div>
					</CardHeader>
					{openSections.executive && (
						<CardBody id="exec-summary-panel">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
								{/* Left: Score gauge */}
								<div className="flex flex-col items-center justify-center">
									<ScoreGauge
										score={summary.overallScore}
										size={140}
									/>
									<p className="mt-2 text-sm text-gray-500">
										Overall Compliance Score
									</p>
								</div>

								{/* Middle: Meta info */}
								<div className="space-y-4">
									<div className="flex items-start gap-3">
										<Globe
											className="h-4 w-4 mt-0.5 text-gray-400 shrink-0"
											aria-hidden="true"
										/>
										<div>
											<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
												Target URL
											</p>
											<p className="text-sm text-gray-900 break-all">
												{summary.targetUrl}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Calendar
											className="h-4 w-4 mt-0.5 text-gray-400 shrink-0"
											aria-hidden="true"
										/>
										<div>
											<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
												Evaluation Date
											</p>
											<p className="text-sm text-gray-900">
												{formatDate(
													summary.evaluationDate
												)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Shield
											className="h-4 w-4 mt-0.5 text-gray-400 shrink-0"
											aria-hidden="true"
										/>
										<div>
											<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
												Engine
											</p>
											<p className="text-sm text-gray-900">
												axe-core v
												{summary.axeCoreVersion}
											</p>
										</div>
									</div>
								</div>

								{/* Right: Severity breakdown */}
								<div>
									<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
										Violations by Severity (
										{summary.totalViolations} total)
									</p>
									<div className="space-y-2">
										{[
											{
												label: 'Critical',
												count: summary.criticalCount,
												severity:
													'critical' as Severity,
											},
											{
												label: 'Serious',
												count: summary.seriousCount,
												severity: 'serious' as Severity,
											},
											{
												label: 'Moderate',
												count: summary.moderateCount,
												severity:
													'moderate' as Severity,
											},
											{
												label: 'Minor',
												count: summary.minorCount,
												severity: 'minor' as Severity,
											},
										].map(({ label, count, severity }) => (
											<div
												key={severity}
												className="flex items-center gap-3"
											>
												<span
													className="h-2.5 w-2.5 rounded-full shrink-0"
													style={{
														backgroundColor:
															getSeverityColor(
																severity
															),
													}}
													aria-hidden="true"
												/>
												<span className="text-sm text-gray-700 w-20">
													{label}
												</span>
												<div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
													<div
														className="h-full rounded-full transition-all duration-500"
														style={{
															width:
																summary.totalViolations >
																0
																	? `${(count / summary.totalViolations) * 100}%`
																	: '0%',
															backgroundColor:
																getSeverityColor(
																	severity
																),
														}}
													/>
												</div>
												<span className="text-sm font-semibold text-gray-900 w-8 text-right tabular-nums">
													{count}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</CardBody>
					)}
				</Card>
			</section>

			{/* ============ PRINCIPLE BREAKDOWN ============ */}
			<section aria-labelledby="principle-heading">
				<div className="mb-4 flex items-center justify-between gap-3">
					<h2
						id="principle-heading"
						className="text-lg font-semibold text-gray-900"
					>
						WCAG 2.2 Principle Breakdown
					</h2>
					<SectionToggle
						open={openSections.principles}
						onToggle={() => toggleSection('principles')}
					/>
				</div>
				{openSections.principles && (
					<div
						id="principle-panel"
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
					>
						{principleBreakdown.map(pb => (
							<Card key={pb.principle}>
								<CardBody className="space-y-3">
									<h3 className="text-sm font-semibold text-gray-900">
										{pb.principle}
									</h3>

									{/* Compliance percentage */}
									<div className="flex items-baseline justify-between">
										<span
											className={cn(
												'text-2xl font-bold tabular-nums',
												complianceTextColor(
													pb.compliancePercentage
												)
											)}
										>
											{pb.compliancePercentage}%
										</span>
										<span className="text-xs text-gray-500">
											compliance
										</span>
									</div>

									{/* Progress bar */}
									<div
										className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"
										role="progressbar"
										aria-valuenow={pb.compliancePercentage}
										aria-valuemin={0}
										aria-valuemax={100}
										aria-label={`${pb.principle} compliance: ${pb.compliancePercentage}%`}
									>
										<div
											className={cn(
												'h-full rounded-full transition-all duration-500',
												complianceBarColor(
													pb.compliancePercentage
												)
											)}
											style={{
												width: `${pb.compliancePercentage}%`,
											}}
										/>
									</div>

									{/* Passed / Failed / Needs Review counts */}
									<div className="flex items-center justify-between text-xs text-gray-600">
										<span className="flex items-center gap-1">
											<CheckCircle2
												className="h-3.5 w-3.5 text-green-500"
												aria-hidden="true"
											/>
											{pb.passedCriteria} passed
										</span>
										<span className="flex items-center gap-1">
											<XCircle
												className="h-3.5 w-3.5 text-red-500"
												aria-hidden="true"
											/>
											{pb.failedCriteria} failed
										</span>
										{(pb.needsReviewCriteria ?? 0) > 0 && (
											<span className="flex items-center gap-1">
												<AlertTriangle
													className="h-3.5 w-3.5 text-amber-500"
													aria-hidden="true"
												/>
												{pb.needsReviewCriteria} review
											</span>
										)}
									</div>
									<p className="text-xs text-gray-500">
										{pb.passedCriteria}/{pb.totalCriteria}{' '}
										criteria passed
									</p>
								</CardBody>
							</Card>
						))}
					</div>
				)}
			</section>

			{/* ============ COMPLIANCE MATRIX ============ */}
			<section aria-labelledby="matrix-heading">
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div className="flex items-center justify-between gap-3">
								<h2
									id="matrix-heading"
									className="text-lg font-semibold text-gray-900"
								>
									Compliance Matrix
								</h2>
								<SectionToggle
									open={openSections.matrix}
									onToggle={() => toggleSection('matrix')}
								/>
							</div>

							{/* Filter dropdowns */}
							<div className="flex flex-wrap items-end gap-3">
								<SectionToggle
									open={openSections.violations}
									onToggle={() => toggleSection('violations')}
								/>
										value={filterPrinciple}
										onChange={e =>
											setFilterPrinciple(
												e.target.value as
													| WcagPrinciple
													| 'all'
											)
										}
										className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
									>
										<option value="all">
											All Principles
										<SectionToggle
											open={openSections.category}
											onToggle={() => toggleSection('category')}
										/>
										Level
									</label>
									<select
										id="auditor-level-filter"
										value={filterLevel}
										onChange={e =>
											setFilterLevel(
												e.target.value as
													| WcagLevel
													| 'all'
											)
										}
										className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
									>
										<option value="all">All Levels</option>
										{LEVELS.map(l => (
											<option key={l} value={l}>
												Level {l}
											<SectionToggle
												open={openSections.incomplete}
												onToggle={() => toggleSection('incomplete')}
											/>
												[
													{
														key: 'criterion',
														label: 'Criterion',
													},
													{
														key: 'title',
														label: 'Title',
													},
													{
														key: 'level',
														label: 'Level',
													},
													{
														key: 'principle',
														label: 'Principle',
													},
													{
														key: 'status',
														label: 'Status',
													},
													{
														key: 'violationCount',
														label: 'Violations',
													},
												] as {
													key: SortKey
													label: string
												}[]
											).map(({ key, label }) => (
												<th
													key={key}
													scope="col"
													className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
												>
													<button
														onClick={() =>
															handleSort(key)
														}
														className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
														aria-label={`Sort by ${label}`}
													>
														{label}
														<ArrowUpDown
															className={cn(
																'h-3 w-3',
																sortKey === key
																	? 'text-blue-600'
																	: 'text-gray-400'
															)}
															aria-hidden="true"
														/>
													</button>
												</th>
											))}
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{filteredMatrix.length === 0 ? (
											<tr>
												<td
													colSpan={6}
													className="px-4 py-8 text-center text-sm text-gray-500"
												>
													No criteria match the
													selected filters.
												</td>
											</tr>
										) : (
											filteredMatrix.map(entry => (
												<tr
													key={entry.criterion}
													className="hover:bg-gray-50 transition-colors"
												>
													<td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
														{entry.criterion}
													</td>
													<td className="px-4 py-3 text-gray-900">
														{entry.title}
													</td>
													<td className="px-4 py-3">
														<Badge variant="info">
															{entry.level}
														</Badge>
													</td>
													<td className="px-4 py-3 text-gray-700">
														{entry.principle}
													</td>
													<td className="px-4 py-3">
														<SectionToggle
															open={openSections.inapplicable}
															onToggle={() => toggleSection('inapplicable')}
														/>
																/>
															)}
															{entry.status ===
																'needs-review' && (
																<AlertTriangle
																	className="h-3 w-3 mr-1"
																	aria-hidden="true"
																/>
															)}
															{statusLabel(
																entry.status
															)}
														</Badge>
													</td>
													<td className="px-4 py-3 text-center tabular-nums font-medium text-gray-900">
														{entry.violationCount}
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
							{/* Row count */}
							<div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
								Showing {filteredMatrix.length} of{' '}
								{complianceMatrix.length} criteria
							</div>
						</CardBody>
					)}
				</Card>
			</section>

			{/* ============ VIOLATIONS ============ */}
			<section aria-labelledby="violations-heading">
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<AlertTriangle
										className="h-5 w-5 text-amber-500"
										aria-hidden="true"
									/>
									<h2
										id="violations-heading"
										className="text-lg font-semibold text-gray-900"
									>
										Violations ({filteredViolations.length})
									</h2>
								</div>
								<SectionToggle
									open={openSections.violations}
									onToggle={() => toggleSection('violations')}
								/>
							</div>

							{/* Severity filter */}
							<div className="flex flex-wrap items-end gap-2">
								<Filter
									className="h-4 w-4 text-gray-400 mr-1"
									aria-hidden="true"
								/>
								<div className="space-y-1">
									<label
										htmlFor="auditor-severity-filter"
										className="block text-xs font-medium text-gray-600"
									>
										Severity
									</label>
									<select
										id="auditor-severity-filter"
										value={filterSeverity}
										onChange={e =>
											setFilterSeverity(
												e.target.value as
													| Severity
													| 'all'
											)
										}
										className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
									>
										<option value="all">All</option>
										{SEVERITIES.map(s => (
											<option key={s} value={s}>
												{s}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
					</CardHeader>
					{openSections.violations && (
						<CardBody id="violations-panel" className="p-0">
							{filteredViolations.length === 0 ? (
								<div className="px-6 py-8 text-center text-sm text-gray-500">
									No violations match the selected severity
									filter.
								</div>
							) : (
								<ul
									className="divide-y divide-gray-100"
									role="list"
								>
									{filteredViolations.map(v => {
										const isExpanded =
											expandedViolation === v.ruleId

										return (
											<li key={v.ruleId}>
												<button
													onClick={() =>
														setExpandedViolation(
															isExpanded
																? null
																: v.ruleId
														)
													}
													className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
													aria-expanded={isExpanded}
												>
													<div className="flex items-start justify-between gap-4">
														<div className="flex-1 min-w-0">
															{/* Top row: severity + rule + criterion */}
															<div className="flex flex-wrap items-center gap-2 mb-1">
																<Badge
																	variant={severityBadgeVariant(
																		v.severity
																	)}
																	className="capitalize"
																>
																	{v.severity}
																</Badge>
																<span className="font-mono text-xs text-gray-500">
																	{v.ruleId}
																</span>
																<Badge variant="info">
																	{
																		v.wcagCriterion
																	}{' '}
																	(Level{' '}
																	{
																		v.wcagLevel
																	}
																	)
																</Badge>
																<Badge variant="default">
																	{
																		v.wcagPrinciple
																	}
																</Badge>
															</div>
															{/* Description */}
															<p className="text-sm text-gray-900">
																{v.description}
															</p>
														</div>

														{/* Instance count + chevron */}
														<div className="flex items-center gap-3 shrink-0">
															<span className="text-xs text-gray-500">
																{
																	v.instanceCount
																}{' '}
																{v.instanceCount ===
																1
																	? 'instance'
																	: 'instances'}
															</span>
															<ChevronDown
																className={cn(
																	'h-4 w-4 text-gray-400 transition-transform duration-200',
																	isExpanded &&
																		'rotate-180'
																)}
																aria-hidden="true"
															/>
														</div>
													</div>
												</button>

												{/* Expanded: formal description */}
												{isExpanded && (
													<div className="px-6 pb-4">
														<div className="ml-0 rounded-lg bg-gray-50 border border-gray-200 p-4">
															<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
																Formal
																Description
															</p>
															<p className="text-sm text-gray-800 leading-relaxed">
																{
																	v.formalDescription
																}
															</p>
														</div>
													</div>
												)}
											</li>
										)
									})}
								</ul>
							)}
						</CardBody>
					)}
				</Card>
			</section>

			{/* ============ CATEGORY BREAKDOWN ============ */}
			{categoryBreakdown && categoryBreakdown.length > 0 && (
				<section aria-labelledby="category-breakdown-heading">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between gap-3">
								<div>
									<h2
										id="category-breakdown-heading"
										className="text-lg font-semibold text-gray-900"
									>
										Category Breakdown
									</h2>
									<p className="text-sm text-gray-500 mt-1">
										Results grouped by axe-core rule
										category
									</p>
								</div>
								<SectionToggle
									open={openSections.category}
									onToggle={() => toggleSection('category')}
								/>
							</div>
						</CardHeader>
						{openSections.category && (
							<CardBody id="category-panel" className="p-0">
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-gray-200 bg-gray-50">
												<th
													scope="col"
													className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
												>
													Category
												</th>
												<th
													scope="col"
													className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
												>
													Pass
												</th>
												<th
													scope="col"
													className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
												>
													Fail
												</th>
												<th
													scope="col"
													className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
												>
													Review
												</th>
												<th
													scope="col"
													className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
												>
													N/A
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{categoryBreakdown.map(
												(cb: CategoryBreakdown) => (
													<tr
														key={cb.category}
														className="hover:bg-gray-50 transition-colors"
													>
														<td className="px-4 py-3 text-gray-900 font-medium">
															{cb.label}
														</td>
														<td className="px-4 py-3 text-center">
															<span className="text-green-600 font-semibold tabular-nums">
																{cb.passedRules}
															</span>
														</td>
														<td className="px-4 py-3 text-center">
															<span
																className={cn(
																	'font-semibold tabular-nums',
																	cb.failedRules >
																		0
																		? 'text-red-600'
																		: 'text-gray-400'
																)}
															>
																{cb.failedRules}
															</span>
														</td>
														<td className="px-4 py-3 text-center">
															<span
																className={cn(
																	'font-semibold tabular-nums',
																	cb.needsReviewRules >
																		0
																		? 'text-amber-600'
																		: 'text-gray-400'
																)}
															>
																{
																	cb.needsReviewRules
																}
															</span>
														</td>
														<td className="px-4 py-3 text-center">
															<span className="text-gray-400 tabular-nums">
																{
																	cb.inapplicableRules
																}
															</span>
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								</div>
							</CardBody>
						)}
					</Card>
				</section>
			)}

			{/* ============ NEEDS REVIEW (INCOMPLETE) ============ */}
			{incompleteItems && incompleteItems.length > 0 && (
				<section aria-labelledby="incomplete-heading">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between gap-3">
								<div>
									<div className="flex items-center gap-2">
										<AlertTriangle
											className="h-5 w-5 text-amber-500"
											aria-hidden="true"
										/>
										<h2
											id="incomplete-heading"
											className="text-lg font-semibold text-gray-900"
										>
											Needs Manual Review (
											{incompleteItems.length})
										</h2>
									</div>
									<p className="text-sm text-gray-500 mt-1">
										Rules that could not be fully evaluated
										by automated testing
									</p>
								</div>
								<SectionToggle
									open={openSections.incomplete}
									onToggle={() => toggleSection('incomplete')}
								/>
							</div>
						</CardHeader>
						{openSections.incomplete && (
							<CardBody id="incomplete-panel" className="p-0">
								<ul
									className="divide-y divide-gray-100"
									role="list"
								>
									{incompleteItems.map(item => (
										<li
											key={item.ruleId}
											className="px-6 py-4"
										>
											<div className="flex flex-wrap items-center gap-2 mb-1">
												<Badge
													variant="warning"
													className="capitalize"
												>
													{item.severity}
												</Badge>
												<span className="font-mono text-xs text-gray-500">
													{item.ruleId}
												</span>
												<Badge variant="info">
													{item.wcagCriterion} (Level{' '}
													{item.wcagLevel})
												</Badge>
											</div>
											<p className="text-sm text-gray-900">
												{item.description}
											</p>
											<p className="mt-1 text-xs text-gray-500">
												{item.instanceCount}{' '}
												{item.instanceCount === 1
													? 'element'
													: 'elements'}{' '}
												to review
											</p>
										</li>
									))}
								</ul>
							</CardBody>
						)}
					</Card>
				</section>
			)}

			{/* ============ INAPPLICABLE RULES ============ */}
			{inapplicableRules && inapplicableRules.length > 0 && (
				<section aria-labelledby="inapplicable-heading">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between gap-3">
								<div>
									<h2
										id="inapplicable-heading"
										className="text-lg font-semibold text-gray-900"
									>
										Not Applicable (
										{inapplicableRules.length} rules)
									</h2>
									<p className="text-sm text-gray-500 mt-1">
										Rules that did not apply to any elements
										on this page
									</p>
								</div>
								<button
									type="button"
									onClick={() =>
										toggleSection('inapplicable')
									}
									className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
								>
									{openSections.inapplicable
										? 'Hide'
										: 'Show'}
									<ChevronDown
										className={cn(
											'h-3.5 w-3.5 transition-transform',
											openSections.inapplicable &&
												'rotate-180'
										)}
										aria-hidden="true"
									/>
								</button>
							</div>
						</CardHeader>
						{openSections.inapplicable && (
							<CardBody id="inapplicable-panel">
								<div className="flex flex-wrap gap-2">
									{inapplicableRules.map(rule => (
										<Badge
											key={rule.ruleId}
											variant="default"
										>
											{rule.ruleId}
										</Badge>
									))}
								</div>
							</CardBody>
						)}
					</Card>
				</section>
			)}
		</div>
	)
}
