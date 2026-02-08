'use client'

import { useState } from 'react'
import { Code2, FileText, User } from 'lucide-react'
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
}

export default function EvaluationResults({
	developerReport,
	auditorReport,
	endUserReport,
	onWcagCardClick,
}: EvaluationResultsProps) {
	const [activeTab, setActiveTab] = useState<
		'developer' | 'auditor' | 'end-user'
	>('end-user')

	return (
		<Tabs
			defaultValue="end-user"
			onValueChange={v =>
				setActiveTab(v as 'developer' | 'auditor' | 'end-user')
			}
			className="w-full"
		>
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
