import { useEffect, useMemo, useState } from "react";
import { Search, Folder, Clock3, Plus, Star, MoreHorizontal, LayoutGrid, List, Trash2, Edit2, Eye, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { useBuilder, type Page } from "@/lib/builder/store";
import { useCloudProjects } from "@/lib/builder/useCloudProjects";
import { createProject as createCloudProject, updateProject as updateCloudProject } from "@/services/project";
import { useProjects } from '@/hooks/useProjects';
import { useCloudProjectsStore } from '@/lib/builder/cloudProjectsStore';
import { deleteBuilderProject, getBuilderProject, saveBuilderProject } from "@/services/builderProject";
import { buildSiteExport } from "@/lib/builder/preview";
import { useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "./ClientOnly";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { PremiumThumbnailPlaceholder } from "./PremiumThumbnailPlaceholder";
import { formatUpdatedAt } from "@/lib/utils";

interface MyProjectsProps {
  title?: string;
  subtitle?: string;
  showOnlyFavorites?: boolean;
  showOnlyTrashed?: boolean;
  hideCreateAction?: boolean;
}

export function MyProjects({
  title = "My Projects",
  subtitle = "Manage all your website projects in one place.",
  showOnlyFavorites = false,
  showOnlyTrashed = false,
  hideCreateAction = false,
}: MyProjectsProps) {
  const { user } = useAuth();
  const { projects, loading, error, refresh } = useCloudProjects();
//   console.log("loading =", loading);
// console.log("error =", error);
// console.log("projects =", projects);
// console.log("projects.length =", projects.length);
  const loadCloudProject = useBuilder((s) => s.loadCloudProject);
  const newProject = useBuilder((s) => s.newProject);
  const currentProjectId = useBuilder((s) => s.currentProjectId);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest" as "newest" | "oldest" | "az" | "recent");
  const [localProjects, setLocalProjects] = useState(projects);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"move-to-trash" | "delete-forever">("move-to-trash");
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid" as "grid"|"list");
  const [statusFilter, setStatusFilter] = useState("all" as "all"|"published"|"draft"|"private");
  const [createOpen, setCreateOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [animatingFavoriteId, setAnimatingFavoriteId] = useState<string | null>(null);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const { deleteExistingProject } = useProjects();

  useEffect(() => setLocalProjects(projects), [projects]);

  async function handleRenameSave() {
    if (!activeProject) return;
    try {
      await updateCloudProject(activeProject.id, { name: renameValue });
      setLocalProjects((prev: any[]) => prev.map((p) => (p.id === activeProject.id ? { ...p, name: renameValue } : p)));
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRenameOpen(false);
      setActiveProject(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!activeProject) return;
    setDeleteLoading(true);

    try {
      // Use centralized deletion to ensure all stores and caches are updated
      if (deleteMode === 'delete-forever') {
        await deleteExistingProject(activeProject.id);
        setLocalProjects((prev: any[]) => prev.filter((p) => p.id !== activeProject.id));
        toast.success('Project permanently deleted');
      } else {
        const now = Date.now();
        // Move to trash via cloud update and refresh
        await updateCloudProject(activeProject.id, { status: 'trashed', updatedAt: now });
        setLocalProjects((prev: any[]) => prev.map((p) => (p.id === activeProject.id ? { ...p, status: 'trashed', updatedAt: now } : p)));
        useCloudProjectsStore.getState().refreshProjects();

        if (currentProjectId === activeProject.id) {
          navigate({ to: "/dashboard" as never });
        }

        toast.success('Project moved to Trash');
      }
    } catch (err) {
      console.error(err);
      toast.error(deleteMode === "delete-forever" ? "Failed to delete project permanently. Please try again." : "Failed to move project to Trash. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setActiveProject(null);
      setDeleteMode("move-to-trash");
    }
  }

  function slugifyName(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";
  }

  async function handleDuplicateProject(projectRecord: any) {
    try {
      // Load the full builder project
      const fullProject = await getBuilderProject(projectRecord.id);
      if (!fullProject) {
        toast.error("Could not load project to duplicate");
        return;
      }

      const newId = nanoid(8);
      const newName = `${fullProject.name || "Untitled"} (copy)`;
      const now = Date.now();

      // Create duplicated builder project
      const duplicatedProject = {
        ...fullProject,
        id: newId,
        name: newName,
        createdAt: now,
        updatedAt: now,
      };

      // Save full builder project
      await saveBuilderProject(duplicatedProject);

      // Create cloud metadata
      await createCloudProject({
        id: newId,
        name: newName,
        templateId: projectRecord.templateId || null,
        thumbnail: projectRecord.thumbnail || "",
        description: projectRecord.description || "",
        favorite: false,
        status: projectRecord.status || "draft",
        isPublic: projectRecord.isPublic || false,
        createdAt: now,
        updatedAt: now,
        pages: duplicatedProject.pages.map((p: any) => p.slug),
      });

      // Update local state
      setLocalProjects((prev: any[]) => [
        {
          ...projectRecord,
          id: newId,
          name: newName,
          createdAt: now,
          updatedAt: now,
          favorite: false,
        },
        ...(prev || []),
      ]);
      refresh();

      toast.success("Project duplicated successfully");
    } catch (err) {
      console.error("Duplicate error:", err);
      toast.error("Failed to duplicate project. Please try again.");
    }
  }

  async function handlePreviewProject(projectId: string) {
    await loadCloudProject(projectId);
    const project = useBuilder.getState().projects[projectId];
    if (!project) {
      toast.error("Preview failed: Unable to load project for preview");
      return;
    }

    const currentPage = project.pages.find((p: Page) => p.id === project.currentPageId) || project.pages[0];
    if (!currentPage) {
      toast.error("Preview failed: No page available for preview");
      return;
    }

    const previewSlug = `${slugifyName(project.name)}-${project.id}`;
    const previewUrl = `${window.location.origin}/demo/${encodeURIComponent(previewSlug)}?page=${encodeURIComponent(currentPage.slug)}`;
    const previewWindow = window.open(previewUrl, "_blank");
    if (!previewWindow) {
      toast.error("Preview failed: Unable to open preview window");
      return;
    }

    const payload = {
      __lovablePreviewPayload: true,
      projectId,
      project,
      pageId: currentPage.id,
    };

    previewWindow.postMessage(payload, window.location.origin);
    const postInterval = window.setInterval(() => {
      if (previewWindow.closed) {
        window.clearInterval(postInterval);
        return;
      }
      try {
        previewWindow.postMessage(payload, window.location.origin);
      } catch (_) {
        // ignore transient failures while the preview window loads
      }
    }, 250);

    window.setTimeout(() => window.clearInterval(postInterval), 2000);
    previewWindow.focus();
    toast.success("Preview opened", { duration: 2000, position: "top-center" });
  }

  async function handleRestoreProject(projectRecord: any) {
    const now = Date.now();
    try {
      await updateCloudProject(projectRecord.id, { status: "draft", updatedAt: now });
      setLocalProjects((prev: any[]) => prev.map((p) => (p.id === projectRecord.id ? { ...p, status: "draft", updatedAt: now } : p)));
      refresh();
      toast.success("Project restored successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore project. Please try again.");
    }
  }

  async function handleToggleFavorite(projectRecord: any) {
    const nextValue = !projectRecord.favorite;
    const projectId = projectRecord.id;

    setAnimatingFavoriteId(projectId);
    setLocalProjects((prev: any[]) => prev.map((p) => (p.id === projectId ? { ...p, favorite: nextValue } : p)));

    try {
      await updateCloudProject(projectId, { favorite: nextValue });
      refresh();
      toast.success(nextValue ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      console.error(err);
      setLocalProjects((prev: any[]) => prev.map((p) => (p.id === projectId ? { ...p, favorite: !nextValue } : p)));
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      window.setTimeout(() => {
        setAnimatingFavoriteId((currentId) => (currentId === projectId ? null : currentId));
      }, 180);
    }
  }

  async function handleExportProject(projectId: string) {
    setExportLoading(true);
    try {
      await loadCloudProject(projectId);
      const project = useBuilder.getState().projects[projectId];
      if (!project) {
        throw new Error("Unable to load project for export");
      }

      const exportData = await buildSiteExport(project);
      const zip = new JSZip();
      for (const file of exportData.files) {
        if (file.base64) {
          zip.file(file.path, file.base64, { base64: true });
        } else {
          zip.file(file.path, file.content);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Project exported as HTML zip");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export project");
    } finally {
      setExportLoading(false);
    }
  }

  const filteredProjects = useMemo(() => {
    const search = q.trim().toLowerCase();
    let list = (localProjects ?? []).filter((p: any) => {
      if (showOnlyTrashed) return p.status === "trashed";
      if (showOnlyFavorites) return p.favorite && p.status !== "trashed";
      return p.status !== "trashed";
    });

    if (search) {
      list = list.filter((p: any) => (p.name || "").toLowerCase().includes(search));
    }

    const byDate = (a: any, b: any, key = "updatedAt") => {
      const aVal = typeof a[key]?.toDate === "function" ? a[key].toDate().getTime() : Number(a[key] ?? 0);
      const bVal = typeof b[key]?.toDate === "function" ? b[key].toDate().getTime() : Number(b[key] ?? 0);
      return bVal - aVal;
    };

    list = list.slice().sort((a: any, b: any) => {
      const favoriteDiff = Number(Boolean(b.favorite)) - Number(Boolean(a.favorite));
      if (favoriteDiff !== 0) return favoriteDiff;

      switch (sort) {
        case "az":
          return (a.name || "").localeCompare(b.name || "");
        case "newest":
          return byDate(a, b, "createdAt");
        case "oldest":
          return -byDate(a, b, "createdAt");
        case "recent":
        default:
          return byDate(a, b, "updatedAt");
      }
    });

    if (statusFilter !== "all") {
      list = list.filter((p: any) => (p.status ?? "draft") === statusFilter);
    }

    return list;
  }, [localProjects, q, showOnlyFavorites, showOnlyTrashed, sort, statusFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse rounded-sm border border-border/70 bg-card p-4 h-36" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900 shadow-sm">
        <div className="text-base font-semibold text-rose-950">Sign in to view your projects</div>
        <p className="mt-2 text-sm text-rose-700">Your saved projects are available once you sign in with your account.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900 shadow-sm">
        <div className="text-base font-semibold text-rose-950">Unable to load projects</div>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
      </div>
    );
  }

  if (!filteredProjects.length) {
    return (
      <div className="p-6">
        <div className="rounded-sm border border-dashed border-[#363636] bg-[#1F1F1F] p-10 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FACC15]/10 text-[#FACC15]">
            <Folder className="h-10 w-10" />
          </div>

          <div className="mt-6 text-2xl font-semibold text-[#F5F5F5]">
            {showOnlyTrashed ? "Trash is empty" : showOnlyFavorites ? "No favorite projects yet" : "No projects yet"}
          </div>

          <p className="mx-auto mt-3 max-w-xs text-sm text-[#969696]">
            {showOnlyTrashed
              ? "Deleted projects will appear here until you restore or permanently delete them."
              : showOnlyFavorites
                ? "Mark projects as favorites to see them here."
                : "Create your first project to begin building websites with your own pages, widgets, and templates."}
          </p>

          {!showOnlyFavorites && !showOnlyTrashed ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                type="button"
                className="my-2 inline-flex items-center justify-center rounded bg-[#FACC15] px-5 py-2 text-sm font-semibold text-[#111111] shadow-lg shadow-[#FACC15]/10 transition hover:bg-[#FDE047]"
                variant="ghost"
                onClick={() => {
                  const id = newProject("My Project");
                  navigate({ to: "/editor/$projectId", params: { projectId: id } });
                }}
              >
                <Plus className="h-5 w-5 text-[#111111]" />
                Create Project
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171717] p-6">
      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <div className="mx-auto max-w-7xl">
        <div className="rounded-sm bg-[#1F1F1F] p-6 shadow-sm ring-1 ring-[#363636]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F5]">{title}</h1>
              <p className="mt-1 text-sm text-[#969696]">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
              {!hideCreateAction && !showOnlyFavorites && !showOnlyTrashed ? (
                <Button className="h-12 rounded-sm bg-[#FACC15] text-[#111111] shadow-md hover:bg-[#FDE047]" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span className="ml-2">Create New Project</span>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[420px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969696]" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." className="pl-12 pr-4 h-12 rounded-sm bg-[#1F1F1F] border-[#363636] text-[#F5F5F5]" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-10 rounded-xl border border-[#363636] bg-[#1F1F1F] px-3 text-[#F5F5F5]">
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="az">Sort: A - Z</option>
                <option value="recent">Sort: Recently Edited</option>
              </select>

              <select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-10 rounded-xl border border-[#363636] bg-[#1F1F1F] px-3 text-[#F5F5F5]">
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="private">Private</option>
              </select>

              <div className="inline-flex items-center rounded-xl border border-[#363636] bg-[#1F1F1F] p-1">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#FACC15] text-[#111111]" : "text-[#969696]"}`}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#FACC15] text-[#111111]" : "text-[#969696]"}`}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
        {/* Rename Dialog */}
        <Dialog open={renameOpen} onOpenChange={(open) => { if (!open) { setRenameOpen(false); setActiveProject(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>Update this project's title without changing its content.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="Project name" />
            </div>
            <DialogFooter className="mt-4 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => { setRenameOpen(false); setActiveProject(null); }}>Cancel</Button>
              <Button onClick={handleRenameSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!open) { setDeleteOpen(false); setActiveProject(null); setDeleteMode("move-to-trash"); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteMode === "delete-forever" ? "Permanently delete project?" : "Move project to Trash?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteMode === "delete-forever"
                  ? "Are you sure you want to permanently delete this project? This action cannot be undone."
                  : "This project will be moved to Trash and can be restored later."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setDeleteOpen(false); setActiveProject(null); setDeleteMode("move-to-trash"); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? (deleteMode === "delete-forever" ? "Deleting…" : "Moving…") : (deleteMode === "delete-forever" ? "Delete Forever" : "Move to Trash")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  

        {filteredProjects.map((projectRecord: any) => {
          const isSelected = projectRecord.id === currentProjectId;
          const pagesCount = Array.isArray(projectRecord.pages) ? projectRecord.pages.length : 0;
          return (
            <div key={projectRecord.id} className={`group w-full rounded-sm border border-[#363636] bg-[#1F1F1F] transition transform hover:-translate-y-1 hover:shadow-xl overflow-hidden ${showOnlyTrashed ? "cursor-default" : "cursor-pointer"}`}> 
              <div className="relative h-44">
                {projectRecord.thumbnail ? (
                  <img src={projectRecord.thumbnail} alt={projectRecord.name} className="h-44 w-full object-cover" />
                ) : (
                  <PremiumThumbnailPlaceholder
                    projectName={projectRecord.name}
                    templateId={projectRecord.templateId}
                    updatedAt={projectRecord.updatedAt}
                  />
                )}

                <div className="absolute right-3 top-3 flex items-center gap-2">
                  {!showOnlyTrashed ? (
                    <button
                      className="rounded-full bg-[#1F1F1F] p-2 shadow-sm transition-transform duration-150"
                      style={{ transform: animatingFavoriteId === projectRecord.id ? "scale(1.15)" : "scale(1)" }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleToggleFavorite(projectRecord);
                      }}
                    >
                      <Star
                        className={`h-4 w-4 transition-all duration-200 ${projectRecord.favorite ? "text-[#FACC15]" : "text-[#969696]"}`}
                        fill={projectRecord.favorite ? "currentColor" : "none"}
                        strokeWidth={projectRecord.favorite ? 1.8 : 1.8}
                      />
                    </button>
                  ) : null}

                  {showOnlyTrashed ? (
                    <div className="rounded-full bg-[#F87171]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F87171]">
                      Deleted
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full bg-[#1F1F1F] p-2 shadow-sm text-[#969696] hover:text-[#F5F5F5]">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent sideOffset={8} align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => { setActiveProject(projectRecord); setRenameValue(projectRecord.name || ""); setRenameOpen(true); }}>Rename</DropdownMenuItem>
                        <DropdownMenuItem onSelect={async () => { try { await updateCloudProject(projectRecord.id, { status: "published" }); setLocalProjects((prev: any[]) => prev.map((p) => p.id === projectRecord.id ? { ...p, status: "published" } : p)); } catch (err) { console.error(err); } }}>Publish</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDuplicateProject(projectRecord)}>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                          setActiveProject(projectRecord);
                          setDeleteMode(showOnlyTrashed ? "delete-forever" : "move-to-trash");
                          setDeleteOpen(true);
                        }}>
                          {showOnlyTrashed ? "Delete Forever" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[#F5F5F5] leading-6 truncate">{projectRecord.name}</h3>
                    <div className="mt-1 text-sm text-[#969696]">{projectRecord.templateId ?? "Custom"}</div>
                  </div>

                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${projectRecord.status === "published" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : projectRecord.status === "private" ? "bg-[#2B2B2B] text-[#D0D0D0]" : "bg-[#2B2B2B] text-[#D0D0D0]"}`}>
                    {projectRecord.status === "published" ? "Published" : projectRecord.status === "private" ? "Private" : "Draft"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-[#969696]">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-3 py-2 text-[#969696]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>{pagesCount} Page{pagesCount === 1 ? "" : "s"}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-3 py-2 text-[#969696]">
                      <Clock3 className="h-4 w-4" />
                      <ClientOnly><span>{formatUpdatedAt(projectRecord.updatedAt)}</span></ClientOnly>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {showOnlyTrashed ? (
                    <>
                      <Button size="sm" variant="outline" className="h-11 w-full flex items-center justify-center gap-2" onClick={() => handleRestoreProject(projectRecord)}>
                        <Star className="h-4 w-4" /> Restore
                      </Button>
                      <Button size="sm" variant="destructive" className="h-11 w-full flex items-center justify-center gap-2" onClick={() => { setActiveProject(projectRecord); setDeleteMode("delete-forever"); setDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" /> Delete Forever
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="h-11 w-full flex items-center justify-center gap-2" onClick={async () => { await loadCloudProject(projectRecord.id); navigate({ to: "/editor/$projectId", params: { projectId: projectRecord.id } }); }}>
                        <Edit2 className="h-4 w-4" /> Edit
                      </Button>
                      <Button size="sm" className="h-11 w-full bg-[#FACC15] text-[#111111] hover:bg-[#FDE047] flex items-center justify-center gap-2" onClick={async () => { await handlePreviewProject(projectRecord.id); }}>
                        <Eye className="h-4 w-4" /> Preview
                      </Button>
                      <Button size="sm" variant="outline" className="h-11 w-full flex items-center justify-center gap-2" onClick={() => handleExportProject(projectRecord.id)} disabled={exportLoading}>
                        <Download className="h-4 w-4" /> Export HTML
                      </Button>
                      <Button size="sm" variant="destructive" className="h-11 w-full flex items-center justify-center gap-2" onClick={() => { setActiveProject(projectRecord); setDeleteMode("move-to-trash"); setDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" /> {deleteLoading && activeProject?.id === projectRecord.id ? "Moving…" : "Delete"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!showOnlyFavorites && !showOnlyTrashed ? (
          <div className="group w-full rounded-sm border-2 border-dashed border-[#363636] bg-[#1F1F1F] transition transform hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center p-6">
            <div className="h-36 w-full flex items-center justify-center bg-transparent">
              <div className="flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-[#FACC15] text-[#111111] flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#F5F5F5]">Create New Project</h3>
                <p className="mt-1 text-sm text-[#969696]">Start building your next amazing website</p>
                <div className="mt-4">
                   <Button onClick={() => setCreateOpen(true)} className="bg-[#FACC15] text-[#111111] hover:bg-[#FDE047]">Create New Project</Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
    </div>
  );
}
