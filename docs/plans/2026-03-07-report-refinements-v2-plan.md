# Report Refinements v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply 10 targeted refinements to the report system based on user feedback from v1.

**Architecture:** Incremental edits to existing components — deletions first, then color refactor, then structural changes (executive summary, toolbar), then additions (auto-scroll, iframe preview, header preferences).

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, React

**Design Doc:** `docs/plans/2026-03-07-report-refinements-v2-design.md`

---

### Task 1: Remove Issue Snapshot from EndUserReport

**Files:**
- Modify: `src/components/evaluation/EndUserReport.tsx` (lines 154–250)

**Step 1: Remove the Issue Snapshot section**

Delete the entire `{/* ============ ISSUE SNAPSHOT ============ */}` section (lines 154–250 inclusive). This removes:
- The Card with `aria-labelledby="snapshot-heading"`
- The severity grid (Critical/Serious/Moderate/Minor counts)
- The detected issues + passed checks summary row
- The "Areas needing attention first" list

Also remove the now-unused imports:
- `AlertTriangle` from lucide-react (check if used elsewhere in file first — it IS used in Priority Actions, so keep it)
- `CheckCircle2` from lucide-react (check if used elsewhere — it is NOT used anywhere else in this file after removing snapshot, so remove it)

Also remove the `attentionCategories` computed variable (lines 122–124) since nothing references it after the snapshot is gone.

And remove `summary` from the destructured report properties (line 118) since it's only used in the snapshot.

**Step 2: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 3: Commit**

```bash
git add src/components/evaluation/EndUserReport.tsx
git commit -m "refactor: remove Issue Snapshot from EndUserReport"
```

---

### Task 2: Remove PourGrid from EndUserReport and DesignerReport

**Files:**
- Modify: `src/components/evaluation/EndUserReport.tsx`
- Modify: `src/components/evaluation/DesignerReport.tsx`

**Step 1: Remove PourGrid from EndUserReport**

In `EndUserReport.tsx`:
- Delete the import: `import PourGrid from '@/components/evaluation/PourGrid'`
- Delete the `<PourGrid>` call at line 128: `<PourGrid principleScores={report.principleScores} useFriendlyNames={true} />`

**Step 2: Remove PourGrid from DesignerReport**

In `DesignerReport.tsx`:
- Delete the import: `import PourGrid from '@/components/evaluation/PourGrid'`
- Delete the `{/* 1. POUR 2x2 Grid */}` line and the `<PourGrid principleScores={report.principleScores} />` call (lines 36–37)

**Step 3: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 4: Commit**

```bash
git add src/components/evaluation/EndUserReport.tsx src/components/evaluation/DesignerReport.tsx
git commit -m "refactor: remove PourGrid from EndUser and Designer reports"
```

---

### Task 3: Remove divider line from EvaluationResults

**Files:**
- Modify: `src/components/evaluation/EvaluationResults.tsx` (line 100)

**Step 1: Delete the divider line**

Remove this line:
```tsx
<div className="mb-4 border-b border-(--border)" />
```

This is at line 100 in `EvaluationResults.tsx`. The tabs already have their own bottom border, making this redundant.

**Step 2: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 3: Commit**

```bash
git add src/components/evaluation/EvaluationResults.tsx
git commit -m "refactor: remove redundant divider line under tabs"
```

---

### Task 4: Update PourGrid colors to WCAG Deck Card palette

**Files:**
- Modify: `src/components/evaluation/PourGrid.tsx`

The WCAG Deck Card colors (from `WcagDeckCard.tsx`) are:
| Principle | Hex |
|---|---|
| Perceivable | #B60000 (Red) |
| Operable | #1651A9 (Blue) |
| Understandable | #186312 (Green) |
| Robust | #535035 (Olive) |

Color variants follow the deck card pattern:
- Border: `border-[#HEX]`
- Background: `bg-[#HEX0D]` (5% opacity via hex alpha)
- Text: `text-[#HEX]`
- Bar fill: `bg-[#HEX]`

**Step 1: Replace the PRINCIPLE_COLORS constant**

Replace the entire `PRINCIPLE_COLORS` constant (lines 8–40) with:

