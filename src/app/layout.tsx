import type { Metadata } from 'next'
import { Instrument_Sans, Syne, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

const instrumentSans = Instrument_Sans({
	variable: '--font-instrument-sans',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
})

const syne = Syne({
	variable: '--font-syne',
	subsets: ['latin'],
	weight: ['400', '600', '700', '800'],
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
				className={`${instrumentSans.variable} ${syne.variable} ${geistMono.variable} antialiased`}
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
