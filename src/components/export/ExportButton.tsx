'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, FileText, Braces, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { exportToPdf } from '@/lib/export/pdf'
import { exportToJson } from '@/lib/export/json'
import { exportToCsv } from '@/lib/export/csv'
import type { DeveloperReport, AuditorReport, EndUserReport, DesignerReport } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportType = 'developer' | 'auditor' | 'end-user' | 'designer'
type ExportFormat = 'pdf' | 'json' | 'csv'

interface ExportButtonProps {
	developerReport: DeveloperReport
	auditorReport: AuditorReport
	endUserReport: EndUserReport
	designerReport: DesignerReport
	activeTab: ReportType
}

// ---------------------------------------------------------------------------
// Export options config
// ---------------------------------------------------------------------------

const EXPORT_OPTIONS: {
	label: string
	icon: typeof FileText
	format: ExportFormat
}[] = [
	{ label: 'Export as PDF', icon: FileText, format: 'pdf' },
	{ label: 'Export as JSON', icon: Braces, format: 'json' },
	{ label: 'Export as CSV', icon: Table2, format: 'csv' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExportButton({
	developerReport,
	auditorReport,
	endUserReport,
	designerReport,
	activeTab,
}: ExportButtonProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [focusedIndex, setFocusedIndex] = useState(-1)
	const containerRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

	// Resolve the active report based on the currently selected tab
	const getActiveReport = useCallback(():
		| DeveloperReport
		| AuditorReport
		| EndUserReport
		| DesignerReport => {
		switch (activeTab) {
			case 'developer':
				return developerReport
			case 'auditor':
				return auditorReport
			case 'end-user':
				return endUserReport
			case 'designer':
				return designerReport
		}
	}, [activeTab, developerReport, auditorReport, endUserReport, designerReport])

	// Dispatch the export for the given format
	const handleExport = useCallback(
		(format: ExportFormat) => {
			const report = getActiveReport()

			switch (format) {
				case 'pdf':
					exportToPdf(report, activeTab)
					break
				case 'json':
					exportToJson(report, activeTab)
					break
				case 'csv':
					exportToCsv(report, activeTab)
					break
			}

			setIsOpen(false)
			setFocusedIndex(-1)
		},
		[getActiveReport, activeTab]
	)

	// Close on outside click
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
				setFocusedIndex(-1)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	// Move focus to the currently focused menu item
	useEffect(() => {
		if (isOpen && focusedIndex >= 0) {
			itemRefs.current[focusedIndex]?.focus()
		}
	}, [isOpen, focusedIndex])

	function toggleDropdown() {
		setIsOpen(prev => {
			const next = !prev
			if (next) {
				setFocusedIndex(0)
			} else {
				setFocusedIndex(-1)
			}
			return next
		})
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		if (!isOpen) {
			if (
				event.key === 'ArrowDown' ||
				event.key === 'Enter' ||
				event.key === ' '
			) {
				event.preventDefault()
				setIsOpen(true)
				setFocusedIndex(0)
			}
			return
		}

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				setFocusedIndex(prev =>
					prev < EXPORT_OPTIONS.length - 1 ? prev + 1 : 0
				)
				break
			case 'ArrowUp':
				event.preventDefault()
				setFocusedIndex(prev =>
					prev > 0 ? prev - 1 : EXPORT_OPTIONS.length - 1
				)
				break
			case 'Home':
				event.preventDefault()
				setFocusedIndex(0)
				break
			case 'End':
				event.preventDefault()
				setFocusedIndex(EXPORT_OPTIONS.length - 1)
				break
			case 'Escape':
				event.preventDefault()
				setIsOpen(false)
				setFocusedIndex(-1)
				triggerRef.current?.focus()
				break
			case 'Tab':
				setIsOpen(false)
				setFocusedIndex(-1)
				break
			case 'Enter':
			case ' ':
				event.preventDefault()
				if (focusedIndex >= 0) {
					handleExport(EXPORT_OPTIONS[focusedIndex].format)
				}
				break
		}
	}

	return (
		<div ref={containerRef} className="relative inline-block">
			<Button
				ref={triggerRef}
				variant="outline"
				size="sm"
				onClick={toggleDropdown}
				onKeyDown={handleKeyDown}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-label="Export report"
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				Export
			</Button>

			{isOpen && (
				<div
					role="listbox"
					aria-label="Export format options"
					className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
					onKeyDown={handleKeyDown}
				>
					{EXPORT_OPTIONS.map((option, index) => {
						const Icon = option.icon
						const isFocused = focusedIndex === index

						return (
							<button
								key={option.format}
								ref={el => {
									itemRefs.current[index] = el
								}}
								role="option"
								aria-selected={isFocused}
								tabIndex={isFocused ? 0 : -1}
								className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
									isFocused
										? 'bg-blue-50 text-blue-700'
										: 'text-gray-700 hover:bg-gray-50'
								}`}
								onClick={() => handleExport(option.format)}
								onMouseEnter={() => setFocusedIndex(index)}
							>
								<Icon
									className="h-4 w-4 shrink-0"
									aria-hidden="true"
								/>
								{option.label}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
