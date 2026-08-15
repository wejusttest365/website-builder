import React from "react";

export interface TypographyControlProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function TypographyControl({ label = "Typography", value = "Inter", onChange }: TypographyControlProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#D0D0D0]">
      <span className="font-medium">{label}</span>
      <input value={value} placeholder="Font family" onChange={(event) => onChange?.(event.target.value)} className="rounded border border-[#363636] bg-[#171717] px-3 py-2 text-sm text-[#F5F5F5]" />
    </label>
  );
}
