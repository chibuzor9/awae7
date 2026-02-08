'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle, Loader2 } from 'lucide-react'
import EvaluationForm from '@/components/evaluation/EvaluationForm'
import EvaluationResults from '@/components/evaluation/EvaluationResults'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import type {
	EvaluationResult,
	DeveloperReport,
	AuditorReport,
	EndUserReport,
} from '@/types'

interface EvaluationData {
	evaluation: EvaluationResult
	developerReport: DeveloperReport
	auditorReport: AuditorReport
	endUserReport: EndUserReport
}

export default function EvaluatePage() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [results, setResults] = useState<EvaluationData | null>(null)

	async function handleSubmit(url: string) {
		setLoading(true)
		setError(null)
		setResults(null)

		try {
			const response = await fetch('/api/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url }),
			})

			const data = await response.json()

			if (!response.ok) {
				const message =
					data?.error ?? 'Something went wrong. Please try again.'
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
		<div className="min-h-screen bg-gray-50">
			<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
				{/* ---- Header ---- */}
				<header className="text-center mb-10">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						Evaluate Website Accessibility
					</h1>
					<p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
						Enter a URL below to run an automated WCAG 2.2
						accessibility audit. You will receive tailored reports
						for developers, auditors, and end users.
					</p>
				</header>

				{/* ---- Form ---- */}
				<section aria-label="Evaluation form" className="mb-12">
					<EvaluationForm onSubmit={handleSubmit} loading={loading} />
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
								<p className="text-lg font-medium text-gray-900">
									Analyzing accessibility...
								</p>
								<p className="mt-1 text-sm text-gray-500">
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
					<Card className="mx-auto max-w-lg border-red-200 bg-red-50">
						<CardBody className="flex flex-col items-center gap-4 py-10 text-center">
							<AlertCircle
								className="h-10 w-10 text-red-500"
								aria-hidden="true"
							/>
							<div>
								<p className="text-lg font-semibold text-red-800">
									Evaluation Failed
								</p>
								<p className="mt-1 text-sm text-red-600">
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
					<section aria-label="Evaluation results">
						<EvaluationResults
							developerReport={results.developerReport}
							auditorReport={results.auditorReport}
							endUserReport={results.endUserReport}
						/>
					</section>
				)}
			</div>
		</div>
	)
}
