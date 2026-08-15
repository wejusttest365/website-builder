import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/builder/store";

interface AddPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPage: (name: string, slug: string) => string;
}

export function AddPageDialog({ open, onOpenChange, onAddPage }: AddPageDialogProps) {
  const [name, setName] = useState("New Page");
  const [slug, setSlug] = useState(slugify("New Page"));
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setName("New Page");
      setSlug(slugify("New Page"));
      setSlugTouched(false);
    }
  }, [open]);

  const handleNameChange = (nextName: string) => {
    setName(nextName);
    if (!slugTouched) {
      setSlug(slugify(nextName));
    }
  };

  const handleSlugChange = (nextSlug: string) => {
    setSlugTouched(true);
    setSlug(slugify(nextSlug));
  };

  const handleAdd = () => {
    const trimmedName = name.trim() || "New Page";
    const trimmedSlug = slug.trim() || slugify(trimmedName);
    const id = onAddPage(trimmedName, trimmedSlug);
    if (id) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add new page</DialogTitle>
          <DialogDescription>Create a new page for your website. The slug will be auto-generated from the page name.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="add-page-name">
              Page name
            </label>
            <Input
              id="add-page-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="add-page-slug">
              Page slug
            </label>
            <Input
              id="add-page-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm transition hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground transition hover:bg-primary/90"
            onClick={handleAdd}
          >
            Add Page
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
