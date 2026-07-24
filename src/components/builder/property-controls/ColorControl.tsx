import { useRef } from "react";

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorControl({
  label,
  value,
  onChange,
}: ColorControlProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => pickerRef.current?.click()}
          className="h-9 w-9 rounded-md border border-border"
          style={{ background: value }}
        />

        <input
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <input
          ref={pickerRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="hidden"
        />
      </div>
    </div>
  );
}