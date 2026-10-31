import { motion, AnimatePresence } from "framer-motion";
import type { ToastMessage } from "./ToastTypes.js";

export type { ToastMessage };

interface BroadcastToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

const icons: Record<string, string> = {
  alert: "📢",
  success: "🎉",
  info: "ℹ️",
  warning: "⚠️",
};

const colors: Record<string, string> = {
  alert: "var(--violet)",
  success: "var(--mint)",
  info: "var(--sky)",
  warning: "var(--amber)",
};

export function BroadcastToast({ toast, onDismiss }: BroadcastToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 9999,
        maxWidth: "360px",
        width: "100%",
      }}
      role="region"
      aria-live="assertive"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xl)",
              padding: "1rem 1.25rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              borderLeft: `3px solid ${colors[toast.type] || colors.info}`,
            }}
            role="alert"
          >
            <span
              style={{ fontSize: "1.25rem", flexShrink: 0, lineHeight: 1.4 }}
            >
              {icons[toast.type] || icons.info}
            </span>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--text-primary)",
                  marginBottom: "0.125rem",
                }}
              >
                {toast.title}
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={onDismiss}
              aria-label="Dismiss notification"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0.125rem",
                fontSize: "1rem",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
