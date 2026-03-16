'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SectionDropdownProps {
	title: string
	description?: string
	/** Optional icon element shown before the title */
	icon?: React.ReactNode
	/** Badge or count shown on the right side, before the chevron */
	trailing?: React.ReactNode
	children: React.ReactNode
	defaultOpen?: boolean
	className?: string
}

/**
 * Consistent expandable section used across all report tabs.
 * Uses the native `<details>` element for built-in accessibility
 * (works without JS, keyboard navigable, semantically correct).
 */
export function SectionDropdown({
	title,
	description,
	icon,
	trailing,
	children,
	defaultOpen = false,
	className,
}: SectionDropdownProps) {
	return (
		<details
			open={defaultOpen}
			className={cn(
				'group overflow-hidden rounded-xl border border-gray-200 bg-white',
				className
			)}
		>
			<summary className="cursor-pointer list-none px-4 py-2.5">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2 min-w-0">
						{icon}
						<div>
							<p className="text-sm font-semibold text-gray-900">
								{title}
							</p>
							{description && (
								<p className="text-xs text-gray-500 mt-0.5">
									{description}
								</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						{trailing}
						<ChevronDown
							className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
							aria-hidden="true"
						/>
					</div>
				</div>
			</summary>
			<div className="border-t border-gray-100">{children}</div>
		</details>
	)
}
