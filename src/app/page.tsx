import Link from "next/link";
import {
  BarChart3,
  ShieldCheck,
  Layers,
  ArrowRight,
  Code2,
  FileText,
  User,
  Globe,
  Search,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ================================================================
   Data
   ================================================================ */

const features = [
  {
    icon: BarChart3,
    title: "Multi-Level Reports",
    description:
      "Get tailored accessibility reports for three distinct audiences: developers, auditors, and end-users, each with the right level of technical detail.",
  },
  {
    icon: ShieldCheck,
    title: "WCAG 2.2 Compliance",
    description:
      "Powered by axe-core, evaluate websites against the latest WCAG 2.2 Level A and AA success criteria with comprehensive coverage.",
  },
  {
    icon: Layers,
    title: "Interactive WCAG Cards",
    description:
      "Learn about all WCAG 2.2 criteria through interactive deck cards with code examples, common violations, and remediation strategies.",
  },
];

const steps = [
  {
    number: 1,
    icon: Globe,
    title: "Enter a URL",
    description: "Paste any website URL to start the evaluation.",
  },
  {
    number: 2,
    icon: Search,
    title: "Get Results",
    description:
      "Our engine analyzes the page against WCAG 2.2 criteria using the industry-standard axe-core library.",
  },
  {
    number: 3,
    icon: CheckCircle2,
    title: "View Reports",
    description:
      "Switch between developer, auditor, and end-user views to get insights tailored to your role.",
  },
];

const reportTypes = [
  {
    icon: Code2,
    role: "Developer",
    description:
      "Detailed CSS selectors, HTML snippets, and remediation code examples to fix accessibility issues quickly.",
    accent: "bg-blue-50 text-blue-700 border-blue-200",
    iconAccent: "text-blue-600",
  },
  {
    icon: FileText,
    role: "Auditor",
    description:
      "Compliance matrices, principle breakdowns, and formal violation descriptions for thorough auditing.",
    accent: "bg-purple-50 text-purple-700 border-purple-200",
    iconAccent: "text-purple-600",
  },
  {
    icon: User,
    role: "End-User",
    description:
      "Plain-language summaries, accessibility scores, and priority recommendations anyone can understand.",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconAccent: "text-emerald-600",
  },
];

const footerLinks = [
  { href: "/evaluate", label: "Evaluate" },
  { href: "/wcag-cards", label: "WCAG Cards" },
  { href: "/login", label: "Login" },
];

/* ================================================================
   Component
   ================================================================ */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-200 opacity-30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-blue-200 opacity-30 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Automated Web{" "}
              <span className="text-indigo-600">Accessibility</span> Evaluator
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
              Evaluate any website against WCAG 2.2 standards and get tailored
              reports for developers, auditors, and end-users.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/evaluate"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm",
                  "hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                )}
              >
                Start Evaluating
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/wcag-cards"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm",
                  "hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                )}
              >
                Browse WCAG Cards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for accessibility evaluation
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A complete toolkit to audit, understand, and improve web
              accessibility.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to a more accessible website.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                {/* Step icon circle */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </div>

                <span className="mt-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Step {step.number}
                </span>

                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Report Types Section ─── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Reports tailored to your role
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Every stakeholder gets the information they need, in the format
              that works for them.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => (
              <div
                key={report.role}
                className={cn(
                  "rounded-2xl border p-8 transition-shadow hover:shadow-md",
                  report.accent
                )}
              >
                <report.icon
                  className={cn("h-8 w-8", report.iconAccent)}
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-xl font-bold">{report.role}</h3>
                <p className="mt-2 text-base leading-7 opacity-90">
                  {report.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer CTA ─── */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to evaluate your website?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Start a free accessibility evaluation now and get actionable reports
            in seconds.
          </p>
          <div className="mt-8">
            <Link
              href="/evaluate"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-sm",
                "hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-colors"
              )}
            >
              Start Evaluating
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* Brand */}
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <span className="text-lg font-bold text-indigo-600 tracking-tight">
                AWAE
              </span>
              <span className="text-sm text-gray-500">
                Automated Web Accessibility Evaluator
              </span>
            </div>

            {/* Links */}
            <nav aria-label="Footer navigation">
              <ul className="flex items-center gap-6">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Built for BSc Software Engineering Thesis at Babcock University
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
