import type { Metadata } from 'next'
import { Atkinson_Hyperlegible, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { NarratorFocusHelper } from '@/components/layout/NarratorFocusHelper'
import './globals.css'

const atkinsonSans = Atkinson_Hyperlegible({
	variable: '--font-atkinson-sans',
	subsets: ['latin'],
	weight: ['400', '700'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'AWAE - Web Accessibility Evaluator',
	applicationName: 'AWAE',
	description:
		'Evaluate your website against WCAG accessibility guidelines. Identify issues, get actionable recommendations, and improve web accessibility.',
	icons: {
		icon: '/vercel.svg',
		shortcut: '/vercel.svg',
		apple: '/vercel.svg',
	},
	verification: {
		google: '1waib8UJ6JfFZLEZ9sGwTU1sq55daSMHmxjha3H56ic',
	},
	openGraph: {
		title: 'AWAE - Automated Web Accessibility Evaluator',
		description:
			'Evaluate your website against WCAG accessibility guidelines. Identify issues, get actionable recommendations, and improve web accessibility.',
		siteName: 'AWAE',
		type: 'website',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${atkinsonSans.variable} ${geistMono.variable} antialiased bg-[radial-gradient(700px_360px_at_50%_-8%,rgba(99,102,241,0.1),transparent)]`}
				suppressHydrationWarning
			>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
				>
					Skip to main content
				</a>
				<Navbar />
				<main id="main-content" tabIndex={-1} className="min-h-[calc(100dvh-4rem)] outline-none">
					{children}
				</main>
				<NarratorFocusHelper />
				<Toaster position="bottom-right" />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	)
}
