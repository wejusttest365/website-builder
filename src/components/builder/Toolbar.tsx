import { useState } from "react";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { buildExportBundle, buildSiteExport } from "@/lib/builder/preview";
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
  Edit2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

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
  // Pages
  const pages = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId]?.pages ?? [] : []));
  const addPage = useBuilder((s) => s.addPage);
  const renamePage = useBuilder((s) => s.renamePage);
  const setPageSlug = useBuilder((s) => s.setPageSlug);
  const duplicatePage = useBuilder((s) => s.duplicatePage);
  const deletePage = useBuilder((s) => s.deletePage);
  const selectPage = useBuilder((s) => s.selectPage);
  const setDescription = useBuilder((s) => s.setPageDescription);
  const setKeywords = useBuilder((s) => s.setPageKeywords);
  const setCustomHead = useBuilder((s) => s.setCustomHead);
  const currentPageId = useBuilder((s) => s.currentProject() ? s.currentProject()!.currentPageId : null);

  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ kind: "project" | "page"; id: string; name: string } | null>(null);

  const bundle = project
    ? buildExportBundle({
        sections: (pageOf(project)?.sections ?? []),
        globalCss: project.globalCss,
        globalJs: project.globalJs,
        title: project.name,
        description: pageOf(project)?.description,
        keywords: pageOf(project)?.keywords,
        customHead: project.customHead,
        assets: project.assets,
        pages: project.pages?.map((p) => ({ id: p.id, slug: p.slug })) ?? [],
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

  function slugify(text: string) {
    return (
      text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "page"
    );
  }

  async function downloadZip() {
    if (!project) return;
    const zip = new JSZip();
    const exportData = buildSiteExport(project);
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

  return (
    <div className="h-14 bg-card border-b border-border flex items-center gap-2 px-3 overflow-visible">
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
                      onClick={() => { setConfirmTarget({ kind: "project", id: p.id, name: p.name }); setConfirmOpen(true); }}
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
        <button
          className="h-8 px-2 rounded-md hover:bg-accent flex items-center gap-1.5 text-xs"
          onClick={() => setPagesOpen((v) => !v)}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="max-w-[120px] truncate">Pages</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        {pagesOpen && (
          <div className="absolute top-full left-0 mt-1 z-40 w-80 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border p-1">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Pages</div>
            <div className="max-h-56 overflow-y-auto">
              {pages.map((pg) => (
                <div key={pg.id} className={`group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-sm ${pg.id === currentPageId ? "bg-accent" : ""}`}>
                  <button className="flex-1 text-left truncate" onClick={() => { selectPage(pg.id); setPagesOpen(false); }}>{pg.name}</button>
                  <button title="Rename / Edit" className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background" onClick={() => { setEditingPage({ id: pg.id, name: pg.name, slug: pg.slug }); setSlugEdited(false); setPageModalOpen(true); setPagesOpen(false); }}><Edit2 className="w-3 h-3" /></button>
                  <div className="opacity-0 group-hover:opacity-100 text-xs px-2">/{pg.slug}</div>
                  <button title="Duplicate" className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background" onClick={() => duplicatePage(pg.id)}><Copy className="w-3 h-3" /></button>
                  <button title="Delete" className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive" onClick={() => { setConfirmTarget({ kind: "page", id: pg.id, name: pg.name }); setConfirmOpen(true); }}><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-1 pt-1">
              <button className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent text-sm flex items-center gap-2" onClick={() => { addPage(); setPagesOpen(false); }}><Plus className="w-3.5 h-3.5" /> New page</button>
            </div>
          </div>
        )}

        {editingPage && (
          <Dialog open={pageModalOpen} onOpenChange={(v) => { setPageModalOpen(v); if (!v) setEditingPage(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Page</DialogTitle>
                <DialogDescription>Change page name and slug.</DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Page name:</label>
                <input
                  className="w-full px-2 py-2 rounded-md border border-input"
                  value={editingPage.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setEditingPage((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        name: nextName,
                        slug: slugEdited ? prev.slug : slugify(nextName),
                      };
                    });
                  }}
                />
                <label className="text-xs text-muted-foreground">Page slug:</label>
                <input
                  className="w-full px-2 py-2 rounded-md border border-input"
                  value={editingPage.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setEditingPage((prev) => (prev ? { ...prev, slug: e.target.value } : prev));
                  }}
                />
              </div>
              <DialogFooter className="mt-4">
                <button className="px-4 py-2 rounded-md border border-input" onClick={() => { setPageModalOpen(false); setEditingPage(null); }}>Cancel</button>
                <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground ml-2" onClick={() => {
                  if (!editingPage) return;
                  renamePage(editingPage.id, editingPage.name);
                  setPageSlug(editingPage.id, editingPage.slug);
                  setPageModalOpen(false);
                  setEditingPage(null);
                }}>OK</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirm delete dialog used for projects and pages */}
        {confirmTarget && (
          <Dialog open={confirmOpen} onOpenChange={(v) => { setConfirmOpen(v); if (!v) setConfirmTarget(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {confirmTarget.kind === 'project' ? 'Project' : 'Page'}</DialogTitle>
                <DialogDescription>Are you sure you want to delete "{confirmTarget.name}"? This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <button className="px-4 py-2 rounded-md border border-input" onClick={() => { setConfirmOpen(false); setConfirmTarget(null); }}>Cancel</button>
                <button className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground ml-2" onClick={() => {
                  if (!confirmTarget) return;
                  if (confirmTarget.kind === 'project') del(confirmTarget.id);
                  else deletePage(confirmTarget.id);
                  setConfirmOpen(false);
                  setConfirmTarget(null);
                }}>Delete</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
        <IconBtn title="Settings" onClick={() => setSettingsOpen(true)}><Settings className="w-4 h-4" /></IconBtn>
      </div>

      <Dialog open={settingsOpen} onOpenChange={(v) => setSettingsOpen(v)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>SEO & Analytics Settings</DialogTitle>
            <DialogDescription>Configure page-specific SEO metadata and global tracking code.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-sm font-semibold mb-3">Page SEO (Current Page)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Meta description</label>
                  <textarea
                    value={pageOf(project)?.description ?? ""}
                    onChange={(e) => project && currentPageId && setDescription(currentPageId, e.target.value)}
                    rows={3}
                    className="w-full mt-1 rounded-md border border-input bg-background px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Meta keywords</label>
                  <input
                    value={pageOf(project)?.keywords ?? ""}
                    onChange={(e) => project && currentPageId && setKeywords(currentPageId, e.target.value)}
                    className="w-full mt-1 rounded-md border border-input bg-background px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="comma-separated keywords"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Global Analytics & Tracking</h3>
              <label className="text-xs text-muted-foreground">Custom HTML for &lt;head&gt;</label>
              <textarea
                value={project?.customHead ?? ""}
                onChange={(e) => project && setCustomHead(e.target.value)}
                rows={5}
                placeholder="Google Analytics, Facebook Pixel, etc."
                className="w-full mt-1 rounded-md border border-input bg-background px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-2">This HTML will be injected into the &lt;head&gt; of all pages</p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-md border border-input">Close</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
