"use client";

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { useAuth } from "@/lib/auth";
import { useCloudProjects } from "@/lib/builder/useCloudProjects";
import { TEMPLATE_LIBRARY } from "@/lib/builder/templates";
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  Heart,
  Trash2,
  ChevronDown,
  LogIn,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "@tanstack/react-router";
import { AuthDrawer } from "./AuthDrawer";
import { useAuthDrawer } from "@/lib/builder/useAuthDrawer";

const MAIN_MENU_ITEMS = [
  { key: "dashboard" as const, label: "Dashboard", Icon: LayoutDashboard, route: "/dashboard" },
  { key: "projects" as const, label: "My Projects", Icon: FolderOpen, route: "/dashboard/projects" },
  { key: "templates" as const, label: "Templates", Icon: Layers, route: "/dashboard/templates" },
  { key: "favorites" as const, label: "Favorites", Icon: Heart, route: "/dashboard/favorites" },
  { key: "trash" as const, label: "Trash", Icon: Trash2, route: "/dashboard/trash" },
] as const;

type DashboardMenuKey = (typeof MAIN_MENU_ITEMS)[number]["key"];

const MENU_ACCENT: Record<DashboardMenuKey, string> = {
  dashboard: "#FACC15",
  projects: "#F5F5F5",
  templates: "#A78BFA",
  favorites: "#D0D0D0",
  trash: "#EF4444",
};

export function AppNav({ fixed = true }: { fixed?: boolean } = {}) {
  const navigate = useNavigate();
  const mounted = useMounted();
  const router = useRouter();
  const { user, logout } = useAuth();
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const { projects: cloudProjects } = useCloudProjects();

  const currentPath = router.state.location.pathname;
  const activeKey = useMemo(() => {
    if (!showProjectDashboard) return null;
    if (currentPath.startsWith("/dashboard/projects")) return "projects";
    if (currentPath.startsWith("/dashboard/templates")) return "templates";
    if (currentPath.startsWith("/dashboard/favorites")) return "favorites";
    if (currentPath.startsWith("/dashboard/trash")) return "trash";
    if (currentPath.startsWith("/dashboard")) return "dashboard";
    return null;
  }, [currentPath, showProjectDashboard]);

  const badgeCounts = useMemo(() => ({
    projects: (cloudProjects as Array<{ status?: string }>).filter((project) => project.status !== "trashed").length,
    favorites: (cloudProjects as Array<{ favorite?: boolean; status?: string }>).filter((project) => Boolean(project.favorite) && project.status !== "trashed").length,
    trash: (cloudProjects as Array<{ status?: string }>).filter((project) => project.status === "trashed").length,
    templates: TEMPLATE_LIBRARY.length,
    dashboard: 0,
  }), [cloudProjects]);

  const dashboardPathMap: Record<DashboardMenuKey, string> = {
    dashboard: "/dashboard",
    projects: "/dashboard/projects",
    templates: "/dashboard/templates",
    favorites: "/dashboard/favorites",
    trash: "/dashboard/trash",
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const { open, setOpen, openDrawer, closeDrawer, pendingAction, setPendingAction } = useAuthDrawer();

  const asideBase = "flex w-[180px] flex-col border-r border-[#363636] bg-[#202020]";
  const asideFixed = fixed ? "fixed inset-y-0 left-0 z-40" : "h-screen";

  if (!mounted) {
    return (
      <aside className={`${asideFixed} ${asideBase}`}>
        <div className="flex h-full flex-col items-center gap-3 py-4">
          <div className="h-10 w-10 rounded-xl bg-[#2B2B2B]" />
          <div className="h-10 w-10 rounded-xl bg-[#2B2B2B]" />
          <div className="h-10 w-10 rounded-xl bg-[#2B2B2B]" />
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${asideFixed} ${asideBase}`}>
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 pb-4 pt-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FACC15] text-sm font-semibold uppercase tracking-tight text-[#111111] shadow-sm">
            W
          </div>
          <div className="flex flex-col">
            <p className="text-[12px] font-semibold leading-tight text-[#F5F5F5]">WebToolOcean</p>
            <p className="text-[11px] leading-tight text-[#969696]">Website Builder</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-0 px-2">
          {MAIN_MENU_ITEMS.map(({ key, label, Icon, route }) => {
            const active = activeKey === key;
            const badgeCount = badgeCounts[key];
            const accent = MENU_ACCENT[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setShowProjectDashboard(true);
                  navigate({ to: route as never });
                }}
                className={`group relative flex w-full items-center gap-2.5 border-t border-[#363636] px-2 py-2.5 transition-all duration-150 ${
                  active
                    ? "bg-[#FACC15]/10 text-[#FACC15]"
                    : "text-[#969696] hover:bg-[#2B2B2B] hover:text-[#F5F5F5]"
                }`}
                style={{ borderRadius: '6px' }}
              >
                <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 text-left text-[12px] font-medium leading-none">{label}</span>
                <span
                  className="inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                  style={{
                    borderColor: `${accent}33`,
                    backgroundColor: active ? `${accent}22` : '#2B2B2B',
                    color: accent,
                    boxShadow: active ? `0 0 10px ${accent}33` : 'none',
                  }}
                >
                  {badgeCount}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div className="shrink-0 border-t border-[#363636] p-2">
          {user ? (
            <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  ref={profileTriggerRef}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-[#2B2B2B]"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    {user?.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-[10px]">{user?.initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="truncate text-[12px] font-medium leading-tight text-[#F5F5F5]">{user?.name}</p>
                    <p className="truncate text-[10px] leading-tight text-[#969696]">{user?.email}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[#969696] transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={4} align="end" className="w-56 bg-[#1F1F1F] border-[#363636] text-[#F5F5F5]">
                <div className="px-3 py-2 text-sm">
                  <p className="font-semibold text-[#F5F5F5]">{user?.name}</p>
                  <p className="text-xs text-[#969696]">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#363636]" />
                <DropdownMenuItem
                  onSelect={() => {
                    setShowProjectDashboard(true);
                    navigate({ to: '/' });
                  }}
                  className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]"
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void 0} className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#363636]" />
                <DropdownMenuItem onSelect={async () => { await logout(); }} className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={() => openDrawer("sign-in", null)}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-[12px] font-medium text-[#F5F5F5] transition hover:bg-[#2B2B2B]"
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
          )}
        </div>

        <AuthDrawer 
          open={open} 
          onOpenChange={(isOpen) => { if (!isOpen) closeDrawer(); }}
          pendingAction={pendingAction}
          onPendingActionComplete={() => setPendingAction(null)}
        />
      </div>
    </aside>
  );
}