```typescript
const PRINCIPLE_COLORS: Record<
	string,
	{ border: string; bg: string; text: string; bar: string; label: string }
> = {
	Perceivable: {
		border: 'border-l-[#B60000]',
		bg: 'bg-[#B600000D]',
		text: 'text-[#B60000]',
		bar: 'bg-[#B60000]',
		label: 'Perceivable',
	},
	Operable: {
		border: 'border-l-[#1651A9]',
		bg: 'bg-[#1651A90D]',
		text: 'text-[#1651A9]',
		bar: 'bg-[#1651A9]',
		label: 'Operable',
	},
	Understandable: {
		border: 'border-l-[#186312]',
		bg: 'bg-[#1863120D]',
		text: 'text-[#186312]',
		bar: 'bg-[#186312]',
		label: 'Understandable',
	},
	Robust: {
		border: 'border-l-[#535035]',
		bg: 'bg-[#5350350D]',
		text: 'text-[#535035]',
		bar: 'bg-[#535035]',
		label: 'Robust',
	},
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 3: Commit**

```bash
git add src/components/evaluation/PourGrid.tsx
git commit -m "refactor: update PourGrid to WCAG Deck Card color palette"
```

---

### Task 5: Refactor DeveloperReport executive summary (Score left + POUR right)

**Files:**
- Modify: `src/components/evaluation/DeveloperReport.tsx`

The goal: replace the standalone `<PourGrid>` + separate summary Card with one unified executive summary card. Layout: score/meta on left, PourGrid 2×2 on right.

**Step 1: Remove the standalone PourGrid call**

Delete lines 703–704:
```tsx
{/* ==================== POUR Principle Scores ==================== */}
<PourGrid principleScores={report.principleScores} />
```

**Step 2: Replace the Summary Card with unified executive summary**

Replace the entire `{/* ==================== Summary Section ==================== */}` Card (lines 706–829) with a new executive summary that has a two-column layout:

```tsx
{/* ==================== Executive Summary ==================== */}
<Card>
	<CardHeader>
		<h2 className="text-lg font-semibold text-gray-900">
			Executive Summary
		</h2>
		<p className="mt-0.5 text-sm text-gray-500">
			Technical accessibility evaluation for developers
		</p>
	</CardHeader>

	<CardBody className="space-y-6">
		{/* Two-column: Score+meta left, POUR grid right */}
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
			{/* Left column: Score + meta */}
			<div className="flex flex-col items-center gap-4">
				<ScoreGauge score={summary.overallScore} size={140} />

				<div className="w-full space-y-3">
					<div className="flex items-center gap-2 text-sm">
						<Globe className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
						<span className="font-medium text-gray-900">Target:</span>
						<span className="truncate text-gray-600">{summary.targetUrl}</span>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<Calendar className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
						<span className="font-medium text-gray-900">Evaluated:</span>
						<span className="text-gray-600">{formatDate(summary.evaluationDate)}</span>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<Layers className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
						<span className="font-medium text-gray-900">Engine:</span>
						<Badge variant="default">axe-core v{summary.axeCoreVersion}</Badge>
					</div>
				</div>
			</div>

			{/* Right column: POUR grid */}
			<PourGrid principleScores={report.principleScores} />
		</div>

		{/* Severity breakdown (below the two-column area) */}
		<div>
			<h3 className="mb-3 text-sm font-semibold text-gray-900">
				Severity Breakdown
			</h3>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<SeverityCount severity="critical" count={summary.criticalCount} />
				<SeverityCount severity="serious" count={summary.seriousCount} />
				<SeverityCount severity="moderate" count={summary.moderateCount} />
				<SeverityCount severity="minor" count={summary.minorCount} />
			</div>
		</div>
	</CardBody>
