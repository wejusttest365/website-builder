import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { buildSiteExport } from "@/lib/builder/preview";
import JSZip from "jszip";
import { SaveStatus } from "./SaveStatus";
import { Undo2, Redo2, Monitor, Tablet, Smartphone, Download, Save, Moon, Sun } from "lucide-react";
import { nanoid } from "nanoid";

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

  async function openPreview() {
    if (!project || !mounted) return;
    console.info('[Preview] button clicked', { projectName: project.name, currentPageId: project.currentPageId });
    try {
      const exportData = await buildSiteExport(project);
      console.info('[Preview] buildSiteExport completed', { projectName: project.name, fileCount: exportData.files.length });

      const currentPage = project.pages.find((p) => p.id === project.currentPageId) || project.pages[0];
      if (currentPage) {
        const pageFile = exportData.files.find((f) => f.path === `${currentPage.slug}.html`);
        if (pageFile) {
          exportData.files.push({ path: 'index.html', content: pageFile.content, base64: pageFile.base64 });
          console.info('[Preview] added index.html alias for current page', { pageSlug: currentPage.slug });
        }
      }

      const slugify = (s: string) =>
        (s || 'project')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'site';

      const shortId = nanoid(6).toLowerCase();
      const slug = `${slugify(project.name)}-${shortId}`;
      console.info('[Preview] generated slug', { slug });

      const payload = { slug, files: exportData.files };
      console.info('[Preview] sending preview request', { endpoint: '/__wto/preview', slug, fileCount: exportData.files.length });
      const resp = await fetch('/__wto/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await resp.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('[Preview] response JSON parse failed', { status: resp.status, statusText: resp.statusText, text, parseError });
        throw new Error(`Preview response was not valid JSON: ${parseError?.message || String(parseError)}`);
      }

      console.info('[Preview] preview request completed', { status: resp.status, ok: resp.ok, data });
      if (!resp.ok || !data?.ok) {
        const errorMessage = data?.error || data?.message || resp.statusText || 'unknown error';
        console.error('[Preview] preview failed response', { status: resp.status, errorMessage, data });
        toast.error(`Preview generation failed: ${errorMessage}`);
        await downloadZip();
        return;
      }

      const origin = window.location.origin;
      const previewPath = data.url || `/preview/${slug}/index.html`;
      const previewUrl = origin + previewPath;
      console.info('[Preview] opening preview URL', { previewUrl });
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      toast.success('Preview opened', { duration: 2000, position: 'top-center' });
    } catch (err) {
      console.error('[Preview] final exception', err);
      toast.error(`Preview failed: ${err?.message || String(err)}`);
    }
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
