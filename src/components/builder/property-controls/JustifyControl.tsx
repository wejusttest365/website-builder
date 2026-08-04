import { AlignHorizontalLeft, AlignHorizontalCenter, AlignHorizontalRight, SpaceBetweenHorizontal, Square } from "lucide-react";
import { ButtonGroupControl } from "./ButtonGroupControl";

export type JustifyValue = "start" | "center" | "end" | "between" | "around";

export interface JustifyControlProps {
  label: string;
  value: JustifyValue;
  onChange: (value: JustifyValue) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function JustifyControl({ label, value, onChange, disabled, hint, tooltip }: JustifyControlProps) {
  const options = [
    { label: "Start", value: "start" as const, icon: <AlignHorizontalLeft className="h-4 w-4" />, tooltip: "Justify to start" },
    { label: "Center", value: "center" as const, icon: <AlignHorizontalCenter className="h-4 w-4" />, tooltip: "Justify to center" },
    { label: "End", value: "end" as const, icon: <AlignHorizontalRight className="h-4 w-4" />, tooltip: "Justify to end" },
    { label: "Between", value: "between" as const, icon: <SpaceBetweenHorizontal className="h-4 w-4" />, tooltip: "Space between items" },
    { label: "Around", value: "around" as const, icon: <Square className="h-4 w-4" />, tooltip: "Space around items" },
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