</Card>
```

Note: The PourGrid component has `className="mb-6"` on its outer div. When used inside the executive summary, we should ensure it doesn't add bottom margin. One approach: the PourGrid already has `mb-6` on the grid div — this is fine inside the executive summary since it will be at the end of the right column.

**Step 3: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 4: Commit**

```bash
git add src/components/evaluation/DeveloperReport.tsx
git commit -m "refactor: integrate PourGrid into Developer executive summary"
```

---

### Task 6: Refactor AuditorReport executive summary (Score left + POUR right)

**Files:**
- Modify: `src/components/evaluation/AuditorReport.tsx`

**Step 1: Remove the standalone WCAG Principle Breakdown section**

Delete the entire `{/* ============ PRINCIPLE BREAKDOWN ============ */}` section (lines 389–408). This removes the standalone PourGrid.

**Step 2: Refactor the Executive Summary to include PourGrid**

Replace the existing executive summary Card body (lines 251–384, the content inside `{openSections.executive && (...)}`) with a two-column layout:

```tsx
<CardBody id="exec-summary-panel">
	<div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
		{/* Left column: Score + meta */}
		<div className="flex flex-col items-center gap-4">
			<ScoreGauge score={summary.overallScore} size={140} />
			<p className="text-sm text-gray-500">Overall Compliance Score</p>

			<div className="w-full space-y-4">
				<div className="flex items-start gap-3">
					<Globe className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" aria-hidden="true" />
					<div>
						<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Target URL</p>
						<p className="text-sm text-gray-900 break-all">{summary.targetUrl}</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<Calendar className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" aria-hidden="true" />
					<div>
						<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Evaluation Date</p>
						<p className="text-sm text-gray-900">{formatDate(summary.evaluationDate)}</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<Shield className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" aria-hidden="true" />
					<div>
						<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Engine</p>
						<p className="text-sm text-gray-900">axe-core v{summary.axeCoreVersion}</p>
					</div>
				</div>
			</div>
		</div>

		{/* Right column: POUR grid */}
		<PourGrid principleScores={report.principleScores} />
	</div>
</CardBody>
```

This replaces the old 3-column layout (score | meta | severity bars) with a 2-column layout (score+meta | POUR grid). The severity breakdown is now shown inline within the PourGrid cards (each principle card already shows issue counts).

**Step 3: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 4: Commit**

```bash
git add src/components/evaluation/AuditorReport.tsx
git commit -m "refactor: integrate PourGrid into Auditor executive summary"
```

---

### Task 7: Add auto-scroll after evaluation

**Files:**
- Modify: `src/app/(dashboard)/evaluate/page.tsx`

**Step 1: Add a ref and scroll effect**

Add a `useRef` import and create a ref for the results section:

```typescript
import { useEffect, useRef, useState } from 'react'
```

Inside `EvaluatePage()`, add:
```typescript
const resultsRef = useRef<HTMLElement>(null)
```

Add a `useEffect` that scrolls when results arrive:
```typescript
useEffect(() => {
	if (results && !loading) {
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}
}, [results, loading])
```

**Step 2: Attach the ref to the results section**

Change the results section element (line 404) from:
```tsx
<section aria-label="Evaluation results">
```
to:
```tsx
<section ref={resultsRef} aria-label="Evaluation results">
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 4: Commit**

```bash
git add src/app/(dashboard)/evaluate/page.tsx
git commit -m "feat: auto-scroll to results after evaluation completes"
```

---

### Task 8: Add live iframe preview to DesignerReport

**Files:**
- Modify: `src/components/evaluation/DesignerReport.tsx`
- Modify: `src/components/evaluation/EvaluationResults.tsx` (pass new props)
- Modify: `src/types/index.ts` (optional — only if we add to DesignerReport type)

The design calls for embedding the evaluated URL in a sandboxed iframe with CSS overlays highlighting problem elements. Since cross-origin iframes block DOM access, we use the full page source HTML (`fullSourceHtml`) when available, rendered via `srcdoc` with injected highlight CSS. Otherwise we fall back to loading the URL directly in an iframe (no highlights, just visual reference).

**Step 1: Add props to DesignerReport**

Change the `DesignerReportProps` interface in `DesignerReport.tsx`:

```typescript
interface DesignerReportProps {
	report: DesignerReportType
	targetUrl?: string
	fullSourceHtml?: string
}
```

Update the component signature:
```typescript
export default function DesignerReport({ report, targetUrl, fullSourceHtml }: DesignerReportProps) {
```

**Step 2: Build the highlight CSS generator**

Add a helper function at the top of DesignerReport.tsx:

