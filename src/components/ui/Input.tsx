'use client'

import {
	forwardRef,
	useId,
	type InputHTMLAttributes,
	type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'size'
> {
	label?: string
	error?: string
	icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, icon, className, id, ...props }, ref) => {
		const generatedId = useId()
		const inputId = id ?? generatedId
		const errorId = error ? `${inputId}-error` : undefined

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="text-sm font-medium text-slate-700"
					>
						{label}
					</label>
				)}

				<div className="relative">
					{icon && (
						<span
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							aria-hidden="true"
						>
							{icon}
						</span>
					)}

					<input
						ref={ref}
						id={inputId}
						aria-describedby={errorId}
						className={cn(
							'w-full rounded-lg border border-violet-300/30 bg-[#f8f5ff] px-3 py-2 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
							icon && 'pl-10',
							error ? 'border-red-500 focus:ring-red-500' : '',
							className
						)}
						{...props}
					/>
				</div>

				{error && (
					<p
						id={errorId}
						className="text-sm text-red-600"
						role="alert"
					>
						{error}
					</p>
				)}
			</div>
		)
	}
)

Input.displayName = 'Input'
