"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowRight, ChevronRight, Layers, Plus, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useBuilder } from "@/lib/builder/store";
import { useCloudProjects } from "@/lib/builder/useCloudProjects";
import { useProjects } from '@/hooks/useProjects';
import { ClientOnly } from "./ClientOnly";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useRequireAuth } from "@/lib/builder/useRequireAuth";
import { TEMPLATE_LIBRARY } from "@/lib/builder/templates";
interface ProjectDashboardProps {
  onOpenEditor?: (projectId: string) => void;
}

function formatDate(value?: any) {
  if (!value) return "Unknown";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }
  if (typeof value === "number") {
    return new Date(value).toLocaleDateString();
  }
  return new Date(value).toLocaleDateString();
}

export function ProjectDashboard({ onOpenEditor }: ProjectDashboardProps) {
  const { user } = useAuth();
  const { projects, loading, refresh } = useCloudProjects();
  const loadCloudProject = useBuilder((s) => s.loadCloudProject);
  const projectsMap = useBuilder((s) => s.projects);
  const localProjects = useMemo(() => Object.values(projectsMap), [projectsMap]);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const { deleteExistingProject } = useProjects();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleProjects = useMemo(() => {
    const source = user ? projects : localProjects;
    return source.filter((p: any) => p.status !== "trashed").slice(0, 4);
  }, [user, projects, localProjects]);
  const recentTemplates = TEMPLATE_LIBRARY.slice(0, 4);

  const openProject = async (projectId: string) => {
    const builderState = useBuilder.getState();
    const localProject = builderState.projects[projectId];
    
    if (localProject) {
      builderState.loadProject(projectId);
      setShowProjectDashboard(false);
      navigate({
        to: "/editor/$projectId",
        params: { projectId },
      });
      onOpenEditor?.(projectId);
      return;
    }
    
    if (user) {
      await loadCloudProject(projectId);
      setShowProjectDashboard(false);
      navigate({
        to: "/editor/$projectId",
        params: { projectId },
      });
      onOpenEditor?.(projectId);
    }
  };

  const requirePreviewAuth = useRequireAuth("preview");

  const openPreviewWindow = (project: any) => {
    const currentPage = project.pages.find((p: any) => p.id === project.currentPageId) || project.pages[0];
    if (!currentPage) {
      toast.error("Preview failed: No page available for preview");
      return;
    }

    const previewSlug = `${project.name.replace(/\s+/g, '-').toLowerCase()}-${project.id}`;
    const previewUrl = `${window.location.origin}/demo/${encodeURIComponent(previewSlug)}?page=${encodeURIComponent(currentPage.slug)}`;
    const win = window.open(previewUrl, '_blank');
    if (!win) {
      toast.error("Preview failed: popup blocked");
      return;
    }

    const payload = {
      __lovablePreviewPayload: true,
      projectId: project.id,
      project,
      pageId: currentPage.id,
    };

    try {
      win.postMessage(payload, window.location.origin);
    } catch (err) {
      console.error("Preview postMessage failed", err);
    }

    const postInterval = window.setInterval(() => {
      if (win.closed) { window.clearInterval(postInterval); return; }
      try { win.postMessage(payload, window.location.origin); } catch (_) { console.warn("Preview retry postMessage failed"); }
    }, 250);
    window.setTimeout(() => window.clearInterval(postInterval), 2000);
    win.focus();
    toast.success("Preview opened", { duration: 2000, position: "top-center" });
  };

  const handlePreviewProject = async (id: string) => {
    await requirePreviewAuth(async () => {
      const builderState = useBuilder.getState();
      const localProject = builderState.projects[id];
      
      if (localProject) {
        openPreviewWindow(localProject);
        return;
      }
      
      if (user) {
        await loadCloudProject(id);
        const p = useBuilder.getState().projects[id];
        if (p) {
          openPreviewWindow(p);
        } else {
          toast.error("Preview failed: Unable to load project for preview");
        }
      }
    });
  };

  const createNewProject = () => {
    setCreateOpen(true);
  };

  const openTemplates = () => {
    navigate({ to: "/dashboard/templates" as never });
  };

  const closeCreateWizard = () => {
    setCreateOpen(false);
  };

  const firstName = user ? (user.name?.split(" ")[0] || "there") : "Guest";

  return (
    <div className="mx-auto min-h-[calc(100vh-100px)] max-w-[1580px] px-3 py-4 sm:px-4 lg:px-6">
      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        openWidgetsPanelForBlank
      />

      <div className="space-y-6">
        <main className="space-y-6">
          {/* <section className="rounded-sm bg-[#1F1F1F] p-6 shadow-sm ring-1 ring-[#363636]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-col gap-2.5">
                  <h1 className="text-4xl font-semibold tracking-tight text-[#F5F5F5] sm:text-5xl">
                    Welcome back, {firstName} 👋
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-[#969696]">
                    Create, manage, and grow your websites all in one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openTemplates}
                  className="inline-flex items-center justify-center rounded-full border border-[#363636] bg-[#1F1F1F] px-4 py-2 text-sm font-semibold text-[#F5F5F5] shadow-sm transition hover:bg-[#242424]"
                >
                  <Layers className="mr-2 h-4 w-4" /> Browse Templates
                </button>
                <button
                  type="button"
                  onClick={createNewProject}
                  className="inline-flex items-center justify-center rounded-full bg-[#FACC15] px-5 py-2 text-sm font-semibold text-[#111111] shadow-lg shadow-[#FACC15]/10 transition hover:bg-[#FDE047]"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create New Project
                </button>
              </div>
            </div>
          </section> */}

          <section className="rounded-sm bg-[#1F1F1F] p-6 shadow-sm ring-1 ring-[#363636]">
             <div className="max-w-3xl mb-4">
                <div className="flex flex-col gap-2.5">
                  <h1 className="text-4xl font-semibold tracking-tight text-[#F5F5F5] sm:text-5xl">
                    Welcome back, {firstName} 👋
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-[#969696]">
                    Create, manage, and grow your websites all in one place.
                  </p>
                </div>
              </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
               
              <div>
                <p className="text-lg font-semibold text-[#F5F5F5]">Recent Projects</p>
                <p className="text-sm text-[#969696]">Manage your active websites in one place.</p>
              </div>
              <button
                onClick={() => navigate({ to: "/dashboard/projects" as never })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FACC15] transition hover:text-[#FDE047]"
              >
                View all projects <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <button
                type="button"
                onClick={createNewProject}
                className="group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#FACC15] bg-[#1F1F1F] p-5 text-center transition hover:border-[#FDE047] hover:bg-[#242424]"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FACC15] text-[#111111] shadow-sm">
                  <Plus className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-base font-semibold text-[#F5F5F5]">Create New Project</p>
                  <p className="mt-1 text-sm text-[#969696]">Start from scratch or choose a template</p>
                </div>
              </button>

              {visibleProjects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#363636] bg-[#1F1F1F] p-10 text-center">
                  <p className="text-base font-semibold text-[#F5F5F5]">No recent projects yet</p>
                  <p className="mt-2 text-sm text-[#969696]">Create your first project to see it here.</p>
                </div>
              )}

              {visibleProjects.map((project: any) => {
                const published = project.status === "published";
                return (
                  <div
                    key={project.id}
                    className="group relative overflow-hidden rounded-2xl border border-[#363636] bg-[#1F1F1F] shadow-sm transition transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    onClick={() => openProject(project.id)}
                    title={project.name}
                  >
                    <div className="relative h-36 overflow-hidden">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-tr from-[#2B2B2B] to-[#1F1F1F]" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-[#1F1F1F]/90 px-2 py-1 text-[11px] font-semibold text-[#D0D0D0]">
                        <Star className={`h-4 w-4 ${project.favorite ? 'text-[#FACC15]' : 'text-[#969696]'}`} />
                      </div>

                      <div className="absolute right-3 top-3">
                        <ProjectActionsMenu
                          project={project as any}
                          onOpen={(id) => openProject(id)}
                           onPreview={handlePreviewProject}
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#F5F5F5] truncate">{project.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-[#2B2B2B] text-[#D0D0D0]'}`}>{published ? 'Published' : 'Draft'}</span>
                      </div>
                      <div className="mt-2 text-[12px] text-[#969696] flex items-center justify-between">
                        <div>Edited <ClientOnly>{formatDate(project.updatedAt)}</ClientOnly></div>
                        <div>{(project.pages || []).length} page{(project.pages || []).length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-sm bg-[#1F1F1F] p-6 shadow-sm ring-1 ring-[#363636]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F5F5F5]">Recent Templates</p>
                <p className="text-sm text-[#969696]">New design ideas for your next site.</p>
              </div>
              <button
                onClick={() => navigate({ to: "/dashboard/templates" as never })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FACC15] transition hover:text-[#FDE047]"
              >
                Browse all <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {recentTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => navigate({ to: "/dashboard/templates" as never })}
                  className="group overflow-hidden rounded-2xl border border-[#363636] bg-[#1F1F1F] text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-32 overflow-hidden bg-[#242424]">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="text-base font-semibold text-[#F5F5F5]">{template.name}</p>
                    <p className="text-sm text-[#969696]">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
