import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Layers, Grid2x2, FolderOpen } from "lucide-react";

type LeftPanelView =
  | "dashboard"
  | "projects"
  | "pages"
  | "templates"
  | "widgets"
  | "favorites"
  | "shared"
  | "trash";

const MENU_ITEMS: {
  key: LeftPanelView;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "projects", label: "Projects", Icon: FolderOpen },
  { key: "pages", label: "Pages", Icon: FileText },
  { key: "templates", label: "Templates", Icon: Layers },
  { key: "widgets", label: "Widgets", Icon: Grid2x2 },
  { key: "dashboard", label: "Dashboard", Icon: FileText },
];

interface SidebarMenuProps {
  leftPanelOpen: "widgets" | "pages" | "layers" | null;
  leftPanelView: LeftPanelView;
  setLeftPanelOpen: (open: "widgets" | "pages" | "layers" | null) => void;
  setLeftPanelView: (view: LeftPanelView) => void;
}

export function SidebarMenu({
  leftPanelOpen,
  leftPanelView,
  setLeftPanelOpen,
  setLeftPanelView,
}: SidebarMenuProps) {
  const isOpen = (view: LeftPanelView) => leftPanelOpen === view;
  return (
    <TooltipProvider delayDuration={300}>
      <div className="px-3 py-3">
        <div className="flex items-center justify-start gap-4">
          {MENU_ITEMS.map(({ key, label, Icon }) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setLeftPanelView(key);
                    if (key === "widgets" || key === "pages") {
                      setLeftPanelOpen(key);
                    }
                  }}
                  className="flex flex-col items-center gap-1 px-1 py-0.5 rounded-md transition"
                >
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      isOpen(key)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-background border border-border"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className={`text-[10px] ${
                      isOpen(key)
                        ? "font-semibold text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </TooltipTrigger>

              <TooltipContent side="bottom">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}