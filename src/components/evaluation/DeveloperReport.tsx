'use client'

import { useState, useMemo, useCallback } from 'react'
import {
	AlertTriangle,
	AlertCircle,
	Info,
	ShieldAlert,
	SearchX,
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionDropdown } from '@/components/ui/SectionDropdown'
import { cn } from '@/lib/utils'
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
	wcagVersion?: string
	wcagLevel?: string
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

/* ---- Main Component ---- */

export default function DeveloperReport({
	report,
	onWcagCardClick,
	wcagVersion,
	wcagLevel,
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

	/* -- Page grouping for crawls -- */
	const allPageUrls = useMemo(() => {
		const urls = new Set<string>()
		for (const v of violations) {
			for (const el of v.elements) {
				if (el.pageUrl) urls.add(el.pageUrl)
			}
		}
		return Array.from(urls).sort()
	}, [violations])

	const isMultiPage = allPageUrls.length > 1
	const [activePage, setActivePage] = useState<string>('all')

	const pageFilteredViolations = useMemo(() => {
		if (!isMultiPage || activePage === 'all') return filteredViolations
		return filteredViolations
			.map(v => ({
				...v,
				elements: v.elements.filter(el => el.pageUrl === activePage),
			}))
			.filter(v => v.elements.length > 0)
	}, [filteredViolations, isMultiPage, activePage])

	/** Per-page violation + element counts for the crawl summary */
	const pageStats = useMemo(() => {
		if (!isMultiPage) return []
		return allPageUrls.map(url => {
			let violationCount = 0
			let elementCount = 0
			for (const v of filteredViolations) {
				const pageElements = v.elements.filter(el => el.pageUrl === url)
				if (pageElements.length > 0) {
					violationCount++
					elementCount += pageElements.length
				}
			}
			return { url, violationCount, elementCount }
		}).sort((a, b) => b.elementCount - a.elementCount)
	}, [isMultiPage, allPageUrls, filteredViolations])

	const sourceEditorText = useMemo(() => {
		if (report.fullSourceHtml?.trim()) {
			return report.fullSourceHtml
		}

		const fallbackCandidates = pageFilteredViolations
			.flatMap(violation =>
				violation.elements.flatMap(element => [
					...(element.sourceContext ?? []),
					element.htmlSnippet,
				])
			)
			.filter(Boolean)

		if (fallbackCandidates.length === 0) return ''

		return [...fallbackCandidates].sort((a, b) => b.length - a.length)[0]
	}, [pageFilteredViolations, report.fullSourceHtml])

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

		if (pageFilteredViolations.length === 0) {
			return {
				lines,
				primaryLine: -1,
				relatedLines: new Set<number>(),
				lineTooltips: new Map<number, string>(),
			}
		}

		const lineTooltips = new Map<number, string>()
		const allMatchedLines = new Set<number>()

		for (const violation of pageFilteredViolations) {
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
	}, [displaySourceText, pageFilteredViolations])

	const clearAllFilters = useCallback(() => {
		setActiveSeverities(new Set(ALL_SEVERITIES))
		setActivePrinciples(new Set(ALL_PRINCIPLES))
		setActiveLevels(new Set(ALL_LEVELS))
		setActiveCategories(new Set(allCategories))
		setActivePage('all')
	}, [allCategories])

	/* ---- Render ---- */

	return (
		<div className="space-y-4">
			<p className="text-xs font-medium text-gray-500">
				Evaluated against WCAG {wcagVersion ?? report.summary.wcagVersion ?? '2.2'} Level {wcagLevel ?? report.summary.wcagLevel ?? 'AA'}
			</p>
			{/* ==================== Crawl Page Navigator ==================== */}
			{isMultiPage && (
				<div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<h3 className="text-sm font-semibold text-gray-900">
								Site Crawl Results
							</h3>
							<p className="text-xs text-gray-500 mt-0.5">
								{allPageUrls.length} pages scanned &middot;{' '}
								{activePage === 'all'
									? `Showing all ${filteredViolations.length} rules`
									: `Filtered to ${pageFilteredViolations.length} rules`}
							</p>
						</div>
						<select
							aria-label="Filter by page"
							value={activePage}
							onChange={e => setActivePage(e.target.value)}
							className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 max-w-xs truncate"
						>
							<option value="all">All pages ({allPageUrls.length})</option>
							{pageStats.map(({ url, elementCount }) => {
								const short = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
								return (
									<option key={url} value={url}>
										{short} ({elementCount} issues)
									</option>
								)
							})}
						</select>
					</div>

					{/* Per-page breakdown chips */}
					<div className="flex flex-wrap gap-1.5">
						<button
							type="button"
							onClick={() => setActivePage('all')}
							aria-pressed={activePage === 'all'}
							className={cn(
								'rounded-full px-3 py-1 text-xs font-medium transition-colors',
								activePage === 'all'
									? 'bg-blue-600 text-white'
									: 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
							)}
						>
							All pages
						</button>
						{pageStats.map(({ url, elementCount }) => {
							const short = url.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/'
							const isActive = activePage === url
							return (
								<button
									key={url}
									type="button"
									onClick={() => setActivePage(url)}
									title={url}
									aria-pressed={isActive}
									className={cn(
										'rounded-full px-3 py-1 text-xs font-medium transition-colors max-w-[200px] truncate',
										isActive
											? 'bg-blue-600 text-white'
											: 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
									)}
								>
									{short} <span className="opacity-70">({elementCount})</span>
								</button>
							)
						})}
					</div>
				</div>
			)}
			{/* ==================== Source Code ==================== */}
			{sourceEditorText && (
				<SectionDropdown
					title="Source Code"
					description="Full formatted source in a fixed-height editor. Hover highlighted lines for issue details and remediation."
					defaultOpen
				>
					<CardBody className="space-y-3">
						{/* Filter toolbar */}
						<div className="flex flex-wrap items-end gap-3">
							{/* Severity */}
							<div className="space-y-1 min-w-[120px]">
								<label htmlFor="developer-filter-severity" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
									Severity
								</label>
								<select
									id="developer-filter-severity"
									value={selectedSeverity}
									onChange={e => handleSeverityChange(e.target.value)}
									className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								>
									<option value="all">All</option>
									{ALL_SEVERITIES.map(s => (
										<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
									))}
								</select>
							</div>

							{/* Principle */}
							<div className="space-y-1 min-w-[120px]">
								<label htmlFor="developer-filter-principle" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
									Principle
								</label>
								<select
									id="developer-filter-principle"
									value={selectedPrinciple}
									onChange={e => handlePrincipleChange(e.target.value)}
									className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								>
									<option value="all">All</option>
									{ALL_PRINCIPLES.map(p => (
										<option key={p} value={p}>{p}</option>
									))}
								</select>
							</div>

							{/* Level */}
							<div className="space-y-1 min-w-[100px]">
								<label htmlFor="developer-filter-level" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
									Level
								</label>
								<select
									id="developer-filter-level"
									value={selectedLevel}
									onChange={e => handleLevelChange(e.target.value)}
									className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								>
									<option value="all">All</option>
									{ALL_LEVELS.map(l => (
										<option key={l} value={l}>{l === 'best-practice' ? 'Best Practice' : `Level ${l}`}</option>
									))}
								</select>
							</div>

							{/* Category */}
							{allCategories.length > 0 && (
								<div className="space-y-1 min-w-[120px]">
									<label htmlFor="developer-filter-category" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
										Category
									</label>
									<select
										id="developer-filter-category"
										value={selectedCategory}
										onChange={e => handleCategoryChange(e.target.value)}
										className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									>
										<option value="all">All</option>
										{allCategories.map(c => (
											<option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
										))}
									</select>
								</div>
							)}

							{/* Page (crawl only) */}
							{isMultiPage && (
								<div className="space-y-1 min-w-[140px]">
									<label htmlFor="developer-filter-page" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
										Page
									</label>
									<select
										id="developer-filter-page"
										value={activePage}
										onChange={e => setActivePage(e.target.value)}
										className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									>
										<option value="all">All pages ({allPageUrls.length})</option>
										{allPageUrls.map(url => {
											const short = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
											return (
												<option key={url} value={url}>{short}</option>
											)
										})}
									</select>
								</div>
							)}

							{/* Divider */}
							<div className="hidden sm:block h-8 w-px bg-gray-200" />

							{/* Theme */}
							<div className="space-y-1 min-w-[130px]">
								<label htmlFor="source-focus-theme" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
									Theme
								</label>
								<select
									id="source-focus-theme"
									value={sourceTheme}
									onChange={e => setSourceTheme(e.target.value as SourceThemeKey)}
									className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								>
									{Object.entries(SOURCE_THEMES).map(([key, value]) => (
										<option key={key} value={key}>{value.label}</option>
									))}
								</select>
							</div>

							{/* Clear filters button */}
							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearAllFilters}
									className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-sm"
								>
									Clear filters
								</button>
							)}
						</div>

						{/* Code viewer */}
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

			{/* ==================== Technical Hotspots ==================== */}
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

			{/* ==================== Violations List ==================== */}
			<section aria-label="Violation results" className="space-y-4">
				<SectionDropdown
					title={`Violations (${pageFilteredViolations.length} of ${violations.length})`}
					description="Expand for full rule-by-rule details."
				>
					<div className="p-4">
						{pageFilteredViolations.length > 0 ? (
							<div className="space-y-3">
								{pageFilteredViolations.map((violation, index) => (
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
										No Issues Detected
									</p>
									{hasActiveFilters && (
										<p className="mt-1 text-xs text-gray-500">
											Try adjusting or clearing the filters to
											see results.
										</p>
									)}
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
						description="These items could not be fully evaluated automatically and require manual verification."
					>
						<div className="p-0">
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
						</div>
					</SectionDropdown>
				</section>
			)}
		</div>
	)
}
