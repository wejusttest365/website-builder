import { useState } from "react";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { buildExportBundle } from "@/lib/builder/preview";
import JSZip from "jszip";
import { toast } from "sonner";
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Download,
  Plus,
  Save,
  Moon,
  Sun,
  FolderOpen,
  Copy,
  Trash2,
  Settings,
  ChevronDown,
  Share2,
} from "lucide-react";

export function Toolbar() {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const projects = useBuilder((s) => s.projects);
  const device = useBuilder((s) => s.device);
  const setDevice = useBuilder((s) => s.setDevice);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const newProject = useBuilder((s) => s.newProject);
  const rename = useBuilder((s) => s.renameProject);
  const load = useBuilder((s) => s.loadProject);
  const dup = useBuilder((s) => s.duplicateProject);
  const del = useBuilder((s) => s.deleteProject);
  const persist = useBuilder((s) => s.persist);
  const dark = useBuilder((s) => s.dark);
  const toggleDark = useBuilder((s) => s.toggleDark);

  const [exportOpen, setExportOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  const bundle = project
    ? buildExportBundle({
        sections: (pageOf(project)?.sections ?? []),
        globalCss: project.globalCss,
        globalJs: project.globalJs,
        title: project.name,
      })
    : null;

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }

  function download(name: string, content: string, mime = "text/html") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    if (!bundle || !project) return;
    const zip = new JSZip();
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${project.name}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="./style.css" />
</head>
<body>
${bundle.body}
<script src="./script.js"></script>
</body>
</html>`;
    zip.file("index.html", indexHtml);
    zip.file("style.css", bundle.css);
    zip.file("script.js", bundle.js);
    // Write each uploaded image into the `images/` folder so the exported
    // site can reference them via simple `images/<filename>` paths.
    for (const [name, dataUrl] of Object.entries(project.assets ?? {})) {
      const m = /^data:[^;]+;base64,(.*)$/.exec(dataUrl);
      if (m) zip.file(`images/${name}`, m[1], { base64: true });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-14 bg-card border-b border-border flex items-center gap-2 px-3">
      <div className="flex items-center gap-2 pr-2 border-r border-border h-full">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          W
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold leading-none">WebToolOcean</div>
          <div className="text-[10px] text-muted-foreground leading-tight">Website Builder</div>
        </div>
      </div>

      <div className="flex items-center gap-2 pr-2 border-r border-border h-full relative">
        <button
          className="h-8 px-2 rounded-md hover:bg-accent flex items-center gap-1.5 text-xs"
          onClick={() => setProjectsOpen((v) => !v)}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="max-w-[140px] truncate">{project?.name ?? "Project"}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        {projectsOpen && (
          <div className="absolute top-full left-0 mt-1 z-40 w-72 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border p-1">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Projects
            </div>
            <div className="max-h-56 overflow-y-auto">
              {Object.values(projects)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((p) => (
                  <div
                    key={p.id}
                    className={`group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-sm ${p.id === project?.id ? "bg-accent" : ""}`}
                  >
                    <button
                      className="flex-1 text-left truncate"
                      onClick={() => {
                        load(p.id);
                        setProjectsOpen(false);
                      }}
                    >
                      {p.name}
                    </button>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background"
                      title="Duplicate"
                      onClick={() => dup(p.id)}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive"
                      title="Delete"
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) del(p.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
            <div className="border-t border-border mt-1 pt-1">
              <button
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent text-sm flex items-center gap-2"
                onClick={() => {
                  newProject();
                  setProjectsOpen(false);
                }}
              >
                <Plus className="w-3.5 h-3.5" /> New project
              </button>
            </div>
          </div>
        )}
        <input
          value={project?.name ?? ""}
          onChange={(e) => project && rename(project.id, e.target.value)}
          className="w-40 h-8 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <IconBtn title="New project" onClick={() => newProject()}><Plus className="w-4 h-4" /></IconBtn>
      <IconBtn title="Save" onClick={() => { persist(); toast.success("Project saved"); }}><Save className="w-4 h-4" /></IconBtn>
      <IconBtn title="Undo (Ctrl+Z)" onClick={undo}><Undo2 className="w-4 h-4" /></IconBtn>
      <IconBtn title="Redo (Ctrl+Y)" onClick={redo}><Redo2 className="w-4 h-4" /></IconBtn>

      <div className="ml-2 flex items-center gap-1 rounded-lg bg-muted p-0.5">
        {[
          { d: "desktop", Icon: Monitor },
          { d: "tablet", Icon: Tablet },
          { d: "mobile", Icon: Smartphone },
        ].map(({ d, Icon }) => (
          <button
            key={d}
            onClick={() => setDevice(d as "desktop" | "tablet" | "mobile")}
            className={`h-7 w-8 flex items-center justify-center rounded-md transition ${device === d ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title={d}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <IconBtn title="Toggle dark mode" onClick={toggleDark}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </IconBtn>
        <button
          className="h-8 px-3 rounded-md hover:bg-accent flex items-center gap-1.5 text-xs"
          onClick={() => project && window.open(`/preview/${project.id}`, "_blank")}
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button
          className="h-8 px-3 rounded-md hover:bg-accent flex items-center gap-1.5 text-xs"
          onClick={() => {
            if (!project) return;
            const url = `${window.location.origin}/demo/${project.id}`;
            navigator.clipboard.writeText(url);
            toast.success("Share link copied", {
              description: "Opens in the same browser that saved the project.",
            });
          }}
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <div className="relative">
          <button
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 text-xs font-medium"
            onClick={() => setExportOpen((v) => !v)}
          >
            <Download className="w-3.5 h-3.5" /> Export
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {exportOpen && bundle && project && (
            <div
              className="absolute top-full right-0 mt-1 z-40 w-56 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border p-1 text-sm"
              onMouseLeave={() => setExportOpen(false)}
            >
              <MenuBtn onClick={() => copy(bundle.body, "HTML")}>Copy HTML</MenuBtn>
              <MenuBtn onClick={() => copy(bundle.css, "CSS")}>Copy CSS</MenuBtn>
              <MenuBtn onClick={() => copy(bundle.js, "JavaScript")}>Copy JavaScript</MenuBtn>
              <MenuBtn onClick={() => copy(bundle.complete, "Complete site")}>Copy Complete Website</MenuBtn>
              <div className="my-1 border-t border-border" />
              <MenuBtn onClick={() => download(`${project.name}.html`, bundle.complete)}>Download HTML</MenuBtn>
              <MenuBtn onClick={downloadZip}>Download ZIP</MenuBtn>
            </div>
          )}
        </div>
        <IconBtn title="Settings"><Settings className="w-4 h-4" /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent text-foreground/80 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function MenuBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-accent text-xs"
    >
      {children}
    </button>
  );
}
