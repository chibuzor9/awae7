import { type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				'rounded-xl border border-violet-300/20 bg-[#f7f4ff]/95 shadow-[0_8px_30px_rgba(18,15,27,0.18)] backdrop-blur-sm',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
	return (
		<div
			className={cn(
				'border-b border-violet-200/40 px-5 py-3.5',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export function CardBody({ className, children, ...props }: CardBodyProps) {
	return (
		<div className={cn('px-5 py-3.5', className)} {...props}>
			{children}
		</div>
	)
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
	return (
		<div
			className={cn(
				'border-t border-violet-200/40 px-5 py-3.5',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}
