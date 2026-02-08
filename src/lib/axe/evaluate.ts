import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";

// ---------------------------------------------------------------------------
// Types for raw axe-core output returned by this module
// ---------------------------------------------------------------------------
export interface RawAxeNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface RawAxeViolation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: RawAxeNode[];
}

export interface RawAxePass {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: { html: string; target: string[] }[];
}

export interface RawEvaluationResult {
  url: string;
  timestamp: string;
  axeCoreVersion: string;
  violations: RawAxeViolation[];
  passes: RawAxePass[];
  incomplete: unknown[];
  inapplicable: unknown[];
}

// ---------------------------------------------------------------------------
// URL validation helper
// ---------------------------------------------------------------------------
function isValidUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Core evaluation function
// ---------------------------------------------------------------------------

/**
 * Launches a headless Chromium browser via Playwright, navigates to `url`,
 * and runs an axe-core accessibility audit scoped to WCAG 2.2 Level A & AA.
 *
 * Returns structured results that can be fed into the transform layer.
 */
export async function evaluateUrl(url: string): Promise<RawEvaluationResult> {
  // ---- Pre-flight validation ----
  if (!url || typeof url !== "string") {
    throw new Error("A valid URL string is required.");
  }

  const trimmedUrl = url.trim();

  if (!isValidUrl(trimmedUrl)) {
    throw new Error(
      `Invalid URL: "${trimmedUrl}". The URL must start with http:// or https://.`
    );
  }

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    // ---- Launch browser ----
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    page = await context.newPage();

    // ---- Navigate ----
    try {
      await page.goto(trimmedUrl, {
        waitUntil: "load",
        timeout: 30_000,
      });
    } catch (navError: unknown) {
      const message =
        navError instanceof Error ? navError.message : String(navError);

      if (message.includes("Timeout") || message.includes("timeout")) {
        throw new Error(
          `Navigation timed out after 30 seconds for URL: "${trimmedUrl}". ` +
            "The page may be too slow to load or unreachable."
        );
      }

      if (
        message.includes("net::ERR_NAME_NOT_RESOLVED") ||
        message.includes("net::ERR_CONNECTION_REFUSED") ||
        message.includes("net::ERR_CONNECTION_TIMED_OUT") ||
        message.includes("net::ERR_ADDRESS_UNREACHABLE")
      ) {
        throw new Error(
          `Unable to reach "${trimmedUrl}". The site may be down or the URL is incorrect.`
        );
      }

      throw new Error(`Failed to navigate to "${trimmedUrl}": ${message}`);
    }

    // ---- Wait briefly for any late-loading content ----
    await page.waitForTimeout(1_000);

    // ---- Run axe-core ----
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();

    // ---- Build result ----
    const violations: RawAxeViolation[] = axeResults.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? "minor",
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target.map(String),
        failureSummary: n.failureSummary ?? "",
      })),
    }));

    const passes: RawAxePass[] = axeResults.passes.map((p) => ({
      id: p.id,
      description: p.description,
      help: p.help,
      helpUrl: p.helpUrl,
      tags: p.tags,
      nodes: p.nodes.map((n) => ({
        html: n.html,
        target: n.target.map(String),
      })),
    }));

    return {
      url: trimmedUrl,
      timestamp: new Date().toISOString(),
      axeCoreVersion: axeResults.testEngine.version,
      violations,
      passes,
      incomplete: axeResults.incomplete ?? [],
      inapplicable: axeResults.inapplicable ?? [],
    };
  } catch (error: unknown) {
    // Re-throw our own errors as-is; wrap unexpected errors
    if (error instanceof Error && error.message.startsWith("Invalid URL")) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith("Navigation timed")) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith("Unable to reach")) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith("Failed to navigate")) {
      throw error;
    }

    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Evaluation failed for "${url}": ${msg}`);
  } finally {
    // ---- Cleanup ----
    try {
      if (page) await page.close();
    } catch { /* swallow */ }

    try {
      if (context) await context.close();
    } catch { /* swallow */ }

    try {
      if (browser) await browser.close();
    } catch { /* swallow */ }
  }
}
