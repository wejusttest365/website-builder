import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Layers, Grid2x2, FolderOpen } from "lucide-react";

type LeftPanelView =
  | "projects"
  | "pages"
  | "templates"
  | "sections"
  | "widgets"
  | "assets"
  | "animations"
  | "seo"
  | "settings"
  | "integrations";

const MENU_ITEMS: {
  key: LeftPanelView;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "projects", label: "Projects", Icon: FolderOpen },
  { key: "pages", label: "Pages", Icon: FileText },
  { key: "templates", label: "Templates", Icon: Layers },
  { key: "widgets", label: "Widgets", Icon: Grid2x2 },
];

interface SidebarMenuProps {
  leftPanelOpen: boolean;
  leftPanelView: LeftPanelView;
  setLeftPanelOpen: (open: boolean) => void;
  setLeftPanelView: (view: LeftPanelView) => void;
}

export function SidebarMenu({
  leftPanelOpen,
  leftPanelView,
  setLeftPanelOpen,
  setLeftPanelView,
}: SidebarMenuProps) {
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
                    setLeftPanelOpen(true);
                  }}
                  className="flex flex-col items-center gap-1 px-1 py-0.5 rounded-md transition"
                >
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      leftPanelOpen && leftPanelView === key
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-background border border-border"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className={`text-[10px] ${
                      leftPanelOpen && leftPanelView === key
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