import Link from 'next/link'

export default function WelcomeBackPage() {
	return (
		<div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
			<div className="w-full rounded-xl border border-(--border) bg-white p-8 text-center shadow-lg">
				<h1 className="text-3xl font-semibold text-slate-900">
					Welcome to the new AWAE
				</h1>
				<p className="mt-4 text-slate-600">
					AWAE has moved from Supabase to Neon for a more reliable database
					foundation and improved uptime. Your account and evaluation history
					are still here, and your sign-in has been securely reconnected.
				</p>
				<div className="mt-6 rounded-lg bg-blue-50 p-4 text-left text-sm text-slate-700">
					<p className="font-semibold text-slate-900">What this means for you</p>
					<ul className="mt-2 list-disc space-y-1 pl-5">
						<li>Your existing account and evaluation history are preserved.</li>
						<li>Your AWAE sign-in now uses Neon Auth.</li>
						<li>You can continue using AWAE as usual.</li>
					</ul>
				</div>
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
