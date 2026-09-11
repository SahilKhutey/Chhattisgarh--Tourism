export interface AccessibilityIssue {
  field_key: string | null;
  code: string;
  severity: "BLOCKER" | "WARNING" | string;
  message: string;
  remediation: string | null;
}

export interface AccessibilityAudit {
  id?: number;
  content_entry_id: string;
  locale_code: string;
  score: number;
  status: "PASS" | "FAIL" | string;
  issues: AccessibilityIssue[];
  created_at?: string;
}

export interface AccessibilityAuditSummary {
  total: number;
  blockers: number;
  average_score: number;
  items: Array<{
    id: number;
    content_entry_id: string;
    locale_code: string;
    score: number;
    status: string;
    created_at: string | null;
    issue_count: number;
  }>;
}
