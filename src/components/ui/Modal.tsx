'use client'

import {
	useEffect,
	useCallback,
	useRef,
	type ReactNode,
	type HTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
	open: boolean
	onClose: () => void
	title?: string
	children: ReactNode
}

export function Modal({
	open,
	onClose,
	title,
	className,
	children,
	...props
}: ModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null)
	const previousFocusRef = useRef<HTMLElement | null>(null)

	/* trap focus & handle Escape */
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
				return
			}

			if (e.key === 'Tab' && dialogRef.current) {
				const focusable =
					dialogRef.current.querySelectorAll<HTMLElement>(
						'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
					)
				if (focusable.length === 0) return

				const first = focusable[0]
				const last = focusable[focusable.length - 1]

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault()
					last.focus()
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault()
					first.focus()
				}
			}
		},
		[onClose]
	)

	useEffect(() => {
		if (open) {
			previousFocusRef.current = document.activeElement as HTMLElement
			document.addEventListener('keydown', handleKeyDown)
			document.body.style.overflow = 'hidden'

			/* move focus into modal */
			requestAnimationFrame(() => {
				dialogRef.current?.focus()
			})

			return () => {
				document.removeEventListener('keydown', handleKeyDown)
				document.body.style.overflow = ''
				previousFocusRef.current?.focus()
			}
		}
	}, [open, handleKeyDown])

	if (!open) return null

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			role="presentation"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50"
				aria-hidden="true"
				onClick={onClose}
			/>

			{/* Dialog */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label={title || 'Dialog'}
				tabIndex={-1}
				className={cn(
					'relative z-10 mx-4 w-full max-w-lg rounded-xl bg-white shadow-xl focus:outline-none',
					className
				)}
				{...props}
			>
				{/* Header */}
				{title != null && (
					<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
						<h2 className="text-lg font-semibold text-gray-900">
							{title}
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
							aria-label="Close dialog"
						>
							<X className="h-5 w-5" aria-hidden="true" />
						</button>
					</div>
				)}

				{/* Close button when no title */}
				{title == null && (
					<button
						type="button"
						onClick={onClose}
						className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						aria-label="Close dialog"
					>
						<X className="h-5 w-5" aria-hidden="true" />
					</button>
				)}

				{/* Body */}
				<div className="px-6 py-4">{children}</div>
			</div>
		</div>,
		document.body
	)
}
