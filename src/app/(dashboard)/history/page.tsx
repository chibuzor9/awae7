'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
	History,
	ExternalLink,
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Globe,
	Clock,
	X,
	Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ScoreGauge } from '@/components/ui/ScoreGauge'
import EvaluationResults from '@/components/evaluation/EvaluationResults'
import { cn, formatDate, getScoreLabel } from '@/lib/utils'
import type {
	EvaluationHistoryItem,
	EvaluationResult,
	DeveloperReport,
	AuditorReport,
	EndUserReport,
	DesignerReport,
} from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaginationInfo {
	page: number
	limit: number
	total: number
	totalPages: number
	hasNext: boolean
	hasPrev: boolean
}

interface EvaluationDetail {
	evaluation: EvaluationResult
	developerReport: DeveloperReport
	auditorReport: AuditorReport
	endUserReport: EndUserReport
	designerReport: DesignerReport
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function HistorySkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<Card key={i} className="animate-pulse">
					<CardBody className="flex items-center gap-6">
						<div className="h-20 w-20 shrink-0 rounded-full bg-gray-200" />
						<div className="flex-1 space-y-3">
							<div className="h-4 w-3/4 rounded bg-gray-200" />
							<div className="h-3 w-1/2 rounded bg-gray-200" />
							<div className="flex gap-2">
								<div className="h-5 w-16 rounded-full bg-gray-200" />
								<div className="h-5 w-16 rounded-full bg-gray-200" />
								<div className="h-5 w-16 rounded-full bg-gray-200" />
							</div>
						</div>
						<div className="h-9 w-24 rounded-lg bg-gray-200 shrink-0" />
					</CardBody>
				</Card>
			))}
		</div>
	)
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
	const router = useRouter()

	return (
		<Card className="mx-auto max-w-lg">
			<CardBody className="flex flex-col items-center gap-4 py-16 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
					<History
						className="h-8 w-8 text-blue-500"
						aria-hidden="true"
					/>
				</div>
				<div>
					<h2 tabIndex={0} className="text-lg font-semibold text-gray-900">
						No evaluations yet
					</h2>
					<p tabIndex={0} className="mt-1 text-sm text-gray-500">
						You have not run any accessibility evaluations. Start by
						evaluating a website to see your history here.
					</p>
				</div>
				<Button
					variant="primary"
					size="md"
					onClick={() => router.push('/evaluate')}
				>
					Run Your First Evaluation
				</Button>
			</CardBody>
		</Card>
	)
}

// ---------------------------------------------------------------------------
// Severity badge helper
// ---------------------------------------------------------------------------

function severityBadge(label: string, count: number) {
	if (count === 0) return null

	const variantMap: Record<string, 'error' | 'warning' | 'info' | 'default'> =
		{
			critical: 'error',
			serious: 'warning',
			moderate: 'warning',
			minor: 'info',
		}

	return (
		<Badge variant={variantMap[label] ?? 'default'}>
			{count} {label}
		</Badge>
	)
}

