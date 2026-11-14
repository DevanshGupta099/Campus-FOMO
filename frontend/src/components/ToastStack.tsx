import React from "react";
import { AlertTriangle, BellRing, CheckCircle2, Info, X } from "lucide-react";

export interface ToastNotice {
  id: string;
  kind: "success" | "warning" | "error" | "broadcast";
  title: string;
  detail?: string;
}

export const ToastStack: React.FC<{
  toasts: ToastNotice[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-16 right-4 z-50 flex w-[min(92vw,390px)] flex-col gap-2.5 lg:bottom-5 lg:right-5"
    >
      {toasts.map((t) => {
        const styles =
          t.kind === "success"
            ? {
                border: "border-pine/45 bg-paper-elevated text-bone",
                badge: "text-pine bg-pine-soft",
                Icon: CheckCircle2,
              }
            : t.kind === "broadcast"
              ? {
                  border: "border-brass bg-obsidian text-bone",
                  badge: "text-brass-light bg-obsidian-elevated",
                  Icon: BellRing,
                }
              : t.kind === "warning"
                ? {
                    border: "border-ochre/45 bg-paper-elevated text-bone",
                    badge: "text-ochre bg-ochre-soft",
                    Icon: AlertTriangle,
                  }
                : {
                    border: "border-terracotta/55 bg-paper-elevated text-bone",
                    badge: "text-terracotta bg-terracotta-soft",
                    Icon: Info,
                  };

        const Icon = styles.Icon;

        return (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 shadow-anchor backdrop-blur-md ${styles.border}`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${styles.badge}`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-bone">
                {t.title}
              </p>
              {t.detail && (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
                  {t.detail}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-ink-secondary transition hover:text-bone"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
