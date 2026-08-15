import React from "react";

export interface ToggleControlProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function ToggleControl({ label = "Toggle", checked = false, onChange }: ToggleControlProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded border border-[#363636] bg-[#1F1F1F] px-3 py-2.5 text-sm text-[#D0D0D0]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#969696]">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.target.checked)} className="h-4 w-4 rounded border-[#363636] text-[#FACC15] focus:ring-[#FACC15]/20" />
    </label>
  );
}
