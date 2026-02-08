# Email Templates

This directory contains Handlebars email templates for AWAE7.

## Available Templates

### 1. Welcome Email (`welcome.hbs`)
Sent when a new user signs up.

**Variables:**
- `username`: User's display name
- `email`: User's email address
- `confirmationUrl`: Optional email confirmation link
- `siteUrl`: Base URL of the application

### 2. Email Confirmation (`email-confirmation.hbs`)
Sent to verify user's email address.

**Variables:**
- `username`: User's display name
- `email`: User's email address
- `confirmationUrl`: Email confirmation link
- `siteUrl`: Base URL of the application

### 3. Password Reset (`password-reset.hbs`)
Sent when user requests a password reset.

**Variables:**
- `username`: User's display name
- `email`: User's email address
- `resetUrl`: Password reset link
- `siteUrl`: Base URL of the application
- `expiryHours`: Number of hours until link expires

## Usage

```typescript
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmailConfirmation } from '@/lib/email';

// Send welcome email
await sendWelcomeEmail({
  username: 'John Doe',
  email: 'john@example.com',
  confirmationUrl: 'https://awae7.com/confirm?token=...',
  siteUrl: 'https://awae7.com'
});

// Send password reset
await sendPasswordResetEmail({
  username: 'John Doe',
  email: 'john@example.com',
  resetUrl: 'https://awae7.com/reset-password?token=...',
  siteUrl: 'https://awae7.com',
  expiryHours: 24
});

// Send email confirmation
await sendEmailConfirmation({
  username: 'John Doe',
  email: 'john@example.com',
  confirmationUrl: 'https://awae7.com/confirm?token=...',
  siteUrl: 'https://awae7.com'
});
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
