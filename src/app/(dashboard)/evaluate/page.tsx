'use client'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle, Loader2 } from 'lucide-react'
import EvaluationForm from '@/components/evaluation/EvaluationForm'
import type { UrlEvaluationOptions } from '@/components/evaluation/EvaluationForm'
import EvaluationResults from '@/components/evaluation/EvaluationResults'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Wcag } from '@/components/ui/Wcag'
import type {
	EvaluationResult,
	DeveloperReport,
	AuditorReport,
	EndUserReport,
	DesignerReport,
} from '@/types'

interface EvaluationData {
	evaluation: EvaluationResult
	developerReport: DeveloperReport
	auditorReport: AuditorReport
	endUserReport: EndUserReport
	designerReport: DesignerReport
}

type PreferredRole = 'end-user' | 'developer' | 'designer' | 'auditor'

const PREFERRED_ROLE_STORAGE_KEY = 'awae_preferred_role'

function normalizeUrl(raw: string): string {
	const trimmed = raw.trim()
	if (!trimmed) return trimmed
	if (!/^https?:\/\//i.test(trimmed)) {
		return `https://${trimmed}`
	}
	return trimmed
}

function getUrlValidationError(rawUrl: string): string | null {
	if (!rawUrl.trim()) {
		return 'Please enter a URL to evaluate.'
	}

	try {
		const parsed = new URL(normalizeUrl(rawUrl))
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return 'Only HTTP and HTTPS URLs are supported.'
		}
		if (!parsed.hostname) {
			return 'Please enter a valid URL with a hostname.'
		}
		return null
	} catch {
		return 'Please enter a valid URL (example: https://example.com).'
	}
}

function extractApiErrorMessage(data: unknown): string | null {
	if (
		typeof data === 'object' &&
		data !== null &&
		'error' in data &&
		typeof (data as { error: unknown }).error === 'string'
	) {
		return (data as { error: string }).error
	}
	return null
}

