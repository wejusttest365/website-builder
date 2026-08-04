import { Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { SectionTemplate } from "@/lib/builder/sections";

interface Props {
  tpl: SectionTemplate;
  onAdd: () => void;
}

export function SectionCard({ tpl, onAdd }: Props) {
  return (
    <div
      className="group rounded-lg border border-border/70 bg-background hover:border-primary/50 hover:shadow-md transition overflow-hidden cursor-grab"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-wto-section", tpl.id);
        e.dataTransfer.setData("text/plain", tpl.id);
        e.dataTransfer.effectAllowed = "copy";

        window.dispatchEvent(
          new CustomEvent("wto-library-drag-start", {
            detail: { kind: "section", sectionId: tpl.id },
          })
        );
      }}
      onDragEnd={() => {
        window.dispatchEvent(
          new CustomEvent("wto-library-drag-end")
        );
      }}
      onDoubleClick={onAdd}
    >
      <div
        className="h-9 flex items-center justify-center text-white text-[9px] font-bold tracking-wider"
        style={{
          background: tpl.thumbBg,
        }}
      >
        {tpl.category.toUpperCase()}
      </div>

      <div className="flex items-center gap-1 px-2 py-2">
        <div className="flex-1 truncate text-[10px] font-medium">
          {tpl.name}
        </div>

        <button
          onClick={onAdd}
          className="rounded p-1 hover:bg-accent"
          title="Add section"
        >
          <Plus className="h-3 w-3" />
        </button>

        <button
          className="rounded p-1 hover:bg-accent"
          title="Copy HTML"
          onClick={async () => {
            await navigator.clipboard.writeText(tpl.html);
            toast.success("HTML copied");
          }}
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}