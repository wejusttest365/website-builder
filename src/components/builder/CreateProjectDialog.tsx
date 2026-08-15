import { useState, useEffect, useRef } from "react";
import { Check, Layers, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useBuilder } from "@/lib/builder/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export function CreateProjectDialog({
  open,
  onOpenChange,
  openWidgetsPanelForBlank = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openWidgetsPanelForBlank?: boolean;
}) {
  const [projectName, setProjectName] = useState("My Project");
  const [startingPoint, setStartingPoint] = useState<"template" | "blank">("template");
  const [creating, setCreating] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const newProject = useBuilder((s) => s.newProject);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);

  useEffect(() => {
    if (open) {
      setProjectName("My Project");
      setStartingPoint("template");
      setCreating(false);
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleCreate = async () => {
    const name = projectName.trim() || "My Project";
    setCreating(true);
    try {
      if (startingPoint === "blank") {
        const createdId = newProject(name);
        setShowProjectDashboard(false);
        if (openWidgetsPanelForBlank) {
          setLeftPanelOpen("widgets");
          setLeftPanelView("widgets");
        }
        navigate({ to: "/editor/$projectId", params: { projectId: createdId } });
        onOpenChange(false);
      } else {
        setShowProjectDashboard(true);
        navigate({ to: "/dashboard/templates" as never });
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleCreate();
    }
  };

  const canCreate = projectName.trim().length > 0 && !creating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-[680px] overflow-hidden rounded-[20px] border border-[#363636] bg-[#1F1F1F] p-0 shadow-2xl">
        <div className="flex flex-col">
          <div className="shrink-0 px-6 pb-5 pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FACC15]/10 text-[#FACC15]">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold text-[#F5F5F5] tracking-tight">
                  Create new project
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-[#969696]">
                  Set up your workspace in a couple of steps
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="create-project-name" className="text-sm font-medium text-[#F5F5F5]">
                Project name
              </label>
              <Input
                ref={nameInputRef}
                id="create-project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="My Project"
                className="h-11 rounded-xl border-[#363636] bg-[#171717] text-[#F5F5F5] placeholder:text-[#969696] focus:border-[#FACC15] focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F5F5]">Starting point</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStartingPoint("template")}
                  className={`relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all duration-200 ${
                    startingPoint === "template"
                      ? "border-[#FACC15] bg-[#FACC15]/10 shadow-sm"
                      : "border-[#363636] bg-[#1F1F1F] hover:border-[#FACC15]/50"
                  }`}
                >
                  {startingPoint === "template" && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FACC15] text-[#111111]">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${
                      startingPoint === "template" ? "bg-[#FACC15] text-[#111111]" : "bg-[#242424] text-[#969696]"
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F5F5F5]">From template</p>
                    <p className="mt-0.5 text-xs text-[#969696]">Start with a professionally designed layout</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStartingPoint("blank")}
                  className={`relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all duration-200 ${
                    startingPoint === "blank"
                      ? "border-[#FACC15] bg-[#FACC15]/10 shadow-sm"
                      : "border-[#363636] bg-[#1F1F1F] hover:border-[#FACC15]/50"
                  }`}
                >
                  {startingPoint === "blank" && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FACC15] text-[#111111]">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${
                      startingPoint === "blank" ? "bg-[#FACC15] text-[#111111]" : "bg-[#242424] text-[#969696]"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F5F5F5]">Start blank</p>
                    <p className="mt-0.5 text-xs text-[#969696]">Build from a completely empty canvas</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#363636] px-6 py-4">
            <div className="flex items-center justify-end gap-2.5">
              <Button variant="ghost" onClick={handleCancel} disabled={creating} className="text-[#969696] hover:text-[#F5F5F5] hover:bg-[#242424]">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!canCreate}
                className="bg-[#FACC15] text-[#111111] hover:bg-[#FDE047] h-10 px-5 rounded-xl"
              >
                {creating ? "Creating..." : startingPoint === "template" ? "Continue →" : "Create project →"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
