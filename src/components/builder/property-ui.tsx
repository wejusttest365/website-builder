import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";

export function PropertyCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#363636] bg-[#1F1F1F] shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#F5F5F5] transition hover:bg-[#242424]"
      >
        <span>{title}</span>

        <ChevronDown
          className={`h-4 w-4 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-[#363636] bg-[#242424]/60 p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function PropertyField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#969696]">
        {label}
      </label>

      {children}
    </div>
  );
}