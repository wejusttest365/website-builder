import type { ChangeEvent } from "react";

export interface PropertyTextInputProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  type?: string;
}

export function PropertyTextInput({ value = "", placeholder, onChange, onBlur, type = "text" }: PropertyTextInputProps) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value)}
      onBlur={onBlur}
      className="h-10 w-full rounded border border-[#363636] bg-[#171717] px-3 text-[13px] text-[#F5F5F5] placeholder:text-[#969696] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 shadow-sm"
    />
  );
}
