import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { PropertyTextInput } from "./PropertyTextInput";

export interface PropertyColorControlProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export function PropertyColorControl({ value = "#ffffff", onChange, onBlur }: PropertyColorControlProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const normalizedValue = (value || "").trim();
  const swatchValue = /^#/.test(normalizedValue) ? normalizedValue : "#ffffff";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:text-violet-600"
        aria-label="Open color picker"
      >
        <span className="block h-5 w-5 rounded-md border border-slate-200" style={{ backgroundColor: swatchValue }} />
      </button>
      <div className="flex-1">
        <PropertyTextInput value={value} placeholder="#ffffff" onChange={onChange} onBlur={onBlur} />
      </div>
      {open ? (
        <div ref={popoverRef} className="fixed z-[1000] rounded-xl border border-slate-200 bg-white p-3 shadow-xl" style={{ top: 12, left: 12 }}>
          <div className="flex items-center gap-2">
              <input type="color" value={swatchValue} onChange={(event) => onChange?.(event.target.value)} onBlur={onBlur} className="h-9 w-9 rounded border border-slate-200 p-0" />
              <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-500">
              <FontAwesomeIcon icon={faPalette} className="h-3.5 w-3.5" />
              <span>Pick a color</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
