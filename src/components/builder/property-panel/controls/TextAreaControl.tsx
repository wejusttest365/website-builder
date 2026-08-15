import React from "react";

export interface TextAreaControlProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function TextAreaControl({ label = "Text area", value = "", placeholder = "Enter content", onChange }: TextAreaControlProps) {
  return (
    <label className="flex flex-col gap-1 text-[#D0D0D0]">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#969696]">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="min-h-16 rounded-[8px] border border-[#363636] bg-[#171717] px-3 py-2 text-[13px] text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/60"
        style={{ resize: "vertical" }}
      />
    </label>
  );
}
