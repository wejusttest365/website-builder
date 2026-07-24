import type { ReactNode } from "react";

interface CenteredLoaderProps {
  message?: string;
  details?: ReactNode;
  className?: string;
}

export function CenteredLoader({
  message = "Loading — please hold on",
  details,
  className = "",
}: CenteredLoaderProps) {
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm ${className}`}>
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border/70 bg-white/95 p-6 shadow-lg shadow-slate-200/60 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary" aria-hidden="true" />
        <div className="text-sm font-medium text-foreground">{message}</div>
        {details ? <div className="text-xs text-muted-foreground">{details}</div> : null}
      </div>
    </div>
  );
}
