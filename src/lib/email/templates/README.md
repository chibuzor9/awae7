# Email Templates (Custom SMTP)

This directory contains Handlebars email templates for **marketing and engagement emails** sent via custom SMTP.

> **📋 Architecture Note**: AWAE7 uses a dual email system:
>
> - **Supabase** handles all authentication emails (`/supabase-email-templates/`)
> - **Custom SMTP** handles marketing/engagement emails (this folder)
>
> See `/supabase-email-templates/ARCHITECTURE.md` for full details.

## Templates for Custom SMTP

These templates are for **non-authentication** communications:

### 1. Welcome Email (`welcome.hbs`)

Sent after user completes signup (post-email-verification) via custom SMTP.

**When to send**: After Supabase confirms the user's email
**Purpose**: Onboarding, feature highlights, getting started guide

**Variables:**

- `username`: User's display name
- `email`: User's email address
- `siteUrl`: Base URL of the application

### 2. Newsletter/Engagement Templates

Add additional templates here for:

- Weekly accessibility tips
- Feature announcements
- Evaluation completion notifications
- Educational content series

## Why Separate from Supabase?

**Authentication emails** (signup confirmation, password reset, etc.) should go through Supabase because:

- ✅ No SMTP configuration needed
- ✅ Reliable delivery through Supabase infrastructure
- ✅ Built-in security and rate limiting
- ✅ Easy to update without code deployment

**Marketing/engagement emails** should use custom SMTP because:

- ✅ Full control over sending logic
- ✅ Can track opens, clicks, and engagement
- ✅ Integrate with marketing automation
- ✅ Send rich, branded content
- ✅ No limits on email types or frequency

## Usage

```typescript
import {
	sendWelcomeEmail,
	sendPasswordResetEmail,
	sendEmailConfirmation,
} from '@/lib/email'

// Send welcome email
await sendWelcomeEmail({
	username: 'John Doe',
	email: 'john@example.com',
	confirmationUrl: 'https://awae7.com/confirm?token=...',
	siteUrl: 'https://awae7.com',
})

// Send password reset
await sendPasswordResetEmail({
	username: 'John Doe',
	email: 'john@example.com',
	resetUrl: 'https://awae7.com/reset-password?token=...',
	siteUrl: 'https://awae7.com',
	expiryHours: 24,
})

// Send email confirmation
await sendEmailConfirmation({
	username: 'John Doe',
	email: 'john@example.com',
	confirmationUrl: 'https://awae7.com/confirm?token=...',
	siteUrl: 'https://awae7.com',
})
```

## Customization

To customize templates:

1. Edit the `.hbs` files in this directory
2. Use Handlebars syntax for variables: `{{variableName}}`
3. Use conditionals: `{{#if condition}}...{{/if}}`
4. Use loops: `{{#each items}}...{{/each}}`

## Styling

Templates use inline CSS for maximum email client compatibility. Key points:

- Responsive design with max-width containers
- Web-safe fonts with fallbacks
- Inline styles for buttons and links
- Professional color scheme matching AWAE7 branding
