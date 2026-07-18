import { Link } from "@tanstack/react-router";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { buildSiteExport } from "@/lib/builder/preview";
import JSZip from "jszip";
import {
  Download,
  Moon,
  Sun,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
} from "lucide-react";
import { createProject } from "@/services/project";
import { toast } from "sonner";

export function Header() {
  const mounted = useMounted();

  const project = useBuilder((s) =>
    s.currentProjectId ? s.projects[s.currentProjectId] : null
  );

  const dark = useBuilder((s) => s.dark);
  const device = useBuilder((s) => s.device);
  const toggleDark = useBuilder((s) => s.toggleDark);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const persist = useBuilder((s) => s.persist);
  const setDevice = useBuilder((s) => s.setDevice);

  async function handleCloudSave() {
    if (!project) {
      toast.error("No project found");
      return;
    }

    try {
      // Save locally
      persist();

      // Save to Firestore
      await createProject(project);

      toast.success("Project saved to cloud!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save project");
    }
  }

  async function downloadZip() {
    if (!project || !mounted) return;

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
    link.download = `${project.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.zip`;

    link.click();

    URL.revokeObjectURL(url);
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-tight text-white shadow-sm">
              W
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">
                WebToolOcean
              </p>
              <p className="text-xs text-slate-500">
                Website Builder
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="h-9 w-20 rounded-md bg-slate-100" />
            <div className="h-9 w-20 rounded-md bg-slate-100" />
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white md:hidden" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link
          to="/"
          className="flex items-center gap-3 text-slate-900 hover:text-slate-900"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-tight text-white shadow-sm">
            W
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">
              WebToolOcean
            </p>
            <p className="text-xs text-slate-500">
              Website Builder
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            title="Undo"
            onClick={undo}
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            title="Redo"
            onClick={redo}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              device === "desktop"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
            onClick={() => setDevice("desktop")}
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              device === "tablet"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
            onClick={() => setDevice("tablet")}
          >
            <Tablet className="w-4 h-4" />
          </button>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              device === "mobile"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
            onClick={() => setDevice("mobile")}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            title="Save"
            onClick={handleCloudSave}
          >
            <Save className="w-4 h-4" />
          </button>

        </div>

        <div className="flex items-center gap-2">

          {project && (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={downloadZip}
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">
                Export ZIP
              </span>
            </button>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            onClick={toggleDark}
          >
            {dark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
}