```typescript
function buildHighlightCss(report: DesignerReportType): string {
	const rules: string[] = []

	// Contrast issues — red dashed border
	for (const issue of report.contrastIssues) {
		if (issue.selector) {
			rules.push(`${issue.selector} { outline: 3px dashed #ef4444 !important; outline-offset: 2px; }`)
		}
	}

	// Touch target issues — orange dot indicator
	for (const issue of report.targetIssues) {
		if (issue.selector) {
			rules.push(`${issue.selector} { outline: 3px solid #f97316 !important; outline-offset: 2px; }`)
		}
	}

	// Hierarchy/focus issues — yellow outline
	for (const issue of report.hierarchyIssues) {
		if (issue.selector) {
			rules.push(`${issue.selector} { outline: 3px solid #eab308 !important; outline-offset: 2px; }`)
		}
	}

	return rules.join('\n')
}
```

**Step 3: Build the srcdoc content**

Add a helper function:

```typescript
function buildPreviewSrcdoc(html: string, highlightCss: string): string {
	const styleTag = `<style data-awae-highlights>${highlightCss}</style>`
	// Inject style before </head> if present, otherwise prepend
	if (html.includes('</head>')) {
		return html.replace('</head>', `${styleTag}</head>`)
	}
	return `${styleTag}${html}`
}
```

**Step 4: Add the iframe preview section**

Insert a new section at the top of the DesignerReport return JSX (where PourGrid used to be), before the Color & Contrast card:

```tsx
{/* 1. Live Preview */}
{(fullSourceHtml || targetUrl) && (
	<Card>
		<CardHeader>
			<div>
				<h3 className="text-base font-semibold text-(--text)">
					Live Preview
				</h3>
				<p className="mt-0.5 text-sm text-(--muted-text)">
					{fullSourceHtml
						? 'Page source rendered with accessibility issues highlighted'
						: 'Live page preview (highlights unavailable for cross-origin content)'}
				</p>
			</div>
			<div className="flex gap-2">
				{fullSourceHtml && (
					<>
						<span className="inline-flex items-center gap-1 text-xs">
							<span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-dashed border-red-500" />
							Contrast
						</span>
						<span className="inline-flex items-center gap-1 text-xs">
							<span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-orange-500" />
							Touch Targets
						</span>
						<span className="inline-flex items-center gap-1 text-xs">
							<span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-yellow-500" />
							Hierarchy / Focus
						</span>
					</>
				)}
			</div>
		</CardHeader>
		<CardBody className="p-0">
			<iframe
				title="Evaluated page preview"
				sandbox="allow-same-origin"
				className="h-[600px] w-full border-0"
				{...(fullSourceHtml
					? { srcDoc: buildPreviewSrcdoc(fullSourceHtml, buildHighlightCss(report)) }
					: { src: targetUrl })}
			/>
		</CardBody>
	</Card>
)}
```

**Step 5: Pass new props through EvaluationResults**

In `EvaluationResults.tsx`, add `evaluation` data passthrough to DesignerReport:

Change the DesignerReport rendering (line 114) from:
```tsx
<DesignerReport report={designerReport} />
```
to:
```tsx
<DesignerReport
	report={designerReport}
	targetUrl={evaluation.targetUrl}
	fullSourceHtml={developerReport.fullSourceHtml}
