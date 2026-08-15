"use client";

import { useEffect, useState } from "react";
import { Copy, Edit2, MoreVertical, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/builder/store";
import type { Page } from "@/lib/builder/store";

interface PageActionsMenuProps {
  page: Page;
  pageCount: number;
  onRename: (id: string, name: string) => void;
  onSetSlug: (id: string, slug: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onSeo: (id: string) => void;
}

export function PageActionsMenu({ page, pageCount, onRename, onSetSlug, onDuplicate, onDelete, onSeo }: PageActionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(page.name);
  const [slug, setSlug] = useState(page.slug);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (renameOpen) {
      setName(page.name);
      setSlug(page.slug);
      setSlugTouched(false);
    }
  }, [renameOpen, page.name, page.slug]);

  const handleRenameSave = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== page.name) {
      onRename(page.id, trimmed);
    }
    if (slug && slug !== page.slug) {
      onSetSlug(page.id, slug);
    }
    setRenameOpen(false);
  };

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#363636] bg-[#1F1F1F] text-[#969696] transition hover:border-[#FACC15] hover:bg-[#FACC15]/10 hover:text-[#FACC15]"
            aria-label="Page actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={8} align="end" className="w-[12rem]">
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Edit2 className="h-4 w-4" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onDuplicate(page.id)}>
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setDeleteOpen(true)} disabled={pageCount <= 1}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => onSeo(page.id)}>
            <Settings className="h-4 w-4" />
            SEO Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename page</DialogTitle>
            <DialogDescription>Update the page name without changing the page content.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-[#969696]" htmlFor="page-rename-input">
              Page name
            </label>
            <Input
              id="page-rename-input"
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!slugTouched) {
                  setSlug(slugify(nextName));
                }
              }}
              autoFocus
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#969696]" htmlFor="page-slug-input">
              Page slug
            </label>
            <Input
              id="page-slug-input"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
            />
          </div>

          <DialogFooter className="mt-6">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#363636] bg-[#1F1F1F] px-4 text-sm text-[#D0D0D0] transition hover:bg-[#242424]"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#FACC15] px-4 text-sm text-[#111111] transition hover:bg-[#FDE047]"
              onClick={handleRenameSave}
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the page from your project. You can only delete a page when your project has more than one page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#F87171] text-white hover:bg-[#F87171]/90"
              onClick={(e: any) => {
                try { e?.preventDefault(); } catch (_) {}
                onDelete(page.id);
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
