import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { buildSiteExport } from "@/lib/builder/preview";
import JSZip from "jszip";
import { SaveStatus } from "./SaveStatus";
import { Undo2, Redo2, Monitor, Tablet, Smartphone, Download, Save, Moon, Sun } from "lucide-react";

export function Toolbar() {
  const mounted = useMounted();
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);
  const showCanvasControls = Boolean(project) && !showProjectDashboard;
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const persistWithStatus = useBuilder((s) => s.persistWithStatus);
  const saveStatus = useBuilder((s) => s.saveStatus);
  const saveErrorMessage = useBuilder((s) => s.saveErrorMessage);
  const setDevice = useBuilder((s) => s.setDevice);
  const device = useBuilder((s) => s.device);
  const toggleDark = useBuilder((s) => s.toggleDark);
  const dark = useBuilder((s) => s.dark);

  async function downloadZip() {
    if (!project || !mounted) return;
    const zip = new JSZip();
    const exportData = await buildSiteExport(project);

    for (const f of exportData.files) {
      if (f.base64) {
        zip.file(f.path, f.base64, { base64: true });
      } else {
        zip.file(f.path, f.content);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function slugifyName(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";
  }

  async function openPreview() {
    if (!project || !mounted) return;

    const currentPage = project.pages.find((p) => p.id === project.currentPageId) || project.pages[0];
    if (!currentPage) {
      toast.error('Preview failed: No current page available for preview');
      return;
    }

    const previewSlug = `${slugifyName(project.name)}-${project.id}`;
    const previewUrl = `${window.location.origin}/demo/${encodeURIComponent(previewSlug)}?page=${encodeURIComponent(currentPage.slug)}`;
    const previewWindow = window.open(previewUrl, '_blank');
    if (!previewWindow) {
      toast.error('Preview failed: Unable to open preview window');
      return;
    }

    const payload = {
      __lovablePreviewPayload: true,
      projectId: project.id,
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
        // ignore while the preview window loads
      }
    }, 250);
    window.setTimeout(() => window.clearInterval(postInterval), 2000);
    previewWindow.focus();

    toast.success('Preview opened', { duration: 2000, position: 'top-center' });
  }

  return (
    <div className="h-14 border-b border-border/70 bg-card/85 backdrop-blur flex items-center gap-2 px-3 overflow-visible shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2 pr-3 border-r border-border/70 h-full">
        <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Builder</div>
        <div className="text-xs font-semibold text-foreground truncate max-w-[180px]">{project?.name ?? "Untitled project"}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="h-8 w-8 rounded-full border border-border/70 bg-background/80 hover:bg-accent/70 flex items-center justify-center text-muted-foreground transition"
          title="Undo"
          onClick={undo}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          className="h-8 w-8 rounded-full border border-border/70 bg-background/80 hover:bg-accent/70 flex items-center justify-center text-muted-foreground transition"
          title="Redo"
          onClick={redo}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium text-slate-700 transition">
          <Save className="w-4 h-4" />
          <button
            className="text-left"
            onClick={() => {
              if (!mounted) return;
              persistWithStatus();
            }}
            type="button"
          >
            Save now
          </button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <SaveStatus status={saveStatus} errorMessage={saveErrorMessage ?? undefined} onRetry={persistWithStatus} />
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-0.5">
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

        <button
          className="h-8 w-8 rounded-full border border-border/70 bg-background/80 hover:bg-accent/70 flex items-center justify-center transition"
          title="Toggle dark mode"
          onClick={toggleDark}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {showCanvasControls ? (
          <div className="relative">
            <button
              className="h-8 px-3 mr-2 rounded-full border border-primary/80 bg-white/90 text-primary hover:bg-white/95 flex items-center gap-2 text-[11px] font-medium"
              onClick={openPreview}
              title="Open Preview"
            >
              <Monitor className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              className="h-8 px-3 rounded-full border border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 text-[11px] font-medium"
              onClick={downloadZip}
            >
              <Download className="w-3.5 h-3.5" /> Export ZIP
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
