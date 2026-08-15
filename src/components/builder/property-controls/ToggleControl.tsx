import { useId } from "react";

export interface ToggleControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function ToggleControl({
  label,
  checked,
  onChange,
  disabled = false,
  hint,
  tooltip,
}: ToggleControlProps) {
  const id = useId();

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#363636] bg-[#1F1F1F] px-2.5 py-2">
        <label htmlFor={id} className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#D0D0D0]" title={tooltip || label}>
          {label}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-[18px] w-[34px] shrink-0 items-center rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/30 ${
            checked ? "border-[#FACC15] bg-[#FACC15]/15" : "border-[#3A3A3A] bg-[#2A2A2A]"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full transition-all duration-200 ${
              checked ? "translate-x-[17px] bg-[#FACC15] shadow-sm" : "translate-x-[3px] bg-[#6A6A6A]"
            }`}
          />
        </button>
      </div>
      {hint ? <p className="text-[10px] text-[#969696]">{hint}</p> : null}
    </div>
  );
}
