import React from "react";

export interface ColorControlProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function ColorControl({ label = "Color", value = "#2563eb", onChange }: ColorControlProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-600">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(event) => onChange?.(event.target.value)} className="h-9 w-14 rounded border border-slate-200 bg-white p-1" />
        <span className="text-[13px] text-slate-500">{value}</span>
      </div>
    </label>
  );
}
