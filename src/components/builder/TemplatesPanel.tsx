import { Search } from "lucide-react";
import { TEMPLATE_CATEGORIES, type TemplateDefinition } from "@/lib/builder/templates";
import { TemplateCard } from "./TemplateCard";

interface TemplatesPanelProps {
  q: string;
  setQ: (value: string) => void;
  templateCategory: string;
  setTemplateCategory: (value: string) => void;
  filteredTemplates: TemplateDefinition[];
  applyTemplate: (template: TemplateDefinition) => void;
}

export function TemplatesPanel({
  q,
  setQ,
  templateCategory,
  setTemplateCategory,
  filteredTemplates,
  applyTemplate,
}: TemplatesPanelProps) {
  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={templateCategory}
          onChange={(e) => setTemplateCategory(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="All">All Templates</option>

          {TEMPLATE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No templates found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              onUse={() => applyTemplate(tpl)}
            />
          ))}
        </div>
      )}
    </section>
  );
}