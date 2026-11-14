import { randomUUID } from "node:crypto";

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  timestamp: string;
}

class AuditService {
  private entries: AuditEntry[] = [
    {
      id: "aud-init-001",
      action: "REALM_PBAC_SYNCED",
      actor: "system:access-studio",
      target: "campus-fomo:central-campus",
      details:
        "Synchronized 44 canonical PBAC permissions across 8 institutional bundles for CHRIST University Central Campus.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "aud-init-002",
      action: "FACULTY_ENDORSED",
      actor: "01927500-0005-7000-8000-000000000005",
      target: "evt-pending-dean",
      details:
        "Department of Computer Science endorsed CHRIST National Model United Nations (MUN) and forwarded to Deanery.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "aud-init-003",
      action: "DEAN_BUDGET_CLEARED",
      actor: "01927500-0006-7000-8000-000000000006",
      target: "evt-hackathon-100",
      details:
        "Cleared INR 45,000 budget and Main Auditorium allocation for Inter-College Hackathon 2026.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  record(params: {
    action: string;
    actor: string;
    target: string;
    details?: string;
  }): AuditEntry {
    const entry: AuditEntry = {
      id: `aud-${randomUUID().slice(0, 8)}`,
      action: params.action,
      actor: params.actor,
      target: params.target,
      details: params.details || "",
      timestamp: new Date().toISOString(),
    };
    this.entries.unshift(entry);
    if (this.entries.length > 500) {
      this.entries.pop();
    }
    return entry;
  }

  list(): AuditEntry[] {
    return [...this.entries];
  }
}

export const auditService = new AuditService();
