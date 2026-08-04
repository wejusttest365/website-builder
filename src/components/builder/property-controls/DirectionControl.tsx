import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonGroupControl } from "./ButtonGroupControl";

export type DirectionValue = "row" | "column" | "row-reverse" | "column-reverse";

export interface DirectionControlProps {
  label: string;
  value: DirectionValue;
  onChange: (value: DirectionValue) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function DirectionControl({ label, value, onChange, disabled, hint, tooltip }: DirectionControlProps) {
  const options = [
    { label: "Row", value: "row" as const, icon: <ArrowRight className="h-4 w-4" />, tooltip: "Left to right" },
    { label: "Column", value: "column" as const, icon: <ArrowDown className="h-4 w-4" />, tooltip: "Top to bottom" },
    { label: "Row reverse", value: "row-reverse" as const, icon: <ArrowLeft className="h-4 w-4" />, tooltip: "Right to left" },
    { label: "Column reverse", value: "column-reverse" as const, icon: <ArrowUp className="h-4 w-4" />, tooltip: "Bottom to top" },
  ];

  return (
    <ButtonGroupControl
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      hint={hint}
      tooltip={tooltip}
    />
  );
}
