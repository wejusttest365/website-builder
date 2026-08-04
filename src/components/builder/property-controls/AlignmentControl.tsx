import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { ButtonGroupControl } from "./ButtonGroupControl";

export type AlignmentValue = "left" | "center" | "right";

export interface AlignmentControlProps {
  label: string;
  value: AlignmentValue;
  onChange: (value: AlignmentValue) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function AlignmentControl({ label, value, onChange, disabled, hint, tooltip }: AlignmentControlProps) {
  const options = [
    { label: "Left", value: "left" as const, icon: <AlignLeft className="h-4 w-4" />, tooltip: "Align left" },
    { label: "Center", value: "center" as const, icon: <AlignCenter className="h-4 w-4" />, tooltip: "Align center" },
    { label: "Right", value: "right" as const, icon: <AlignRight className="h-4 w-4" />, tooltip: "Align right" },
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
