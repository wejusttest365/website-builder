import React from "react";

export interface SelectControlProps {
  label?: string;
  value?: string;
  options?: Array<{ label: string; value: string }>;
  onChange?: (value: string) => void;
}

export function SelectControl({ label = "Select", value = "", options = [], onChange }: SelectControlProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-[#D0D0D0]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#969696]">{label}</span>
      <select value={value} onChange={(event) => onChange?.(event.target.value)} className="h-9 w-full rounded border border-[#363636] bg-[#171717] px-3 text-[13px] text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
