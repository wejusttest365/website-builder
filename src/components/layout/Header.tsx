import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder, type Project as BuilderProject } from "@/lib/builder/store";
import { useAuth } from "@/lib/auth";
import { buildSiteExport } from "@/lib/builder/preview";
import JSZip from "jszip";
import {
  ChevronDown,
  CreditCard,
  Download,
  LogOut,
  Monitor,
  Save,
  Settings,
  Smartphone,
  Tablet,
  Undo2,
  User,
  Redo2,
} from "lucide-react";
import { createProject, type ProjectMetadata } from "@/services/project";
import { saveBuilderProject } from "@/services/builderProject";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginDialog } from "@/components/builder/LoginDialog";

export function Header() {
  const mounted = useMounted();
  const navigate = useNavigate();

  const { user, logout, authReady } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");

  useEffect(() => {
    if (user && authDialogOpen) {
      setAuthDialogOpen(false);
    }
  }, [user, authDialogOpen]);

  const project = useBuilder(
    (s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null)
  ) as BuilderProject | null;
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);

  const device = useBuilder((s) => s.device);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const persist = useBuilder((s) => s.persist);
  const setDevice = useBuilder((s) => s.setDevice);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);

  const showCanvasControls = Boolean(user) && !showProjectDashboard && Boolean(project);

  const handleLogout = async () => {
    await logout();
  };

  const handleSwitchAccount = async () => {
    await logout();
    setAuthMode("sign-in");
    setAuthDialogOpen(true);
  };

  const mapBuilderProjectToDashboardMetadata = (project: BuilderProject): ProjectMetadata => {
    return {
      id: project.id,
      name: project.name,
      templateId: project.selectedTemplateId ?? null,
      thumbnail: project.thumbnail ?? "",
      description: project.description,
      favorite: false,
      status: "draft",
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      pages: project.pages.map((page: { slug: string }) => page.slug),
      isPublic: false,
    } as ProjectMetadata;
  };

  async function handleCloudSave() {
    if (!project) {
      toast.error("No project found");
      return;
    }

    try {
      persist();
      await saveBuilderProject(project);
      await createProject(mapBuilderProjectToDashboardMetadata(project));

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

        <button
          type="button"
          onClick={() => {
            setShowProjectDashboard(true);
            navigate({ to: '/' });
          }}
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
        </button>

        {showCanvasControls ? (
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
        ) : null}

        <div className="flex items-center gap-2">

          {user && project && (
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

          {authReady ? (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Avatar className="h-9 w-9">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.name} />
                      ) : (
                        <AvatarFallback>{user.initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} align="end" className="w-56">
                  <div className="px-3 py-2 text-sm">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSwitchAccount}>
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    Switch Account
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setShowProjectDashboard(true);
                      navigate({ to: '/' });
                    }}
                  >
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void 0}>
                    <Settings className="mr-2 h-4 w-4 text-slate-500" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void 0}>
                    <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4 text-slate-500" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => {
                    setAuthMode("sign-in");
                    setAuthDialogOpen(true);
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-violet-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-900"
                  onClick={() => {
                    setAuthMode("sign-up");
                    setAuthDialogOpen(true);
                  }}
                >
                  Sign Up
                </button>
              </div>
            )
          ) : null}

        </div>

      </div>
      <LoginDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} initialMode={authMode} />
    </header>
  );
}