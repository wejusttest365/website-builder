import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateProjectDialog } from "@/components/builder/CreateProjectDialog";

export function CreateProjectFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Create new project"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="group fixed z-50 inline-flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-[#FACC15] text-[#111111] shadow-lg shadow-[#FACC15]/20 outline-none transition-all duration-200 ease-out hover:scale-[1.03] hover:bg-[#FDE047] hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2 active:scale-95 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:group-hover:rotate-0 bottom-[max(20px,env(safe-area-inset-bottom,0px))] right-[max(20px,env(safe-area-inset-right,0px))] sm:h-14 sm:w-auto sm:px-6 sm:bottom-7 sm:right-7"
      >
        <Plus className="h-6 w-6 transition-transform duration-200 ease-out group-hover:rotate-90 motion-reduce:transform-none" />
        <span className="hidden text-base font-semibold sm:inline">New Project</span>
      </button>

      <CreateProjectDialog
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
