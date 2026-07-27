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
import { createProject as createCloudProject, updateProject as updateCloudProject, deleteProject as deleteCloudProject } from "@/services/project";
import { deleteBuilderProject, getBuilderProject, saveBuilderProject } from "@/services/builderProject";
import { buildSiteExport } from "@/lib/builder/preview";
import { useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "./ClientOnly";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { PremiumThumbnailPlaceholder } from "./PremiumThumbnailPlaceholder";
import { formatUpdatedAt } from "@/lib/utils";

export function MyProjects() {
  const { user } = useAuth();
  const { projects, loading, error } = useCloudProjects();
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
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid" as "grid"|"list");
  const [statusFilter, setStatusFilter] = useState("all" as "all"|"published"|"draft"|"private");
  const [createOpen, setCreateOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [projectName, setProjectName] = useState("My Project");
  const [exportLoading, setExportLoading] = useState(false);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);

  useEffect(() => setLocalProjects(projects), [projects]);

  async function handleRenameSave() {
    if (!activeProject) return;
    try {
      await updateCloudProject(activeProject.id, { name: renameValue });
      setLocalProjects((prev: any[]) => prev.map((p) => (p.id === activeProject.id ? { ...p, name: renameValue } : p)));
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
      await deleteCloudProject(activeProject.id);
      try {
        await deleteBuilderProject(activeProject.id);
      } catch (e) {
        // Ignore if builder project was not present locally.
      }

      setLocalProjects((prev: any[]) => prev.filter((p) => p.id !== activeProject.id));

      if (currentProjectId === activeProject.id) {
        navigate({ to: "/dashboard" as never });
      }

      toast.success("Project deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setActiveProject(null);
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
    let list = localProjects ?? [];
    if (search) {
      list = list.filter((p: any) => (p.name || "").toLowerCase().includes(search));
    }
    const byDate = (a: any, b: any, key = "updatedAt") => {
      const aVal = typeof a[key]?.toDate === "function" ? a[key].toDate().getTime() : Number(a[key] ?? 0);
      const bVal = typeof b[key]?.toDate === "function" ? b[key].toDate().getTime() : Number(b[key] ?? 0);
      return bVal - aVal;
    };
    switch (sort) {
      case "newest":
        list = list.slice().sort((a: any, b: any) => byDate(a, b, "createdAt"));
        break;
      case "oldest":
        list = list.slice().sort((a: any, b: any) => -byDate(a, b, "createdAt"));
        break;
      case "az":
        list = list.slice().sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "recent":
        list = list.slice().sort((a: any, b: any) => byDate(a, b, "updatedAt"));
        break;
    }
    if (statusFilter !== "all") {
      list = list.filter((p: any) => (p.status ?? "draft") === statusFilter);
    }

    return list;
  }, [localProjects, q, sort]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse rounded-2xl border border-border/70 bg-card p-4 h-36" />
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

  if (!projects.length) {
  return (
    <div className="rounded-[32px] border border-dashed border-border/70 bg-slate-50 p-10 text-center shadow-sm">
      {/* DEBUG */}
      <div className="mb-6 rounded-lg bg-red-100 border border-red-300 p-4 text-left text-red-700">
        <div><strong>loading:</strong> {String(loading)}</div>
        <div><strong>error:</strong> {String(error)}</div>
        <div><strong>projects.length:</strong> {projects.length}</div>
        <div><strong>filteredProjects.length:</strong> {filteredProjects.length}</div>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(projects, null, 2)}
        </pre>
      </div>

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-700">
        <Folder className="h-10 w-10" />
      </div>

      <div className="mt-6 text-2xl font-semibold text-foreground">
        No projects yet
      </div>

      <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
        Create your first project to begin building websites with your own pages,
        widgets, and templates.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          type="button"
          className=""
          variant="ghost"
          onClick={() => {
            const id = newProject("My Project");
            navigate({ to: "/editor/$projectId", params: { projectId: id } });
          }}
        >
          <Plus className="h-5 w-5 text-violet-600" />
          <span className="ml-2">Create Project</span>
        </Button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <CreateProjectDialog
        open={createOpen}
        projectName={projectName}
        step={wizardStep}
        onProjectNameChange={setProjectName}
        onNext={() => setWizardStep(2)}
        onCancel={() => { setCreateOpen(false); setWizardStep(1); }}
        onCreateCustom={() => {
          const name = projectName.trim() || "My Project";
          const createdId = newProject(name);
          setShowProjectDashboard(false);
          navigate({ to: "/editor/$projectId", params: { projectId: createdId } });
          setCreateOpen(false);
          setWizardStep(1);
        }}
        onCreateTemplate={() => {
          setCreateOpen(false);
          navigate({ to: "/dashboard/templates" as never });
        }}
      />
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
              <p className="mt-1 text-sm text-slate-500">Manage all your website projects in one place.</p>
            </div>

            <div className="flex items-center gap-4">
              <Button className="h-12 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md hover:brightness-105" onClick={() => { setProjectName("My Project"); setWizardStep(1); setCreateOpen(true); }}>
                <Plus className="h-4 w-4" />
                <span className="ml-2">Create New Project</span>
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[420px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." className="pl-12 pr-4 h-12 rounded-2xl bg-white border" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-10 rounded-xl border px-3">
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="az">Sort: A - Z</option>
                <option value="recent">Sort: Recently Edited</option>
              </select>

              <select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-10 rounded-xl border px-3">
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="private">Private</option>
              </select>

              <div className="inline-flex items-center rounded-xl border bg-white p-1">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-violet-50 text-violet-600" : "text-slate-500"}`}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-violet-50 text-violet-600" : "text-slate-500"}`}><List className="h-4 w-4" /></button>
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
        <AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!open) { setDeleteOpen(false); setActiveProject(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete this project? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setDeleteOpen(false); setActiveProject(null); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  

        {filteredProjects.map((projectRecord: any) => {
          const isSelected = projectRecord.id === currentProjectId;
          const pagesCount = Array.isArray(projectRecord.pages) ? projectRecord.pages.length : 0;
          return (
            <div key={projectRecord.id} className={`group w-full rounded-[20px] border bg-white transition transform hover:-translate-y-1 hover:shadow-xl overflow-hidden`}> 
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
                  <button
                    className="rounded-full bg-white p-2 shadow-sm"
                    onClick={async (e) => {
                      e.stopPropagation();
                      setLocalProjects((prev: any[]) => prev.map((p) => (p.id === projectRecord.id ? { ...p, favorite: !p.favorite } : p)));
                      try {
                        await updateCloudProject(projectRecord.id, { favorite: !projectRecord.favorite });
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    <Star className={`h-4 w-4 ${projectRecord.favorite ? "text-yellow-400" : "text-slate-400"}`} />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-full bg-white p-2 shadow-sm text-slate-500 hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={8} align="end" className="w-44">
                      <DropdownMenuItem onSelect={() => { setActiveProject(projectRecord); setRenameValue(projectRecord.name || ""); setRenameOpen(true); }}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onSelect={async () => { try { await updateCloudProject(projectRecord.id, { status: "published" }); setLocalProjects((prev: any[]) => prev.map((p) => p.id === projectRecord.id ? { ...p, status: "published" } : p)); } catch (err) { console.error(err); } }}>Publish</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDuplicateProject(projectRecord)}>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { setActiveProject(projectRecord); setDeleteOpen(true); }}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 leading-6 truncate">{projectRecord.name}</h3>
                    <div className="mt-1 text-sm text-violet-600">{projectRecord.templateId ?? "Custom"}</div>
                  </div>

                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${projectRecord.status === "published" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : projectRecord.status === "private" ? "bg-slate-900 text-white" : "bg-amber-100 text-amber-800"}`}>
                    {projectRecord.status === "published" ? "Published" : projectRecord.status === "private" ? "Private" : "Draft"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-600">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>{pagesCount} Page{pagesCount === 1 ? "" : "s"}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-600">
                      <Clock3 className="h-4 w-4" />
                      <ClientOnly><span>{formatUpdatedAt(projectRecord.updatedAt)}</span></ClientOnly>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button size="sm" variant="outline" className="h-11 w-full flex items-center justify-center gap-2" onClick={async () => { await loadCloudProject(projectRecord.id); navigate({ to: "/editor/$projectId", params: { projectId: projectRecord.id } }); }}>
                    <Edit2 className="h-4 w-4" /> Edit
                  </Button>
                  <Button size="sm" className="h-11 w-full bg-violet-600 text-white hover:bg-violet-700 flex items-center justify-center gap-2" onClick={async () => { await handlePreviewProject(projectRecord.id); }}>
                    <Eye className="h-4 w-4" /> Preview
                  </Button>
                  <Button size="sm" variant="outline" className="h-11 w-full flex items-center justify-center gap-2" onClick={() => handleExportProject(projectRecord.id)} disabled={exportLoading}>
                    <Download className="h-4 w-4" /> Export HTML
                  </Button>
                  <Button size="sm" variant="destructive" className="h-11 w-full flex items-center justify-center gap-2" onClick={() => { setActiveProject(projectRecord); setDeleteOpen(true); }}>
                    <Trash2 className="h-4 w-4" /> {deleteLoading && activeProject?.id === projectRecord.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Create New Card */}
        <div className="group w-full rounded-[20px] border-2 border-dashed border-border bg-white transition transform hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center p-6">
          <div className="h-36 w-full flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Create New Project</h3>
              <p className="mt-1 text-sm text-slate-500">Start building your next amazing website</p>
              <div className="mt-4">
                <Button onClick={() => { setProjectName("My Project"); setWizardStep(1); setCreateOpen(true); }} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">Create New Project</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

  // Create modal shared with dashboard
  
