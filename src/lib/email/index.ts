import Handlebars from "handlebars";
import { readFileSync } from "fs";
import { join } from "path";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  username: string;
  email: string;
  confirmationUrl?: string;
  siteUrl: string;
}

export interface PasswordResetEmailData {
  username: string;
  email: string;
  resetUrl: string;
  siteUrl: string;
  expiryHours: number;
}

export interface EmailConfirmationData {
  username: string;
  email: string;
  confirmationUrl: string;
  siteUrl: string;
}

/**
 * Load and compile a Handlebars template
 */
function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
  const templatePath = join(process.cwd(), "src", "lib", "email", "templates", `${templateName}.hbs`);
  const templateContent = readFileSync(templatePath, "utf-8");
  return Handlebars.compile(templateContent);
}

/**
 * Generate welcome email HTML
 */
export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const template = loadTemplate("welcome");
  return template(data);
}

/**
 * Generate password reset email HTML
 */
export function generatePasswordResetEmail(data: PasswordResetEmailData): string {
  const template = loadTemplate("password-reset");
  return template(data);
}

/**
 * Generate email confirmation HTML
 */
export function generateEmailConfirmationEmail(data: EmailConfirmationData): string {
  const template = loadTemplate("email-confirmation");
  return template(data);
}

/**
 * Send email using configured email service
 * This is a placeholder - you'll need to implement based on your email service
 * (e.g., SendGrid, AWS SES, Resend, etc.)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Check if we're in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Email would be sent in production:");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("HTML length:", options.html.length);
    return;
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

  throw new Error("Email sending not configured. Please set up an email service provider.");
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const html = generateWelcomeEmail(data);
  
  await sendEmail({
    to: data.email,
    subject: "Welcome to AWAE7 - Let's Get Started! 🎉",
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const html = generatePasswordResetEmail(data);
  
  await sendEmail({
    to: data.email,
    subject: "Reset Your AWAE7 Password 🔒",
    html,
  });
}

/**
 * Send email confirmation
 */
export async function sendEmailConfirmation(data: EmailConfirmationData): Promise<void> {
  const html = generateEmailConfirmationEmail(data);
  
  await sendEmail({
    to: data.email,
    subject: "Confirm Your AWAE7 Email Address ✉️",
    html,
  });
}
