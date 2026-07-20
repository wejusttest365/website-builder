import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { SeoSettingsPanel } from "./SeoSettingsPanel";
import type { Page } from "@/lib/builder/store";

interface SeoDialogProps {
  page: Page | null;
  project: any;
  open: boolean;
  onClose: () => void;
}

export function SeoDialog({
  page,
  project,
  open,
  onClose,
}: SeoDialogProps) {
  if (!page) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-2xl p-0">

        <div className="max-h-[90vh] overflow-y-auto rounded-3xl bg-background">

          <DialogHeader className="border-b px-6 py-5">

            <DialogTitle>
              SEO Settings
            </DialogTitle>

            <DialogDescription>
              Configure page SEO metadata.
            </DialogDescription>

          </DialogHeader>

          <div className="p-6">

            <SeoSettingsPanel
              page={page}
              project={project}
            />

          </div>

          <DialogFooter className="border-t px-6 py-4">

            <DialogClose asChild>

              <button className="rounded-lg border px-4 py-2">
                Close
              </button>

            </DialogClose>

            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>

          </DialogFooter>

        </div>

      </DialogContent>

    </Dialog>
  );
}