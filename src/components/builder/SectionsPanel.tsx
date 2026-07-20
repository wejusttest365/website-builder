import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { SectionTemplate } from "@/lib/builder/sections";
import { SectionCard } from "./SectionCard";

interface Props {
  q: string;
  setQ: (value: string) => void;
  groupedSections: readonly (readonly [string, SectionTemplate[]])[];
  openCats: Record<string, boolean>;
  setOpenCats: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  addSection: (section: SectionTemplate) => void;
}

export function SectionsPanel({
  q,
  setQ,
  groupedSections,
  openCats,
  setOpenCats,
  addSection,
}: Props) {
  return (
    <section className="w-full space-y-2">
      <div className="rounded-lg border border-border/70 bg-background/90 p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections..."
            className="w-full rounded-md border border-input bg-background pl-8 pr-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {groupedSections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
          No sections found.
        </div>
      ) : (
        groupedSections.map(([cat, items]) => {
          const open = q.trim() ? true : openCats[cat] ?? false;

          return (
            <div
              key={cat}
              className="overflow-hidden rounded-lg border border-border bg-background"
            >
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-muted"
                onClick={() =>
                  setOpenCats((prev) => ({
                    ...prev,
                    [cat]: !open,
                  }))
                }
              >
                {open ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}

                <span>{cat}</span>

                <span className="ml-auto text-muted-foreground">
                  {items.length}
                </span>
              </button>

              {open && (
                <div className="space-y-2 border-t border-border p-2">
                  {items.map((tpl) => (
                    <SectionCard
                      key={tpl.id}
                      tpl={tpl}
                      onAdd={() => addSection(tpl)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}