import Link from 'next/link'

export default function NotFound() {
	return (
		<section className="min-h-[calc(100dvh-4rem)] bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-4xl rounded-2xl border border-blue-900/40 bg-slate-900/80 p-8 shadow-2xl backdrop-blur sm:p-10">
				<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
					Error 404
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
					Page lost in the dark web of links
				</h1>
				<p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
					The page you requested could not be found. It may have been
					removed, renamed, or never existed in this route.
				</p>

				<div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-5 sm:grid-cols-3">
					<div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
						<p className="text-xs uppercase tracking-wide text-blue-300">
							Status
						</p>
						<p className="mt-1 text-lg font-semibold text-white">
							404
						</p>
					</div>
					<div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
						<p className="text-xs uppercase tracking-wide text-blue-300">
							Scope
						</p>
						<p className="mt-1 text-sm font-medium text-slate-200">
							Route not available
						</p>
					</div>
					<div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
						<p className="text-xs uppercase tracking-wide text-blue-300">
							Suggestion
						</p>
						<p className="mt-1 text-sm font-medium text-slate-200">
							Return home or evaluate a page
						</p>
					</div>
				</div>

				<div className="mt-8 flex flex-wrap gap-3">
					<Link
						href="/"
						className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
					>
						Back to Home
					</Link>
					<Link
						href="/evaluate"
						className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
					>
						Go to Evaluation
					</Link>
				</div>
			</div>
		</section>
	)
}
