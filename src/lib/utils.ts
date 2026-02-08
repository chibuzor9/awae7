import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs)
}

export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function getScoreLabel(score: number): {
	label: string
	color: string
} {
	if (score >= 90) return { label: 'Excellent', color: '#22c55e' }
	if (score >= 70) return { label: 'Good', color: '#84cc16' }
	if (score >= 50) return { label: 'Needs Improvement', color: '#f59e0b' }
	if (score >= 30) return { label: 'Poor', color: '#f97316' }
	return { label: 'Critical', color: '#ef4444' }
}

export function getSeverityColor(severity: string): string {
	switch (severity) {
		case 'critical':
			return '#ef4444'
		case 'serious':
			return '#f97316'
		case 'moderate':
			return '#f59e0b'
		case 'minor':
			return '#3b82f6'
		default:
			return '#6b7280'
	}
}

export function isValidUrl(url: string): boolean {
	try {
		const parsed = new URL(url)
		return parsed.protocol === 'http:' || parsed.protocol === 'https:'
	} catch {
		return false
	}
}
