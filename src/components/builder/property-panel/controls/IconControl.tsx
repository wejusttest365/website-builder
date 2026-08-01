import React from "react";

export interface IconControlProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function IconControl({ label = "Icon", value = "sparkles", onChange }: IconControlProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input value={value} placeholder="Icon name" onChange={(event) => onChange?.(event.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm" />
    </label>
  );
}
