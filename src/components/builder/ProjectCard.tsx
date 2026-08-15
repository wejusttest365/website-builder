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
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#363636] bg-[#1F1F1F] shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-[#242424] px-4 py-3 transition hover:bg-[#2B2B2B]"
      >
        <span className="text-sm font-semibold text-[#F5F5F5]">
          {title}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-[#969696] transition-transform ${
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
      <label className="text-xs font-medium uppercase tracking-wide text-[#969696]">
        {label}
      </label>

      {children}
    </div>
  );
}