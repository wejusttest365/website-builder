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
    <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
      >
        <span className="text-sm font-semibold text-slate-800">
          {title}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="space-y-4 p-4">
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
      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>

      {children}
    </div>
  );
}