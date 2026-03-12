# AWAE7

AWAE7 is a Next.js 16 web accessibility evaluation platform that analyzes pages against WCAG 2.2 and generates audience-specific reports for:

- Developers
- Designers
- Auditors
- End users

The app uses `axe-core` for automated accessibility analysis, Supabase for authentication, and Prisma + PostgreSQL for persistence.

## Core Features

- URL and HTML file accessibility evaluation
- Optional multi-page crawl mode for site-wide checks
- Role-specific report views with tailored detail depth
- WCAG card deck for accessibility learning and remediation guidance
- Export support (CSV, JSON, PDF)

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Supabase Auth (`@supabase/ssr`)
- Prisma with PostgreSQL
- axe-core + Playwright

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database
- Supabase project (URL + anon key)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root and set required values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
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
- `src/lib/supabase`: browser/server/middleware Supabase clients
- `prisma/schema.prisma`: database schema

## Environment Variables

Required today:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional (only if you implement SMTP provider integration in `src/lib/email/index.ts`):

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SENDGRID_API_KEY`

## Email Architecture

AWAE7 uses a dual approach:

- Supabase handles authentication emails (confirmation, password reset, magic links, OTP).
- Application SMTP integration handles non-auth emails such as welcome or engagement messaging.

The SMTP implementation is intentionally a placeholder in `src/lib/email/index.ts`. In development, it logs outgoing email payload details; in production, it throws until a provider is wired.

Email templates currently live in `src/lib/email/templates`.

## Notes

- Accessibility crawling uses Playwright and Chromium headless shell.
- The `postinstall` script runs Prisma generation and installs Playwright browser binaries outside Vercel environments.

## License

This project is licensed under the MIT License. See `LICENSE`.

This project uses [axe-core](https://github.com/dequelabs/axe-core), licensed under MPL-2.0.
