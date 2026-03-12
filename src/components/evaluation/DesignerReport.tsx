'use client'

import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { DesignerReport as DesignerReportType } from '@/types'

interface DesignerReportProps {
	report: DesignerReportType
	targetUrl?: string
	fullSourceHtml?: string
}

const severityConfig = {
	critical: { icon: ShieldAlert, colorClass: 'text-red-600', bgClass: 'bg-red-50' },
	serious: { icon: AlertTriangle, colorClass: 'text-orange-600', bgClass: 'bg-orange-50' },
	moderate: { icon: AlertCircle, colorClass: 'text-amber-600', bgClass: 'bg-amber-50' },
	minor: { icon: Info, colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
} as const

function severityBadgeVariant(severity: string) {
	switch (severity) {
		case 'critical':
		case 'serious':
			return 'error' as const
		case 'moderate':
			return 'warning' as const
		default:
			return 'info' as const
	}
}

function buildHighlightCss(report: DesignerReportType): string {
	const rules: string[] = []

	for (const issue of report.contrastIssues) {
		if (issue.selector) {
			rules.push(`${issue.selector} { outline: 3px dashed #ef4444 !important; outline-offset: 2px; }`)
		}
	}

	for (const issue of report.targetIssues) {
		if (issue.selector) {
			rules.push(`${issue.selector} { outline: 3px solid #f97316 !important; outline-offset: 2px; }`)
		}
	}

	// hierarchyIssues don't have selectors — they describe structural issues
	// (heading order, focus order) that can't be targeted by CSS selector

	return rules.join('\n')
}

function stripCspMeta(html: string): string {
	return html.replace(
		/<meta[^>]*http-equiv\s*=\s*["']?content-security-policy["']?[^>]*>/gi,
		''
	)
}

function buildPreviewSrcdoc(html: string, highlightCss: string, targetUrl?: string): string {
	const clean = stripCspMeta(html)
	const styleTag = `<style data-awae-highlights>${highlightCss}</style>`
	const baseTag = targetUrl ? `<base href="${targetUrl}" />` : ''
	const injected = `${baseTag}${styleTag}`
	if (clean.includes('</head>')) {
		return clean.replace('</head>', `${injected}</head>`)
	}
	if (clean.includes('<head>')) {
		return clean.replace('<head>', `<head>${injected}`)
	}
	return `${injected}${clean}`
}

export default function DesignerReport({ report, targetUrl, fullSourceHtml }: DesignerReportProps) {
	return (
		<div className="space-y-6">
			{/* 1. Live Preview */}
			{(fullSourceHtml || targetUrl) && (
				<Card>
					<CardHeader>
						<div>
							<h3 className="text-base font-semibold text-(--text)">
								Live Preview
							</h3>
							<p className="mt-0.5 text-sm text-(--muted-text)">
								{fullSourceHtml
									? 'Page source rendered with accessibility issues highlighted'
									: 'Live page preview (highlights unavailable for cross-origin content)'}
							</p>
						</div>
						{fullSourceHtml && (
							<div className="flex gap-3">
								<span className="inline-flex items-center gap-1.5 text-xs text-(--muted-text)">
									<span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-dashed border-red-500" />
									Contrast
								</span>
								<span className="inline-flex items-center gap-1.5 text-xs text-(--muted-text)">
									<span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-orange-500" />
									Touch Targets
								</span>
								<span className="inline-flex items-center gap-1.5 text-xs text-(--muted-text)">
									<span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-yellow-500" />
									Hierarchy / Focus
								</span>
							</div>
						)}
					</CardHeader>
					<CardBody className="p-0">
						{fullSourceHtml ? (
							<iframe
								title="Evaluated page preview"
								sandbox="allow-same-origin allow-scripts"
								referrerPolicy="no-referrer"
								className="h-150 w-full border-0"
								srcDoc={buildPreviewSrcdoc(
									fullSourceHtml,
									buildHighlightCss(report),
									targetUrl
								)}
							/>
						) : (
							<iframe
								title="Evaluated page preview"
								sandbox="allow-same-origin allow-scripts"
								referrerPolicy="no-referrer"
								className="h-150 w-full border-0"
								src={targetUrl}
							/>
						)}
					</CardBody>
				</Card>
			)}

			{/* 2. Color & Contrast */}
			<Card>
				<CardHeader>
					<div>
						<h3 className="text-base font-semibold text-(--text)">
							Color & Contrast
						</h3>
						<p className="mt-0.5 text-sm text-(--muted-text)">
							Text and interactive elements that do not meet
							minimum contrast ratios
						</p>
					</div>
					{report.contrastIssues.length > 0 ? (
						<Badge variant="error">
							{report.contrastIssues.length} issues
						</Badge>
					) : (
						<Badge variant="success">No Issues Detected</Badge>
					)}
				</CardHeader>
				<CardBody>
					{report.contrastIssues.length === 0 ? (
						<p className="text-center text-sm text-(--muted-text) py-4">
							All text and interactive elements meet contrast
							requirements.
						</p>
					) : (
						<div className="space-y-3">
							{report.contrastIssues.map((issue, i) => (
								<div
									key={`contrast-${i}`}
									className="flex items-start gap-3 rounded-lg border border-(--border) p-3"
								>
									<div
										className="flex shrink-0 flex-col items-center gap-1"
										role="img"
										aria-label={`Color swatches: Foreground ${issue.foreground}, Background ${issue.background}`}
									>
										{/* Note: Inline styles required for dynamic contrast colors */}
										<div
											className="h-6 w-6 rounded border border-gray-300"
											style={{
												backgroundColor:
													issue.foreground,
											}}
											title={`Foreground: ${issue.foreground}`}
										/>
										<div
											className="h-6 w-6 rounded border border-gray-300"
											style={{
												backgroundColor:
													issue.background,
											}}
											title={`Background: ${issue.background}`}
										/>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<Badge
												variant={severityBadgeVariant(
													issue.severity
												)}
											>
												{issue.severity}
											</Badge>
											<span className="text-xs text-(--muted-text)">
												WCAG {issue.wcagCriterion}
											</span>
										</div>
										<p className="mt-1 text-sm text-(--text)">
											Ratio:{' '}
											<strong>{issue.ratio}</strong>{' '}
											(required: {issue.requiredRatio})
										</p>
										<p className="mt-0.5 text-xs font-mono text-(--muted-text) truncate">
											{issue.selector}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* 3. Touch Targets & Spacing */}
			<Card>
				<CardHeader>
					<div>
						<h3 className="text-base font-semibold text-(--text)">
							Touch Targets & Spacing
						</h3>
						<p className="mt-0.5 text-sm text-(--muted-text)">
							Interactive elements that are too small to tap
							comfortably
						</p>
					</div>
					{report.targetIssues.length > 0 ? (
						<Badge variant="error">
							{report.targetIssues.length} issues
						</Badge>
					) : (
						<Badge variant="success">No Issues Detected</Badge>
					)}
				</CardHeader>
				<CardBody>
					{report.targetIssues.length === 0 ? (
						<p className="text-center text-sm text-(--muted-text) py-4">
							All interactive elements meet minimum touch target
							size.
						</p>
					) : (
						<div className="space-y-2">
							{report.targetIssues.map((issue, i) => (
								<div
									key={`target-${i}`}
									className="flex items-center gap-3 rounded-lg border border-(--border) p-3"
								>
									<Badge
										variant={severityBadgeVariant(
											issue.severity
										)}
									>
										{issue.severity}
									</Badge>
									<div className="min-w-0 flex-1">
										<p className="text-sm text-(--text)">
											Size:{' '}
											<strong>{issue.currentSize}</strong>{' '}
											(required: {issue.requiredSize})
										</p>
										<p className="mt-0.5 text-xs font-mono text-(--muted-text) truncate">
											{issue.selector}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* 4. Visual Hierarchy & Focus */}
			<Card>
				<CardHeader>
					<div>
						<h3 className="text-base font-semibold text-(--text)">
							Visual Hierarchy & Focus
						</h3>
						<p className="mt-0.5 text-sm text-(--muted-text)">
							Heading structure, focus indicators, and reading
							order
						</p>
					</div>
					{report.hierarchyIssues.length > 0 ? (
						<Badge variant="error">
							{report.hierarchyIssues.length} issues
						</Badge>
					) : (
						<Badge variant="success">No Issues Detected</Badge>
					)}
				</CardHeader>
				<CardBody>
					{report.hierarchyIssues.length === 0 ? (
						<p className="text-center text-sm text-(--muted-text) py-4">
							Page has a clear visual hierarchy and focus order.
						</p>
					) : (
						<div className="space-y-2">
							{report.hierarchyIssues.map((issue, i) => (
								<div
									key={`hier-${i}`}
									className="rounded-lg border border-(--border) p-3"
								>
									<div className="flex items-center gap-2">
										<Badge
											variant={severityBadgeVariant(
												issue.severity
											)}
										>
											{issue.severity}
										</Badge>
										<span className="text-xs font-mono text-(--muted-text)">
											{issue.ruleId}
										</span>
										<span className="text-xs text-(--muted-text)">
											· {issue.elementCount} element
											{issue.elementCount !== 1
												? 's'
												: ''}
										</span>
									</div>
									<p className="mt-1.5 text-sm text-(--text)">
										{issue.designerDescription}
									</p>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* 5. Component Checklist */}
			<Card>
				<CardHeader>
					<h3 className="text-base font-semibold text-(--text)">
						Component Checklist
					</h3>
				</CardHeader>
				<CardBody className="p-0">
					<table className="min-w-full text-sm">
						<thead className="bg-(--surface)">
							<tr className="text-left text-xs text-(--muted-text)">
								<th className="px-4 py-2.5">Component</th>
								<th className="px-4 py-2.5">Status</th>
								<th className="px-4 py-2.5 text-right">
									Issues
								</th>
							</tr>
						</thead>
						<tbody>
							{report.componentChecklist.map(item => (
								<tr
									key={item.component}
									className="border-t border-(--border)"
								>
									<td className="px-4 py-2.5 text-(--text)">
										{item.component}
									</td>
									<td className="px-4 py-2.5">
										{item.status === 'pass' && (
											<span className="inline-flex items-center gap-1 text-emerald-600">
												<CheckCircle2
													className="h-3.5 w-3.5"
													aria-hidden="true"
												/>
												Pass
											</span>
										)}
										{item.status === 'warning' && (
											<span className="inline-flex items-center gap-1 text-amber-600">
												<AlertCircle
													className="h-3.5 w-3.5"
													aria-hidden="true"
												/>
												Warning
											</span>
										)}
										{item.status === 'fail' && (
											<span className="inline-flex items-center gap-1 text-red-600">
												<AlertTriangle
													className="h-3.5 w-3.5"
													aria-hidden="true"
												/>
												Fail
											</span>
										)}
									</td>
									<td className="px-4 py-2.5 text-right font-medium text-(--text)">
										{item.issueCount === 0
											? 'No Issues Detected'
											: item.issueCount}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</CardBody>
			</Card>
		</div>
	)
}
