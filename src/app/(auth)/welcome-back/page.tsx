import Link from 'next/link'

export default function WelcomeBackPage() {
	return (
		<div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
			<div className="w-full rounded-xl border border-(--border) bg-white p-8 text-center shadow-lg">
				<h1 className="text-3xl font-semibold text-slate-900">
					Welcome back
				</h1>
				<p className="mt-4 text-slate-600">
					AWAE has moved to Neon. Your account and evaluation history are
					still here, and your sign-in has been securely reconnected.
				</p>
				<Link
					href="/evaluate"
					className="mt-7 inline-block rounded-lg bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white"
				>
					Continue to AWAE
				</Link>
			</div>
		</div>
	)
}
