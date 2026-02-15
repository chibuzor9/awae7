// ==========================================
// Core Types for AWAE7
// ==========================================

// ---------- User & Auth ----------
export type UserRole = 'developer' | 'auditor' | 'end-user'

export interface AppUser {
	id: string
	email: string
	username: string
	preferredRole: UserRole
}

// ---------- Evaluation ----------
export type Severity = 'critical' | 'serious' | 'moderate' | 'minor'
export type WcagPrinciple =
	| 'Perceivable'
	| 'Operable'
	| 'Understandable'
	| 'Robust'
export type WcagLevel = 'A' | 'AA' | 'AAA' | 'best-practice'

/** axe-core `cat.*` tag categories */
export type WcagCategory =
	| 'aria'
	| 'color'
	| 'forms'
	| 'keyboard'
	| 'language'
	| 'name-role-value'
	| 'parsing'
	| 'semantics'
	| 'sensory-and-visual-cues'
	| 'structure'
	| 'tables'
	| 'text-alternatives'
	| 'time-and-media'
	| 'other'

export interface EvaluationRequest {
	url: string
}

// ---------- axe-core check-level data ----------

/** A reference to a related DOM node returned by an axe check. */
export interface RelatedNode {
	html: string
	target: string[]
}

/** Result of an individual axe-core check (within any / all / none arrays). */
export interface CheckResult {
	id: string
	impact: string | null
	message: string
	data: Record<string, unknown> | null
	relatedNodes: RelatedNode[]
}

// ---------- Test environment ----------

/** Browser / OS metadata captured by axe-core at evaluation time. */
export interface TestEnvironment {
	userAgent: string
	windowWidth: number
	windowHeight: number
	orientationAngle: number
	orientationType: string
}

// ---------- Evaluation result ----------

export interface EvaluationResult {
	id?: string
	targetUrl: string
	timestamp: string
	axeCoreVersion: string
	testEnvironment: TestEnvironment
	fullSourceHtml?: string
	overallScore: number
	totalViolations: number
	totalIncomplete: number
	totalPasses: number
	totalInapplicable: number
	criticalCount: number
	seriousCount: number
	moderateCount: number
	minorCount: number
	violations: ViolationItem[]
	passes: PassItem[]
	incomplete: IncompleteItem[]
	inapplicable: InapplicableItem[]
}

export interface ViolationItem {
	id?: string
	ruleId: string
	description: string
	helpUrl: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	severity: Severity
	category: WcagCategory
	nodes: ViolationNode[]
}

export interface ViolationNode {
	html: string
	target: string[]
	sourceContext?: string[]
	failureSummary: string
	impact: string | null
	any: CheckResult[]
	all: CheckResult[]
	none: CheckResult[]
}

export interface PassItem {
	ruleId: string
	description: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	category: WcagCategory
}

// ---------- Incomplete / Inapplicable ----------

export interface IncompleteItem {
	ruleId: string
	description: string
	helpUrl: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	severity: Severity
	category: WcagCategory
	nodes: IncompleteNode[]
}

export interface IncompleteNode {
	html: string
	target: string[]
	sourceContext?: string[]
	impact: string | null
	any: CheckResult[]
	all: CheckResult[]
	none: CheckResult[]
}

export interface InapplicableItem {
	ruleId: string
	description: string
	helpUrl: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	category: WcagCategory
}

// ---------- Report Types ----------
export interface DeveloperReport {
	summary: ReportSummary
	fullSourceHtml?: string
	violations: DeveloperViolation[]
	incompleteItems: DeveloperIncompleteItem[]
	filters: ReportFilters
}

export interface DeveloperViolation {
	ruleId: string
	severity: Severity
	description: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	category: WcagCategory
	helpUrl: string
	elements: {
		selector: string
		htmlSnippet: string
		sourceContext?: string[]
		failureSummary: string
		checkData?: Record<string, unknown>
	}[]
	remediation: string
}

export interface DeveloperIncompleteItem {
	ruleId: string
	severity: Severity
	description: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	category: WcagCategory
	helpUrl: string
	reason: string
	elementCount: number
}

export interface AuditorReport {
	summary: ReportSummary
	complianceMatrix: ComplianceEntry[]
	principleBreakdown: PrincipleBreakdown[]
	categoryBreakdown: CategoryBreakdown[]
	violations: AuditorViolation[]
	incompleteItems: AuditorIncompleteItem[]
	inapplicableRules: InapplicableItem[]
	filters: ReportFilters
}

export interface ComplianceEntry {
	criterion: string
	title: string
	level: WcagLevel
	principle: WcagPrinciple
	status: 'pass' | 'fail' | 'needs-review' | 'not-tested'
	violationCount: number
}

export interface PrincipleBreakdown {
	principle: WcagPrinciple
	totalCriteria: number
	passedCriteria: number
	failedCriteria: number
	needsReviewCriteria: number
	compliancePercentage: number
}

export interface CategoryBreakdown {
	category: WcagCategory
	label: string
	totalRules: number
	passedRules: number
	failedRules: number
	needsReviewRules: number
	inapplicableRules: number
}

export interface AuditorViolation {
	ruleId: string
	severity: Severity
	description: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	category: WcagCategory
	instanceCount: number
	formalDescription: string
}

export interface AuditorIncompleteItem {
	ruleId: string
	severity: Severity
	description: string
	wcagCriterion: string
	wcagLevel: WcagLevel
	wcagPrinciple: WcagPrinciple
	category: WcagCategory
	instanceCount: number
	reason: string
}

export interface EndUserReport {
	summary: ReportSummary
	score: number
	scoreLabel: string
	scoreColor: string
	categories: EndUserCategory[]
	priorities: string[]
	needsReviewCount: number
}

export interface EndUserCategory {
	name: string
	icon: string
	score: number
	description: string
	issueCount: number
	needsReviewCount: number
}

export interface ReportSummary {
	targetUrl: string
	evaluationDate: string
	totalViolations: number
	totalIncomplete: number
	totalPasses: number
	totalInapplicable: number
	overallScore: number
	criticalCount: number
	seriousCount: number
	moderateCount: number
	minorCount: number
	axeCoreVersion: string
	testEnvironment: TestEnvironment
}

export interface ReportFilters {
	severity: Severity[]
	principle: WcagPrinciple[]
	level: WcagLevel[]
	category: WcagCategory[]
}

// ---------- WCAG Card ----------
export interface WcagCard {
	criterionId: string
	criterionNumber: string
	title: string
	principle: WcagPrinciple
	level: WcagLevel
	description: string
	url: string
	explanation?: string
	implementationExamples?: {
		good: string
		bad: string
	}
	commonViolations?: string[]
	remediationStrategies?: string[]
}

// ---------- History ----------
export interface EvaluationHistoryItem {
	id: string
	targetUrl: string
	timestamp: string
	overallScore: number
	totalViolations: number
	criticalCount: number
	seriousCount: number
}
