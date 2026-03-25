'use client'

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { Globe, Search, Upload, FileText, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wcag } from '@/components/ui/Wcag'
import { cn, isValidUrl } from '@/lib/utils'

export type WcagVersion = '2.1' | '2.2'
export type WcagLevel = 'A' | 'AA'

type InputMode = 'url' | 'file'

export interface UrlEvaluationOptions {
	url: string
	crawlWholeSite: boolean
	maxPages: number
	wcagVersion: WcagVersion
	wcagLevel: WcagLevel
}

export interface EvaluationFormProps {
	onSubmitUrl: (options: UrlEvaluationOptions) => void
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
	const [crawlWholeSite, setCrawlWholeSite] = useState(false)
	const [maxPages, setMaxPages] = useState('10')
	const [wcagVersion, setWcagVersion] = useState<WcagVersion>('2.2')
	const [wcagLevel, setWcagLevel] = useState<WcagLevel>('AA')
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

			const parsedMaxPages = Number.parseInt(maxPages, 10)
			if (
				crawlWholeSite &&
				(!Number.isFinite(parsedMaxPages) ||
					parsedMaxPages < 1 ||
					parsedMaxPages > 50)
			) {
				setError('Max pages must be a number between 1 and 50.')
				return
			}

			onSubmitUrl({
				url: normalized,
				crawlWholeSite,
				maxPages: crawlWholeSite ? parsedMaxPages : 1,
				wcagVersion,
				wcagLevel,
			})
		} else {
			if (!selectedFile) {
				setError('Please select an HTML file to evaluate.')
				return
			}
			onSubmitFile(selectedFile)
		}
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			<form onSubmit={handleSubmit} noValidate className="space-y-4">
				{/* WCAG settings */}
				<fieldset className="flex flex-wrap items-end justify-center gap-4 mb-4">
					<legend className="sr-only">Evaluation Settings</legend>
					<div className="flex flex-col gap-1">
						<label htmlFor="wcag-version" className="text-xs font-medium text-gray-600">
							<Wcag /> Version
						</label>
						<select
							id="wcag-version"
							value={wcagVersion}
							onChange={e => setWcagVersion(e.target.value as WcagVersion)}
							disabled={loading}
							className="h-9 rounded-lg border border-(--border) bg-white px-3 text-sm text-(--text) focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="2.1">WCAG 2.1</option>
							<option value="2.2">WCAG 2.2</option>
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label htmlFor="wcag-level" className="text-xs font-medium text-gray-600">
							Conformance Level
						</label>
						<select
							id="wcag-level"
							value={wcagLevel}
							onChange={e => setWcagLevel(e.target.value as WcagLevel)}
							disabled={loading}
							className="h-9 rounded-lg border border-(--border) bg-white px-3 text-sm text-(--text) focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="A">Level A</option>
							<option value="AA">Level AA</option>
						</select>
					</div>
				</fieldset>

				{/* Mode toggle */}
				<div role="tablist" aria-label="Input method" className="flex items-center justify-center gap-1 rounded-lg bg-gray-100 p-1 w-fit mx-auto">
					<button
						type="button"
						role="tab"
						id="input-tab-url"
						aria-selected={mode === 'url'}
						tabIndex={mode === 'url' ? 0 : -1}
						onClick={() => {
							setMode('url')
							setError(null)
						}}
						onKeyDown={(e) => {
							if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
								e.preventDefault()
								const newMode = mode === 'url' ? 'file' : 'url'
								setMode(newMode)
								setError(null)
								const targetId = newMode === 'url' ? 'input-tab-url' : 'input-tab-file'
								document.getElementById(targetId)?.focus()
							}
						}}
						className={cn(
							'flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
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
						role="tab"
						id="input-tab-file"
						aria-selected={mode === 'file'}
						tabIndex={mode === 'file' ? 0 : -1}
						onClick={() => {
							setMode('file')
							setError(null)
						}}
						onKeyDown={(e) => {
							if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
								e.preventDefault()
								const newMode = mode === 'url' ? 'file' : 'url'
								setMode(newMode)
								setError(null)
								const targetId = newMode === 'url' ? 'input-tab-url' : 'input-tab-file'
								document.getElementById(targetId)?.focus()
							}
						}}
						className={cn(
							'flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
							mode === 'file'
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-600 hover:text-gray-900'
						)}
					>
						<Upload className="h-4 w-4" aria-hidden="true" />
						HTML File
					</button>
				</div>

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

							<div className="mt-3 rounded-lg border border-(--border) bg-(--surface) px-3 py-2.5">
								<label className="flex items-center gap-2 text-sm font-medium text-(--text)">
									<input
										type="checkbox"
										checked={crawlWholeSite}
										onChange={e => {
											setCrawlWholeSite(e.target.checked)
											if (error) setError(null)
										}}
										disabled={loading}
										className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										aria-describedby="crawl-help-text"
									/>
									Crawl full website (same origin)
								</label>
								<p id="crawl-help-text" className="mt-1 text-xs text-(--muted-text)">
									Automatically excludes admin paths like
									/wp-admin, /admin, /administrator, and
									/wp-login.php.
								</p>

								{crawlWholeSite && (
									<div className="mt-2 flex items-center gap-2">
										<label
											htmlFor="maxPages"
											className="text-xs font-medium text-(--muted-text)"
										>
											Max pages
										</label>
										<input
											id="maxPages"
											type="number"
											min={1}
											max={50}
											value={maxPages}
											onChange={e => {
												setMaxPages(e.target.value)
												if (error) setError(null)
											}}
											disabled={loading}
											className="h-8 w-24 rounded-md border border-(--border) bg-white px-2 text-sm text-(--text)"
										/>
										<p className="text-xs text-(--muted-text)">
											1 to 50 pages
										</p>
									</div>
								)}
							</div>
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
							<p className="text-sm text-blue-700" role="alert">
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
