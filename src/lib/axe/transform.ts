import type {
	EvaluationResult,
	ViolationItem,
    ViolationNode,
    CheckResult,
	DeveloperReport,
	DeveloperViolation,
    DeveloperIncompleteItem,
	AuditorReport,
    AuditorIncompleteItem,
	EndUserReport,
	ReportSummary,
	ComplianceEntry,
	PrincipleBreakdown,
    CategoryBreakdown,
	AuditorViolation,
	EndUserCategory,
	PassItem,
    IncompleteItem,
    IncompleteNode,
    InapplicableItem,
	Severity,
	WcagPrinciple,
	WcagLevel,
    WcagCategory,
    TestEnvironment,
} from '@/types'

// ===========================================================================
// Helpers  --  WCAG tag parsing
// ===========================================================================

/**
 * Extract a WCAG criterion number from an array of axe-core tags.
 * Tags look like "wcag111", "wcag143", "wcag412", "wcag1412" etc.
 * We convert "wcag111" -> "1.1.1", "wcag1412" -> "1.4.12".
 */
function extractWcagCriterion(tags: string[]): string {
    for (const tag of tags) {
		const match = tag.match(/^wcag(\d)(\d{1,2})(\d{1,2})$/)
		if (match) {
			return `${match[1]}.${match[2]}.${match[3]}`
		}
	}
    if (tags.includes('best-practice')) return 'best-practice'
	return 'unknown'
}

/**
 * Determine the WCAG level from axe-core tags.
 */
function extractWcagLevel(tags: string[]): WcagLevel {
    if (tags.includes('best-practice')) return 'best-practice'
    if (tags.includes('wcag2aaa')) return 'AAA'
    if (
        tags.includes('wcag2aa') ||
        tags.includes('wcag21aa') ||
        tags.includes('wcag22aa')
    )
        return 'AA'
    if (tags.includes('wcag2a') || tags.includes('wcag21a')) return 'A'
	return 'A'
}

/**
 * Map a WCAG criterion to its principle.
 */
function mapToPrinciple(criterion: string): WcagPrinciple {
	if (criterion.startsWith('1.')) return 'Perceivable'
	if (criterion.startsWith('2.')) return 'Operable'
	if (criterion.startsWith('3.')) return 'Understandable'
	if (criterion.startsWith('4.')) return 'Robust'
    return 'Perceivable'
}

/**
 * Extract the `cat.*` category tag from axe-core tags.
 */
function extractCategory(tags: string[]): WcagCategory {
    for (const tag of tags) {
        if (tag.startsWith('cat.')) {
            const cat = tag.slice(4) as WcagCategory
            if (CATEGORY_LABELS[cat]) return cat
        }
    }
    return 'other'
}

/** Human-readable label for each category */
const CATEGORY_LABELS: Record<WcagCategory, string> = {
    aria: 'ARIA',
    color: 'Color',
    forms: 'Forms',
    keyboard: 'Keyboard',
    language: 'Language',
    'name-role-value': 'Name / Role / Value',
    parsing: 'Parsing',
    semantics: 'Semantics',
    'sensory-and-visual-cues': 'Sensory & Visual Cues',
    structure: 'Structure',
    tables: 'Tables',
    'text-alternatives': 'Text Alternatives',
    'time-and-media': 'Time & Media',
    other: 'Other',
}

/**
 * Map axe-core impact string to our Severity type.
 */
function mapImpactToSeverity(impact: string | undefined | null): Severity {
	switch (impact) {
		case 'critical':
			return 'critical'
		case 'serious':
			return 'serious'
		case 'moderate':
			return 'moderate'
		case 'minor':
		default:
			return 'minor'
	}
}

/**
 * Points deducted per severity bucket.
 */
const SEVERITY_WEIGHT: Record<Severity, number> = {
	critical: 15,
	serious: 10,
	moderate: 5,
	minor: 2,
}

/**
 * Map raw axe checks to our CheckResult type.
 */
function mapChecks(raw: any[]): CheckResult[] {
    return (raw ?? []).map((c: any) => ({
        id: c.id ?? '',
        impact: c.impact ?? null,
        message: c.message ?? '',
        data: c.data ?? null,
        relatedNodes: (c.relatedNodes ?? []).map((rn: any) => ({
            html: rn.html ?? '',
            target: Array.isArray(rn.target) ? rn.target.map(String) : [],
        })),
    }))
}

// ===========================================================================
// 1.  transformRawResults
// ===========================================================================

/**
 * Transform the raw axe-core output (as returned by `evaluateUrl`) into the
 * application's canonical `EvaluationResult` shape.
 */
