# Email Architecture for AWAE7

## Email Strategy Overview

AWAE7 uses a **dual email system** to separate authentication flows from marketing/engagement communications:

### 1. Supabase Auth Emails (Authentication & Security)
**Handled by**: Supabase Authentication Email Templates  
**Configuration**: Supabase Dashboard → Authentication → Email Templates  
**No SMTP needed**: Supabase handles delivery automatically

**Use cases:**
- ✉️ Confirm Signup - New user email verification
- 🔑 Reset Password - Password reset flow
- ✨ Magic Link - Passwordless authentication
- 📧 Change Email - Email address update confirmation
- 🎊 Invite User - Admin user invitations
- 🔐 Reauthentication - Security verification (OTP/code)

**Templates location**: `/supabase-email-templates/`

### 2. Custom SMTP Emails (Marketing & Engagement)
**Handled by**: Custom email service (Resend, SendGrid, etc.)  
**Configuration**: `.env.local` with SMTP/API credentials  
**Requires**: Email service provider setup

**Use cases:**
- 🎉 Welcome Email - Onboarding after signup completion
- 📰 Newsletters - Regular updates and announcements
- 🎓 Educational Content - WCAG tips and best practices
- 📊 Reports - Evaluation summaries and insights
- 🔔 Notifications - Non-auth system notifications

**Templates location**: `/src/lib/email/templates/`

## Architecture Benefits

### Security & Compliance
- Auth emails go through Supabase's trusted infrastructure
- Separation of concerns: auth vs marketing
- Easier compliance with email authentication (SPF, DKIM, DMARC)

### Reliability
- Auth emails always work (no SMTP configuration issues blocking signups)
- Marketing emails can be disabled/modified without affecting auth
- Independent delivery channels reduce single point of failure

### Flexibility
- Easy to customize marketing emails without touching auth
- Can use different email services for different purposes
- Professional auth emails without SMTP setup complexity

## Implementation Guide

### For Authentication Emails (Supabase)
1. Navigate to Supabase Dashboard → Authentication → Email Templates
2. Choose the email type (Confirm signup, Magic Link, etc.)
3. Copy contents from `/supabase-email-templates/[template-name].html`
4. Paste into Supabase editor
5. Update subject line if desired
6. Save

**No code deployment needed!**

### For Marketing/Engagement Emails (Custom SMTP)
1. Choose email provider (Resend recommended)
2. Get API key from provider
3. Add to `.env.local`:
   ```
   RESEND_API_KEY="re_your_key"
   EMAIL_FROM="AWAE7 <hello@yourdomain.com>"
   ```
4. Update `/src/lib/email/index.ts` to use your provider
5. Use email functions in your application code:
   ```typescript
   import { sendWelcomeEmail } from '@/lib/email';
   
   await sendWelcomeEmail({
     username: user.name,
     email: user.email,
     siteUrl: 'https://awae7.com'
   });
   ```

## Email Flow Examples

### New User Signup
1. User submits signup form
2. **Supabase sends** → Confirm Signup email (auth)
3. User clicks confirmation link
4. Account activated
5. **Custom SMTP sends** → Welcome email (marketing)

### Password Reset
1. User requests password reset
2. **Supabase sends** → Reset Password email (auth)
3. User clicks reset link and sets new password
4. Done ✓

### Newsletter Subscription
1. User subscribes to newsletter
2. **Custom SMTP sends** → Newsletter emails (marketing)
3. All newsletter communications via custom SMTP

## Best Practices

### Auth Emails (Supabase)
- Keep templates focused on the specific action
- Clear, prominent call-to-action buttons
- Security warnings where appropriate
- Short expiry times mentioned
- Professional but concise

### Marketing Emails (Custom SMTP)
- Rich content and branding
- Feature highlights and tips
- Can be longer and more detailed
- Include unsubscribe links
- Track opens/clicks if desired

## Customization Options

### Supabase Email Subjects
You can customize subjects in Supabase Dashboard. Consider:
- "Verify Your AWAE7 Email" (instead of "Confirm your signup")
- "Your AWAE7 Login Link" (instead of "Magic Link")
- "Security Code: [OTP]" (for reauthentication)

### Custom Email Types
Add new email templates in `/src/lib/email/templates/` for:
- Weekly digests
- Feature announcements
- Evaluation completion notifications
- Tutorial series
- Community updates

## Troubleshooting

### Supabase Emails Not Sending
1. Check Supabase project status
2. Verify email templates are saved in dashboard
3. Check user's email isn't blocked/bounced
4. Review Supabase logs in dashboard

### Custom SMTP Emails Not Sending
1. Verify API key in `.env.local`
2. Check email service provider dashboard for errors
3. Ensure `EMAIL_FROM` domain is verified
4. Review application logs for error messages

## Migration Notes

If you previously had all emails as Handlebars templates:
- **Keep auth templates** in Supabase for reliability
- **Move marketing templates** to custom SMTP for flexibility
- This separation improves both security and user experience
