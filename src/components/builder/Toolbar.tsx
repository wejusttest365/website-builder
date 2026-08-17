import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { buildSiteExport } from "@/lib/builder/preview";
import JSZip from "jszip";
import { SaveStatus } from "./SaveStatus";
import { Undo2, Redo2, Monitor, Tablet, Smartphone, Download, Save, Moon, Sun, Sparkles } from "lucide-react";

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
    if (!project || !mounted) {
      console.warn("[PREVIEW:SENDER] skipped: missing project or mounted", { project: !!project, mounted });
      return;
    }

    const currentPage = project.pages.find((p) => p.id === project.currentPageId) || project.pages[0];
    if (!currentPage) {
      console.warn("[PREVIEW:SENDER] skipped: no current page", { pageCount: project.pages?.length });
      toast.error('Preview failed: No current page available for preview');
      return;
    }

    const previewSlug = `${slugifyName(project.name)}-${project.id}`;
    const previewUrl = `${window.location.origin}/demo/${encodeURIComponent(previewSlug)}?page=${encodeURIComponent(currentPage.slug)}`;
    console.log("[PREVIEW:SENDER] opening preview", { previewUrl, projectId: project.id, pageId: currentPage.id, pageSlug: currentPage.slug });

    const previewWindow = window.open(previewUrl, '_blank');
    if (!previewWindow) {
      console.error("[PREVIEW:SENDER] window.open returned null: popup blocked?");
      toast.error('Preview failed: Unable to open preview window');
      return;
    }
    console.log("[PREVIEW:SENDER] window.opened", { href: previewWindow.location?.href, closed: previewWindow.closed });

    const payload = {
      __lovablePreviewPayload: true,
      projectId: project.id,
      project,
      pageId: currentPage.id,
    };
    console.log("[PREVIEW:SENDER] sending payload", { keys: Object.keys(payload), projectId: payload.projectId, hasProject: !!payload.project });

    try {
      previewWindow.postMessage(payload, window.location.origin);
      console.log("[PREVIEW:SENDER] first postMessage sent", { targetOrigin: window.location.origin });
    } catch (err) {
      console.error("[PREVIEW:SENDER] first postMessage failed", err);
    }

    const postInterval = window.setInterval(() => {
      if (previewWindow.closed) {
        window.clearInterval(postInterval);
        console.log("[PREVIEW:SENDER] preview window closed, stopped retries");
        return;
      }
      try {
        previewWindow.postMessage(payload, window.location.origin);
        console.log("[PREVIEW:SENDER] retry postMessage sent");
      } catch (_) {
        console.warn("[PREVIEW:SENDER] retry postMessage failed");
      }
    }, 250);
    window.setTimeout(() => window.clearInterval(postInterval), 2000);
    previewWindow.focus();

    toast.success('Preview opened', { duration: 2000, position: 'top-center' });
  }

  return (
    <div className="flex h-14 items-center gap-2 overflow-visible border-b border-[#363636] bg-[#1F1F1F] px-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 rounded-full border border-[#363636] bg-[#171717] px-3 py-1.5 pr-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FACC15]/10 text-[#FACC15]">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#969696]">Builder</div>
          <div className="truncate text-xs font-semibold text-[#F5F5F5] max-w-[180px]">{project?.name ?? "Untitled project"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#363636] bg-[#1F1F1F] text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]"
          title="Undo"
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#363636] bg-[#1F1F1F] text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]"
          title="Redo"
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#363636] bg-[#1F1F1F] px-3 py-1 text-[11px] font-medium text-[#D0D0D0] shadow-sm transition">
          <Save className="h-4 w-4" />
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
        <div className="inline-flex items-center gap-1 rounded-full border border-[#363636] bg-[#1F1F1F] p-0.5 shadow-sm">
          {[
            { d: "desktop", Icon: Monitor },
            { d: "tablet", Icon: Tablet },
            { d: "mobile", Icon: Smartphone },
          ].map(({ d, Icon }) => (
            <button
              key={d}
              onClick={() => setDevice(d as "desktop" | "tablet" | "mobile")}
              className={`flex h-7 w-8 items-center justify-center rounded-full transition ${device === d ? "bg-[#FACC15] text-[#111111] shadow-sm" : "text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"}`}
              title={d}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#363636] bg-[#1F1F1F] text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]"
          title="Toggle dark mode"
          onClick={toggleDark}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {showCanvasControls ? (
          <div className="relative">
            <button
              className="mr-2 flex h-8 items-center gap-2 rounded-full border border-[#363636] bg-[#1F1F1F] px-3 text-[11px] font-medium text-[#D0D0D0] transition hover:bg-[#242424]"
              onClick={openPreview}
              title="Open Preview"
            >
              <Monitor className="h-3.5 w-3.5" /> Preview
            </button>
            <button
              className="flex h-8 items-center gap-2 rounded-full bg-[#FACC15] px-3 text-[11px] font-medium text-[#111111] transition hover:bg-[#FDE047]"
              onClick={downloadZip}
            >
              <Download className="h-3.5 w-3.5" /> Export ZIP
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