function scoreLabelClass(score: number): string {
	if (score >= 90) return 'text-blue-800'
	if (score >= 70) return 'text-blue-700'
	if (score >= 50) return 'text-blue-600'
	if (score >= 30) return 'text-blue-500'
	return 'text-blue-400'
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function HistoryPage() {
	// List state
	const [evaluations, setEvaluations] = useState<EvaluationHistoryItem[]>([])
	const [pagination, setPagination] = useState<PaginationInfo | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Detail state
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [detailCache, setDetailCache] = useState<
		Record<string, EvaluationDetail>
	>({})

	// Current page
	const [page, setPage] = useState(1)
	const limit = 10

	// ---- Fetch evaluation list ----
	const fetchHistory = useCallback(
		async (pageNum: number) => {
			setLoading(true)
			setError(null)

			try {
				const res = await fetch(
					`/api/evaluations?page=${pageNum}&limit=${limit}`
				)
				const data = await res.json()

				if (!res.ok) {
					throw new Error(
						data?.error ?? 'Failed to load evaluation history.'
					)
				}

				setEvaluations(data.evaluations)
				setPagination(data.pagination)
			} catch (err: unknown) {
				const message =
					err instanceof Error
						? err.message
						: 'An unexpected error occurred.'
				setError(message)
				toast.error(message)
			} finally {
				setLoading(false)
			}
		},
		[limit]
	)

	useEffect(() => {
		fetchHistory(page)
	}, [page, fetchHistory])

	// ---- Fetch single evaluation detail with reports ----
	async function handleViewDetail(id: string) {
		if (selectedId === id) {
			setSelectedId(null)
			return
		}

		setSelectedId(id)

		// Return early if already cached
		if (detailCache[id]) return

		setDetailLoading(true)

		try {
			const res = await fetch(`/api/evaluations/${id}`)
			const data = await res.json()

			if (!res.ok) {
				throw new Error(
					data?.error ?? 'Failed to load evaluation details.'
				)
			}

			const detail: EvaluationDetail = {
				evaluation: data.evaluation,
				developerReport: data.developerReport,
				auditorReport: data.auditorReport,
				endUserReport: data.endUserReport,
				designerReport: data.designerReport,
			}

			setDetailCache(prev => ({ ...prev, [id]: detail }))
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : 'Failed to load details.'
			toast.error(message)
			setSelectedId(null)
		} finally {
			setDetailLoading(false)
		}
	}

	// ---- Pagination handlers ----
	function goToPage(newPage: number) {
		setSelectedId(null)
		setPage(newPage)
	}

	// ---- Delete evaluation ----
	const [deleteTarget, setDeleteTarget] = useState<EvaluationHistoryItem | null>(null)
	const [deleting, setDeleting] = useState(false)

	async function handleDelete() {
		if (!deleteTarget) return
		setDeleting(true)
		try {
			const res = await fetch(`/api/evaluations/${deleteTarget.id}`, {
				method: 'DELETE',
			})
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(data?.error ?? 'Failed to delete evaluation.')
			}

			// Remove from local state
			setEvaluations(prev => prev.filter(ev => ev.id !== deleteTarget.id))
			setDetailCache(prev => {
				const next = { ...prev }
				delete next[deleteTarget.id]
				return next
			})
			if (selectedId === deleteTarget.id) setSelectedId(null)
			toast.success('Evaluation deleted.')
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to delete.'
			toast.error(message)
		} finally {
			setDeleting(false)
			setDeleteTarget(null)
		}
	}

	return (
		<div className="min-h-full bg-transparent">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* ---- Header ---- */}
				<header className="mb-10">
					<div className="flex items-center gap-3 mb-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft)">
							<History
								className="h-5 w-5 text-(--accent)"
								aria-hidden="true"
							/>
						</div>
						<h1 tabIndex={0} className="text-3xl font-semibold tracking-tight text-slate-900">
							Evaluation History
						</h1>
					</div>
					<p tabIndex={0} className="text-base text-slate-600 sm:text-lg">
						Review your past accessibility evaluations. Click on any
						evaluation to view the full report with developer,
						designer, auditor, and end-user perspectives.
					</p>
				</header>

				{/* ---- Loading State ---- */}
				{loading && <HistorySkeleton />}

				{/* ---- Error State ---- */}
				{error && !loading && (
					<Card className="mx-auto max-w-lg border-blue-200 bg-blue-50">
						<CardBody className="flex flex-col items-center gap-4 py-10 text-center">
							<AlertTriangle
								className="h-10 w-10 text-blue-600"
								aria-hidden="true"
							/>
							<div>
								<p tabIndex={0} className="text-lg font-semibold text-blue-800">
									Failed to Load History
								</p>
								<p tabIndex={0} className="mt-1 text-sm text-blue-700">
									{error}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => fetchHistory(page)}
							>
								Try Again
							</Button>
						</CardBody>
					</Card>
				)}

				{/* ---- Empty State ---- */}
				{!loading && !error && evaluations.length === 0 && (
					<EmptyState />
				)}

				{/* ---- Evaluation List ---- */}
				{!loading && !error && evaluations.length > 0 && (
					<>
						<div className="space-y-4" role="region" aria-label="Evaluation list">
							{evaluations.map(ev => {
								const { label } = getScoreLabel(ev.overallScore)
								const isSelected = selectedId === ev.id
								const cachedDetail = detailCache[ev.id] ?? null

								// Truncate long URLs for display
								const displayUrl =
									ev.targetUrl.length > 60
										? ev.targetUrl.slice(0, 57) + '...'
										: ev.targetUrl

								return (
									<div key={ev.id} className="space-y-3">
										{/* ---- Evaluation summary card ---- */}
										<Card
											className={cn(
												'transition-colors cursor-pointer hover:border-blue-300',
												isSelected &&
													'border-blue-400 ring-1 ring-blue-200'
											)}
											onClick={() =>
												handleViewDetail(ev.id)
											}
											role="button"
											tabIndex={0}
											aria-expanded={isSelected}
											onKeyDown={e => {
												if (
													e.key === 'Enter' ||
													e.key === ' '
												) {
													e.preventDefault()
													handleViewDetail(ev.id)
												}
											}}
										>
											<CardBody className="flex items-center gap-6">
												{/* Score gauge */}
												<div className="shrink-0">
													<ScoreGauge
														score={ev.overallScore}
														size={80}
													/>
												</div>

												{/* Info */}
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<Globe
															className="h-4 w-4 text-gray-400 shrink-0"
															aria-hidden="true"
														/>
														<p
															className="text-sm font-semibold text-gray-900 truncate"
															title={ev.targetUrl}
														>
															{displayUrl}
														</p>
													</div>
													<p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
														<Clock
															className="h-3.5 w-3.5"
															aria-hidden="true"
														/>
														{formatDate(
															ev.timestamp
														)}
													</p>
													<div className="mt-2 flex flex-wrap items-center gap-1.5">
														<Badge
															variant={
																ev.totalViolations ===
																0
																	? 'success'
																	: 'default'
															}
														>
															{ev.totalViolations}{' '}
															violation
															{ev.totalViolations !==
															1
																? 's'
																: ''}
														</Badge>
														{severityBadge(
															'critical',
															ev.criticalCount
														)}
														{severityBadge(
															'serious',
															ev.seriousCount
														)}
													</div>
												</div>

												{/* Score label & actions */}
												<div className="shrink-0 text-right">
													<p
														className={cn(
															'text-sm font-bold',
															scoreLabelClass(
																ev.overallScore
															)
														)}
													>
														{label}
													</p>
													<div className="mt-2 flex items-center gap-1.5 justify-end">
														<Button
															variant="outline"
															size="sm"
															tabIndex={-1}
															onClick={e => {
																e.stopPropagation()
																handleViewDetail(
																	ev.id
																)
															}}
														>
															{isSelected
																? 'Hide Report'
																: 'View Report'}
															{!isSelected && (
																<ExternalLink
																	className="h-3.5 w-3.5"
																	aria-hidden="true"
																/>
															)}
														</Button>
														<button
															type="button"
															onClick={e => {
																e.stopPropagation()
																setDeleteTarget(ev)
															}}
															className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
															aria-label={`Delete evaluation for ${displayUrl}`}
														>
															<Trash2 className="h-4 w-4" aria-hidden="true" />
														</button>
													</div>
												</div>
											</CardBody>
										</Card>

										{/* ---- Inline detail: loading state ---- */}
										{isSelected &&
											detailLoading &&
											!cachedDetail && (
												<Card className="border-blue-200">
													<CardBody className="flex items-center justify-center gap-3 py-12">
														<Loader2
															className="h-6 w-6 animate-spin text-blue-500"
															aria-hidden="true"
														/>
														<span className="text-sm text-gray-500">
															Loading full
															report...
														</span>
													</CardBody>
												</Card>
											)}

										{/* ---- Inline detail: full report ---- */}
										{isSelected && cachedDetail && (
											<Card className="border-blue-200">
												<CardBody className="pt-2 pb-6">
													<div className="mb-4 flex items-center justify-between">
														<h3 className="text-sm font-semibold text-gray-700">
															Full Report
														</h3>
														<div className="flex items-center gap-2">
															<a
																href={
																	ev.targetUrl
																}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
																onClick={e =>
																	e.stopPropagation()
																}
															>
																Visit site
																<ExternalLink
																	className="h-3 w-3"
																	aria-hidden="true"
																/>
															</a>
															<button
																onClick={e => {
																	e.stopPropagation()
																	setSelectedId(
																		null
																	)
																}}
																className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
																aria-label="Collapse report"
															>
																<X className="h-4 w-4" />
															</button>
														</div>
													</div>
													<EvaluationResults
														evaluation={
															cachedDetail.evaluation
														}
														developerReport={
															cachedDetail.developerReport
														}
														auditorReport={
															cachedDetail.auditorReport
														}
														endUserReport={
															cachedDetail.endUserReport
														}
														designerReport={
															cachedDetail.designerReport
														}
													/>
												</CardBody>
											</Card>
										)}
									</div>
								)
							})}
						</div>

						{/* ---- Pagination ---- */}
						{pagination && pagination.totalPages > 1 && (
							<nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
								<p className="text-sm text-gray-500">
									Showing{' '}
									<span className="font-medium">
										{(pagination.page - 1) *
											pagination.limit +
											1}
									</span>{' '}
									to{' '}
									<span className="font-medium">
										{Math.min(
											pagination.page * pagination.limit,
											pagination.total
										)}
									</span>{' '}
									of{' '}
									<span className="font-medium">
										{pagination.total}
									</span>{' '}
									evaluations
								</p>

								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={!pagination.hasPrev}
										onClick={() => goToPage(page - 1)}
										aria-label="Previous page"
									>
										<ChevronLeft
											className="h-4 w-4"
											aria-hidden="true"
										/>
										Previous
									</Button>

									{/* Page numbers */}
									<div className="flex items-center gap-1">
										{Array.from(
											{ length: pagination.totalPages },
											(_, i) => i + 1
										)
											.filter(p => {
												return (
													p === 1 ||
													p ===
														pagination.totalPages ||
													Math.abs(
														p - pagination.page
													) <= 1
												)
											})
											.reduce<(number | 'ellipsis')[]>(
												(acc, p, idx, arr) => {
													if (
														idx > 0 &&
														p -
															(arr[
																idx - 1
															] as number) >
															1
													) {
														acc.push('ellipsis')
													}
													acc.push(p)
													return acc
												},
												[]
											)
											.map((item, idx) =>
												item === 'ellipsis' ? (
													<span
														key={`ellipsis-${idx}`}
														className="px-1 text-gray-400"
													>
														...
													</span>
												) : (
													<button
														key={item}
														onClick={() =>
															goToPage(
																item as number
															)
														}
														className={cn(
															'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
															item ===
																pagination.page
																? 'bg-blue-600 text-white'
																: 'text-gray-600 hover:bg-gray-100'
														)}
														aria-label={`Page ${item}`}
														aria-current={
															item ===
															pagination.page
																? 'page'
																: undefined
														}
													>
														{item}
													</button>
												)
											)}
									</div>

									<Button
										variant="outline"
										size="sm"
										disabled={!pagination.hasNext}
										onClick={() => goToPage(page + 1)}
										aria-label="Next page"
									>
										Next
										<ChevronRight
											className="h-4 w-4"
											aria-hidden="true"
										/>
									</Button>
								</div>
							</nav>
						)}
					</>
				)}
			</div>

			{/* ---- Delete confirmation modal ---- */}
			<Modal
				open={!!deleteTarget}
				onClose={() => !deleting && setDeleteTarget(null)}
				title="Delete Evaluation"
			>
				<div className="space-y-4">
					<p tabIndex={0} className="text-sm text-gray-600">
						Are you sure you want to delete this evaluation? This action cannot be undone.
					</p>
					{deleteTarget && (
						<div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
							<p className="text-sm font-medium text-gray-900 truncate">
								{deleteTarget.targetUrl}
							</p>
							<p className="text-xs text-gray-500">
								{formatDate(deleteTarget.timestamp)} &middot; Score: {deleteTarget.overallScore}
							</p>
						</div>
					)}
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDeleteTarget(null)}
							disabled={deleting}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={handleDelete}
							loading={deleting}
							className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
						>
							<Trash2 className="h-4 w-4" aria-hidden="true" />
							Delete
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	)
}
