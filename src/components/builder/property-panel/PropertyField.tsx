import type { ReactNode } from "react";

export interface PropertyFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function PropertyField({ label, children, hint }: PropertyFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">{label}</label>
        {hint ? <span className="text-[10px] text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}
