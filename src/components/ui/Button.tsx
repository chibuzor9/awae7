'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const variantClasses = {
	primary:
		'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] focus-visible:ring-[var(--accent)] shadow-sm',
	secondary:
		'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-600',
	outline:
		'border border-[var(--border)] bg-white text-slate-700 hover:bg-[var(--accent-soft)] focus-visible:ring-[var(--accent)]',
	ghost: 'bg-transparent text-slate-700 hover:bg-[var(--accent-soft)] focus-visible:ring-[var(--accent)]',
	danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
} as const

const sizeClasses = {
	sm: 'px-3 py-1.5 text-xs',
	md: 'px-4 py-2 text-sm',
	lg: 'px-6 py-2.5 text-base',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof variantClasses
	size?: 'sm' | 'md' | 'lg'
	loading?: boolean
	children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = 'primary',
			size = 'md',
			loading = false,
			disabled,
			className,
			children,
			...props
		},
		ref
	) => {
		const isDisabled = disabled || loading

		return (
			<button
				ref={ref}
				disabled={isDisabled}
				className={cn(
					'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
					variantClasses[variant],
					sizeClasses[size],
					className
				)}
				{...props}
			>
				{loading && (
					<Loader2
						className="h-4 w-4 animate-spin"
						aria-hidden="true"
					/>
				)}
				{children}
			</button>
		)
	}
)

Button.displayName = 'Button'
