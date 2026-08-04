import { useEffect, useState, type DragEvent, type ReactNode, type SyntheticEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faPlus, faTrash, faClone, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

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
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  renderItem?: (item: PropertyRepeaterItem, index: number) => ReactNode;
}

export function PropertyRepeater({
  title,
  items,
  onAdd,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onReorder,
  renderItem,
}: PropertyRepeaterProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length ? 0 : null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setExpandedIndex((current) => {
      if (!items.length) return null;
      if (current == null) return current;
      if (current >= items.length) return items.length - 1;
      return current;
    });
  }, [items.length]);

  const stop = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragStart = (event: DragEvent, index: number) => {
    if (!onReorder) return;
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (event: DragEvent, index: number) => {
    if (!onReorder || dragIndex == null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (event: DragEvent, toIndex: number) => {
    if (!onReorder) return;
    event.preventDefault();
    event.stopPropagation();
    const fromRaw = event.dataTransfer.getData("text/plain");
    const fromIndex = Number(fromRaw);
    if (!Number.isFinite(fromIndex) || fromIndex === toIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    onReorder(fromIndex, toIndex);
    setExpandedIndex((current) => {
      if (current == null) return current;
      if (current === fromIndex) return toIndex;
      if (fromIndex < current && toIndex >= current) return current - 1;
      if (fromIndex > current && toIndex <= current) return current + 1;
      return current;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const actionBtnClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";

  return (
    <div className="min-w-0 w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </div>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            Add
          </button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        {items.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const isDragging = dragIndex === index;
          const isDropTarget = dragOverIndex === index && dragIndex != null && dragIndex !== index;

          return (
            <div
              key={item.id}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={(event) => handleDrop(event, index)}
              className={[
                "min-w-0 overflow-hidden rounded-lg border bg-white transition",
                isDropTarget ? "border-violet-300 bg-violet-50/40" : "border-slate-200",
                isDragging ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
                <span
                  draggable={Boolean(onReorder)}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragEnd={handleDragEnd}
                  onClick={stop}
                  onMouseDown={(event) => event.stopPropagation()}
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 ${onReorder ? "cursor-grab active:cursor-grabbing hover:bg-slate-50 hover:text-slate-600" : ""}`}
                  title="Drag to reorder"
                  aria-label="Drag to reorder"
                >
                  <FontAwesomeIcon icon={faGripVertical} className="h-3 w-3" />
                </span>

                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="min-w-0 flex-1 truncate px-1 py-1 text-left text-[13px] font-medium text-slate-700"
                >
                  {item.label || `Item ${index + 1}`}
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    title="Duplicate"
                    aria-label="Duplicate"
                    className={actionBtnClass}
                    onClick={(event) => {
                      stop(event);
                      onDuplicate?.(item.id);
                    }}
                  >
                    <FontAwesomeIcon icon={faClone} className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title="Move up"
                    aria-label="Move up"
                    disabled={index === 0 || !onMoveUp}
                    className={actionBtnClass}
                    onClick={(event) => {
                      stop(event);
                      onMoveUp?.(item.id);
                      setExpandedIndex((current) => {
                        if (current == null) return current;
                        if (current === index) return Math.max(0, index - 1);
                        if (current === index - 1) return index;
                        return current;
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    aria-label="Move down"
                    disabled={index === items.length - 1 || !onMoveDown}
                    className={actionBtnClass}
                    onClick={(event) => {
                      stop(event);
                      onMoveDown?.(item.id);
                      setExpandedIndex((current) => {
                        if (current == null) return current;
                        if (current === index) return Math.min(items.length - 1, index + 1);
                        if (current === index + 1) return index;
                        return current;
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    aria-label="Delete"
                    className={`${actionBtnClass} hover:text-red-500`}
                    onClick={(event) => {
                      stop(event);
                      onRemove?.(item.id);
                      setExpandedIndex((current) => {
                        if (current == null) return current;
                        if (current === index) return null;
                        if (current > index) return current - 1;
                        return current;
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="space-y-2 border-t border-slate-100 px-2.5 pb-2.5 pt-2">
                  {renderItem ? renderItem(item, index) : item.content}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
