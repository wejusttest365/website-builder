"use client";

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { useAuth } from "@/lib/auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCloudProjects } from "@/lib/builder/useCloudProjects";
import { TEMPLATE_LIBRARY } from "@/lib/builder/templates";
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  Heart,
  Trash2,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { user, logout } = useAuth();
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const { projects: cloudProjects } = useCloudProjects();

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

  const asideBase = "flex w-[76px] flex-col border-r border-[#363636] bg-[#202020]";
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
    <TooltipProvider delayDuration={300}>
      <aside className={`${asideFixed} ${asideBase}`}>
        <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto overflow-x-hidden py-3">
          <div className="flex flex-col items-center gap-0.5 px-1 pb-3 pt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] text-sm font-semibold uppercase tracking-tight text-[#111111] shadow-sm">
              W
            </div>
            <p className="text-[11px] font-semibold leading-tight text-[#F5F5F5]">WebToolOcean</p>
            <p className="text-[10px] leading-tight text-[#969696]">Website Builder</p>
          </div>

          {MAIN_MENU_ITEMS.map(({ key, label, Icon, route }) => {
            const active = showProjectDashboard;
            const badgeCount = badgeCounts[key];
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectDashboard(true);
                      navigate({ to: route as never });
                    }}
                    className={`group relative flex h-auto w-full flex-col items-center justify-center gap-1 rounded-xl py-2 transition ${
                      active ? "text-[#FACC15]" : "text-[#969696] hover:text-[#F5F5F5]"
                    }`}
                  >
                    <span className="relative inline-flex h-5 w-5 items-center justify-center">
                      <Icon className="h-[18px] w-[18px]" />
                      {badgeCount > 0 ? (
                        <span
                          className="pointer-events-none absolute left-full top-1/2 ml-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border px-1.5 text-[10px] font-semibold leading-none opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1"
                          style={{
                            borderColor: `${MENU_ACCENT[key]}33`,
                            backgroundColor: '#202020',
                            color: MENU_ACCENT[key],
                            boxShadow: `0 0 12px ${MENU_ACCENT[key]}22`,
                          }}
                        >
                          {badgeCount}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-[10px] leading-none">{label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* USER PROFILE AT BOTTOM */}
        <div className="shrink-0 border-t border-[#363636] p-2">
          <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
            <DropdownMenuTrigger asChild>
              <button
                ref={profileTriggerRef}
                type="button"
                className="flex w-full flex-col items-center gap-1 rounded-xl py-2 transition hover:bg-[#2B2B2B]"
              >
                <Avatar className="h-8 w-8">
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-[10px]">{user?.initials}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-[10px] leading-none text-[#F5F5F5]">{user?.name?.split(" ")[0]}</span>
                <ChevronUp className="h-3 w-3 text-[#969696]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={4} align="center" className="w-56 bg-[#1F1F1F] border-[#363636] text-[#F5F5F5]">
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
              <DropdownMenuItem
                onSelect={() => void 0}
                className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#363636]" />
              <DropdownMenuItem
                onSelect={async () => {
                  await logout();
                }}
                className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  );
}