/>
```

**Step 6: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 7: Commit**

```bash
git add src/components/evaluation/DesignerReport.tsx src/components/evaluation/EvaluationResults.tsx
git commit -m "feat: add live iframe preview with highlights to Designer report"
```

---

### Task 9: Merge developer filters + theme into one toolbar row

**Files:**
- Modify: `src/components/evaluation/DeveloperReport.tsx`

The design calls for merging the Filters `SectionDropdown` and the Source Code theme selector into one compact toolbar row placed directly above the source code viewer.

**Step 1: Remove the standalone Filters SectionDropdown**

Delete the entire `{/* ==================== Filters Section ==================== */}` SectionDropdown block (lines 831–966 approximately). This removes the collapsible Filters section.

**Step 2: Remove the standalone theme selector from Source Code section**

Inside the Source Code `SectionDropdown` > `CardBody`, remove the theme selector div (lines 975–1004, the `<div className="flex justify-end">` block containing the Theme label and select).

**Step 3: Add the unified toolbar above Source Code**

Replace the removed Filters section with a compact toolbar row. Insert it directly above the Source Code SectionDropdown:

```tsx
{/* ==================== Filter Toolbar ==================== */}
<div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
	{/* Severity */}
	<div className="space-y-1 min-w-[120px]">
		<label htmlFor="developer-filter-severity" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
			Severity
		</label>
		<select
			id="developer-filter-severity"
			value={selectedSeverity}
			onChange={e => handleSeverityChange(e.target.value)}
			className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
		>
			<option value="all">All</option>
			{ALL_SEVERITIES.map(s => (
				<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
			))}
		</select>
	</div>

	{/* Principle */}
	<div className="space-y-1 min-w-[120px]">
		<label htmlFor="developer-filter-principle" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
			Principle
		</label>
		<select
			id="developer-filter-principle"
			value={selectedPrinciple}
			onChange={e => handlePrincipleChange(e.target.value)}
			className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
		>
			<option value="all">All</option>
			{ALL_PRINCIPLES.map(p => (
				<option key={p} value={p}>{p}</option>
			))}
		</select>
	</div>

	{/* Level */}
	<div className="space-y-1 min-w-[100px]">
		<label htmlFor="developer-filter-level" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
			Level
		</label>
		<select
			id="developer-filter-level"
			value={selectedLevel}
			onChange={e => handleLevelChange(e.target.value)}
			className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
		>
			<option value="all">All</option>
			{ALL_LEVELS.map(l => (
				<option key={l} value={l}>{l === 'best-practice' ? 'Best Practice' : `Level ${l}`}</option>
			))}
		</select>
	</div>

	{/* Category */}
	{allCategories.length > 0 && (
		<div className="space-y-1 min-w-[120px]">
			<label htmlFor="developer-filter-category" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
				Category
			</label>
			<select
				id="developer-filter-category"
				value={selectedCategory}
				onChange={e => handleCategoryChange(e.target.value)}
				className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
			>
				<option value="all">All</option>
				{allCategories.map(c => (
					<option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
				))}
			</select>
		</div>
	)}

	{/* Divider */}
	<div className="hidden sm:block h-8 w-px bg-gray-200" />

	{/* Theme */}
	<div className="space-y-1 min-w-[130px]">
		<label htmlFor="source-focus-theme" className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
			Theme
		</label>
		<select
			id="source-focus-theme"
			value={sourceTheme}
			onChange={e => setSourceTheme(e.target.value as SourceThemeKey)}
			className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
		>
			{Object.entries(SOURCE_THEMES).map(([key, value]) => (
				<option key={key} value={key}>{value.label}</option>
			))}
		</select>
	</div>

	{/* Clear filters button */}
	{hasActiveFilters && (
		<button
			type="button"
			onClick={clearAllFilters}
			className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-sm"
		>
			Clear filters
		</button>
	)}
</div>
```

**Step 4: Verify the SectionDropdown Filters import is still used**

The `Filter` icon from lucide-react was only used inside the old Filters SectionDropdown. Remove it from the import if no longer used anywhere in the file (check the violations empty state as well — it uses `SearchX` not `Filter`). Actually `Filter` is used in the old section only, so remove it.

**Step 5: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 6: Commit**

```bash
git add src/components/evaluation/DeveloperReport.tsx
git commit -m "refactor: merge filters and theme into one toolbar row"
```

---

### Task 10: Move preferences to header dropdown

**Files:**
- Modify: `src/app/(dashboard)/evaluate/page.tsx` (remove preference card)
- Modify: `src/components/layout/Navbar.tsx` (add preference dropdown)

**Step 1: Remove the preference section from evaluate page**

In `evaluate/page.tsx`, delete the entire `{/* ---- Preference ---- */}` section (lines 277–333). This removes the Card with the role selection buttons.

Also remove the now-unused:
- `handlePreferredRoleChange` function (lines 144–167)
- The `useEffect` that loads preference (lines 79–142)
- The `preferredRole` and `setPreferredRole` state (lines 76–77)
- The `PreferredRole` type (line 28)
- The `PREFERRED_ROLE_STORAGE_KEY` constant (line 30)
- `Card` and `CardBody` imports if unused after removal (check — they ARE used in loading/error states, so keep them)
- `cn` import if unused (check — it IS used in loading state for progress bar indeterminate animation classNames — actually no, `cn` is imported but after removing the preference section, check all usages... Actually `cn` is not used anywhere else in this file. Remove it.)
- `toast` import — still used in handleUrlSubmit and handleFileSubmit, so keep it.

Wait — we still need the preference system to work. The defaultTab prop on EvaluationResults needs to know the user's preferred role. Let me rethink this.

The preference loading and state should remain in the evaluate page since EvaluationResults needs `defaultTab={preferredRole}`. What we remove is only the UI card. The loading logic stays.

**Revised Step 1: Remove only the preference UI card**

Delete just the JSX section (lines 277–333):
```tsx
{/* ---- Preference ---- */}
<section aria-label="Report preference" className="mb-8">
  ...
