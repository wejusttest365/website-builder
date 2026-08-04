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
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
