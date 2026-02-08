// ==========================================
// Core Types for AWAE7
// ==========================================

// ---------- User & Auth ----------
export type UserRole = "developer" | "auditor" | "end-user";

export interface AppUser {
  id: string;
  email: string;
  username: string;
  preferredRole: UserRole;
}

// ---------- Evaluation ----------
export type Severity = "critical" | "serious" | "moderate" | "minor";
export type WcagPrinciple = "Perceivable" | "Operable" | "Understandable" | "Robust";
export type WcagLevel = "A" | "AA";

export interface EvaluationRequest {
  url: string;
}

export interface EvaluationResult {
  id?: string;
  targetUrl: string;
  timestamp: string;
  axeCoreVersion: string;
  overallScore: number;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  violations: ViolationItem[];
  passes: PassItem[];
}

export interface ViolationItem {
  id?: string;
  ruleId: string;
  description: string;
  helpUrl: string;
  wcagCriterion: string;
  wcagLevel: WcagLevel;
  wcagPrinciple: WcagPrinciple;
  severity: Severity;
  nodes: ViolationNode[];
}

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface PassItem {
  ruleId: string;
  description: string;
  wcagCriterion: string;
  wcagLevel: WcagLevel;
  wcagPrinciple: WcagPrinciple;
}

// ---------- Report Types ----------
export interface DeveloperReport {
  summary: ReportSummary;
  violations: DeveloperViolation[];
  filters: ReportFilters;
}

export interface DeveloperViolation {
  ruleId: string;
  severity: Severity;
  description: string;
  wcagCriterion: string;
  wcagLevel: WcagLevel;
  wcagPrinciple: WcagPrinciple;
  helpUrl: string;
  elements: {
    selector: string;
    htmlSnippet: string;
    failureSummary: string;
  }[];
  remediation: string;
}

export interface AuditorReport {
  summary: ReportSummary;
  complianceMatrix: ComplianceEntry[];
  principleBreakdown: PrincipleBreakdown[];
  violations: AuditorViolation[];
  filters: ReportFilters;
}

export interface ComplianceEntry {
  criterion: string;
  title: string;
  level: WcagLevel;
  principle: WcagPrinciple;
  status: "pass" | "fail" | "not-tested";
  violationCount: number;
}

export interface PrincipleBreakdown {
  principle: WcagPrinciple;
  totalCriteria: number;
  passedCriteria: number;
  failedCriteria: number;
  compliancePercentage: number;
}

export interface AuditorViolation {
  ruleId: string;
  severity: Severity;
  description: string;
  wcagCriterion: string;
  wcagLevel: WcagLevel;
  wcagPrinciple: WcagPrinciple;
  instanceCount: number;
  formalDescription: string;
}

export interface EndUserReport {
  summary: ReportSummary;
  score: number;
  scoreLabel: string;
  scoreColor: string;
  categories: EndUserCategory[];
  priorities: string[];
}

export interface EndUserCategory {
  name: string;
  icon: string;
  score: number;
  description: string;
  issueCount: number;
}

export interface ReportSummary {
  targetUrl: string;
  evaluationDate: string;
  totalViolations: number;
  overallScore: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  axeCoreVersion: string;
}

export interface ReportFilters {
  severity: Severity[];
  principle: WcagPrinciple[];
  level: WcagLevel[];
}

// ---------- WCAG Card ----------
export interface WcagCard {
  criterionId: string;
  criterionNumber: string;
  title: string;
  principle: WcagPrinciple;
  level: WcagLevel;
  description: string;
  explanation: string;
  implementationExamples: {
    good: string;
    bad: string;
  };
  commonViolations: string[];
  remediationStrategies: string[];
}

// ---------- History ----------
export interface EvaluationHistoryItem {
  id: string;
  targetUrl: string;
  timestamp: string;
  overallScore: number;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
}
