import { useEffect } from "react";
import { sound } from "../utils/audio.js";

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "alert";
}

interface BroadcastToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function BroadcastToast({ toast, onDismiss }: BroadcastToastProps) {
  useEffect(() => {
    if (!toast) return;

    if (toast.type === "alert") {
      sound.playAlert();
    } else {
      sound.playSuccess();
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      className="fixed top-16 sm:top-20 inset-x-4 max-w-md mx-auto z-50 pointer-events-auto animate-slideDown"
    >
      <div className="relative rounded-2xl bg-ink-900/95 backdrop-blur-xl border border-gold-400/50 p-4 shadow-2xl shadow-gold-400/20 flex items-start gap-3 text-left">
        <div className="p-2 rounded-xl bg-gold-400/20 text-gold-400 text-lg flex-shrink-0 animate-pulse">
          📢
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-royal-500/30 text-royal-300 border border-royal-500/40">
              CAMPUS BROADCAST
            </span>
            <span className="text-xs font-bold text-paper-50 truncate">
              {toast.title}
            </span>
          </div>
          <p className="text-xs text-paper-50/80 leading-relaxed font-body">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss Notification"
          className="text-paper-50/50 hover:text-paper-50 text-sm p-1 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