export function transformRawResults(rawResults: any): EvaluationResult {
	// -- Map violations --
	const violations: ViolationItem[] = (rawResults.violations ?? []).map(
		(v: any) => {
			const criterion = extractWcagCriterion(v.tags ?? [])
			const level = extractWcagLevel(v.tags ?? [])
			const principle = mapToPrinciple(criterion)
			const severity = mapImpactToSeverity(v.impact)
            const category = extractCategory(v.tags ?? [])

			return {
				ruleId: v.id,
				description: v.description ?? v.help ?? '',
				helpUrl: v.helpUrl ?? '',
				wcagCriterion: criterion,
				wcagLevel: level,
				wcagPrinciple: principle,
				severity,
                category,
                nodes: (v.nodes ?? []).map(
                    (n: any): ViolationNode => ({
                        html: n.html ?? '',
                        target: Array.isArray(n.target)
                            ? n.target.map(String)
                            : [],
                        failureSummary: n.failureSummary ?? '',
                        impact: n.impact ?? null,
                        any: mapChecks(n.any),
                        all: mapChecks(n.all),
                        none: mapChecks(n.none),
                    })
                ),
			} satisfies ViolationItem
		}
	)

	// -- Map passes --
	const passes: PassItem[] = (rawResults.passes ?? []).map((p: any) => {
		const criterion = extractWcagCriterion(p.tags ?? [])
		const level = extractWcagLevel(p.tags ?? [])
		const principle = mapToPrinciple(criterion)
        const category = extractCategory(p.tags ?? [])

		return {
			ruleId: p.id,
			description: p.description ?? p.help ?? '',
			wcagCriterion: criterion,
			wcagLevel: level,
			wcagPrinciple: principle,
            category,
		} satisfies PassItem
	})

    // -- Map incomplete (needs-review) --
    const incomplete: IncompleteItem[] = (rawResults.incomplete ?? []).map(
        (i: any) => {
            const criterion = extractWcagCriterion(i.tags ?? [])
            const level = extractWcagLevel(i.tags ?? [])
            const principle = mapToPrinciple(criterion)
            const severity = mapImpactToSeverity(i.impact)
            const category = extractCategory(i.tags ?? [])

            return {
                ruleId: i.id,
                description: i.description ?? i.help ?? '',
                helpUrl: i.helpUrl ?? '',
                wcagCriterion: criterion,
                wcagLevel: level,
                wcagPrinciple: principle,
                severity,
                category,
                nodes: (i.nodes ?? []).map(
                    (n: any): IncompleteNode => ({
                        html: n.html ?? '',
                        target: Array.isArray(n.target)
                            ? n.target.map(String)
                            : [],
                        impact: n.impact ?? null,
                        any: mapChecks(n.any),
                        all: mapChecks(n.all),
                        none: mapChecks(n.none),
                    })
                ),
            } satisfies IncompleteItem
        }
    )

    // -- Map inapplicable --
    const inapplicable: InapplicableItem[] = (
        rawResults.inapplicable ?? []
    ).map((r: any) => {
        const criterion = extractWcagCriterion(r.tags ?? [])
        const level = extractWcagLevel(r.tags ?? [])
        const principle = mapToPrinciple(criterion)
        const category = extractCategory(r.tags ?? [])

        return {
            ruleId: r.id,
            description: r.description ?? r.help ?? '',
            helpUrl: r.helpUrl ?? '',
            wcagCriterion: criterion,
            wcagLevel: level,
            wcagPrinciple: principle,
            category,
        } satisfies InapplicableItem
    })

    // -- Test environment --
    const testEnvironment: TestEnvironment = {
        userAgent: rawResults.testEnvironment?.userAgent ?? '',
        windowWidth: rawResults.testEnvironment?.windowWidth ?? 0,
        windowHeight: rawResults.testEnvironment?.windowHeight ?? 0,
        orientationAngle: rawResults.testEnvironment?.orientationAngle ?? 0,
        orientationType: rawResults.testEnvironment?.orientationType ?? '',
    }

	// -- Severity counts --
	const criticalCount = violations.filter(
		v => v.severity === 'critical'
	).length
	const seriousCount = violations.filter(v => v.severity === 'serious').length
	const moderateCount = violations.filter(
		v => v.severity === 'moderate'
	).length
	const minorCount = violations.filter(v => v.severity === 'minor').length

	// -- Overall score --
	let score = 100
	for (const v of violations) {
		score -= SEVERITY_WEIGHT[v.severity] ?? 2
	}
    // Incomplete items reduce score at half weight
    for (const i of incomplete) {
        score -= Math.ceil((SEVERITY_WEIGHT[i.severity] ?? 2) * 0.5)
    }
	score = Math.max(0, score)

	return {
		targetUrl: rawResults.url ?? '',
		timestamp: rawResults.timestamp ?? new Date().toISOString(),
		axeCoreVersion: rawResults.axeCoreVersion ?? 'unknown',
        testEnvironment,
		overallScore: score,
		totalViolations: violations.length,
        totalIncomplete: incomplete.length,
        totalPasses: passes.length,
        totalInapplicable: inapplicable.length,
		criticalCount,
		seriousCount,
		moderateCount,
		minorCount,
		violations,
		passes,
        incomplete,
        inapplicable,
	}
}

