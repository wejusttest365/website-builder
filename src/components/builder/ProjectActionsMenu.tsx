"use client";

import { useEffect, useState } from "react";
import { Copy, Edit2, MoreVertical, Download, Trash2, Upload } from "lucide-react";
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
import type { Project } from "@/lib/builder/store";

interface ProjectActionsMenuProps {
  project: Project;
  onRename: (projectId: string, name: string) => Promise<void>;
  onDuplicate: (projectId: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onPublish: (projectId: string) => Promise<void>;
  onExport: (project: Project) => Promise<void>;
}

export function ProjectActionsMenu({ project, onRename, onDuplicate, onDelete, onPublish, onExport }: ProjectActionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(project.name);

  useEffect(() => {
    if (renameOpen) {
      setName(project.name);
    }
  }, [renameOpen, project.name]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== project.name) {
      await onRename(project.id, trimmed);
    }
    setRenameOpen(false);
  };

  const published = Boolean(project.publishedAt);

  return (
    <div className="flex items-center" onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Project actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={8} align="end" className="w-[14rem]">
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Edit2 className="h-4 w-4" />
            Rename Project
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onDuplicate(project.id)}>
            <Copy className="h-4 w-4" />
            Duplicate Project
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete Project
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => onPublish(project.id)}>
            <Upload className="h-4 w-4" />
            {published ? "Re-publish" : "Publish"}
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onExport(project)}>
            <Download className="h-4 w-4" />
            Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Update this project's title without changing its content.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <label htmlFor="project-rename-input" className="text-sm font-medium text-muted-foreground">
              Project name
            </label>
            <Input
              id="project-rename-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm transition hover:bg-muted"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground transition hover:bg-primary/90"
              onClick={handleSave}
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this project will remove it from your project dashboard permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm transition hover:bg-muted" onClick={() => setDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm text-destructive-foreground transition hover:bg-destructive/90"
              onClick={async () => {
                await onDelete(project.id);
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
