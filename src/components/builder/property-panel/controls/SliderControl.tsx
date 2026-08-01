import React from "react";

export interface SliderControlProps {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export function SliderControl({ label = "Slider", value = 50, min = 0, max = 100, onChange }: SliderControlProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange?.(Number(event.target.value))} className="w-full" />
      <span className="text-xs text-slate-500">{value}</span>
    </label>
  );
}
