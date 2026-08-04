import { useId } from "react";
import type { ReactNode } from "react";
import { ControlWrapper } from "./ControlWrapper";

export interface SegmentedIconOption<T extends string> {
  label: string;
  value: T;
  icon: ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

export interface SegmentedIconControlProps<T extends string> {
  label: string;
  value: T;
  options: SegmentedIconOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function SegmentedIconControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  hint,
  tooltip,
}: SegmentedIconControlProps<T>) {
  const id = useId();

  return (
    <ControlWrapper label={label} hint={hint} tooltip={tooltip} htmlFor={id}>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
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
              className={`flex h-10 w-10 items-center justify-center rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                active
                  ? "bg-primary/10 text-primary border border-primary"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              } ${optionDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {option.icon}
            </button>
          );
        })}
      </div>
    </ControlWrapper>
  );
}
