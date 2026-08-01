import React from "react";

export interface TextAreaControlProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function TextAreaControl({ label = "Text area", value = "", placeholder = "Enter content", onChange }: TextAreaControlProps) {
  return (
    <label className="flex flex-col gap-1 text-slate-600">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="min-h-16 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100/60"
        style={{ resize: "vertical" }}
      />
    </label>
  );
}
