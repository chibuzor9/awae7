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
	ChevronDown,
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
	WcagCategory,
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
const ALL_LEVELS: WcagLevel[] = ['A', 'AA', 'AAA', 'best-practice']

const CATEGORY_LABELS: Partial<Record<WcagCategory, string>> = {
	color: 'Color',
	forms: 'Forms',
	keyboard: 'Keyboard',
	language: 'Language',
	'name-role-value': 'Name / Role / Value',
	parsing: 'Parsing',
	semantics: 'Semantics',
	'sensory-and-visual-cues': 'Sensory & Visual',
	structure: 'Structure',
	tables: 'Tables',
	'text-alternatives': 'Text Alternatives',
	'time-and-media': 'Time & Media',
	aria: 'ARIA',
	other: 'Other',
}

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

function severityBadgeVariant(
	severity: Severity
): 'error' | 'warning' | 'info' {
	if (severity === 'critical') return 'error'
	if (severity === 'serious' || severity === 'moderate') return 'warning'
	return 'info'
}

type SourceThemeKey = 'vscode-dark' | 'vscode-light' | 'monokai'

const SOURCE_THEMES: Record<
	SourceThemeKey,
	{
		label: string
		container: string
		lineNumber: string
		lineDefault: string
		linePrimary: string
		lineSecondary: string
	}
> = {
	'vscode-dark': {
		label: 'VS Code Dark+',
		container: 'bg-[#1e1e1e] border border-[#2d2d2d] text-[#d4d4d4]',
		lineNumber: 'text-[#6a9955]',
		lineDefault: 'hover:bg-white/5',
		linePrimary: 'border-l-4 border-l-red-500 bg-red-500/15',
		lineSecondary: 'border-l-2 border-l-amber-400/90 bg-amber-400/10',
	},
	'vscode-light': {
		label: 'VS Code Light+',
		container: 'bg-[#ffffff] border border-[#e5e7eb] text-[#1f2937]',
		lineNumber: 'text-[#6b7280]',
		lineDefault: 'hover:bg-gray-50',
		linePrimary: 'border-l-4 border-l-red-500 bg-red-50',
		lineSecondary: 'border-l-2 border-l-amber-500 bg-amber-50',
	},
	monokai: {
		label: 'Monokai',
		container: 'bg-[#272822] border border-[#3a3b35] text-[#f8f8f2]',
		lineNumber: 'text-[#a6e22e]',
		lineDefault: 'hover:bg-white/5',
		linePrimary: 'border-l-4 border-l-pink-500 bg-pink-500/15',
		lineSecondary: 'border-l-2 border-l-cyan-400 bg-cyan-400/10',
	},
}

function extractSelectorTokens(selector: string): string[] {
	return selector
		.split(/\s+|>|\+|~|\.|#|\[|\]|\(|\)|:|,/)
		.map(token => token.trim())
		.filter(token => token.length >= 3)
}

function buildUserImpactSummary(
	severity: Severity,
	principle: WcagPrinciple
): string {
	if (severity === 'critical') {
		return `High impact: many users may be blocked from completing key tasks (${principle}).`
	}
	if (severity === 'serious') {
		return `Significant impact: users will struggle or abandon the task (${principle}).`
	}
	if (severity === 'moderate') {
		return `Noticeable impact: users can continue, but with friction and confusion (${principle}).`
	}
	return `Low impact: quality issue that still affects trust and usability (${principle}).`
}

function formatHtmlForDisplay(html: string): string {
	const normalized = html.replace(/\r\n/g, '\n').trim()
	if (!normalized) return ''
	if (!normalized.includes('<')) return normalized

	const voidTags = new Set([
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		'img',
		'input',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr',
	])

	const tokens =
		normalized.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g) ?? []
	const lines: string[] = []
	let depth = 0

	for (const tokenRaw of tokens) {
		const token = tokenRaw.trim()
		if (!token) continue

		if (!token.startsWith('<')) {
			const textLines = token
				.split('\n')
				.map(part => part.trim())
				.filter(Boolean)

			for (const textLine of textLines) {
				lines.push(`${'  '.repeat(depth)}${textLine}`)
			}
			continue
		}

		const isClosing = /^<\//.test(token)
		const isComment = /^<!--/.test(token)
		const isDoctype = /^<!doctype/i.test(token)
		const isProcessing = /^<\?/.test(token)
		const isTag = /^<[^!][^>]*>$/.test(token)
		const isSelfClosing = /\/>$/.test(token)
		const tagNameMatch = token.match(/^<\/?\s*([a-zA-Z0-9:-]+)/)
		const tagName = tagNameMatch?.[1]?.toLowerCase() ?? ''
		const isVoid = voidTags.has(tagName)

		if (isClosing) {
			depth = Math.max(0, depth - 1)
		}

		const indent = '  '.repeat(depth)
		lines.push(`${indent}${token}`)

		if (
			isTag &&
			!isClosing &&
			!isSelfClosing &&
			!isVoid &&
			!isComment &&
			!isDoctype &&
			!isProcessing
		) {
			depth += 1
		}
	}

	return lines.join('\n')
}

