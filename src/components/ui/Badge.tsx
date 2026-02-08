import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const variantClasses = {
	default: 'bg-gray-100 text-gray-700',
	success: 'bg-green-100 text-green-800',
	warning: 'bg-amber-100 text-amber-800',
	error: 'bg-red-100 text-red-800',
	info: 'bg-blue-100 text-blue-800',
} as const

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: keyof typeof variantClasses
	children: ReactNode
}

export function Badge({
	variant = 'default',
	className,
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
				variantClasses[variant],
				className
			)}
			{...props}
		>
			{children}
		</span>
	)
}
