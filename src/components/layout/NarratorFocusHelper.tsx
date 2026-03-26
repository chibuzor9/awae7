'use client'

import { useEffect } from 'react'

/**
 * Automatically adds tabIndex="0" to all semantic text elements
 * (h1-h6, p, li, span, blockquote) inside <main> so that screen readers
 * like Windows Narrator can reach them via Tab key navigation.
 *
 * Uses a MutationObserver to handle dynamically rendered content.
 * Skips elements that are already interactive (buttons, links, inputs)
 * or already have a tabIndex set.
 */

const TEXT_SELECTORS = 'h1, h2, h3, h4, h5, h6, p, li, blockquote'

const INTERACTIVE_TAGS = new Set([
	'A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS', 'SUMMARY',
])

function shouldMakeFocusable(el: HTMLElement): boolean {
	// Skip if already has explicit tabIndex attribute
	if (el.hasAttribute('tabindex')) return false
	// Skip interactive elements
	if (INTERACTIVE_TAGS.has(el.tagName)) return false
	// Skip elements inside interactive parents (e.g. <li> inside a <button>)
	if (el.closest('button, a, [role="button"]')) return false
	// Skip hidden elements
	if (el.getAttribute('aria-hidden') === 'true') return false
	// Skip elements inside a role="group" container (cards handled as single tab stops)
	if (el.closest('[role="group"]')) return false
	// Skip empty elements
	if (!el.textContent?.trim()) return false
	return true
}

function applyTabIndex(root: Element | Document) {
	const elements = root.querySelectorAll<HTMLElement>(TEXT_SELECTORS)
	for (const el of elements) {
		if (shouldMakeFocusable(el)) {
			el.setAttribute('tabindex', '0')
		}
	}
}

export function NarratorFocusHelper() {
	useEffect(() => {
		const main = document.getElementById('main-content')
		if (!main) return

		// Apply to existing content
		applyTabIndex(main)

		// Watch for dynamically added content
		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node instanceof HTMLElement) {
						// Check the node itself
						if (node.matches?.(TEXT_SELECTORS) && shouldMakeFocusable(node)) {
							node.setAttribute('tabindex', '0')
						}
						// Check children
						applyTabIndex(node)
					}
				}
			}
		})

		observer.observe(main, { childList: true, subtree: true })

		return () => observer.disconnect()
	}, [])

	return null
}
