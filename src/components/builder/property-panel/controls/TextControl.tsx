import React from "react";

export interface TextControlProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function TextControl({ label = "Text", value = "", placeholder = "Enter value", onChange }: TextControlProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-[#D0D0D0]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#969696]">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-9 w-full rounded border border-[#363636] bg-[#171717] px-3 text-[13px] text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20"
      />
    </label>
  );
}
