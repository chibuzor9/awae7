import WcagCardDeck from '@/components/wcag/WcagCardDeck'

export const metadata = {
	title: 'WCAG 2.2 Card Deck - AWAE',
	description: 'Browse and learn about WCAG 2.2 success criteria',
}

export default function WcagCardsPage() {
	return (
		<div className="min-h-full bg-transparent">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<header className="mb-8 text-center">
					<h1 className="text-3xl font-semibold text-slate-900">
						WCAG 2.2 Card Deck
					</h1>
					<p className="mt-2 text-slate-600">
						Browse all WCAG 2.2 Level A, AA and AAA success criteria
						as interactive cards
					</p>
				</header>
				<WcagCardDeck />
			</div>
		</div>
	)
}
