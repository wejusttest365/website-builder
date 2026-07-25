import { useMemo, useState } from "react";
import { Search, Folder, Clock3, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useBuilder } from "@/lib/builder/store";
import { useCloudProjects } from "@/lib/builder/useCloudProjects";
import { useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "./ClientOnly";

const newProject = useBuilder((s) => s.newProject);
function formatUpdatedAt(value?: any) {
  if (!value) return "Unknown";
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (typeof value === "number") {
    return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MyProjects() {
  const { user } = useAuth();
  const { projects, loading, error } = useCloudProjects();
  const loadCloudProject = useBuilder((s) => s.loadCloudProject);
const newProject = useBuilder((s) => s.newProject);
  const currentProjectId = useBuilder((s) => s.currentProjectId);
  const [q, setQ] = useState("");
const navigate = useNavigate();

const filteredProjects = useMemo(() => {
  const search = q.trim().toLowerCase();

  if (!search) return projects;

  return projects.filter((project) =>
    project.name.toLowerCase().includes(search)
  );
}, [projects, q]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse rounded-3xl border border-border/70 bg-card p-5" />
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-700">
          <Folder className="h-10 w-10" />
        </div>
        <div className="mt-6 text-2xl font-semibold text-foreground">No projects yet</div>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
          Create your first project to begin building websites with your own pages, widgets, and templates.
        </p>
       <Button
  type="button"
  className="mt-6"
  variant="default"
  onClick={() => {
    const id = newProject("My Project");

    navigate({
      to: "/editor/$projectId",
      params: {
        projectId: id,
      },
    });
  }}
>
  <Plus className="h-4 w-4" />
  Create Project
</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Projects</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">My Projects</h2>
          </div>
      <Button
  variant="secondary"
  size="sm"
  onClick={() => {
    const id = newProject("My Project");

    navigate({
      to: "/editor/$projectId",
      params: {
        projectId: id,
      },
    });
  }}
>
  Create New
</Button>
        </div>

        <div className="mt-4 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search projects..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredProjects.map((projectRecord) => {
          const isSelected = projectRecord.id === currentProjectId;
          return (
            <button
              key={projectRecord.id}
              type="button"
              onClick={() => loadCloudProject(projectRecord.id)}
              className={`group w-full rounded-3xl border p-4 text-left shadow-sm transition ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border/70 bg-white hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Folder className="h-4 w-4 text-primary" />
                    <span className="truncate">{projectRecord.name}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{projectRecord.pages.length} pages</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <ClientOnly>
                    <span>{formatUpdatedAt(projectRecord.updatedAt)}</span>
                  </ClientOnly>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded-full border border-border/70 bg-muted px-2 py-1">Open</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
