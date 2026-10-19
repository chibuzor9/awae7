# AWAE7

AWAE7 is a Next.js 16 web accessibility evaluation platform that analyzes pages against WCAG 2.2 and generates audience-specific reports for:

- Developers
- Designers
- Auditors
- End users

The app uses `axe-core` for automated accessibility analysis, Neon Auth for authentication, and Prisma + Neon PostgreSQL for persistence.

## Core Features

- URL and HTML file accessibility evaluation
- Optional multi-page crawl mode for site-wide checks
- Role-specific report views with tailored detail depth
- WCAG card deck for accessibility learning and remediation guidance
- Export support (CSV, JSON, PDF)

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Neon Auth (`@neondatabase/auth`)
- Prisma with PostgreSQL
- axe-core + Playwright

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database
- Neon project with Neon Auth enabled

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root and set required values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.client.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

3. Generate Prisma client and apply schema:

```bash
npx prisma generate
npx prisma db push
```

4. Start development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Create production build
- `npm run start`: Run production server
- `npm run lint`: Run ESLint

## Project Structure

- `src/app`: App Router pages and API routes
- `src/components`: UI and report components
- `src/lib/axe`: accessibility evaluation and report transformation
- `src/lib/email`: email template rendering + email sending integration points
- `src/lib/neon-auth.ts`: server-side Neon Auth integration
- `prisma/schema.prisma`: database schema

## Environment Variables

Neon deployments also require:

- `DATABASE_URL_UNPOOLED`
- `NEXT_PUBLIC_NEON_AUTH_URL`
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_COOKIE_SECRET` (at least 32 random characters)

Required today:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional (only if you implement SMTP provider integration in `src/lib/email/index.ts`):

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SENDGRID_API_KEY`

## Email Architecture

For the preview deployment, set the OAuth application callback URLs through
Neon Auth. GitHub should use the Neon-managed callback URL:

`https://ep-soft-bread-zabarv9f.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth/callback/github`

Neon Auth then returns users to the application callback at
`https://awae7-preview.vercel.app/auth/callback`.

AWAE7 uses a dual approach:

- Neon Auth handles authentication emails, password resets, and OAuth callbacks.
- Application SMTP integration handles non-auth emails such as welcome or engagement messaging.

The SMTP implementation is intentionally a placeholder in `src/lib/email/index.ts`. In development, it logs outgoing email payload details; in production, it throws until a provider is wired.

Email templates currently live in `src/lib/email/templates`.

## Notes

- Accessibility crawling uses Playwright and Chromium headless shell.
- The `postinstall` script runs Prisma generation and installs Playwright browser binaries outside Vercel environments.

## License

This project is licensed under the MIT License. See `LICENSE`.

This project uses [axe-core](https://github.com/dequelabs/axe-core), licensed under MPL-2.0.
