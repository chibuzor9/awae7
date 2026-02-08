'use client'

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { Globe, Search, Upload, FileText, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn, isValidUrl } from '@/lib/utils'

type InputMode = 'url' | 'file'

export interface EvaluationFormProps {
	onSubmitUrl: (url: string) => void
	onSubmitFile: (file: File) => void
	loading: boolean
}

/**
 * Dual-mode form: enter a URL or upload an HTML file for evaluation.
 */
export default function EvaluationForm({
	onSubmitUrl,
	onSubmitFile,
	loading,
}: EvaluationFormProps) {
	const [mode, setMode] = useState<InputMode>('url')
	const [url, setUrl] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// ---- URL helpers ----
	function normalizeUrl(raw: string): string {
		const trimmed = raw.trim()
		if (!trimmed) return trimmed
		if (!/^https?:\/\//i.test(trimmed)) {
			return `https://${trimmed}`
		}
		return trimmed
	}

	// ---- File handlers ----
	function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
		setError(null)
		const file = e.target.files?.[0]
		if (!file) return

		const name = file.name.toLowerCase()
		if (!name.endsWith('.html') && !name.endsWith('.htm')) {
			setError('Only .html and .htm files are accepted.')
			setSelectedFile(null)
			return
		}

		if (file.size > 10 * 1024 * 1024) {
			setError('File is too large. Maximum size is 10 MB.')
			setSelectedFile(null)
			return
		}

		setSelectedFile(file)
	}

	function clearFile() {
		setSelectedFile(null)
		setError(null)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	// ---- Drag & drop ----
	function handleDrop(e: React.DragEvent) {
		e.preventDefault()
		e.stopPropagation()
		setError(null)

		const file = e.dataTransfer.files?.[0]
		if (!file) return

		const name = file.name.toLowerCase()
		if (!name.endsWith('.html') && !name.endsWith('.htm')) {
			setError('Only .html and .htm files are accepted.')
			return
		}

		if (file.size > 10 * 1024 * 1024) {
			setError('File is too large. Maximum size is 10 MB.')
			return
		}

		setSelectedFile(file)
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault()
		e.stopPropagation()
	}

	// ---- Submit ----
	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		if (mode === 'url') {
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
			onSubmitUrl(normalized)
		} else {
			if (!selectedFile) {
				setError('Please select an HTML file to evaluate.')
				return
			}
			onSubmitFile(selectedFile)
		}
	}

	return (
		<div className="w-full max-w-2xl mx-auto space-y-4">
			{/* Mode toggle */}
			<div className="flex items-center justify-center gap-1 rounded-lg bg-gray-100 p-1 w-fit mx-auto">
				<button
					type="button"
					onClick={() => {
						setMode('url')
						setError(null)
					}}
					className={cn(
						'flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors',
						mode === 'url'
							? 'bg-white text-gray-900 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					)}
				>
					<Globe className="h-4 w-4" aria-hidden="true" />
					URL
				</button>
				<button
					type="button"
					onClick={() => {
						setMode('file')
						setError(null)
					}}
					className={cn(
						'flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors',
						mode === 'file'
							? 'bg-white text-gray-900 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					)}
				>
					<Upload className="h-4 w-4" aria-hidden="true" />
					HTML File
				</button>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} noValidate>
				{mode === 'url' ? (
					/* URL input */
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
				) : (
					/* File upload */
					<div className="space-y-3">
						<div
							onDrop={handleDrop}
							onDragOver={handleDragOver}
							className={cn(
								'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors',
								selectedFile
									? 'border-blue-300 bg-blue-50'
									: 'border-gray-300 bg-white hover:border-gray-400',
								loading && 'opacity-60 pointer-events-none'
							)}
						>
							{selectedFile ? (
								<div className="flex items-center gap-3">
									<FileText
										className="h-8 w-8 text-blue-500"
										aria-hidden="true"
									/>
									<div className="text-left">
										<p className="text-sm font-medium text-gray-900">
											{selectedFile.name}
										</p>
										<p className="text-xs text-gray-500">
											{(selectedFile.size / 1024).toFixed(
												1
											)}{' '}
											KB
										</p>
									</div>
									<button
										type="button"
										onClick={clearFile}
										className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
										aria-label="Remove file"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							) : (
								<>
									<Upload
										className="h-10 w-10 text-gray-400 mb-3"
										aria-hidden="true"
									/>
									<p className="text-sm text-gray-600">
										<button
											type="button"
											onClick={() =>
												fileInputRef.current?.click()
											}
											className="font-semibold text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
										>
											Choose a file
										</button>{' '}
										or drag and drop
									</p>
									<p className="mt-1 text-xs text-gray-500">
										.html or .htm files up to 10 MB
									</p>
								</>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept=".html,.htm"
								onChange={handleFileChange}
								className="sr-only"
								disabled={loading}
								aria-label="Upload HTML file"
							/>
						</div>

						{error && (
							<p className="text-sm text-red-600" role="alert">
								{error}
							</p>
						)}

						<Button
							type="submit"
							variant="primary"
							size="md"
							loading={loading}
							disabled={!selectedFile}
							className="w-full"
						>
							<Search className="h-4 w-4" aria-hidden="true" />
							{loading ? 'Evaluating...' : 'Evaluate HTML File'}
						</Button>
					</div>
				)}
			</form>
		</div>
	)
}
