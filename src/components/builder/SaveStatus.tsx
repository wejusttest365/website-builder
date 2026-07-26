import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";

export type SaveStatusState = "idle" | "saving" | "saved" | "failed";

export function SaveStatus({
  status,
  errorMessage,
  onRetry,
}: {
  status: SaveStatusState;
  errorMessage?: string | null;
  onRetry?: () => void;
}) {
  const showRetry = status === "failed" && typeof onRetry === "function";

  const statusLabel =
    status === "saving"
      ? "Saving..."
      : status === "saved"
      ? "Saved"
      : status === "failed"
      ? "Save failed"
      : "All changes saved";

  const statusIcon =
    status === "saving" ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500" />
    ) : status === "saved" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
    ) : status === "failed" ? (
      <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
    ) : (
      <Circle className="h-3.5 w-3.5 text-slate-400" />
    );

  return (
    <div className="flex min-w-[170px] max-w-[260px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm transition-colors duration-150 whitespace-nowrap">
      <span className="flex items-center justify-center">{statusIcon}</span>
      <div className="min-w-0 truncate">
        <div className="text-slate-900">{statusLabel}</div>
        {status === "saved" ? (
          <div className="text-[11px] text-slate-500">All changes saved</div>
        ) : null}
      </div>
      {showRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-2xl border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Retry
        </button>
      ) : null}
      {status === "failed" && errorMessage ? (
        <span className="truncate text-[10px] text-rose-500">{errorMessage}</span>
      ) : null}
    </div>
  );
}
