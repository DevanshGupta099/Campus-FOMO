import React, { useEffect, useMemo, useState } from "react";
import { FileLock2, Search, ShieldCheck } from "lucide-react";
import { apiClient } from "../../api/client";
import type { AuditLogItem } from "../../api/types";
import { useWorkspace } from "../../components/WorkspaceShell";
import { formatIstDateTime } from "../../utils/format";

export const AuditLogsView: React.FC = () => {
  const { streamRevision } = useWorkspace();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    apiClient
      .getAuditLogs()
      .then((res) => {
        if (active) setLogs(res.auditLogs);
      })
      .catch(() => {
        if (active) setLogs([]);
      });
    return () => {
      active = false;
    };
  }, [streamRevision]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        (l.details || "").toLowerCase().includes(q),
    );
  }, [logs, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Append-Only Security &amp; Governance Trail
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            Immutable Audit Ledger
          </h1>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-md border border-pine/40 bg-pine-soft px-3 py-1.5 font-mono text-xs font-semibold text-pine">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{filtered.length} Tamper-Evident Entries</span>
        </span>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by action (EVENT_APPROVED, USER_LOGIN), actor, or target..."
          className="w-full rounded-md border border-rule-strong bg-paper-elevated py-2 pl-9 pr-3.5 text-xs text-ink"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-rule-strong bg-paper-elevated shadow-editorial">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-rule bg-paper font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Timestamp (IST)</th>
                <th className="px-4 py-3">Action Code</th>
                <th className="px-4 py-3">Actor Subject</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {filtered.map((item, idx) => (
                <tr key={item.id || `${item.timestamp}-${idx}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-ink-secondary">
                    {formatIstDateTime(item.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded bg-obsidian px-2 py-0.5 font-mono text-[10px] font-semibold text-brass-light">
                      <FileLock2 className="h-3 w-3" />
                      <span>{item.action}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink">{item.actor}</td>
                  <td className="px-4 py-3 font-mono text-ink-secondary">
                    {item.target}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">
                    {item.details || "Verified"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
