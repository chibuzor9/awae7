import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Privacy Policy - AWAE',
	description: 'Privacy Policy for AWAE Web Accessibility Evaluator',
}

export default function PrivacyPolicyPage() {
	return (
		<article className="container mx-auto px-4 py-12 max-w-4xl">
			<h1 tabIndex={0} className="text-4xl font-bold mb-8">Privacy Policy</h1>
			<p tabIndex={0} className="text-gray-600 mb-8">Last Updated: March 7, 2026</p>

			<div className="prose prose-lg max-w-none space-y-6">
				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						1. Introduction
					</h2>
					<p tabIndex={0} className="mb-4">
						Welcome to AWAE (Web Accessibility Evaluator). We are
						committed to protecting your privacy and ensuring the
						security of your personal information. This Privacy
						Policy explains how we collect, use, disclose, and
						safeguard your information when you use our web
						accessibility evaluation service.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						2. Information We Collect
					</h2>
					<h3 tabIndex={0} className="text-xl font-semibold mb-3">
						2.1 Personal Information
					</h3>
					<p tabIndex={0} className="mb-4">
						When you create an account, we collect:
					</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>Email address</li>
						<li tabIndex={0}>Name (if provided)</li>
						<li tabIndex={0}>Authentication credentials</li>
					</ul>

					<h3 tabIndex={0} className="text-xl font-semibold mb-3">
						2.2 Usage Data
					</h3>
					<p tabIndex={0} className="mb-4">
						We automatically collect certain information when you
						use our service:
					</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>URLs of websites you evaluate</li>
						<li tabIndex={0}>Accessibility evaluation results</li>
						<li tabIndex={0}>Browser type and version</li>
						<li tabIndex={0}>Device information</li>
						<li tabIndex={0}>IP address</li>
						<li tabIndex={0}>Usage patterns and preferences</li>
					</ul>

					<h3 tabIndex={0} className="text-xl font-semibold mb-3">
						2.3 Cookies and Tracking
					</h3>
					<p tabIndex={0} className="mb-4">
						We use cookies and similar tracking technologies to
						enhance your experience, analyze usage patterns, and
						improve our service.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						3. How We Use Your Information
					</h2>
					<p tabIndex={0} className="mb-4">We use the collected information to:</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>
							Provide and maintain our accessibility evaluation
							service
						</li>
						<li tabIndex={0}>Process and store your evaluation results</li>
						<li tabIndex={0}>
							Send you service-related notifications and updates
						</li>
						<li tabIndex={0}>Improve and optimize our service</li>
						<li tabIndex={0}>Analyze usage patterns and trends</li>
						<li tabIndex={0}>Detect and prevent fraud or abuse</li>
						<li tabIndex={0}>Comply with legal obligations</li>
					</ul>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						4. Data Sharing and Disclosure
					</h2>
					<p tabIndex={0} className="mb-4">
						We do not sell your personal information. We may share
						your information only in the following circumstances:
					</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>
							<strong>Service Providers:</strong> With third-party
							service providers who assist in operating our
							service (e.g., hosting, analytics, authentication)
						</li>
						<li tabIndex={0}>
							<strong>Legal Requirements:</strong> When required
							by law or to protect our rights, safety, or property
						</li>
						<li tabIndex={0}>
							<strong>Business Transfers:</strong> In connection
							with a merger, acquisition, or sale of assets
						</li>
						<li tabIndex={0}>
							<strong>With Your Consent:</strong> When you
							explicitly consent to sharing your information
						</li>
					</ul>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						5. Data Security
					</h2>
					<p tabIndex={0} className="mb-4">
						We implement appropriate technical and organizational
						measures to protect your personal information against
						unauthorized access, alteration, disclosure, or
						destruction. These measures include:
					</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>Encryption of data in transit and at rest</li>
						<li tabIndex={0}>Secure authentication mechanisms</li>
						<li tabIndex={0}>Regular security assessments</li>
						<li tabIndex={0}>Access controls and monitoring</li>
					</ul>
					<p tabIndex={0} className="mb-4">
						However, no method of transmission over the internet or
						electronic storage is 100% secure. While we strive to
						protect your personal information, we cannot guarantee
						absolute security.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						6. Data Retention
					</h2>
					<p tabIndex={0} className="mb-4">
						We retain your personal information for as long as
						necessary to provide our service and fulfill the
						purposes outlined in this Privacy Policy. Evaluation
						results are stored indefinitely unless you request
						deletion. You can delete individual evaluations or your
						entire account at any time.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						7. Your Rights
					</h2>
					<p tabIndex={0} className="mb-4">You have the right to:</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>Access your personal information</li>
						<li tabIndex={0}>Correct inaccurate or incomplete information</li>
						<li tabIndex={0}>Request deletion of your personal information</li>
						<li tabIndex={0}>
							Object to or restrict processing of your information
						</li>
						<li tabIndex={0}>Export your data in a portable format</li>
						<li tabIndex={0}>Withdraw consent at any time</li>
					</ul>
					<p tabIndex={0} className="mb-4">
						To exercise these rights, please contact us using the
						information provided below.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						8. Third-Party Services
					</h2>
					<p tabIndex={0} className="mb-4">
						Our service uses third-party services for authentication
						(Supabase), analytics (Vercel Analytics), and hosting.
						These services have their own privacy policies, and we
						encourage you to review them:
					</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>
							<a
								href="https://supabase.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
								className="text-indigo-600 hover:text-indigo-800 underline"
							>
								Supabase Privacy Policy
							</a>
						</li>
						<li tabIndex={0}>
							<a
								href="https://vercel.com/legal/privacy-policy"
								target="_blank"
								rel="noopener noreferrer"
								className="text-indigo-600 hover:text-indigo-800 underline"
							>
								Vercel Privacy Policy
							</a>
						</li>
					</ul>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						9. Children&apos;s Privacy
					</h2>
					<p tabIndex={0} className="mb-4">
						Our service is not intended for children under the age
						of 13. We do not knowingly collect personal information
						from children under 13. If you believe we have collected
						information from a child under 13, please contact us
						immediately.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						10. International Data Transfers
					</h2>
					<p tabIndex={0} className="mb-4">
						Your information may be transferred to and processed in
						countries other than your country of residence. These
						countries may have different data protection laws. We
						ensure appropriate safeguards are in place to protect
						your information in accordance with this Privacy Policy.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						11. Changes to This Privacy Policy
					</h2>
					<p tabIndex={0} className="mb-4">
						We may update this Privacy Policy from time to time. We
						will notify you of any material changes by posting the
						new Privacy Policy on this page and updating the &quot;Last
						Updated&quot; date. Your continued use of our service after
						any changes constitutes acceptance of the updated
						Privacy Policy.
					</p>
				</section>

				<section>
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						12. Contact Us
					</h2>
					<p tabIndex={0} className="mb-4">
						If you have any questions, concerns, or requests
						regarding this Privacy Policy or our data practices,
						please contact us at:
					</p>
					<div className="bg-gray-50 p-4 rounded-lg">
						<p tabIndex={0} className="mb-2">
							<strong>Email:</strong> privacy@awae.app
						</p>
						<p tabIndex={0} className="mb-2">
							<strong>Repository:</strong>{' '}
							<a
								href="https://github.com/chibuzor9/awae7"
								target="_blank"
								rel="noopener noreferrer"
								className="text-indigo-600 hover:text-indigo-800 underline"
							>
								github.com/chibuzor9/awae7
							</a>
						</p>
					</div>
				</section>

				<section className="mt-8 pt-8 border-t">
					<h2 tabIndex={0} className="text-2xl font-semibold mb-4">
						13. GDPR Compliance
					</h2>
					<p tabIndex={0} className="mb-4">
						For users in the European Economic Area (EEA), we comply
						with the General Data Protection Regulation (GDPR). Our
						legal basis for processing your personal information
						includes:
					</p>
					<ul className="list-disc pl-6 mb-4">
						<li tabIndex={0}>
							<strong>Consent:</strong> You have given explicit
							consent for processing your personal information
						</li>
						<li tabIndex={0}>
							<strong>Contract:</strong> Processing is necessary
							to provide our service
						</li>
						<li tabIndex={0}>
							<strong>Legal Obligation:</strong> Processing is
							required to comply with legal obligations
						</li>
						<li tabIndex={0}>
							<strong>Legitimate Interest:</strong> Processing is
							necessary for our legitimate business interests
						</li>
					</ul>
				</section>
			</div>
		</article>
	)
}
