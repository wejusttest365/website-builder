import type { ChangeEvent } from "react";

export interface PropertySelectOption {
  label: string;
  value: string;
}

export interface PropertySelectProps {
  value?: string;
  options?: PropertySelectOption[];
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export function PropertySelect({ value = "", options = [], onChange, onBlur }: PropertySelectProps) {
  return (
    <select
      value={value}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange?.(event.target.value)}
      onBlur={onBlur}
      className="h-10 w-full rounded border border-[#363636] bg-[#171717] px-3 text-[13px] text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 shadow-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
