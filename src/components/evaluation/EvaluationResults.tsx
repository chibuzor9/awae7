'use client'

import { useEffect, useState } from 'react'
import {
	AlertTriangle,
	CheckCircle2,
	ClipboardCheck,
	Code2,
	FileText,
	User,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import DeveloperReport from '@/components/evaluation/DeveloperReport'
import AuditorReport from '@/components/evaluation/AuditorReport'
import EndUserReport from '@/components/evaluation/EndUserReport'
import { ExportButton } from '@/components/export/ExportButton'
import type {
	DeveloperReport as DeveloperReportType,
	AuditorReport as AuditorReportType,
	EndUserReport as EndUserReportType,
} from '@/types'

export interface EvaluationResultsProps {
	developerReport: DeveloperReportType
	auditorReport: AuditorReportType
	endUserReport: EndUserReportType
	onWcagCardClick?: (criterionNumber: string) => void
	defaultTab?: 'developer' | 'auditor' | 'end-user'
}

export default function EvaluationResults({
	developerReport,
	auditorReport,
	endUserReport,
	onWcagCardClick,
	defaultTab = 'end-user',
}: EvaluationResultsProps) {
	const [activeTab, setActiveTab] = useState<
		'developer' | 'auditor' | 'end-user'
	>(defaultTab)

	const summary = developerReport.summary

	const topPrinciple = Object.entries(
		developerReport.violations.reduce<Record<string, number>>(
			(acc, item) => {
				acc[item.wcagPrinciple] =
					(acc[item.wcagPrinciple] ?? 0) + item.elements.length
				return acc
			},
			{}
		)
	).sort((a, b) => b[1] - a[1])[0]

	useEffect(() => {
		setActiveTab(defaultTab)
	}, [defaultTab])

	return (
		<Tabs
			defaultValue={defaultTab}
			key={defaultTab}
			onValueChange={v =>
				setActiveTab(v as 'developer' | 'auditor' | 'end-user')
			}
			className="w-full"
		>
			<div className="mb-4 rounded-2xl border border-(--border) bg-white p-5 shadow-sm">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-(--muted-text)">
							Results Overview
						</p>
						<h2 className="mt-1 text-lg font-semibold text-(--text)">
							Accessibility evaluation snapshot
						</h2>
					</div>
					<p className="text-sm text-(--muted-text)">
						Target:{' '}
						<span className="font-medium text-(--text)">
							{summary.targetUrl}
						</span>
					</p>
				</div>

				<div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
					<div className="rounded-xl border border-(--border) bg-(--surface) p-3">
						<p className="text-xs text-(--muted-text)">
							Overall score
						</p>
						<p className="mt-1 text-xl font-bold text-(--text)">
							{summary.overallScore}/100
						</p>
					</div>
					<div className="rounded-xl border border-(--border) bg-(--surface) p-3">
						<p className="text-xs text-(--muted-text)">
							Violations
						</p>
						<p className="mt-1 text-xl font-bold text-red-600">
							{summary.totalViolations}
						</p>
					</div>
					<div className="rounded-xl border border-(--border) bg-(--surface) p-3">
						<p className="text-xs text-(--muted-text)">
							Needs review
						</p>
						<p className="mt-1 text-xl font-bold text-amber-600">
							{summary.totalIncomplete}
						</p>
					</div>
					<div className="rounded-xl border border-(--border) bg-(--surface) p-3">
						<p className="text-xs text-(--muted-text)">
							Checks passed
						</p>
						<p className="mt-1 text-xl font-bold text-emerald-600">
							{summary.totalPasses}
						</p>
					</div>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
					<div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-(--text)">
						<AlertTriangle
							className="h-4 w-4 text-red-500"
							aria-hidden="true"
						/>
						<span>
							Most impacted principle:{' '}
							<span className="font-semibold">
								{topPrinciple?.[0] ?? 'N/A'}
							</span>
						</span>
					</div>
					<div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-(--text)">
						<ClipboardCheck
							className="h-4 w-4 text-amber-500"
							aria-hidden="true"
						/>
						<span>
							Manual review items:{' '}
							<span className="font-semibold">
								{auditorReport.incompleteItems.length}
							</span>
						</span>
					</div>
					<div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-(--text)">
						<CheckCircle2
							className="h-4 w-4 text-emerald-500"
							aria-hidden="true"
						/>
						<span>
							Inapplicable criteria:{' '}
							<span className="font-semibold">
								{auditorReport.inapplicableRules.length}
							</span>
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-4">
				<TabsList className="mb-2">
					<TabsTrigger value="end-user">
						<span className="inline-flex items-center gap-1.5">
							<User className="h-4 w-4" aria-hidden="true" />
							End User
						</span>
					</TabsTrigger>

					<TabsTrigger value="developer">
						<span className="inline-flex items-center gap-1.5">
							<Code2 className="h-4 w-4" aria-hidden="true" />
							Developer
						</span>
					</TabsTrigger>

					<TabsTrigger value="auditor">
						<span className="inline-flex items-center gap-1.5">
							<FileText className="h-4 w-4" aria-hidden="true" />
							Auditor
						</span>
					</TabsTrigger>
				</TabsList>

				<ExportButton
					developerReport={developerReport}
					auditorReport={auditorReport}
					endUserReport={endUserReport}
					activeTab={activeTab}
				/>
			</div>

			<TabsContent value="end-user">
				<EndUserReport report={endUserReport} />
			</TabsContent>

			<TabsContent value="developer">
				<DeveloperReport
					report={developerReport}
					onWcagCardClick={onWcagCardClick}
				/>
			</TabsContent>

			<TabsContent value="auditor">
				<AuditorReport report={auditorReport} />
			</TabsContent>
		</Tabs>
	)
}
