import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectWizardProps } from "./ProjectWizard";

export function CreateProjectDialog({
  open,
  projectName,
  step,
  onProjectNameChange,
  onNext,
  onCancel,
  onCreateCustom,
  onCreateTemplate,
}: Pick<
  ProjectWizardProps,
  "open" | "projectName" | "step" | "onProjectNameChange" | "onNext" | "onCancel" | "onCreateCustom" | "onCreateTemplate"
>) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Create a new project" : "Create Custom Website"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Give your new project a name."
              : "Choose whether to start with a template or build a custom website from scratch."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <label className="block text-sm font-medium text-slate-700">Project Name</label>
            <Input
              value={projectName}
              onChange={(event) => onProjectNameChange(event.target.value)}
              placeholder="My Project"
              autoFocus
            />
          </div>
        ) : (
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCreateTemplate}
              className="group rounded-3xl border border-border/70 bg-white p-6 text-left shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <Layers className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Start from Template</h2>
              <p className="mt-2 text-sm text-slate-600">Use a professionally designed template.</p>
            </button>

            <button
              type="button"
              onClick={onCreateCustom}
              className="group rounded-3xl border border-border/70 bg-white p-6 text-left shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Start Blank</h2>
              <p className="mt-2 text-sm text-slate-600">Build your website from scratch.</p>
            </button>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between gap-2 py-4">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          {step === 1 ? (
            <Button disabled={!projectName.trim()} onClick={onNext}>Next →</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
