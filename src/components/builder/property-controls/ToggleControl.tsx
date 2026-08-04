import { useId } from "react";

export interface ToggleControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
  tooltip?: string;
}

export function ToggleControl({
  label,
  checked,
  onChange,
  disabled = false,
  hint,
  tooltip,
}: ToggleControlProps) {
  const id = useId();

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-2.5 py-2">
        <label htmlFor={id} className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-700" title={tooltip || label}>
          {label}
        </label>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      {hint ? <p className="text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}