</section>
```

Keep:
- `preferredRole` state
- `PREFERRED_ROLE_STORAGE_KEY`
- `PreferredRole` type
- The `useEffect` that loads preference on mount
- `handlePreferredRoleChange` (will be needed by the Navbar via a different mechanism)

Actually, the Navbar is a separate component with no shared state. We need a way for the Navbar's preference dropdown to update the evaluate page's state. Options:
1. Use localStorage events (clean, no prop drilling)
2. Pass a callback through context

Option 1 is simplest: Navbar writes to localStorage, and the evaluate page listens for `storage` events to sync. The existing `useEffect` already reads from localStorage on mount, we just need to add a `storage` event listener.

**Revised approach:**

In `evaluate/page.tsx`:
- Remove the preference section JSX (lines 277–333)
- Remove `handlePreferredRoleChange` function (it will live in Navbar now)
- Add a `storage` event listener to the existing `useEffect` so the page reacts when Navbar changes the preference
- Remove `cn` import (unused after removing the preference card buttons)

In `Navbar.tsx`:
- Add a preferences dropdown next to the user email when logged in
- The dropdown writes to localStorage and optionally syncs to /api/preferences
- On desktop: show a small dropdown button next to the email
- On mobile: show it in the mobile menu

**Step 1a: Update evaluate/page.tsx**

Remove the preference section JSX. Remove `handlePreferredRoleChange`. Remove `cn` import.

Add a storage event listener to the existing useEffect so preference changes from the Navbar are picked up:

```typescript
useEffect(() => {
	let mounted = true

	const loadPreference = async () => {
		// ... existing localStorage + API fetch logic (keep as-is) ...
	}

	loadPreference()

	// Listen for preference changes from other components (e.g. Navbar)
	const handleStorageChange = (e: StorageEvent) => {
		if (e.key !== PREFERRED_ROLE_STORAGE_KEY || !e.newValue) return
		const newRole = e.newValue as PreferredRole
		if (['end-user', 'developer', 'designer', 'auditor'].includes(newRole)) {
			if (mounted) setPreferredRole(newRole)
		}
	}

	window.addEventListener('storage', handleStorageChange)

	return () => {
		mounted = false
		window.removeEventListener('storage', handleStorageChange)
	}
}, [])
```

Note: the `storage` event only fires for changes from OTHER tabs/windows. For same-tab changes (when user clicks in Navbar), we need to also dispatch a custom event or use a different mechanism. The simplest approach: use a custom `StorageEvent` dispatch or a window custom event.

Alternative approach: use a custom event:

In Navbar, after setting localStorage:
```typescript
window.dispatchEvent(new Event('awae-preference-changed'))
```

In evaluate page, listen for it:
```typescript
const handlePreferenceChange = () => {
	const stored = window.localStorage.getItem(PREFERRED_ROLE_STORAGE_KEY)
	if (stored && ['end-user', 'developer', 'designer', 'auditor'].includes(stored)) {
		if (mounted) setPreferredRole(stored as PreferredRole)
	}
}
window.addEventListener('awae-preference-changed', handlePreferenceChange)
```

This is clean and works for same-tab updates.

**Step 1b: Add preference dropdown to Navbar**

Add a dropdown menu next to the user email in the desktop auth section of Navbar. The dropdown shows a "Report Preference" option with sub-options for each role.

Add these constants and state to the Navbar component:

```typescript
const PREFERRED_ROLE_STORAGE_KEY = 'awae_preferred_role'
type PreferredRole = 'end-user' | 'developer' | 'designer' | 'auditor'

