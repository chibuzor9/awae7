import type { DeveloperReport, AuditorReport, EndUserReport } from '@/types'

type ReportType = 'developer' | 'auditor' | 'end-user'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateString(): string {
	return new Date().toISOString().split('T')[0]
}

/** Escape a value for CSV: wrap in quotes if it contains commas, quotes, or newlines. */
function escapeCsvValue(value: string): string {
	if (
		value.includes(',') ||
		value.includes('"') ||
		value.includes('\n') ||
		value.includes('\r')
	) {
		return `"${value.replace(/"/g, '""')}"`
	}
	return value
}

function arrayToCsv(headers: string[], rows: string[][]): string {
	const headerLine = headers.map(escapeCsvValue).join(',')
	const dataLines = rows.map(row => row.map(escapeCsvValue).join(','))
	return [headerLine, ...dataLines].join('\r\n')
}

function triggerDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = filename
	document.body.appendChild(anchor)
	anchor.click()
	document.body.removeChild(anchor)
	URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Developer CSV
// ---------------------------------------------------------------------------

function generateDeveloperCsv(report: DeveloperReport): string {
	const headers = [
		'Rule ID',
		'Severity',
		'WCAG Criterion',
		'WCAG Level',
		'WCAG Principle',
		'Description',
		'Selector',
		'Remediation',
	]

	const rows: string[][] = []

	for (const violation of report.violations) {
		if (violation.elements.length === 0) {
			rows.push([
				violation.ruleId,
				violation.severity,
				violation.wcagCriterion,
				violation.wcagLevel,
				violation.wcagPrinciple,
				violation.description,
				'',
				violation.remediation,
			])
		} else {
			for (const element of violation.elements) {
				rows.push([
					violation.ruleId,
					violation.severity,
					violation.wcagCriterion,
					violation.wcagLevel,
					violation.wcagPrinciple,
					violation.description,
					element.selector,
					violation.remediation,
				])
			}
		}
	}

	return arrayToCsv(headers, rows)
}

// ---------------------------------------------------------------------------
// Auditor CSV
// ---------------------------------------------------------------------------

function generateAuditorCsv(report: AuditorReport): string {
	const headers = [
		'Rule ID',
		'Severity',
		'WCAG Criterion',
		'WCAG Level',
		'WCAG Principle',
		'Instance Count',
		'Formal Description',
	]

	const rows = report.violations.map(v => [
		v.ruleId,
		v.severity,
		v.wcagCriterion,
		v.wcagLevel,
		v.wcagPrinciple,
		String(v.instanceCount),
		v.formalDescription,
	])

	return arrayToCsv(headers, rows)
}

// ---------------------------------------------------------------------------
// End-User CSV
// ---------------------------------------------------------------------------

function generateEndUserCsv(report: EndUserReport): string {
	// Section 1: Categories
	const catHeaders = ['Category Name', 'Score', 'Issue Count', 'Description']
	const catRows = report.categories.map(c => [
		c.name,
		String(c.score),
		String(c.issueCount),
		c.description,
	])
	const categoryCsv = arrayToCsv(catHeaders, catRows)

	// Section 2: Priorities
	const priorityHeaders = ['Priority Number', 'Action']
	const priorityRows = report.priorities.map((p, i) => [String(i + 1), p])
	const priorityCsv = arrayToCsv(priorityHeaders, priorityRows)

	return categoryCsv + '\r\n\r\n' + priorityCsv
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function exportToCsv(
	report: DeveloperReport | AuditorReport | EndUserReport,
	reportType: ReportType
): void {
	let csvContent: string

	switch (reportType) {
		case 'developer':
			csvContent = generateDeveloperCsv(report as DeveloperReport)
			break
		case 'auditor':
			csvContent = generateAuditorCsv(report as AuditorReport)
			break
		case 'end-user':
			csvContent = generateEndUserCsv(report as EndUserReport)
			break
	}

	// BOM for proper UTF-8 encoding in Excel
	const BOM = '\uFEFF'
	const blob = new Blob([BOM + csvContent], {
		type: 'text/csv;charset=utf-8;',
	})
	const filename = `awae-${reportType}-report-${getDateString()}.csv`
	triggerDownload(blob, filename)
}
