'use client'

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	type ReactNode,
	type HTMLAttributes,
	type KeyboardEvent,
} from 'react'
import { cn } from '@/lib/utils'

/* ---- Context ---- */

interface TabsContextValue {
	activeTab: string
	setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
	const ctx = useContext(TabsContext)
	if (!ctx) {
		throw new Error('Tabs compound components must be used within <Tabs>')
	}
	return ctx
}

/* ---- Root ---- */

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
	defaultValue: string
	onValueChange?: (value: string) => void
	children: ReactNode
}

export function Tabs({
	defaultValue,
	onValueChange,
	className,
	children,
	...props
}: TabsProps) {
	const [activeTab, setActiveTabInternal] = useState(defaultValue)

	const setActiveTab = useCallback(
		(value: string) => {
			setActiveTabInternal(value)
			onValueChange?.(value)
		},
		[onValueChange]
	)

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab }}>
			<div className={cn('flex flex-col', className)} {...props}>
				{children}
			</div>
		</TabsContext.Provider>
	)
}

/* ---- TabsList ---- */

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export function TabsList({ className, children, ...props }: TabsListProps) {
	const listRef = useRef<HTMLDivElement>(null)

	const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
		const list = listRef.current
		if (!list) return

		const triggers = Array.from(
			list.querySelectorAll<HTMLButtonElement>('[role="tab"]')
		)
		const currentIndex = triggers.findIndex(
			t => t === document.activeElement
		)
		if (currentIndex === -1) return

		let nextIndex: number | null = null

		if (e.key === 'ArrowRight') {
			nextIndex = (currentIndex + 1) % triggers.length
		} else if (e.key === 'ArrowLeft') {
			nextIndex = (currentIndex - 1 + triggers.length) % triggers.length
		} else if (e.key === 'Home') {
			nextIndex = 0
		} else if (e.key === 'End') {
			nextIndex = triggers.length - 1
		}

		if (nextIndex !== null) {
			e.preventDefault()
			triggers[nextIndex].focus()
			triggers[nextIndex].click()
		}
	}, [])

	return (
		<div
			ref={listRef}
			role="tablist"
			aria-label="Report tabs"
			className={cn('flex gap-1 border-b border-gray-200', className)}
			onKeyDown={handleKeyDown}
			{...props}
		>
			{children}
		</div>
	)
}

/* ---- TabsTrigger ---- */

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
	value: string
	children: ReactNode
}

export function TabsTrigger({
	value,
	className,
	children,
	...props
}: TabsTriggerProps) {
	const { activeTab, setActiveTab } = useTabsContext()
	const isActive = activeTab === value

	return (
		<button
			type="button"
			role="tab"
			id={`tab-${value}`}
			aria-selected={isActive}
			aria-controls={`tabpanel-${value}`}
			tabIndex={isActive ? 0 : -1}
			data-tab={value}
			className={cn(
				'rounded-t-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1',
				isActive
					? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700'
					: 'text-gray-600 hover:bg-blue-50 hover:text-blue-700',
				className
			)}
			onClick={() => setActiveTab(value)}
			{...props}
		>
			{children}
		</button>
	)
}

/* ---- TabsContent ---- */

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
	value: string
	children: ReactNode
}

export function TabsContent({
	value,
	className,
	children,
	...props
}: TabsContentProps) {
	const { activeTab } = useTabsContext()

	if (activeTab !== value) return null

	return (
		<div
			id={`tabpanel-${value}`}
			role="tabpanel"
			aria-labelledby={`tab-${value}`}
			data-tabpanel={value}
			className={cn('py-3 focus-visible:outline-none', className)}
			{...props}
		>
			{children}
		</div>
	)
}
