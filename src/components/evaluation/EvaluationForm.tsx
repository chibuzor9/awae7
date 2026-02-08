'use client'

import { useState, type FormEvent } from 'react'
import { Globe, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { isValidUrl } from '@/lib/utils'

export interface EvaluationFormProps {
	onSubmit: (url: string) => void
	loading: boolean
}

/**
 * URL input form for initiating an accessibility evaluation.
 * Validates the URL client-side and auto-prepends https:// when needed.
 */
export default function EvaluationForm({
	onSubmit,
	loading,
}: EvaluationFormProps) {
	const [url, setUrl] = useState('')
	const [error, setError] = useState<string | null>(null)

	function normalizeUrl(raw: string): string {
		const trimmed = raw.trim()
		if (!trimmed) return trimmed

		// Auto-prepend https:// if the user entered a bare domain
		if (!/^https?:\/\//i.test(trimmed)) {
			return `https://${trimmed}`
		}
		return trimmed
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		const normalized = normalizeUrl(url)

		if (!normalized) {
			setError('Please enter a URL to evaluate.')
			return
		}

		if (!isValidUrl(normalized)) {
			setError(
				'Please enter a valid URL starting with http:// or https://.'
			)
			return
		}

		onSubmit(normalized)
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-2xl mx-auto"
			noValidate
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start">
				<div className="flex-1">
					<Input
						type="url"
						value={url}
						onChange={e => {
							setUrl(e.target.value)
							if (error) setError(null)
						}}
						placeholder="Enter website URL (e.g., https://example.com)"
						icon={<Globe className="h-5 w-5" />}
						error={error ?? undefined}
						disabled={loading}
						aria-label="Website URL"
					/>
				</div>

				<Button
					type="submit"
					variant="primary"
					size="md"
					loading={loading}
					className="sm:mt-0 shrink-0"
				>
					<Search className="h-4 w-4" aria-hidden="true" />
					{loading ? 'Evaluating...' : 'Evaluate'}
				</Button>
			</div>
		</form>
	)
}