// ===========================================================================
// Shared: build a ReportSummary from an EvaluationResult
// ===========================================================================

function buildSummary(result: EvaluationResult): ReportSummary {
	return {
		targetUrl: result.targetUrl,
		evaluationDate: result.timestamp,
		totalViolations: result.totalViolations,
        totalIncomplete: result.totalIncomplete,
        totalPasses: result.totalPasses,
        totalInapplicable: result.totalInapplicable,
		overallScore: result.overallScore,
		criticalCount: result.criticalCount,
		seriousCount: result.seriousCount,
		moderateCount: result.moderateCount,
		minorCount: result.minorCount,
		axeCoreVersion: result.axeCoreVersion,
        testEnvironment: result.testEnvironment,
	}
}

// ===========================================================================
// 2.  generateDeveloperReport
// ===========================================================================

const SEVERITY_ORDER: Record<Severity, number> = {
	critical: 0,
	serious: 1,
	moderate: 2,
	minor: 3,
}

/**
 * Extract the most informative check data from a violation node.
 * For example, color-contrast checks contain foreground/background colors and ratio.
 */
function extractCheckData(node: ViolationNode): Record<string, unknown> | undefined {
    const allChecks = [...node.any, ...node.all, ...node.none]
    for (const check of allChecks) {
        if (check.data && Object.keys(check.data).length > 0) {
            return check.data
        }
    }
    return undefined
}

/**
 * Build a reason string for an incomplete item explaining why it needs review.
 */
function buildIncompleteReason(item: IncompleteItem): string {
    if (item.nodes.length > 0) {
        const firstNode = item.nodes[0]
        const allChecks = [
            ...firstNode.any,
            ...firstNode.all,
            ...firstNode.none,
        ]
        const messaged = allChecks.find(c => c.message)
        if (messaged) return messaged.message
    }
    return `Automated testing could not determine the result. Manual review is required for: ${ item.description }`
}

/** Collect unique categories present across all result arrays. */
function getActiveCategories(result: EvaluationResult): WcagCategory[] {
    const cats = new Set<WcagCategory>()
    for (const v of result.violations) cats.add(v.category)
    for (const p of result.passes) cats.add(p.category)
    for (const i of result.incomplete) cats.add(i.category)
    for (const r of result.inapplicable) cats.add(r.category)
    return Array.from(cats).sort()
}

export function generateDeveloperReport(
	result: EvaluationResult
): DeveloperReport {
	const violations: DeveloperViolation[] = result.violations
		.map(v => ({
			ruleId: v.ruleId,
			severity: v.severity,
			description: v.description,
			wcagCriterion: v.wcagCriterion,
			wcagLevel: v.wcagLevel,
			wcagPrinciple: v.wcagPrinciple,
            category: v.category,
			helpUrl: v.helpUrl,
			elements: v.nodes.map(n => ({
				selector: n.target.join(', '),
				htmlSnippet: n.html,
				failureSummary: n.failureSummary,
                checkData: extractCheckData(n),
			})),
			remediation: getRemediation(v.ruleId),
		}))
		.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

    const incompleteItems: DeveloperIncompleteItem[] = result.incomplete
        .map(i => ({
            ruleId: i.ruleId,
            severity: i.severity,
            description: i.description,
            wcagCriterion: i.wcagCriterion,
            wcagLevel: i.wcagLevel,
            wcagPrinciple: i.wcagPrinciple,
            category: i.category,
            helpUrl: i.helpUrl,
            reason: buildIncompleteReason(i),
            elementCount: i.nodes.length,
        }))
        .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

    const activeCategories = getActiveCategories(result)

	return {
		summary: buildSummary(result),
		violations,
        incompleteItems,
		filters: {
			severity: ['critical', 'serious', 'moderate', 'minor'],
			principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'],
			level: ['A', 'AA'],
            category: activeCategories,
		},
	}
}

// ===========================================================================
// 3.  generateAuditorReport
// ===========================================================================

