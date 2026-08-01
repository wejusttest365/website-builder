import React from "react";

export interface TextControlProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function TextControl({ label = "Text", value = "", placeholder = "Enter value", onChange }: TextControlProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-600">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  );
}
