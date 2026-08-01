import { type DragEvent } from "react";
import { Plus } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { WidgetRegistration } from "../widgetRegistry";

interface WidgetLibraryCardProps {
  widget: WidgetRegistration;
  active?: boolean;
  onSelect: (widget: WidgetRegistration) => void;
  onDragStart?: (event: DragEvent<HTMLDivElement>, widget: WidgetRegistration) => void;
  onDragEnd?: (event: DragEvent<HTMLDivElement>) => void;
}

export function WidgetLibraryCard({ widget, active = false, onSelect, onDragStart, onDragEnd }: WidgetLibraryCardProps) {
  const variantCount = widget.supportedVariants?.length ?? 0;
  const description = widget.description ?? widget.preview ?? "";

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart?.(event, widget)}
      onDragEnd={(event) => onDragEnd?.(event)}
      className={`group flex w-full cursor-grab items-center gap-2 rounded-2xl border transition ${
        active ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(widget)}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
      >
        <span className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
          active ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-700"
        }`}>
          <FontAwesomeIcon icon={widget.icon as any} className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold leading-5">{widget.displayName}</span>
            <span className="ml-auto inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-600">{variantCount}</span>
          </div>
          <p className="mt-1 truncate text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(widget);
        }}
        className="mr-2 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label={`Add ${widget.displayName}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
