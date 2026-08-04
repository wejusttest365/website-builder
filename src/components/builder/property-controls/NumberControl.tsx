import { useId } from "react";
import { ControlWrapper } from "./ControlWrapper";

export interface NumberControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function NumberControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  hint,
  tooltip,
}: NumberControlProps) {
  const id = useId();

  return (
    <ControlWrapper label={label} hint={hint} tooltip={tooltip} htmlFor={id}>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition duration-150 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </ControlWrapper>
  );
}
