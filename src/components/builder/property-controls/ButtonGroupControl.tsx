import { useId } from "react";
import type { ReactNode } from "react";
import { ControlWrapper } from "./ControlWrapper";

export interface ButtonOption<T extends string> {
  label: string;
  value: T;
  icon?: ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

export interface ButtonGroupControlProps<T extends string> {
  label: string;
  value: T;
  options: ButtonOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function ButtonGroupControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  hint,
  tooltip,
}: ButtonGroupControlProps<T>) {
  const id = useId();

  return (
    <ControlWrapper label={label} hint={hint} tooltip={tooltip} htmlFor={id}>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const active = option.value === value;
          const optionDisabled = disabled || option.disabled;
          return (
            <button
              key={option.value}
              type="button"
              aria-label={option.tooltip || option.label}
              title={option.tooltip || option.label}
              disabled={optionDisabled}
              onClick={() => !optionDisabled && onChange(option.value)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/40 ${
                active
                  ? "border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15]"
                  : "border-[#363636] bg-[#171717] text-[#D0D0D0] hover:border-[#363636] hover:bg-[#242424]"
              } ${optionDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </ControlWrapper>
  );
}
