'use client'

import { useEffect, useState } from 'react'
import {
	Code2,
	FileText,
	Palette,
	User,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import DeveloperReport from '@/components/evaluation/DeveloperReport'
import AuditorReport from '@/components/evaluation/AuditorReport'
import EndUserReport from '@/components/evaluation/EndUserReport'
import DesignerReport from '@/components/evaluation/DesignerReport'
import { ExportButton } from '@/components/export/ExportButton'
import { Wcag } from '@/components/ui/Wcag'
import type {
	EvaluationResult,
	DeveloperReport as DeveloperReportType,
	AuditorReport as AuditorReportType,
	EndUserReport as EndUserReportType,
	DesignerReport as DesignerReportType,
} from '@/types'

export interface EvaluationResultsProps {
	evaluation: EvaluationResult
	developerReport: DeveloperReportType
	auditorReport: AuditorReportType
	endUserReport: EndUserReportType
	designerReport: DesignerReportType
	onWcagCardClick?: (criterionNumber: string) => void
	defaultTab?: 'developer' | 'auditor' | 'end-user' | 'designer'
}

export default function EvaluationResults({
	evaluation,
	developerReport,
	auditorReport,
	endUserReport,
	designerReport,
	onWcagCardClick,
	defaultTab = 'end-user',
}: EvaluationResultsProps) {
	const [activeTab, setActiveTab] = useState<
		'developer' | 'auditor' | 'end-user' | 'designer'
	>(defaultTab)

	useEffect(() => {
		setActiveTab(defaultTab)
	}, [defaultTab])

	return (
		<Tabs
			defaultValue={defaultTab}
			key={defaultTab}
			onValueChange={v =>
				setActiveTab(v as 'developer' | 'auditor' | 'end-user' | 'designer')
			}
			className="w-full"
		>
			<p className="mb-3 text-xs font-medium text-gray-500">
				Evaluated against <Wcag /> {evaluation.wcagVersion ?? '2.2'} Level {evaluation.wcagLevel ?? 'AA'}
			</p>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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

					<TabsTrigger value="designer">
						<span className="inline-flex items-center gap-1.5">
							<Palette className="h-4 w-4" aria-hidden="true" />
							Designer
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
					designerReport={designerReport}
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

			<TabsContent value="designer">
				<DesignerReport
					report={designerReport}
					targetUrl={evaluation.targetUrl}
					fullSourceHtml={developerReport.fullSourceHtml}
					pageSources={evaluation.pageSources}
				/>
			</TabsContent>

			<TabsContent value="auditor">
				<AuditorReport report={auditorReport} />
			</TabsContent>
		</Tabs>
	)
}