export default function EvaluatePage() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [results, setResults] = useState<EvaluationData | null>(null)
	const [preferredRole, setPreferredRole] =
		useState<PreferredRole>('end-user')
	const resultsRef = useRef<HTMLElement>(null)

	useEffect(() => {
		if (results && !loading) {
			resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}, [results, loading])

	useEffect(() => {
		let mounted = true

		const loadPreference = async () => {
			let localFallback: PreferredRole | null = null

			try {
				const storedRole = window.localStorage.getItem(
					PREFERRED_ROLE_STORAGE_KEY
				)
				if (
					storedRole === 'end-user' ||
					storedRole === 'developer' ||
					storedRole === 'designer' ||
					storedRole === 'auditor'
				) {
					localFallback = storedRole
					if (mounted) setPreferredRole(storedRole)
				}
			} catch {
				// Ignore localStorage access issues silently
			}

			try {
				const response = await fetch('/api/preferences', {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				})

				if (!response.ok) return

				const data = (await response.json()) as {
					preferredRole?: string
				}

				if (
					data.preferredRole === 'end-user' ||
					data.preferredRole === 'developer' ||
					data.preferredRole === 'designer' ||
					data.preferredRole === 'auditor'
				) {
					if (mounted) setPreferredRole(data.preferredRole)
					try {
						window.localStorage.setItem(
							PREFERRED_ROLE_STORAGE_KEY,
							data.preferredRole
						)
					} catch {
						// Ignore localStorage access issues silently
					}
				}
			} catch {
				if (localFallback && mounted) {
					setPreferredRole(localFallback)
				}
			}
		}

		loadPreference()

		const handlePreferenceChange = () => {
			try {
				const stored = window.localStorage.getItem(PREFERRED_ROLE_STORAGE_KEY)
				if (
					stored === 'end-user' ||
					stored === 'developer' ||
					stored === 'designer' ||
					stored === 'auditor'
				) {
					if (mounted) setPreferredRole(stored)
				}
			} catch {
				// Ignore localStorage errors
			}
		}
		window.addEventListener('awae-preference-changed', handlePreferenceChange)

		return () => {
			mounted = false
			window.removeEventListener('awae-preference-changed', handlePreferenceChange)
		}
	}, [])

	async function handleUrlSubmit({
		url,
		crawlWholeSite,
		maxPages,
		wcagVersion,
		wcagLevel,
	}: UrlEvaluationOptions) {
		const validationError = getUrlValidationError(url)
		if (validationError) {
			setError(validationError)
			toast.error(validationError)
			return
		}

		const normalizedUrl = normalizeUrl(url)

		setLoading(true)
		setError(null)
		setResults(null)

		try {
			const response = await fetch('/api/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: normalizedUrl,
					crawlWholeSite,
					maxPages,
					wcagVersion,
					wcagLevel,
				}),
			})

			let data: unknown = null
			try {
				data = await response.json()
			} catch {
				data = null
			}

			if (!response.ok) {
				const message =
					extractApiErrorMessage(data) ??
					'Evaluation failed. The target may be unreachable, blocked, or returned an error status.'
				throw new Error(message)
			}

			setResults(data as EvaluationData)
		} catch (err: unknown) {
			const message =
				err instanceof TypeError
					? 'Network error. Please check your connection and try again.'
					: err instanceof Error
						? err.message
						: 'An unexpected error occurred.'
			setError(message)
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	async function handleFileSubmit(file: File) {
		setLoading(true)
		setError(null)
		setResults(null)

		try {
			const formData = new FormData()
			formData.append('file', file)

			const response = await fetch('/api/evaluate', {
				method: 'POST',
				body: formData,
			})

			const data = await response.json()

			if (!response.ok) {
				const message =
					data?.error ??
					'HTML evaluation failed. The uploaded file may be malformed or unreadable.'
				throw new Error(message)
			}

			setResults(data as EvaluationData)
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
	}

	return (
		<div className="min-h-full bg-transparent">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* ---- Header ---- */}
				<header className="mb-10 text-center">
					<h1 tabIndex={0} className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
						Evaluate Website Accessibility
					</h1>
					<p tabIndex={0} className="mx-auto mt-3 max-w-3xl text-base text-slate-600 sm:text-lg">
						Enter a URL or upload an HTML file to run an automated
						<Wcag /> 2.2 accessibility audit.
					</p>
				</header>

				{/* ---- Form ---- */}
				<section aria-label="Evaluation form" className="mb-12">
					<EvaluationForm
						onSubmitUrl={handleUrlSubmit}
						onSubmitFile={handleFileSubmit}
						loading={loading}
					/>
				</section>

				{/* ---- Loading State ---- */}
				{loading && (
					<Card className="mx-auto max-w-lg text-center">
						<CardBody className="py-16 flex flex-col items-center gap-4">
							<Loader2
								className="h-10 w-10 animate-spin text-blue-600"
								aria-hidden="true"
							/>
							<div>
								<p tabIndex={0} className="text-lg font-medium text-gray-900">
									Analyzing accessibility...
								</p>
								<p tabIndex={0} className="mt-1 text-sm text-gray-500">
									This may take a moment while we scan the
									page and generate your reports.
								</p>
							</div>

							{/* Progress bar animation */}
							<div
								className="mt-2 h-1.5 w-64 overflow-hidden rounded-full bg-gray-200"
								role="progressbar"
								aria-label="Evaluation in progress"
								aria-busy="true"
							>
								<div className="h-full w-1/2 animate-[indeterminate_1.5s_ease-in-out_infinite] rounded-full bg-blue-600" />
							</div>
						</CardBody>
					</Card>
				)}

				{/* ---- Error State ---- */}
				{error && !loading && (
					<Card className="mx-auto max-w-lg border-blue-200 bg-blue-50" role="alert">
						<CardBody className="flex flex-col items-center gap-4 py-10 text-center">
							<AlertCircle
								className="h-10 w-10 text-blue-600"
								aria-hidden="true"
							/>
							<div>
								<p tabIndex={0} className="text-lg font-semibold text-blue-800">
									Evaluation Failed
								</p>
								<p tabIndex={0} className="mt-1 text-sm text-blue-700">
									{error}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setError(null)}
							>
								Dismiss
							</Button>
						</CardBody>
					</Card>
				)}

				{/* ---- Results ---- */}
				{results && !loading && (
					<section ref={resultsRef} aria-label="Evaluation results" aria-live="polite" className="scroll-mt-20">
						<EvaluationResults
							key={`${results.evaluation.id ?? results.evaluation.targetUrl}-${preferredRole}`}
							evaluation={results.evaluation}
							developerReport={results.developerReport}
							auditorReport={results.auditorReport}
							endUserReport={results.endUserReport}
							designerReport={results.designerReport}
							defaultTab={preferredRole}
						/>
					</section>
				)}
			</div>
		</div>
	)
}
