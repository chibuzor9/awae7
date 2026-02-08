import Handlebars from 'handlebars'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface EmailOptions {
	to: string
	subject: string
	html: string
	text?: string
}

export interface WelcomeEmailData {
	username: string
	email: string
	siteUrl: string
}

/**
 * Load and compile a Handlebars template
 */
function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
	// Use path relative to source file for better bundling compatibility
	const templatePath = join(__dirname, 'templates', `${templateName}.hbs`)
	const templateContent = readFileSync(templatePath, 'utf-8')
	return Handlebars.compile(templateContent)
}

/**
 * Generate welcome email HTML (sent after Supabase confirms user email)
 */
export function generateWelcomeEmail(data: WelcomeEmailData): string {
	const template = loadTemplate('welcome')
	return template(data)
}

/**
 * Send email using configured email service
 * This is a placeholder - you'll need to implement based on your email service
 * (e.g., SendGrid, AWS SES, Resend, etc.)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
	// Check if we're in development mode
	if (process.env.NODE_ENV === 'development') {
		console.log('📧 Email would be sent in production:')
		console.log('To:', options.to)
		console.log('Subject:', options.subject)
		console.log('HTML length:', options.html.length)
		return
	}

	// TODO: Implement actual email sending
	// Example with Resend:
	// const resend = new Resend(process.env.RESEND_API_KEY);
	// await resend.emails.send({
	//   from: process.env.EMAIL_FROM!,
	//   to: options.to,
	//   subject: options.subject,
	//   html: options.html,
	// });

	// Example with SendGrid:
	// const sgMail = require('@sendgrid/mail');
	// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	// await sgMail.send({
	//   to: options.to,
	//   from: process.env.EMAIL_FROM,
	//   subject: options.subject,
	//   html: options.html,
	// });

	throw new Error(
		'Email sending not configured. Please set up an email service provider by:\n' +
			'1. Installing an email library (e.g., npm install resend)\n' +
			'2. Setting environment variables (RESEND_API_KEY, EMAIL_FROM, etc.)\n' +
			'3. Implementing the sendEmail function in src/lib/email/index.ts\n' +
			'See README.md for detailed setup instructions.'
	)
}

/**
 * Send welcome email to new user (after Supabase email confirmation)
 * This is sent via custom SMTP, not Supabase
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
	const html = generateWelcomeEmail(data)

	await sendEmail({
		to: data.email,
		subject: "Welcome to AWAE7 - Let's Get Started! 🎉",
		html,
	})
}
