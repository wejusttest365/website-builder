import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface PropertyAccordionProps {
  title: string;
  icon?: ReactNode;
  summary?: string;
  defaultOpen?: boolean;
  children?: ReactNode;
}

export function PropertyAccordion({
  title,
  icon,
  summary,
  defaultOpen = false,
  children,
}: PropertyAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left transition hover:bg-slate-50"
        aria-expanded={open}
      >
        {icon ? <span className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-500">{icon}</span> : null}
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-800">{title}</span>
        {summary && !open ? (
          <span className="shrink-0 text-[12px] text-slate-400">{summary}</span>
        ) : null}
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        )}
      </button>
      {open ? <div className="space-y-2.5 border-t border-slate-100 px-2.5 py-2.5">{children}</div> : null}
    </div>
  );
}
