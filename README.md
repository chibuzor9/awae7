This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Configure your environment variables:
    - **Database**: Add your `DATABASE_URL` for PostgreSQL
    - **Supabase**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - **Email**: Choose and configure an email service provider (see Email Configuration below)
    - **Site URL**: Set `NEXT_PUBLIC_SITE_URL` to your application URL

3. Generate Prisma client and push schema to database:

```bash
npx prisma generate
npx prisma db push
```

## Email Configuration

AWAE7 uses a **dual email system** for optimal user experience:

### Supabase Auth Emails (No Setup Required)

Authentication emails are handled by Supabase automatically:

- ✅ Signup confirmation
- ✅ Password reset
- ✅ Magic link login
- ✅ Email change verification
- ✅ User invitations
- ✅ Reauthentication/OTP

**To customize**: Copy templates from `/supabase-email-templates/` into Supabase Dashboard → Authentication → Email Templates

See `/supabase-email-templates/ARCHITECTURE.md` for full details.

### Custom SMTP (Optional - For Marketing Emails)

For non-auth emails (welcome messages, newsletters), configure custom SMTP:

**1. Choose an Email Service Provider**

**Recommended: Resend** (simplest setup)

```bash
npm install resend
```

Add to `.env.local`:

```
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="AWAE7 <hello@yourdomain.com>"
```

**2. Implement Email Sending**

Update `src/lib/email/index.ts` to use your chosen provider. Example with Resend:

```typescript
import { Resend } from 'resend'

export async function sendEmail(options: EmailOptions): Promise<void> {
	const resend = new Resend(process.env.RESEND_API_KEY)

	await resend.emails.send({
		from: process.env.EMAIL_FROM!,
		to: options.to,
		subject: options.subject,
		html: options.html,
	})
}
```

**3. Send Marketing Emails**

Use the welcome email after user completes signup:

```typescript
import { sendWelcomeEmail } from '@/lib/email'

// After Supabase confirms user's email
await sendWelcomeEmail({
	username: user.name,
	email: user.email,
	siteUrl: 'https://awae7.com',
})
```

Add more templates in `/src/lib/email/templates/` for newsletters, tips, etc.

## Architecture Benefits

**Why separate auth from marketing emails?**

- 🔒 Auth emails always work (no SMTP issues blocking signups)
- ⚡ Faster onboarding (Supabase handles auth instantly)
- 🎯 Better deliverability (auth through Supabase, marketing through dedicated SMTP)
- 🛠️ Easy customization (update Supabase templates without code deployment)

## Supabase Auth Email Customization

To replace default Supabase emails with custom templates:

1. In Supabase Dashboard, go to **Authentication → Email Templates**
2. Disable built-in email templates
3. Use the provided templates in this project instead

The custom templates provide:

- Professional branding matching AWAE7
- Responsive design for all devices
- Clear call-to-action buttons
- Accessibility-friendly markup

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project uses [axe-core](https://github.com/dequelabs/axe-core), which is licensed under the Mozilla Public License 2.0 (MPL-2.0).
