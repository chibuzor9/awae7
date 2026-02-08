# Supabase Email Templates for AWAE7

This folder contains professional HTML email templates designed for direct use in Supabase Authentication → Email Templates.

## Templates Included

### 1. **confirm-signup.html**
- **Subject**: Welcome to AWAE7 - Confirm Your Email
- **When**: User signs up for an account
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`

### 2. **reset-password.html**
- **Subject**: Reset Your AWAE7 Password
- **When**: User requests password reset
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`

### 3. **magic-link.html**
- **Subject**: Sign In to AWAE7 - Magic Link
- **When**: User requests magic link login
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`

### 4. **change-email.html**
- **Subject**: Confirm Your New AWAE7 Email Address
- **When**: User changes their email address
- **Variables**: `{{ .Email }}`, `{{ .NewEmail }}`, `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`

### 5. **invite-user.html**
- **Subject**: You're Invited to Join AWAE7
- **When**: Admin invites a new user
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`

### 6. **reauthentication.html**
- **Subject**: AWAE7 Security - Verify Your Identity
- **When**: User needs to reauthenticate for sensitive actions
- **Variables**: `{{ .Email }}`, `{{ .Token }}`, `{{ .SiteURL }}`

## How to Use

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Update Each Template
For each email type:
1. Click on the email template name (e.g., "Confirm signup")
2. Copy the entire contents of the corresponding HTML file
3. Paste into the Supabase email template editor
4. Update the **Subject** field with the recommended subject line above
5. Click **Save**

### Step 3: Test Your Templates
- Use Supabase's test functionality to preview emails
- Sign up with a test account to verify the real flow
- Check rendering on different email clients if possible

## Template Features

✨ **Professional Design**
- Modern gradient header with AWAE7 branding
- Clean, responsive layout
- Mobile-friendly design

🎨 **Consistent Branding**
- Purple gradient (#667eea to #764ba2)
- AWAE7 logo and styling
- Professional typography

📱 **Email Client Compatible**
- Inline CSS for maximum compatibility
- Tested layout structure
- Web-safe fonts with fallbacks

🔒 **Security Best Practices**
- Clear security warnings where needed
- Expiry time notifications
- Instructions for suspicious activity

## Customization

To customize these templates:
1. Edit the HTML files directly
2. Update colors, fonts, or layout as needed
3. Test thoroughly before deploying to production
4. Keep Supabase variable placeholders intact (e.g., `{{ .Email }}`)

## Supabase Variables

These variables are automatically replaced by Supabase:
- `{{ .Email }}` - User's email address
- `{{ .NewEmail }}` - New email address (for email change)
- `{{ .ConfirmationURL }}` - Action confirmation link
- `{{ .Token }}` - Verification code (for reauthentication)
- `{{ .SiteURL }}` - Your application's URL

## Support

If you need help or have questions about these templates, please refer to:
- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- AWAE7 project documentation

---

**Note**: These templates replace the default Supabase Auth emails with professional, branded communications that match the AWAE7 identity.
