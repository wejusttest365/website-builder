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
      className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-50 shadow-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
