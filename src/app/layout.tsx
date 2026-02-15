import type { Metadata } from 'next'
import { Atkinson_Hyperlegible, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
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
	description:
		'Evaluate your website against WCAG accessibility guidelines. Identify issues, get actionable recommendations, and improve web accessibility.',
	icons: {
		icon: '/vercel.svg',
		shortcut: '/vercel.svg',
		apple: '/vercel.svg',
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
				<Navbar />
				<main className="min-h-[calc(100dvh-4rem)]">{children}</main>
				<Toaster position="bottom-right" />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	)
}
