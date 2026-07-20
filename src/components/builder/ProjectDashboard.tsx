"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronRight, Crown, Heart, Layers, Plus, ShieldCheck, Sparkles, Star, Trash2, Users } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBuilder, type Project } from "@/lib/builder/store";
import { buildSiteExport } from "@/lib/builder/preview";
import { createProject as createCloudProject, deleteProject as deleteCloudProject, updateProject as updateCloudProject } from "@/services/project";
import { useCloudProjects } from "@/lib/builder/useCloudProjects";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { EmptyProjectsState } from "./EmptyProjectsState";

interface CloudProjectRecord {
  id: string;
  ownerId: string;
  project: Project;
  createdAt?: any;
  updatedAt?: any;
}

interface ProjectDashboardProps {
  onOpenEditor: () => void;
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
  const newProject = useBuilder((s) => s.newProject);
  const renameProject = useBuilder((s) => s.renameProject);
  const duplicateProject = useBuilder((s) => s.duplicateProject);
  const deleteProject = useBuilder((s) => s.deleteProject);
  const publishProject = useBuilder((s) => s.publishProject);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);
  const [createOpen, setCreateOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [projectName, setProjectName] = useState("My Project");

  const openProject = async (projectId: string) => {
    await loadCloudProject(projectId);
    onOpenEditor();
  };

  const createNewProject = () => {
    setProjectName("My Project");
    setWizardStep(1);
    setCreateOpen(true);
  };

  const openTemplates = () => {
    setLeftPanelOpen(true);
    setLeftPanelView("templates");
    onOpenEditor();
  };

  const closeCreateWizard = () => {
    setCreateOpen(false);
    setWizardStep(1);
  };

  const goToStepTwo = () => setWizardStep(2);

  const handleCreateProject = (useTemplate: boolean) => {
    const name = projectName.trim() || "My Project";
    newProject(name);
    setLeftPanelOpen(true);
    if (useTemplate) {
      setLeftPanelView("templates");
    } else {
      setLeftPanelView("widgets");
    }
    setCreateOpen(false);
    setWizardStep(1);
    onOpenEditor();
  };

  const onRename = async (projectId: string, name: string) => {
    await loadCloudProject(projectId);
    renameProject(projectId, name);
    const updated = useBuilder.getState().projects[projectId];
    if (updated) {
      await updateCloudProject(projectId, updated);
      refresh();
      toast.success("Project renamed");
    }
  };

  const onDuplicate = async (projectId: string) => {
    await loadCloudProject(projectId);
    const newId = duplicateProject(projectId);
    const duplicated = useBuilder.getState().projects[newId];
    if (duplicated) {
      await createCloudProject(duplicated);
      refresh();
      toast.success("Project duplicated");
    }
  };

  const onDelete = async (projectId: string) => {
    deleteProject(projectId);
    try {
      await deleteCloudProject(projectId);
      refresh();
      toast.success("Project deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project from cloud");
    }
  };

  const onPublish = async (projectId: string) => {
    await loadCloudProject(projectId);
    publishProject(projectId);
    const published = useBuilder.getState().projects[projectId];
    if (published) {
      await updateCloudProject(projectId, published);
      refresh();
      toast.success("Project published");
    }
  };

  const onExport = async (project: Project) => {
    try {
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to export project");
    }
  };

  const cardItems = useMemo(() => projects, [projects]);

  if (!user) {
    return (
      <div className="flex min-h-[450px] items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Sign in to view your dashboard.
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0] || "there";
  const visibleProjects = cardItems.slice(0, 4);

  const recentTemplates = [
    { title: "Business Consultant", subtitle: "Business" },
    { title: "Creative Portfolio", subtitle: "Portfolio" },
    { title: "Online Store", subtitle: "E-Commerce" },
    { title: "Fitness Trainer", subtitle: "Health & Fitness" },
  ];

  const activityFeed = [
    { label: `You published "${cardItems[0]?.project.name ?? "Architecture Firm"}"`, description: "2 hours ago", icon: ShieldCheck, color: "text-emerald-600" },
    { label: `You edited "${cardItems[1]?.project.name ?? "Digital Agency"}"`, description: "Yesterday", icon: Sparkles, color: "text-sky-600" },
    { label: `You duplicated "${cardItems[2]?.project.name ?? "Portfolio Website"}"`, description: "2 days ago", icon: Star, color: "text-violet-600" },
    { label: `You deleted "${cardItems[3]?.project.name ?? "Old Project"}"`, description: "3 days ago", icon: Trash2, color: "text-rose-600" },
  ];

  const storageItems = [
    { label: "Projects", value: "5.1 GB", color: "bg-violet-500" },
    { label: "Templates", value: "1.2 GB", color: "bg-sky-500" },
    { label: "Assets", value: "0.9 GB", color: "bg-amber-400" },
  ];

  return (
    <div className="mx-auto min-h-[calc(100vh-100px)] max-w-[1580px] px-3 py-4 sm:px-4 lg:px-6">
      <CreateProjectDialog
        open={createOpen}
        projectName={projectName}
        step={wizardStep}
        onProjectNameChange={setProjectName}
        onNext={goToStepTwo}
        onCancel={closeCreateWizard}
        onCreateCustom={() => handleCreateProject(false)}
        onCreateTemplate={() => handleCreateProject(true)}
      />

      <div className="space-y-6">
        <main className="space-y-6">
          <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-col gap-2.5">
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    Welcome back, {firstName}! 👋
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600">
                    Create, manage, and grow your websites all in one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openTemplates}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  <Layers className="mr-2 h-4 w-4" /> Browse Templates
                </button>
                <button
                  type="button"
                  onClick={createNewProject}
                  className="inline-flex items-center justify-center rounded-full bg-violet-950 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-950/10 transition hover:bg-violet-900"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create New Project
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Your Projects</p>
                <p className="text-sm text-slate-500">Manage your active websites in one place.</p>
              </div>
              <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
                View all projects <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <button
                type="button"
                onClick={createNewProject}
                className="group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-violet-300 bg-violet-50 p-5 text-center transition hover:border-violet-400 hover:bg-violet-100"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-violet-950 shadow-sm">
                  <Plus className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-950">Create New Project</p>
                  <p className="mt-1 text-sm text-slate-500">Start from scratch or choose a template</p>
                </div>
              </button>

              {visibleProjects.map(({ id, project }) => {
                const published = Boolean(project.publishedAt);
                return (
                  <div key={id} className="group flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-slate-200">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-slate-900/0" />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-950">{project.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{published ? "Published" : "Draft"}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                          {published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>Edited {formatDate(project.updatedAt)}</span>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Users className="h-4 w-4" />
                          <span>3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Recent Templates</p>
                  <p className="text-sm text-slate-500">New design ideas for your next site.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <ArrowRight className="h-4 w-4" /> Browse all
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {recentTemplates.map((template) => (
                  <div key={template.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                    <div className="h-32 bg-gradient-to-br from-violet-950 via-violet-700 to-slate-900" />
                    <div className="space-y-2 p-4">
                      <p className="text-base font-semibold text-slate-950">{template.title}</p>
                      <p className="text-sm text-slate-500">{template.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Activity Feed</p>
                  <p className="text-sm text-slate-500">Recent actions</p>
                </div>
                <button className="text-sm font-semibold text-violet-700 transition hover:text-violet-900">View all</button>
              </div>

              <div className="mt-5 space-y-3">
                {activityFeed.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
                    <span className={`mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl ${item.color} bg-opacity-20 text-current`}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Storage Usage</p>
                <p className="text-sm text-slate-500">Your file storage summary</p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">7.2 GB Used</span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
              <div className="flex items-center justify-center">
                <div className="relative h-40 w-40">
                  <div className="absolute inset-0 rounded-full bg-slate-100" />
                  <div className="absolute inset-6 rounded-full bg-violet-500/20" />
                  <div className="absolute inset-10 rounded-full bg-sky-500/20" />
                  <div className="absolute inset-16 rounded-full bg-amber-400/20" />
                  <div className="absolute inset-0 flex items-center justify-center text-base font-semibold text-slate-900">7.2 GB</div>
                </div>
              </div>
              <div className="space-y-3">
                {storageItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.value}</p>
                    </div>
                    <span className={`inline-flex h-3.5 w-3.5 rounded-full ${item.color}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-gradient-to-r from-violet-950 via-violet-800 to-violet-700 p-6 text-white shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-200">Build faster with AI</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Let AI generate websites, content, and layouts for you in seconds.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
                  Use our AI assistant to jumpstart your next website and turn ideas into published pages faster.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-violet-950 transition hover:bg-slate-100">
                  Try AI Website
                </button>
                <button className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
                  Learn More
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Team Workspace</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">Collaborate with your team and manage projects together.</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  <Users className="h-4 w-4" /> Invite Members
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-900">
                  <ShieldCheck className="h-4 w-4" /> Manage Team
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
