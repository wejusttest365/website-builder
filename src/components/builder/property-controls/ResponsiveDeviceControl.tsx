import { Monitor, Tablet, Smartphone } from "lucide-react";
import { ButtonGroupControl } from "./ButtonGroupControl";

export type ResponsiveDeviceValue = "desktop" | "tablet" | "mobile";

export interface ResponsiveDeviceControlProps {
  label: string;
  value: ResponsiveDeviceValue;
  onChange: (value: ResponsiveDeviceValue) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function ResponsiveDeviceControl({ label, value, onChange, disabled, hint, tooltip }: ResponsiveDeviceControlProps) {
  const options = [
    { label: "Desktop", value: "desktop" as const, icon: <Monitor className="h-4 w-4" />, tooltip: "Desktop device" },
    { label: "Tablet", value: "tablet" as const, icon: <Tablet className="h-4 w-4" />, tooltip: "Tablet device" },
    { label: "Mobile", value: "mobile" as const, icon: <Smartphone className="h-4 w-4" />, tooltip: "Mobile device" },
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
