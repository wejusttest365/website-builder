import { toast } from "sonner";
import type { TemplateDefinition } from "@/lib/builder/templates";

interface TemplateCardProps {
  tpl: TemplateDefinition;
  onUse: () => void;
}

export function TemplateCard({
  tpl,
  onUse,
}: TemplateCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-32 overflow-hidden">
        <img
          src={tpl.thumbnail}
          alt={tpl.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
          {tpl.category}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {tpl.name}
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {tpl.description}
          </p>
        </div>

        <button
          onClick={() => {
            onUse();
            toast.success(`${tpl.name} loaded into canvas`);
          }}
          className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}