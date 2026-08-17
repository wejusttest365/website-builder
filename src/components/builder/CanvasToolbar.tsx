"use client";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useBuilder } from "@/lib/builder/store";
import { useAuth } from "@/lib/auth";
import { buildSiteExport } from "@/lib/builder/preview";
import JSZip from "jszip";
import {
  ChevronDown,
  Download,
  Monitor,
  Smartphone,
  Tablet,
  Undo2,
  Redo2,
  Upload,
} from "lucide-react";
import { SaveStatus } from "@/components/builder/SaveStatus";
import { toast } from "sonner";
import { nanoid } from 'nanoid';
import { useMounted } from "@/hooks/use-mounted";

// CanvasToolbar - builder top bar

export function CanvasToolbar({
  project,
  pages,
  currentPageId,
  onSelectPage,
}: {
  project: any;
  pages: any[] | null;
  currentPageId: string | null;
  onSelectPage: (pageId: string) => void;
}) {
  const navigate = useNavigate();
  const mounted = useMounted();
  const [pageSelectorOpen, setPageSelectorOpen] = useState(false);
  const { user } = useAuth();

  const device = useBuilder((s) => s.device);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const persistWithStatus = useBuilder((s) => s.persistWithStatus);
  const saveStatus = useBuilder((s) => s.saveStatus);
  const saveErrorMessage = useBuilder((s) => s.saveErrorMessage);
  const setDevice = useBuilder((s) => s.setDevice);
  const publishProject = useBuilder((s) => s.publishProject);

  const activePage = project?.pages?.find((p: any) => p.id === currentPageId) ?? project?.pages?.[0] ?? null;

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

  function slugifyName(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";
  }

  async function openPreview() {
    if (!project || !mounted) return;

    const currentPage = project.pages.find((p: any) => p.id === project.currentPageId) || project.pages[0];
    if (!currentPage) {
      toast.error('Preview failed: No current page available for preview');
      return;
    }

    const previewSlug = `${slugifyName(project.name)}-${project.id}`;
    const previewUrl = `${window.location.origin}/demo/${encodeURIComponent(previewSlug)}?page=${encodeURIComponent(currentPage.slug)}`;

    const payload = {
      __lovablePreviewPayload: true,
      projectId: project.id,
      project,
      pageId: currentPage.id,
    };

    let payloadSent = false;
    const sendPayload = () => {
      if (payloadSent) return;
      payloadSent = true;
      try {
        previewWindow.postMessage(payload, "*");
      } catch (err) {
        console.error("Preview postMessage failed", err);
      }
    };

    const handlePreviewReady = (event: MessageEvent) => {
      if (event.data && event.data.__previewReady) {
        sendPayload();
        window.removeEventListener("message", handlePreviewReady);
      }
    };

    window.addEventListener("message", handlePreviewReady);

    const previewWindow = window.open(previewUrl, '_blank');
    if (!previewWindow) {
      window.removeEventListener("message", handlePreviewReady);
      toast.error('Preview failed: Unable to open preview window');
      return;
    }

    const closedCheck = window.setInterval(() => {
      if (previewWindow.closed) {
        window.clearInterval(closedCheck);
        window.removeEventListener("message", handlePreviewReady);
      }
    }, 1000);

    previewWindow.focus();
    toast.success('Preview opened', { duration: 2000, position: 'top-center' });
  }

  async function handlePublish() {
    if (!project || !currentPageId || !mounted) return;
    await publishProject(currentPageId);
  }

  if (!mounted || !project) {
    return (
      <div className="flex h-12 items-center border-b border-[#363636] bg-[#1F1F1F] px-3">
        <div className="h-8 w-48 rounded-md bg-[#2B2B2B]" />
      </div>
    );
  }

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#363636] bg-[#1F1F1F] px-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPageSelectorOpen(!pageSelectorOpen)}
            className="flex items-center gap-2 rounded-lg border border-[#363636] bg-[#1F1F1F] px-3 py-1.5 text-sm font-medium text-[#D0D0D0] transition hover:bg-[#242424]"
          >
            {activePage?.name ?? "Select page"}
            <ChevronDown className="h-3.5 w-3.5 text-[#969696]" />
          </button>
          {pageSelectorOpen && (
            <div className="absolute top-[8px] left-0 z-50 w-64 rounded-xl border border-[#363636] bg-[#1F1F1F] p-1 shadow-xl">
              {(pages ?? []).map((page: any) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    onSelectPage(page.id);
                    setPageSelectorOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    page.id === currentPageId ? "bg-[#FACC15]/10 text-[#FACC15]" : "text-[#D0D0D0] hover:bg-[#242424]"
                  }`}
                >
                  <span className="truncate">{page.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#363636] bg-[#1F1F1F] text-[#D0D0D0] transition hover:border-[#FACC15] hover:text-[#F5F5F5]"
            title="Undo"
            onClick={undo}
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#363636] bg-[#1F1F1F] text-[#D0D0D0] transition hover:border-[#FACC15] hover:text-[#F5F5F5]"
            title="Redo"
            onClick={redo}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-[#363636]" />

          <button
            type="button"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
              device === "desktop"
                ? "border-[#FACC15] bg-[#FACC15] text-[#111111]"
                : "border-[#363636] bg-[#1F1F1F] text-[#D0D0D0] hover:border-[#FACC15] hover:text-[#F5F5F5]"
            }`}
            onClick={() => setDevice("desktop")}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            type="button"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
              device === "tablet"
                ? "border-[#FACC15] bg-[#FACC15] text-[#111111]"
                : "border-[#363636] bg-[#1F1F1F] text-[#D0D0D0] hover:border-[#FACC15] hover:text-[#F5F5F5]"
            }`}
            onClick={() => setDevice("tablet")}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>

          <button
            type="button"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
              device === "mobile"
                ? "border-[#FACC15] bg-[#FACC15] text-[#111111]"
                : "border-[#363636] bg-[#1F1F1F] text-[#D0D0D0] hover:border-[#FACC15] hover:text-[#F5F5F5]"
            }`}
            onClick={() => setDevice("mobile")}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-[#363636]" />

          <SaveStatus status={saveStatus} errorMessage={saveErrorMessage ?? undefined} onRetry={persistWithStatus} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#363636] bg-[#1F1F1F] px-3 text-sm font-medium text-[#F5F5F5] transition hover:border-[#FACC15] hover:text-[#FACC15]"
          onClick={openPreview}
          title="Preview"
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden md:inline">Preview</span>
        </button>

        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#FACC15] px-3 text-sm font-medium text-[#111111] transition hover:bg-[#FDE047]"
          onClick={handlePublish}
          title="Publish"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden md:inline">Publish</span>
        </button>

        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#363636] bg-[#1F1F1F] px-3 text-sm font-medium text-[#F5F5F5] transition hover:border-[#FACC15] hover:text-[#FACC15]"
          onClick={downloadZip}
          title="Export ZIP"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export ZIP</span>
        </button>
      </div>
    </div>
  );
}
