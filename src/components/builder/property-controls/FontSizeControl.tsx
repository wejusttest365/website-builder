import { normalizeFontSizeToPx } from "@/components/builder/widgets/fontSize";

export interface FontSizeControlProps {
  label?: string;
  value?: string | number | null;
  onChange: (next: string) => void;
  allowEmpty?: boolean;
  placeholder?: string;
}

export function FontSizeControl({
  label = "Font Size",
  value,
  onChange,
  allowEmpty = true,
  placeholder = "Inherit",
}: FontSizeControlProps) {
  const normalized = normalizeFontSizeToPx(value);
  const numericValue = normalized ? String(Number.parseInt(normalized, 10)) : "";

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-slate-500">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        value={numericValue}
        placeholder={placeholder}
        onChange={(event) => {
          const next = event.target.value.trim();
          if (!next) {
            if (allowEmpty) onChange("");
            return;
          }
          const parsed = Number(next);
          if (!Number.isFinite(parsed) || parsed <= 0) return;
          onChange(Math.round(parsed) + "px");
        }}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
      />
    </div>
  );
}
