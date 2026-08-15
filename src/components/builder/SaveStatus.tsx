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
      : "Saved";

  const statusIcon =
    status === "saving" ? (
      <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" />
    ) : status === "saved" ? (
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    ) : status === "failed" ? (
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
    ) : (
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    );

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#D0D0D0] whitespace-nowrap">
      <span className="flex items-center justify-center">{statusIcon}</span>
      <span className="text-[#F5F5F5]">{statusLabel}</span>
    </div>
  );
}
