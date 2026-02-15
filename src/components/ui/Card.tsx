import { type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				'rounded-xl border border-(--border) bg-white shadow-sm',
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
			className={cn('border-b border-(--border) px-5 py-3.5', className)}
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
			className={cn('border-t border-(--border) px-5 py-3.5', className)}
			{...props}
		>
			{children}
		</div>
	)
}
