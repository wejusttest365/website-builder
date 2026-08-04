import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function normalizeColorValue(value: string, fallback = "#2563eb") {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return fallback;
  const lowered = trimmed.toLowerCase();
  if (["transparent", "rgba(0, 0, 0, 0)", "rgba(255, 255, 255, 0)", "hsla(0, 0%, 0%, 0)", "hsla(0, 0%, 100%, 0)", "none"].includes(lowered)) {
    return fallback;
  }
  return trimmed;
}

export function ColorControl({
  label,
  value,
  onChange,
}: ColorControlProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 12, left: 12 });
  const [mounted, setMounted] = useState(false);

  const normalizedValue = normalizeColorValue(value);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 220;
      const height = 136;
      const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.left));
      const top = Math.min(window.innerHeight - height - 12, Math.max(12, rect.bottom + 8));
      setPickerPosition({ top, left });
    };

    updatePosition();
    const timeoutId = window.setTimeout(updatePosition, 0);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-medium text-slate-500">{label}</label>

      <div className="flex items-center gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="h-8 w-8 rounded-md border border-slate-200"
          style={{ background: normalizedValue }}
          aria-label="Open color picker"
        />

        <input
          className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
          value={normalizedValue}
          onChange={(e) => onChange(e.target.value || "#2563eb")}
        />

        <input
          ref={pickerRef}
          type="color"
          value={normalizedValue}
          onChange={(e) => onChange(e.target.value)}
          className="hidden"
        />
      </div>

      {open && mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              className="fixed z-[9999] w-[220px] rounded-lg border border-border bg-popover p-3 shadow-xl"
              style={{ top: pickerPosition.top, left: pickerPosition.left }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={pickerRef}
                  type="color"
                  value={normalizedValue}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border border-input bg-background p-0"
                />
                <input
                  className="h-9 w-full rounded border border-input bg-background px-2 text-sm"
                  value={normalizedValue}
                  onChange={(e) => onChange(e.target.value || "#2563eb")}
                />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Choose a color without losing the picker.</div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}