export function generateAuditorReport(result: EvaluationResult): AuditorReport {
    // ---- Compliance matrix ----
	const criteriaMap = new Map<
		string,
		{
			title: string
			level: WcagLevel
			principle: WcagPrinciple
            status: 'pass' | 'fail' | 'needs-review' | 'not-tested'
			violationCount: number
		}
	>()

	// Seed passes first
	for (const p of result.passes) {
		if (!criteriaMap.has(p.wcagCriterion)) {
			criteriaMap.set(p.wcagCriterion, {
				title: p.description,
				level: p.wcagLevel,
				principle: p.wcagPrinciple,
				status: 'pass',
				violationCount: 0,
			})
		}
	}

    // Overlay incomplete (needs-review) — only if not already failing
    for (const i of result.incomplete) {
        const existing = criteriaMap.get(i.wcagCriterion)
        if (existing) {
            if (existing.status === 'pass') {
                existing.status = 'needs-review'
            }
        } else {
            criteriaMap.set(i.wcagCriterion, {
                title: i.description,
                level: i.wcagLevel,
                principle: i.wcagPrinciple,
                status: 'needs-review',
                violationCount: 0,
            })
        }
    }

    // Overlay violations (overrides pass/needs-review status)
	for (const v of result.violations) {
		const existing = criteriaMap.get(v.wcagCriterion)
		if (existing) {
			existing.status = 'fail'
			existing.violationCount += 1
		} else {
			criteriaMap.set(v.wcagCriterion, {
				title: v.description,
				level: v.wcagLevel,
				principle: v.wcagPrinciple,
				status: 'fail',
				violationCount: 1,
			})
		}
	}

	const complianceMatrix: ComplianceEntry[] = Array.from(
		criteriaMap.entries()
	)
		.map(([criterion, data]) => ({
			criterion,
			title: data.title,
			level: data.level,
			principle: data.principle,
			status: data.status,
			violationCount: data.violationCount,
		}))
		.sort((a, b) =>
			a.criterion.localeCompare(b.criterion, undefined, { numeric: true })
		)

	// ---- Principle breakdown ----
	const principles: WcagPrinciple[] = [
		'Perceivable',
		'Operable',
		'Understandable',
		'Robust',
	]

	const principleBreakdown: PrincipleBreakdown[] = principles.map(
		principle => {
			const entries = complianceMatrix.filter(
				e => e.principle === principle
			)
			const total = entries.length
			const passed = entries.filter(e => e.status === 'pass').length
			const failed = entries.filter(e => e.status === 'fail').length
            const needsReview = entries.filter(
                e => e.status === 'needs-review'
            ).length
			const compliancePercentage =
				total > 0 ? Math.round((passed / total) * 100) : 100

			return {
				principle,
				totalCriteria: total,
				passedCriteria: passed,
				failedCriteria: failed,
                needsReviewCriteria: needsReview,
				compliancePercentage,
			}
		}
	)

    // ---- Category breakdown ----
    const categoryBreakdown: CategoryBreakdown[] =
        buildCategoryBreakdown(result)

	// ---- Violations (auditor-oriented) ----
	const violations: AuditorViolation[] = result.violations
		.map(v => ({
			ruleId: v.ruleId,
			severity: v.severity,
			description: v.description,
			wcagCriterion: v.wcagCriterion,
			wcagLevel: v.wcagLevel,
			wcagPrinciple: v.wcagPrinciple,
            category: v.category,
			instanceCount: v.nodes.length,
			formalDescription: buildFormalDescription(v),
		}))
		.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

    // ---- Incomplete items (auditor-oriented) ----
    const incompleteItems: AuditorIncompleteItem[] = result.incomplete
        .map(i => ({
            ruleId: i.ruleId,
            severity: i.severity,
            description: i.description,
            wcagCriterion: i.wcagCriterion,
            wcagLevel: i.wcagLevel,
            wcagPrinciple: i.wcagPrinciple,
            category: i.category,
            instanceCount: i.nodes.length,
            reason: buildIncompleteReason(i),
        }))
        .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

    const activeCategories = getActiveCategories(result)

	return {
		summary: buildSummary(result),
		complianceMatrix,
		principleBreakdown,
        categoryBreakdown,
		violations,
        incompleteItems,
        inapplicableRules: result.inapplicable,
		filters: {
			severity: ['critical', 'serious', 'moderate', 'minor'],
			principle: ['Perceivable', 'Operable', 'Understandable', 'Robust'],
			level: ['A', 'AA'],
            category: activeCategories,
		},
	}
}

/**
 * Build a breakdown of rules by axe-core category (cat.* tags).
 */
