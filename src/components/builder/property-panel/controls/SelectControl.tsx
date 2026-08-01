import React from "react";

export interface SelectControlProps {
  label?: string;
  value?: string;
  options?: Array<{ label: string; value: string }>;
  onChange?: (value: string) => void;
}

export function SelectControl({ label = "Select", value = "", options = [], onChange }: SelectControlProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-600">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange?.(event.target.value)} className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
