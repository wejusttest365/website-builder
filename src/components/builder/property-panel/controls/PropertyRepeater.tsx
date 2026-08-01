import { useState, useEffect, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faPlus, faTrash, faChevronDown, faChevronRight, faLink, faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export interface PropertyRepeaterItem {
  id: string;
  label: string;
  content?: ReactNode;
}

export interface PropertyRepeaterProps {
  title: string;
  items: PropertyRepeaterItem[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  renderItem?: (item: PropertyRepeaterItem, index: number) => ReactNode;
}

export function PropertyRepeater({ title, items, onAdd, onRemove, renderItem }: PropertyRepeaterProps) {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    // Reset expanded item when the items change (ensures no stale selection)
    setExpandedId(items[0]?.id ?? null);
  }, [items]);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 px-0 py-0">
        <div className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.08em]">{title}</div>
        <button type="button" onClick={onAdd} className="text-[13px] font-medium text-violet-600 hover:underline flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
          Add Item
        </button>
      </div>

      <div className="space-y-1">
        {items.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id}>
              <div className="flex h-10 items-center justify-between gap-2 px-2 py-1 text-left">
                <button type="button" onClick={() => setExpandedId(isExpanded ? null : item.id)} className="flex flex-1 items-center gap-3 rounded px-3 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-100">
                  <FontAwesomeIcon icon={faGripVertical} className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{item.label}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => onRemove?.(item.id)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                    <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
                    <FontAwesomeIcon icon={faLink} className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : item.id)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
                    <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {isExpanded ? <div className="border-t border-slate-200 px-3 py-2">{renderItem ? renderItem(item, index) : item.content}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
