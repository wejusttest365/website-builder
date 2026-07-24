import { useEffect, useState } from "react";

interface SliderControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SliderControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  onChange,
}: SliderControlProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocalValue(v);
            onChange(v);
          }}
          className="w-20 rounded-md border border-border bg-background px-2 py-1 text-right text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocalValue(v);
            onChange(v);
          }}
          className="flex-1"
        />

        <span className="w-10 text-right text-xs text-muted-foreground">
          {localValue}
          {unit}
        </span>
      </div>
    </div>
  );
}