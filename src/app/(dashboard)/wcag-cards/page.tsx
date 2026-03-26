import WcagCardDeck from '@/components/wcag/WcagCardDeck'
import { Badge } from '@/components/ui/Badge'
import { Wcag } from '@/components/ui/Wcag'

export const metadata = {
	title: 'WCAG 2.2 Card Deck - AWAE',
	description: 'Browse and learn about WCAG 2.2 success criteria',
}

export default function WcagCardsPage() {
	return (
		<div className="min-h-full bg-transparent">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<header className="relative mb-8 text-center">
					<div className="absolute right-0 top-0 hidden sm:block">
						<Badge
							variant="info"
							className="gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium"
						>
							<span>Deck by Johannes Lehner</span>
							<a
								href="https://www.figma.com/design/WxpgDugpnb0FmvZB02irF9/WCAG-2.2-Card-Deck--Community-?node-id=301-301450&t=9RIqCG0ieWZFxn0m-0"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-2 hover:text-blue-900"
							>
								Figma
							</a>
							<span aria-hidden="true">·</span>
							<a
								href="https://github.com/johanneslehner/wcag2.2-card-deck"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-2 hover:text-blue-900"
							>
								GitHub
							</a>
						</Badge>
					</div>
					<h1 className="text-3xl font-semibold text-slate-900">
						<Wcag /> 2.2 Card Deck
					</h1>
					<p className="mt-2 text-slate-600">
						Browse all <Wcag /> 2.2 Level A, AA and AAA success criteria
						as interactive cards
					</p>
					<div className="mt-3 sm:hidden">
						<Badge
							variant="info"
							className="gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium"
						>
							<span>Deck by Johannes Lehner</span>
							<a
								href="https://www.figma.com/design/WxpgDugpnb0FmvZB02irF9/WCAG-2.2-Card-Deck--Community-?node-id=301-301450&t=9RIqCG0ieWZFxn0m-0"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-2 hover:text-blue-900"
							>
								Figma
							</a>
							<span aria-hidden="true">·</span>
							<a
								href="https://github.com/johanneslehner/wcag2.2-card-deck"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-2 hover:text-blue-900"
							>
								GitHub
							</a>
						</Badge>
					</div>
				</header>
				<WcagCardDeck />
			</div>
		</div>
	)
}