function buildCategoryBreakdown(result: EvaluationResult): CategoryBreakdown[] {
    const catMap = new Map<
        WcagCategory,
        {
            passed: Set<string>
            failed: Set<string>
            needsReview: Set<string>
            inapplicable: Set<string>
        }
    >()

    function ensure(cat: WcagCategory) {
        if (!catMap.has(cat)) {
            catMap.set(cat, {
                passed: new Set(),
                failed: new Set(),
                needsReview: new Set(),
                inapplicable: new Set(),
            })
        }
        return catMap.get(cat)!
    }

    for (const p of result.passes) ensure(p.category).passed.add(p.ruleId)
    for (const v of result.violations) ensure(v.category).failed.add(v.ruleId)
    for (const i of result.incomplete)
        ensure(i.category).needsReview.add(i.ruleId)
    for (const r of result.inapplicable)
        ensure(r.category).inapplicable.add(r.ruleId)

    return Array.from(catMap.entries())
        .map(([category, data]) => {
            const allRules = new Set([
                ...data.passed,
                ...data.failed,
                ...data.needsReview,
                ...data.inapplicable,
            ])
            return {
                category,
                label: CATEGORY_LABELS[category] ?? category,
                totalRules: allRules.size,
                passedRules: data.passed.size,
                failedRules: data.failed.size,
                needsReviewRules: data.needsReview.size,
                inapplicableRules: data.inapplicable.size,
            }
        })
        .sort(
            (a, b) =>
                b.failedRules - a.failedRules || a.label.localeCompare(b.label)
        )
}

/**
 * Produce a formal, audit-appropriate description of a violation.
 */
function buildFormalDescription(v: ViolationItem): string {
    const levelStr =
        v.wcagLevel === 'best-practice'
            ? 'Best Practice'
            : `WCAG 2.2 Level ${ v.wcagLevel }`
    const criterionStr =
        v.wcagLevel === 'best-practice'
            ? ''
            : `, Success Criterion ${ v.wcagCriterion }`
	const principleStr = v.wcagPrinciple
	const instanceStr =
		v.nodes.length === 1 ? '1 instance' : `${v.nodes.length} instances`

	return (
        `Non-conformance with ${ levelStr }${ criterionStr } ` +
		`(${principleStr}). ${v.description}. ` +
		`${instanceStr} identified with ${v.severity} impact.`
	)
}

// ===========================================================================
// 4.  generateEndUserReport
// ===========================================================================

