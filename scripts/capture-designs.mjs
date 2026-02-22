/**
 * Screenshot generator — captures each AWAE page at desktop + mobile viewports.
 *
 * Usage:  node scripts/capture-designs.mjs
 *
 * Prerequisites:
 *   - Dev server running on http://localhost:3000
 *   - Playwright chromium installed
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = resolve(__dirname, '../../designs/dev')

const BASE = process.env.BASE_URL || 'http://localhost:3000'

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812 },
}

const ALL_PAGES = [
  { name: '01-home', path: '/' },
  { name: '02-login', path: '/login' },
  { name: '03-signup', path: '/signup' },
  { name: '04-evaluate', path: '/evaluate' },
  { name: '05-wcag-cards', path: '/wcag-cards' },
  { name: '06-history', path: '/history' },
]

// Allow running specific pages via env: PAGES=05-wcag-cards,06-history
const filterNames = process.env.PAGES?.split(',').map(s => s.trim())
const PAGES = filterNames
  ? ALL_PAGES.filter(p => filterNames.includes(p.name))
  : ALL_PAGES

async function run() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  for (const { name, path } of PAGES) {
    for (const [label, viewport] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 2, // retina-quality screenshots
      })
      const page = await context.newPage()

      const url = `${BASE}${path}`
      console.log(`  Capturing ${name} (${label}) → ${url}`)

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      } catch {
        // If networkidle times out, the page is likely still usable
        console.log(`    ⚠  networkidle timeout, proceeding anyway`)
      }

      // Extra wait for fonts + animations to settle
      await page.waitForTimeout(1500)

      const filename = `${name}-${label}.png`
      try {
        await page.screenshot({
          path: resolve(OUTPUT_DIR, filename),
          fullPage: true,
          timeout: 120000,
        })
        console.log(`    ✓  Saved ${filename}`)
      } catch (ssErr) {
        console.log(`    ⚠  Screenshot timeout, trying viewport-only capture`)
        await page.screenshot({
          path: resolve(OUTPUT_DIR, filename),
          fullPage: false,
          timeout: 60000,
        })
        console.log(`    ✓  Saved ${filename} (viewport only)`)
      }

      await context.close()
    }
  }

  await browser.close()
  console.log(`\nDone — screenshots saved to ${OUTPUT_DIR}`)
}

run().catch(err => {
  console.error('Screenshot capture failed:', err)
  process.exit(1)
})
