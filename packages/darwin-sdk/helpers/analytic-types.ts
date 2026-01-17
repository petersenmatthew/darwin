export type AnalyticsEvent = Record<string, any>; // can be anything (lenient)

export interface AnalyticsSnapshot {
  events: AnalyticsEvent[];
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface ProductIssue {
  id: string;
  severity: Severity;
  evidence: string[];
  hypothesis: string;
  recommendedAction: string;
  affectedArea: string;
}

export interface AnalysisResult {
  summary: string;
  mainProblems: ProductIssue[];
  confidence: number;
}