export function generateEndUserReport(result: EvaluationResult): EndUserReport {
	const score = result.overallScore

	// Score label and colour
	let scoreLabel: string
	let scoreColor: string
	if (score >= 90) {
		scoreLabel = 'Excellent'
        scoreColor = '#22c55e'
	} else if (score >= 75) {
		scoreLabel = 'Good'
        scoreColor = '#84cc16'
	} else if (score >= 50) {
		scoreLabel = 'Needs Improvement'
        scoreColor = '#f59e0b'
	} else if (score >= 25) {
		scoreLabel = 'Poor'
        scoreColor = '#f97316'
	} else {
		scoreLabel = 'Critical Issues'
        scoreColor = '#ef4444'
	}

	// ---- Categories (one per principle) ----
	const principleInfo: {
		principle: WcagPrinciple
		name: string
		icon: string
		emptyDescription: string
	}[] = [
		{
			principle: 'Perceivable',
			name: 'Content Visibility',
			icon: 'eye',
			emptyDescription:
				'All content on this page can be perceived by everyone, including people using screen readers.',
		},
		{
			principle: 'Operable',
			name: 'Navigation & Interaction',
			icon: 'mouse-pointer',
			emptyDescription:
				'All interactive elements on this page work well for everyone, including keyboard-only users.',
		},
		{
			principle: 'Understandable',
			name: 'Clarity & Readability',
			icon: 'book-open',
			emptyDescription:
				'The content and forms on this page are clear and easy to understand.',
		},
		{
			principle: 'Robust',
			name: 'Technical Compatibility',
			icon: 'shield',
			emptyDescription:
				'This page works well with assistive technologies like screen readers.',
		},
	]

	const categories: EndUserCategory[] = principleInfo.map(info => {
		const relViolations = result.violations.filter(
			v => v.wcagPrinciple === info.principle
		)
        const relIncomplete = result.incomplete.filter(
            i => i.wcagPrinciple === info.principle
        )

		const issueCount = relViolations.length
        const needsReviewCount = relIncomplete.length

		// Per-category score: deduct from 100
		let catScore = 100
		for (const v of relViolations) {
			catScore -= SEVERITY_WEIGHT[v.severity] ?? 2
		}
        for (const i of relIncomplete) {
            catScore -= Math.ceil((SEVERITY_WEIGHT[i.severity] ?? 2) * 0.5)
        }
		catScore = Math.max(0, catScore)

		let description: string
        if (issueCount === 0 && needsReviewCount === 0) {
			description = info.emptyDescription
        } else {
			const sorted = [...relViolations].sort(
				(a, b) =>
					SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
			)
			const plainParts = sorted
				.slice(0, 3)
				.map(v => getPlainLanguage(v.ruleId))

            if (needsReviewCount > 0) {
                plainParts.push(
                    `${ needsReviewCount } additional ${ needsReviewCount === 1 ? 'area needs' : 'areas need' } manual review.`
                )
            }

			description = plainParts.join(' ')
		}

		return {
			name: info.name,
			icon: info.icon,
			score: catScore,
			description,
			issueCount,
            needsReviewCount,
		}
	})

	// ---- Priority recommendations ----
	const allSorted = [...result.violations].sort(
		(a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
	)

	const seen = new Set<string>()
	const priorities: string[] = []
	for (const v of allSorted) {
		if (seen.has(v.ruleId)) continue
		seen.add(v.ruleId)
		priorities.push(getPlainLanguage(v.ruleId))
		if (priorities.length >= 5) break
	}

	return {
		summary: buildSummary(result),
		score,
		scoreLabel,
		scoreColor,
		categories,
		priorities,
        needsReviewCount: result.totalIncomplete,
	}
}

// ===========================================================================
// Remediation guidance (developer-facing)
// ===========================================================================

const REMEDIATION_MAP: Record<string, string> = {
    // ── WCAG 2.0 A / AA ──
	'image-alt':
		'Add an alt attribute to all <img> elements that describes the image content. For decorative images use alt="".',
	'color-contrast':
		'Ensure text has a sufficient contrast ratio against its background. WCAG requires at least 4.5:1 for normal text and 3:1 for large text.',
	label: "Add a <label> element associated with each form input using the 'for' attribute matching the input's 'id', or wrap the input inside a <label>.",
	'link-name':
		'Ensure all links have descriptive text content, an aria-label, or an aria-labelledby attribute so users know where the link goes.',
	'heading-order':
		'Use heading levels (h1-h6) in sequential, descending order without skipping levels. Every page should start with an h1.',
	'button-name':
		'Ensure all <button> elements have discernible text, either as text content, an aria-label, or aria-labelledby attribute.',
	'html-has-lang':
		'Add a lang attribute to the <html> element (e.g., <html lang="en">) to specify the document language.',
	'html-lang-valid':
		"Ensure the lang attribute on the <html> element uses a valid BCP 47 language tag (e.g., 'en', 'fr', 'es').",
	'document-title':
		'Add a descriptive <title> element inside the <head> of the document to help users identify the page.',
	'meta-viewport':
		'Do not use user-scalable=no in the <meta name="viewport"> tag, and ensure maximum-scale is not set below 2. Users must be able to zoom.',
	list: 'Ensure that <li> elements are contained within a <ul>, <ol>, or <menu> parent element.',
	listitem:
		'Ensure list items (<li>) are used inside proper list containers (<ul>, <ol>, or <menu>).',
	region: 'Ensure all page content is contained within landmark regions (e.g., <main>, <nav>, <header>, <footer>, or ARIA landmarks).',
	bypass: 'Provide a "skip to main content" link as the first focusable element on the page so keyboard users can bypass repetitive navigation.',
	'aria-allowed-attr':
		"Ensure ARIA attributes used on an element are appropriate for the element's role. Remove any ARIA attributes that are not valid for the assigned role.",
	'aria-valid-attr-value':
		"Ensure all ARIA attribute values are valid. For example, aria-hidden should be 'true' or 'false', not an empty string.",
	'aria-valid-attr':
		'Ensure all ARIA attributes are valid and correctly spelled. Remove any unsupported or misspelt ARIA attributes.',
	'aria-required-attr':
		"Add all required ARIA attributes for the element's role. For example, role='checkbox' requires aria-checked.",
	'aria-roles':
		'Ensure all role attribute values are valid ARIA roles. Remove or correct any misspelt or non-existent role values.',
	'aria-hidden-focus':
		"Do not apply aria-hidden='true' to elements that are focusable. Either remove aria-hidden or make the element non-focusable.",
	tabindex:
		"Avoid using tabindex values greater than 0. Use tabindex='0' to add elements to the natural tab order or tabindex='-1' for programmatic focus.",
	'input-image-alt':
		'Add an alt attribute to all <input type="image"> elements that describes the button action.',
	'select-name':
		'Ensure all <select> elements have an associated <label> or an aria-label attribute.',
	'frame-title':
		'Add a title attribute to all <iframe> and <frame> elements that describes the embedded content.',
	'td-headers-attr':
		'Ensure td elements in tables with headers use valid headers attributes that reference existing th element ids.',
	'th-has-data-cells':
		'Ensure each <th> element in a data table has associated data cells to maintain proper table structure.',
	'valid-lang':
		'Ensure lang attributes on elements within the page use valid BCP 47 language tags.',
	'empty-heading':
		'Ensure heading elements (h1-h6) contain visible text or an accessible name. Empty headings confuse screen reader users.',
	'form-field-multiple-labels':
		'Ensure each form field has only one associated <label>. Multiple labels can confuse assistive technologies.',

    // ── WCAG 2.1 additions ──
    'autocomplete-valid':
        'Ensure the autocomplete attribute value on form fields is a valid token from the HTML specification (e.g., "name", "email", "tel").',
    'avoid-inline-spacing':
        'Do not use inline !important styles on text spacing properties (line-height, letter-spacing, word-spacing). Allow users to override them.',
    'input-button-name':
        'Ensure <input type="button"> elements have discernible text via value, aria-label, or aria-labelledby.',

    // ── WCAG 2.2 additions ──
    'target-size':
        'Ensure interactive targets (buttons, links) are at least 24×24 CSS pixels or have sufficient spacing around them.',

    // ── Best-Practice rules ──
    'landmark-banner-is-top-level':
        'The <header> (banner) landmark should be a top-level element, not nested inside another landmark.',
    'landmark-contentinfo-is-top-level':
        'The <footer> (contentinfo) landmark should be a top-level element, not nested inside another landmark.',
    'landmark-main-is-top-level':
        'The <main> landmark should be a top-level element, not nested inside another sectioning element.',
    'landmark-no-duplicate-banner':
        'Ensure the page has at most one <header> (banner) landmark.',
    'landmark-no-duplicate-contentinfo':
        'Ensure the page has at most one <footer> (contentinfo) landmark.',
    'landmark-one-main':
        'Ensure the page has exactly one <main> landmark so assistive technology users can navigate to primary content.',
    'landmark-unique':
        'Ensure all landmark regions have unique labels when multiple landmarks of the same type exist.',
    'page-has-heading-one':
        'Ensure the page has at least one <h1> heading so assistive technology users can quickly identify the primary content.',
    accesskeys:
        'Ensure accesskey attribute values are unique across the page to avoid conflicting keyboard shortcuts.',
    'aria-allowed-role':
        'Ensure elements only use ARIA roles that are appropriate for the element type.',
    'p-as-heading':
        'Do not use styled <p> elements as headings. Use proper heading elements (h1-h6) instead for correct semantic structure.',
    'empty-table-header':
        'Ensure all <th> elements contain visible text to properly label table columns/rows.',
    'scope-attr-valid':
        'Ensure the scope attribute on <th> elements uses valid values: "row", "col", "rowgroup", or "colgroup".',
    'table-duplicate-name':
        'Ensure tables do not have both a caption and a summary/aria-label with the same text.',
    'table-fake-caption':
        'Do not use a <td> element spanning all columns as a table caption. Use the <caption> element instead.',
    'no-autoplay-audio':
        'Ensure <audio> and <video> elements with autoplay do not play for more than 3 seconds, or provide controls to stop them.',
    'svg-img-alt':
        'Ensure <svg> elements with role="img" have an accessible name via <title>, aria-label, or aria-labelledby.',
    'meta-refresh':
        'Do not use <meta http-equiv="refresh"> to redirect or reload the page. This can disorient users.',
}

/**
 * Return developer-oriented remediation guidance for a given axe-core rule ID.
 */
export function getRemediation(ruleId: string): string {
	return (
		REMEDIATION_MAP[ruleId] ??
		'Review the element and ensure it meets the WCAG requirement. ' +
			'Refer to the help URL for detailed guidance on fixing this issue.'
	)
}

// ===========================================================================
// Plain-language descriptions (end-user-facing)
// ===========================================================================

const PLAIN_LANGUAGE_MAP: Record<string, string> = {
    // ── WCAG 2.0 A / AA ──
	'image-alt':
		"Some images on this page don't have text descriptions, making them invisible to screen readers.",
	'color-contrast':
		'Some text on this page may be hard to read due to low color contrast.',
	label: 'Some form fields are missing labels, which makes it hard to know what information to enter.',
	'link-name':
		"Some links on this page don't have descriptive text, making it hard to know where they lead.",
	'heading-order':
		'The headings on this page are not in a logical order, which can make it harder to navigate.',
	'button-name':
		"Some buttons on this page don't have labels, so it's unclear what they do.",
	'html-has-lang':
		"The page doesn't specify its language, which can cause screen readers to mispronounce content.",
	'html-lang-valid':
		"The page's language setting is invalid, which may confuse screen readers.",
	'document-title':
		'This page is missing a title, making it harder to identify in browser tabs and bookmarks.',
	'meta-viewport':
		'This page prevents users from zooming in, which is a problem for people with low vision.',
	list: 'Some lists on this page are not structured correctly, which can confuse screen readers.',
	listitem:
		'Some list items on this page are not inside proper list containers.',
	region: 'Some content on this page is not inside clearly defined sections, making navigation harder.',
	bypass: "This page is missing a 'skip to content' link, making keyboard users tab through the entire navigation every time.",
	'aria-allowed-attr':
		'Some interactive elements use incorrect accessibility attributes, which may confuse assistive technologies.',
	'aria-valid-attr-value':
		'Some accessibility settings on this page have incorrect values, which may cause screen readers to behave unexpectedly.',
	'aria-valid-attr':
		'Some elements use invalid accessibility attributes that assistive technologies cannot understand.',
	'aria-required-attr':
		'Some interactive elements are missing required accessibility attributes needed by screen readers.',
	'aria-roles':
		'Some elements have invalid roles assigned, which can confuse assistive technologies.',
	'aria-hidden-focus':
		'Some hidden elements can still receive keyboard focus, which is confusing for keyboard users.',
	tabindex:
		'The keyboard navigation order on this page may not follow the expected visual order.',
	'input-image-alt':
		"Some image buttons on this page don't have text descriptions.",
	'select-name':
		'Some dropdown menus are missing labels, making it hard to know what to select.',
	'frame-title':
		'Some embedded content on this page is missing a description.',
	'empty-heading':
		'Some headings on this page are empty, which can confuse people using screen readers to navigate.',
	'form-field-multiple-labels':
		'Some form fields have multiple labels, which may confuse assistive technologies.',

    // ── WCAG 2.1 additions ──
    'autocomplete-valid':
        'Some form fields have incorrect autocomplete settings, which may prevent your browser from helping you fill them in.',
    'avoid-inline-spacing':
        'Some text styling on this page cannot be customised, which may be a problem for people who need larger or more spaced-out text.',
    'input-button-name':
        "Some buttons on this page don't have a clear label, so it's hard to know what they do.",

    // ── WCAG 2.2 additions ──
    'target-size':
        'Some buttons and links on this page are too small to tap or click easily, especially on mobile.',

    // ── Best-Practice rules ──
    'landmark-banner-is-top-level':
        'The page header is nested inside another section, which can confuse screen reader navigation.',
    'landmark-contentinfo-is-top-level':
        'The page footer is nested inside another section, which can confuse screen reader navigation.',
    'landmark-main-is-top-level':
        'The main content area is nested inside another section, making it harder for screen readers to find.',
    'landmark-no-duplicate-banner':
        'This page has more than one header section, which may confuse assistive technologies.',
    'landmark-no-duplicate-contentinfo':
        'This page has more than one footer section, which may confuse assistive technologies.',
    'landmark-one-main':
        "This page doesn't have a clearly marked main content area, making it harder for screen reader users to find the primary content.",
    'landmark-unique':
        'Some page sections have the same label, making it hard for screen reader users to tell them apart.',
    'page-has-heading-one':
        'This page is missing a main heading, which makes it harder to understand the page topic.',
    accesskeys:
        'Some keyboard shortcuts on this page conflict with each other, which may cause unexpected behaviour.',
    'aria-allowed-role':
        'Some elements on this page have roles that do not match what they actually do.',
    'p-as-heading':
        'Some text that looks like a heading is not coded as one, so screen readers may miss it.',
    'empty-table-header':
        'Some table headers are empty, making the table hard to understand with a screen reader.',
    'scope-attr-valid':
        'Some table headers have incorrect settings, which may confuse screen readers when reading the table.',
    'table-duplicate-name':
        'A table has the same name repeated in different places, which may confuse assistive technologies.',
    'table-fake-caption':
        'A table uses a fake caption instead of a proper one, which may not be read correctly by screen readers.',
    'no-autoplay-audio':
        'This page plays audio or video automatically, which can be disorienting and hard to stop for some users.',
    'svg-img-alt':
        "Some graphics on this page don't have text descriptions for screen reader users.",
    'meta-refresh':
        'This page automatically refreshes or redirects, which can be confusing and disorienting.',
}

/**
 * Return end-user-friendly, plain-language description for a given axe-core rule ID.
 */
export function getPlainLanguage(ruleId: string): string {
	return (
		PLAIN_LANGUAGE_MAP[ruleId] ??
		'An accessibility issue was found that may affect some users of this page.'
	)
}