const ROLE_OPTIONS: { value: PreferredRole; label: string }[] = [
	{ value: 'end-user', label: 'End User' },
	{ value: 'developer', label: 'Developer' },
	{ value: 'designer', label: 'Designer' },
	{ value: 'auditor', label: 'Auditor' },
]
```

Add state:
```typescript
const [preferredRole, setPreferredRole] = useState<PreferredRole>('end-user')
const [prefDropdownOpen, setPrefDropdownOpen] = useState(false)
```

Add a useEffect to load the saved preference:
```typescript
useEffect(() => {
	try {
		const stored = window.localStorage.getItem(PREFERRED_ROLE_STORAGE_KEY)
		if (stored && ['end-user', 'developer', 'designer', 'auditor'].includes(stored)) {
			setPreferredRole(stored as PreferredRole)
		}
	} catch {
		// Ignore localStorage errors
	}
}, [])
```

Add a handler:
```typescript
async function handlePreferenceChange(role: PreferredRole) {
	setPreferredRole(role)
	setPrefDropdownOpen(false)
	try {
		window.localStorage.setItem(PREFERRED_ROLE_STORAGE_KEY, role)
		window.dispatchEvent(new Event('awae-preference-changed'))
	} catch {
		// Ignore localStorage errors
	}
	try {
		await fetch('/api/preferences', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ preferredRole: role }),
		})
	} catch {
		// Silent fail for API sync
	}
}
```

In the desktop auth section, replace the simple email + logout with email + preference dropdown + logout:

```tsx
{user ? (
	<div className="flex items-center gap-3">
		{/* Preference Dropdown */}
		<div className="relative">
			<button
				type="button"
				onClick={() => setPrefDropdownOpen(!prefDropdownOpen)}
				className="flex items-center gap-1.5 rounded-lg border border-(--border) bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-(--accent-soft) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2"
			>
				<span className="text-xs text-slate-500">View:</span>
				<span className="font-medium">
					{ROLE_OPTIONS.find(r => r.value === preferredRole)?.label ?? 'End User'}
				</span>
				<ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', prefDropdownOpen && 'rotate-180')} aria-hidden="true" />
			</button>
			{prefDropdownOpen && (
				<>
					<button
						type="button"
						className="fixed inset-0 z-40"
						aria-label="Close preference dropdown"
						onClick={() => setPrefDropdownOpen(false)}
					/>
					<div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-(--border) bg-white py-1 shadow-lg">
						{ROLE_OPTIONS.map(option => (
							<button
								key={option.value}
								type="button"
								onClick={() => handlePreferenceChange(option.value)}
								className={cn(
									'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-(--accent-soft)',
									preferredRole === option.value
										? 'font-semibold text-(--accent)'
										: 'text-slate-700'
								)}
							>
								{option.label}
							</button>
						))}
					</div>
				</>
			)}
		</div>

		<span className="max-w-48 truncate text-sm text-slate-600">
			{user.email}
		</span>
		<button
			onClick={handleLogout}
			disabled={loggingOut}
			className="cursor-pointer rounded-lg border border-(--border) bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-(--accent-soft) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2 disabled:opacity-50"
		>
			{loggingOut ? 'Logging out...' : 'Logout'}
		</button>
	</div>
) : (
	// ... existing login/signup buttons unchanged ...
)}
```

Add imports to Navbar:
```typescript
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
```

Also add the preference option in the mobile menu, below the email:
```tsx
{/* Mobile preference selector */}
<div className="space-y-1 px-3">
	<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Report Preference</p>
	<div className="flex flex-wrap gap-1">
		{ROLE_OPTIONS.map(option => (
			<button
				key={option.value}
				type="button"
				onClick={() => handlePreferenceChange(option.value)}
				className={cn(
					'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
					preferredRole === option.value
						? 'bg-(--accent) text-white'
						: 'bg-(--accent-soft) text-slate-700'
				)}
			>
				{option.label}
			</button>
		))}
	</div>
</div>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Zero errors

**Step 3: Commit**

```bash
git add src/app/(dashboard)/evaluate/page.tsx src/components/layout/Navbar.tsx
git commit -m "feat: move report preference selector to header dropdown"
```

---

## Execution Order

Tasks can be parallelized in groups:

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1, 2, 3 | Independent deletions |
| B | 4 | PourGrid color update (no deps) |
| C | 5, 6 | Executive summary refactors (use PourGrid after B) |
| D | 7, 8, 9, 10 | Independent additions |

For subagent-driven development, execute sequentially: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Tasks 1–3 can be done by the same subagent. Tasks 5–6 can be done by the same subagent.

## Final Verification

After all 10 tasks:

```bash
npm run build
```

Expected: Zero TypeScript or build errors.