function renderHtmlLine(line: string, keyPrefix: string): React.ReactNode {
	if (!line.includes('<')) {
		return <span>{line}</span>
	}

	const parts: React.ReactNode[] = []
	let cursor = 0
	let chunkIndex = 0

	while (cursor < line.length) {
		const open = line.indexOf('<', cursor)

		if (open === -1) {
			parts.push(
				<span key={`${keyPrefix}-text-${chunkIndex++}`}>
					{line.slice(cursor)}
				</span>
			)
			break
		}

		if (open > cursor) {
			parts.push(
				<span key={`${keyPrefix}-text-${chunkIndex++}`}>
					{line.slice(cursor, open)}
				</span>
			)
		}

		const close = line.indexOf('>', open)
		if (close === -1) {
			parts.push(
				<span
					key={`${keyPrefix}-raw-${chunkIndex++}`}
					className="text-sky-300"
				>
					{line.slice(open)}
				</span>
			)
			break
		}

		const tagRaw = line.slice(open, close + 1)
		const tagMatch = tagRaw.match(
			/^<(\/)?([A-Za-z][\w:-]*)([\s\S]*?)(\/?)>$/
		)

		if (!tagMatch) {
			parts.push(
				<span
					key={`${keyPrefix}-tag-${chunkIndex++}`}
					className="text-sky-300"
				>
					{tagRaw}
				</span>
			)
			cursor = close + 1
			continue
		}

		const [, slash = '', tagName = '', attrs = '', selfClose = ''] =
			tagMatch
		const attrParts: React.ReactNode[] = []
		const attrRegex = /([^\s=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g
		let attrMatch: RegExpExecArray | null
		let attrIndex = 0

		while ((attrMatch = attrRegex.exec(attrs)) !== null) {
			const attrName = attrMatch[1]
			const attrValue = attrMatch[2]

			attrParts.push(
				<span
					key={`${keyPrefix}-attr-space-${attrIndex}`}
					className="text-slate-400"
				>
					{' '}
				</span>
			)
			attrParts.push(
				<span
					key={`${keyPrefix}-attr-name-${attrIndex}`}
					className="text-amber-300"
				>
					{attrName}
				</span>
			)

			if (attrValue != null) {
				attrParts.push(
					<span
						key={`${keyPrefix}-attr-eq-${attrIndex}`}
						className="text-slate-300"
					>
						=
					</span>
				)
				attrParts.push(
					<span
						key={`${keyPrefix}-attr-val-${attrIndex}`}
						className="text-lime-300"
					>
						{attrValue}
					</span>
				)
			}

			attrIndex += 1
		}

		parts.push(
			<span key={`${keyPrefix}-tag-${chunkIndex++}`}>
				<span className="text-slate-300">{'<'}</span>
				{slash && <span className="text-slate-300">/</span>}
				<span className="text-sky-300">{tagName}</span>
				{attrParts}
				{selfClose && <span className="text-slate-300">/</span>}
				<span className="text-slate-300">{'>'}</span>
			</span>
		)

		cursor = close + 1
	}

	return parts
}

function SectionDropdown({
	title,
	description,
	children,
	defaultOpen = false,
	className,
}: {
	title: string
	description?: string
	children: React.ReactNode
	defaultOpen?: boolean
	className?: string
}) {
	return (
		<details
			open={defaultOpen}
			className={cn(
				'group overflow-hidden rounded-xl border border-gray-200 bg-white',
				className
			)}
		>
			<summary className="cursor-pointer list-none px-4 py-2.5">
				<div className="flex items-center justify-between gap-2">
					<div>
						<p className="text-sm font-semibold text-gray-900">
							{title}
						</p>
						{description && (
							<p className="text-xs text-gray-500 mt-0.5">
								{description}
							</p>
						)}
					</div>
					<ChevronDown
						className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
						aria-hidden="true"
					/>
				</div>
			</summary>
			<div className="border-t border-gray-100">{children}</div>
		</details>
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

	const incompleteItems = report.incompleteItems ?? []

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
	const [activeCategories, setActiveCategories] = useState<Set<WcagCategory>>(
		() => new Set(report.filters?.category ?? [])
	)
	const [sourceTheme, setSourceTheme] =
		useState<SourceThemeKey>('vscode-dark')

	/* -- Filtered violations -- */
	const filteredViolations = useMemo(
		() =>
			violations.filter(
				v =>
					activeSeverities.has(v.severity) &&
					activePrinciples.has(v.wcagPrinciple) &&
					activeLevels.has(v.wcagLevel) &&
					(activeCategories.size === 0 ||
						!v.category ||
						activeCategories.has(v.category))
			),
		[
			violations,
			activeSeverities,
			activePrinciples,
			activeLevels,
			activeCategories,
		]
	)

	const topCriteria = useMemo(() => {
		const counts = violations.reduce<Record<string, number>>(
			(acc, item) => {
				acc[item.wcagCriterion] =
					(acc[item.wcagCriterion] ?? 0) + item.elements.length
				return acc
			},
			{}
		)

		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
	}, [violations])

	const topRules = useMemo(() => {
		return [...violations]
			.map(item => ({
				ruleId: item.ruleId,
				description: item.description,
				count: item.elements.length,
				severity: item.severity,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5)
	}, [violations])

	const topCategories = useMemo(() => {
		const counts = violations.reduce<Record<string, number>>(
			(acc, item) => {
				const key = item.category ?? 'other'
				acc[key] = (acc[key] ?? 0) + item.elements.length
				return acc
			},
			{}
		)

		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
	}, [violations])

	const allCategories = report.filters?.category ?? []

	const selectedSeverity =
		activeSeverities.size === ALL_SEVERITIES.length
			? 'all'
			: (Array.from(activeSeverities)[0] ?? 'all')
	const selectedPrinciple =
		activePrinciples.size === ALL_PRINCIPLES.length
			? 'all'
			: (Array.from(activePrinciples)[0] ?? 'all')
	const selectedLevel =
		activeLevels.size === ALL_LEVELS.length
			? 'all'
			: (Array.from(activeLevels)[0] ?? 'all')
	const selectedCategory =
		activeCategories.size === allCategories.length
			? 'all'
			: (Array.from(activeCategories)[0] ?? 'all')

	const handleSeverityChange = useCallback((value: string) => {
		if (value === 'all') {
			setActiveSeverities(new Set(ALL_SEVERITIES))
			return
		}
		setActiveSeverities(new Set([value as Severity]))
	}, [])

	const handlePrincipleChange = useCallback((value: string) => {
		if (value === 'all') {
			setActivePrinciples(new Set(ALL_PRINCIPLES))
			return
		}
		setActivePrinciples(new Set([value as WcagPrinciple]))
	}, [])

	const handleLevelChange = useCallback((value: string) => {
		if (value === 'all') {
			setActiveLevels(new Set(ALL_LEVELS))
			return
		}
		setActiveLevels(new Set([value as WcagLevel]))
	}, [])

	const handleCategoryChange = useCallback(
		(value: string) => {
			if (value === 'all') {
				setActiveCategories(new Set(allCategories))
				return
			}
			setActiveCategories(new Set([value as WcagCategory]))
		},
		[allCategories]
	)
	const activeFilterCount =
		ALL_SEVERITIES.length -
		activeSeverities.size +
		(ALL_PRINCIPLES.length - activePrinciples.size) +
		(ALL_LEVELS.length - activeLevels.size) +
		(allCategories.length - activeCategories.size)

	const hasActiveFilters = activeFilterCount > 0

	const sourceEditorText = useMemo(() => {
		if (report.fullSourceHtml?.trim()) {
			return report.fullSourceHtml
		}

		const fallbackCandidates = filteredViolations
			.flatMap(violation =>
				violation.elements.flatMap(element => [
					...(element.sourceContext ?? []),
					element.htmlSnippet,
				])
			)
			.filter(Boolean)

		if (fallbackCandidates.length === 0) return ''

		return [...fallbackCandidates].sort((a, b) => b.length - a.length)[0]
	}, [filteredViolations, report.fullSourceHtml])

	const displaySourceText = useMemo(() => {
		if (report.fullSourceHtml?.trim()) {
			return report.fullSourceHtml.replace(/\r\n/g, '\n')
		}

		return formatHtmlForDisplay(sourceEditorText)
	}, [report.fullSourceHtml, sourceEditorText])

	const sourceHighlight = useMemo(() => {
		if (!displaySourceText) {
			return {
				lines: [] as string[],
				primaryLine: -1,
				relatedLines: new Set<number>(),
				lineTooltips: new Map<number, string>(),
			}
		}

		const lines = displaySourceText.split('\n')

		if (filteredViolations.length === 0) {
			return {
				lines,
				primaryLine: -1,
				relatedLines: new Set<number>(),
				lineTooltips: new Map<number, string>(),
			}
		}

		const lineTooltips = new Map<number, string>()
		const allMatchedLines = new Set<number>()

		for (const violation of filteredViolations) {
			for (const element of violation.elements) {
				const selectorTokens = extractSelectorTokens(element.selector)
				if (selectorTokens.length === 0) continue

				for (let index = 0; index < lines.length; index += 1) {
					const lower = lines[index].toLowerCase()
					const hasToken = selectorTokens.some(token =>
						lower.includes(token.toLowerCase())
					)

					if (!hasToken) continue

					allMatchedLines.add(index)

					const details = [
						`Rule: ${violation.ruleId}`,
						`Issue: ${violation.description}`,
						`What failed: ${element.failureSummary}`,
						`Fix: ${violation.remediation}`,
						`User impact: ${buildUserImpactSummary(violation.severity, violation.wcagPrinciple)}`,
					].join('\n')

					const existing = lineTooltips.get(index)
					if (
						!existing ||
						!existing.includes(`Rule: ${violation.ruleId}`)
					) {
						lineTooltips.set(
							index,
							existing ? `${existing}\n\n${details}` : details
						)
					}
				}
			}
		}

		const primaryLine =
			allMatchedLines.size > 0
				? Math.min(...Array.from(allMatchedLines))
				: -1
		const relatedLines = new Set<number>(allMatchedLines)

		if (primaryLine >= 0) {
			relatedLines.delete(primaryLine)
		}

		return { lines, primaryLine, relatedLines, lineTooltips }
	}, [displaySourceText, filteredViolations])

	const clearAllFilters = useCallback(() => {
		setActiveSeverities(new Set(ALL_SEVERITIES))
		setActivePrinciples(new Set(ALL_PRINCIPLES))
		setActiveLevels(new Set(ALL_LEVELS))
		setActiveCategories(new Set(allCategories))
	}, [allCategories])

	/* ---- Render ---- */

	return (
		<div className="space-y-4">
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
								{(summary.totalIncomplete ?? 0) > 0 && (
									<>
										{' · '}
										<span className="font-semibold text-amber-600">
											{summary.totalIncomplete}
										</span>{' '}
										needs review
									</>
								)}
								{(summary.totalPasses ?? 0) > 0 && (
									<>
										{' · '}
										<span className="font-semibold text-green-600">
											{summary.totalPasses}
										</span>{' '}
										passed
									</>
								)}
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
			<SectionDropdown
				title="Filters"
				description="Narrow results by severity, principle, level, and category."
			>
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

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
						<div className="space-y-1.5">
							<label
								htmlFor="developer-filter-severity"
								className="text-xs font-medium uppercase tracking-wide text-gray-500"
							>
								Severity
							</label>
							<select
								id="developer-filter-severity"
								value={selectedSeverity}
								onChange={e =>
									handleSeverityChange(e.target.value)
								}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
							>
								<option value="all">All severities</option>
								{ALL_SEVERITIES.map(severity => (
									<option key={severity} value={severity}>
										{severity.charAt(0).toUpperCase() +
											severity.slice(1)}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="developer-filter-principle"
								className="text-xs font-medium uppercase tracking-wide text-gray-500"
							>
								WCAG Principle
							</label>
							<select
								id="developer-filter-principle"
								value={selectedPrinciple}
								onChange={e =>
									handlePrincipleChange(e.target.value)
								}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
							>
								<option value="all">All principles</option>
								{ALL_PRINCIPLES.map(principle => (
									<option key={principle} value={principle}>
										{principle}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="developer-filter-level"
								className="text-xs font-medium uppercase tracking-wide text-gray-500"
							>
								Conformance Level
							</label>
							<select
								id="developer-filter-level"
								value={selectedLevel}
								onChange={e =>
									handleLevelChange(e.target.value)
								}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
							>
								<option value="all">All levels</option>
								{ALL_LEVELS.map(level => (
									<option key={level} value={level}>
										{level === 'best-practice'
											? 'Best Practice'
											: `Level ${level}`}
									</option>
								))}
							</select>
						</div>

						{allCategories.length > 0 && (
							<div className="space-y-1.5">
								<label
									htmlFor="developer-filter-category"
									className="text-xs font-medium uppercase tracking-wide text-gray-500"
								>
									Category
								</label>
								<select
									id="developer-filter-category"
									value={selectedCategory}
									onChange={e =>
										handleCategoryChange(e.target.value)
									}
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
								>
									<option value="all">All categories</option>
									{allCategories.map(category => (
										<option key={category} value={category}>
											{CATEGORY_LABELS[category] ??
												category}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
				</CardBody>
			</SectionDropdown>

			{/* ==================== Violations List ==================== */}
			<section aria-label="Hotspots and insights">
				<SectionDropdown
					title="Technical Hotspots"
					description="Quickly identify where the highest concentration of issues is."
				>
					<CardBody className="space-y-5">
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
							<div>
								<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
									Top WCAG criteria
								</p>
								<ul className="space-y-2">
									{topCriteria.map(([criterion, count]) => (
										<li
											key={criterion}
											className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
										>
											<span className="font-medium text-gray-800">
												{criterion}
											</span>
											<span className="tabular-nums text-gray-600">
												{count}
											</span>
										</li>
									))}
								</ul>
							</div>

							<div>
								<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
									Top rule IDs
								</p>
								<ul className="space-y-2">
									{topRules.map(rule => (
										<li
											key={rule.ruleId}
											className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
										>
											<div className="flex items-center justify-between gap-2">
												<code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
													{rule.ruleId}
												</code>
												<Badge
													variant={severityBadgeVariant(
														rule.severity
													)}
												>
													{rule.count} hits
												</Badge>
											</div>
											<p className="mt-1 line-clamp-2 text-xs text-gray-600">
												{rule.description}
											</p>
										</li>
									))}
								</ul>
							</div>

							<div>
								<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
									Category hotspots
								</p>
								<div className="flex flex-wrap gap-2">
									{topCategories.map(([category, count]) => (
										<Badge key={category} variant="default">
											{CATEGORY_LABELS[
												category as WcagCategory
											] ?? category}
											: {count}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</CardBody>
				</SectionDropdown>
			</section>

			<section aria-label="Violation results" className="space-y-4">
				{sourceEditorText && (
					<SectionDropdown
						title="Source Code"
						description="Full formatted source in a fixed-height editor. Hover highlighted lines for issue details and remediation."
					>
						<CardBody className="space-y-3">
							<div className="flex justify-end">
								<div className="w-full max-w-xs space-y-1">
									<label
										htmlFor="source-focus-theme"
										className="text-xs font-medium uppercase tracking-wide text-gray-500"
									>
										Theme
									</label>
									<select
										id="source-focus-theme"
										title="Select code theme"
										value={sourceTheme}
										onChange={event =>
											setSourceTheme(
												event.target
													.value as SourceThemeKey
											)
										}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
									>
										{Object.entries(SOURCE_THEMES).map(
											([key, value]) => (
												<option key={key} value={key}>
													{value.label}
												</option>
											)
										)}
									</select>
								</div>
							</div>

							<div
								className={cn(
									'h-136 overflow-auto rounded-xl p-2 font-mono text-xs leading-relaxed',
									SOURCE_THEMES[sourceTheme].container
								)}
							>
								<div className="mb-2 flex items-center justify-between border-b border-white/10 px-2 pb-2">
									<div className="flex items-center gap-1.5">
										<span className="h-2.5 w-2.5 rounded-full bg-red-400" />
										<span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
										<span className="h-2.5 w-2.5 rounded-full bg-green-400" />
									</div>
									<span className="truncate text-[10px] text-gray-400">
										source.html
									</span>
								</div>
								<div className="min-w-2xl">
									{sourceHighlight.lines.map(
										(line, lineIndex) => {
											const isPrimary =
												lineIndex ===
												sourceHighlight.primaryLine
											const isRelated =
												sourceHighlight.relatedLines.has(
													lineIndex
												)

											const hoverDetails =
												sourceHighlight.lineTooltips.get(
													lineIndex
												)

											return (
												<div
													key={`source-focus-${lineIndex}`}
													title={
														isPrimary || isRelated
															? hoverDetails
															: undefined
													}
													className={cn(
														'grid grid-cols-[2.75rem_1fr] gap-2 px-2 py-0.5',
														SOURCE_THEMES[
															sourceTheme
														].lineDefault,
														isPrimary &&
															SOURCE_THEMES[
																sourceTheme
															].linePrimary,
														!isPrimary &&
															isRelated &&
															SOURCE_THEMES[
																sourceTheme
															].lineSecondary
													)}
												>
													<span
														className={cn(
															'select-none text-right text-[10px] tabular-nums',
															SOURCE_THEMES[
																sourceTheme
															].lineNumber
														)}
													>
														{lineIndex + 1}
													</span>
													<span className="whitespace-pre">
														{renderHtmlLine(
															line,
															`source-line-${lineIndex}`
														)}
													</span>
												</div>
											)
										}
									)}
								</div>
							</div>

							<p className="text-xs text-gray-500">
								Highlighted lines indicate where filtered
								violations appear in the page source.
							</p>
						</CardBody>
					</SectionDropdown>
				)}

				<SectionDropdown
					title={`Violations (${filteredViolations.length} of ${violations.length})`}
					description="Expand for full rule-by-rule details."
				>
					<div className="p-4">
						{filteredViolations.length > 0 ? (
							<div className="space-y-3">
								{filteredViolations.map((violation, index) => (
									<ViolationCard
										key={`${violation.ruleId}-${violation.elements[0]?.pageUrl ?? 'no-page'}-${index}`}
										uniqueId={`${violation.ruleId}-${violation.elements[0]?.pageUrl ?? 'no-page'}-${index}`}
										ruleId={violation.ruleId}
										severity={violation.severity}
										description={violation.description}
										wcagCriterion={violation.wcagCriterion}
										wcagLevel={violation.wcagLevel}
										wcagPrinciple={violation.wcagPrinciple}
										helpUrl={violation.helpUrl}
										elements={violation.elements}
										remediation={violation.remediation}
										category={violation.category}
										onWcagCardClick={onWcagCardClick}
									/>
								))}
							</div>
						) : (
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
										Try adjusting or clearing the filters to
										see results.
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
					</div>
				</SectionDropdown>
			</section>

			{/* ==================== Needs Review (Incomplete) ==================== */}
			{incompleteItems.length > 0 && (
				<section aria-label="Needs review items">
					<SectionDropdown
						title={`Needs Manual Review (${incompleteItems.length})`}
						description="Items that require human validation."
					>
						<Card>
							<CardHeader>
								<h3 className="text-sm font-semibold text-gray-900">
									Needs Manual Review
									<span className="ml-1.5 text-gray-500 font-normal">
										({incompleteItems.length})
									</span>
								</h3>
								<p className="mt-0.5 text-xs text-gray-500">
									These items could not be fully evaluated
									automatically and require manual
									verification.
								</p>
							</CardHeader>
							<CardBody className="p-0">
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
												<Badge variant="warning">
													{item.severity}
												</Badge>
												<code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
													{item.ruleId}
												</code>
												<Badge variant="info">
													{item.wcagCriterion} (
													{item.wcagLevel})
												</Badge>
											</div>
											<p className="text-sm text-gray-800">
												{item.description}
											</p>
											{item.reason && (
												<p className="mt-1 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 inline-block">
													{item.reason}
												</p>
											)}
											<p className="mt-1 text-xs text-gray-500">
												{item.elementCount}{' '}
												{item.elementCount === 1
													? 'element'
													: 'elements'}{' '}
												to review
											</p>
										</li>
									))}
								</ul>
							</CardBody>
						</Card>
					</SectionDropdown>
				</section>
			)}
		</div>
	)
}
