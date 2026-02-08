import type { DeveloperReport, AuditorReport, EndUserReport } from '@/types'

type ReportType = 'developer' | 'auditor' | 'end-user'

function getDateString(): string {
	return new Date().toISOString().split('T')[0]
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

export function exportToJson(
	report: DeveloperReport | AuditorReport | EndUserReport,
	reportType: ReportType
): void {
	const jsonString = JSON.stringify(report, null, 2)
	const blob = new Blob([jsonString], { type: 'application/json' })
	const filename = `awae-${reportType}-report-${getDateString()}.json`
	triggerDownload(blob, filename)
}
