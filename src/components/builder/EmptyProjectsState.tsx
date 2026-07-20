import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyProjectsStateProps {
  onCreateNew: () => void;
}

export function EmptyProjectsState({ onCreateNew }: EmptyProjectsStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 bg-muted/70 p-12 text-center text-sm text-slate-500">
      <div className="mb-4 text-lg font-semibold text-foreground">No projects yet</div>
      <div className="max-w-xl mx-auto space-y-3 text-slate-600">
        <p>Start your first website project now. Create custom pages, add widgets, and publish from the builder.</p>
      </div>
      <Button className="mt-6 inline-flex items-center gap-2" onClick={onCreateNew}>
        <Plus className="h-4 w-4" />
        Create first project
      </Button>
    </div>
  );
}
