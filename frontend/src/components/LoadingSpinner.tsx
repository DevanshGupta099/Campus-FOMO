interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  label = "LOADING CAMPUS FOMO...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-2",
    lg: "w-14 h-14 border-3",
  }[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-20 space-y-3 text-center"
    >
      <div
        className={`${sizeClasses} border-violet-500 border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      {label && (
        <p className="text-violet-300 text-xs font-mono tracking-widest uppercase">
          {label}
        </p>
      )}
    </div>
  );
}
