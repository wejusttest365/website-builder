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
        className="h-8 w-full rounded-lg border border-[#363636] bg-[#171717] px-2.5 text-[13px] text-[#F5F5F5] outline-none transition duration-150 focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </ControlWrapper>
  );
}
