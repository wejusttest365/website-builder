import { useMemo, useState, type ReactNode } from "react";
import {
  ALargeSmall,
  Box,
  Code2,
  Heading,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointerClick,
  Paintbrush,
  PanelTop,
  Pin,
  Settings2,
  Type,
  X,
} from "lucide-react";
import { PropertyAccordion } from "./PropertyAccordion";

export type PropertyPanelTab = "content" | "design" | "settings";

export interface PropertyPanelProps {
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeIcon?: ReactNode;
  icon?: ReactNode;
  variantControl?: ReactNode;
  children?: ReactNode;
  content?: ReactNode;
  /** Design: background accordion body */
  background?: ReactNode;
  backgroundSummary?: string;
  /** Design: typography accordion body */
  typography?: ReactNode;
  /** Design: layout accordion body */
  layout?: ReactNode;
  /** Fallback design body when background/typography are not split */
  style?: ReactNode;
  responsive?: ReactNode;
  animation?: ReactNode;
  advanced?: ReactNode;
  onClose?: () => void;
  onPin?: () => void;
  pinned?: boolean;
}

function resolvePanelIcon(title: string, explicit?: ReactNode, badgeIcon?: ReactNode) {
  if (explicit) return explicit;
  if (badgeIcon) return badgeIcon;
  const key = title.trim().toLowerCase();
  if (key.includes("heading")) return <span className="text-[13px] font-semibold leading-none">H</span>;
  if (key.includes("text") || key.includes("paragraph")) return <span className="text-[13px] font-semibold leading-none">A</span>;
  if (key.includes("image")) return <ImageIcon className="h-3.5 w-3.5" />;
  if (key.includes("button")) return <MousePointerClick className="h-3.5 w-3.5" />;
  if (key.includes("container")) return <Box className="h-3.5 w-3.5" />;
  if (key.includes("hero")) return <LayoutTemplate className="h-3.5 w-3.5" />;
  if (key.includes("navbar") || key.includes("nav")) return <PanelTop className="h-3.5 w-3.5" />;
  if (key.includes("footer")) return <LayoutTemplate className="h-3.5 w-3.5" />;
  if (key.includes("grid")) return <LayoutTemplate className="h-3.5 w-3.5" />;
  if (key.includes("section")) return <LayoutTemplate className="h-3.5 w-3.5" />;
  return <Type className="h-3.5 w-3.5" />;
}

const tabDefs: Array<{ key: PropertyPanelTab; label: string; icon: ReactNode }> = [
  { key: "content", label: "Content", icon: <ALargeSmall className="h-3.5 w-3.5" /> },
  { key: "design", label: "Design", icon: <Paintbrush className="h-3.5 w-3.5" /> },
  { key: "settings", label: "Settings", icon: <Settings2 className="h-3.5 w-3.5" /> },
];

export function PropertyPanel({
  title = "Properties",
  subtitle,
  badgeLabel,
  badgeIcon,
  icon,
  variantControl,
  children,
  content,
  background,
  backgroundSummary = "None",
  typography,
  layout,
  style,
  responsive,
  animation,
  advanced,
  onClose,
  onPin,
  pinned,
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<PropertyPanelTab>("content");
  const [localPinned, setLocalPinned] = useState(false);
  const isPinned = pinned ?? localPinned;

  const displayTitle = badgeLabel || title;
  const panelIcon = useMemo(() => resolvePanelIcon(displayTitle, icon, badgeIcon), [displayTitle, icon, badgeIcon]);

  const contentBody = content ?? children;
  const hasContent = Boolean(contentBody || variantControl);
  const hasBackground = Boolean(background);
  const hasTypography = Boolean(typography);
  const hasLayout = Boolean(layout);
  const hasStyle = Boolean(style);
  const hasDesign = hasBackground || hasTypography || hasLayout || hasStyle;
  const hasResponsive = Boolean(responsive);
  const hasCode = Boolean(advanced || animation);
  const hasSettings = hasResponsive || hasCode;

  const tabs = tabDefs.filter((tab) => {
    if (tab.key === "content") return hasContent;
    if (tab.key === "design") return hasDesign;
    return hasSettings;
  });

  const resolvedTab = tabs.some((tab) => tab.key === activeTab)
    ? activeTab
    : (tabs[0]?.key ?? "content");

  const handlePin = () => {
    if (onPin) {
      onPin();
      return;
    }
    setLocalPinned((prev) => !prev);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden  border border-[#363636] bg-[#1F1F1F]">
      <div className="shrink-0 border-b border-[#363636] bg-[#1F1F1F] px-3 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#363636] bg-[#242424] text-[#D0D0D0]">
              {panelIcon}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-[#F5F5F5]">{displayTitle}</div>
              {subtitle ? <div className="truncate text-[11px] text-[#969696]">{subtitle}</div> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={handlePin}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                isPinned ? "bg-[#242424] text-[#FACC15]" : "text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"
              }`}
              aria-label={isPinned ? "Unpin panel" : "Pin panel"}
              aria-pressed={isPinned}
            >
              <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={!onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Close panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 rounded-xl border border-[#363636] bg-[#1A1A1A] p-1">
          {tabs.map((tab) => {
            const active = resolvedTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#2A2A2A] text-[#F5F5F5] shadow-sm"
                    : "text-[#969696] hover:bg-[#242424] hover:text-[#D0D0D0]"
                }`}
              >
                <span className={active ? "text-[#FACC15]" : "text-[#969696]"}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5">
        {resolvedTab === "content" ? (
          <div className="space-y-2.5">
            {variantControl}
            {contentBody}
          </div>
        ) : null}

        {resolvedTab === "design" ? (
          <div className="space-y-2">
            {hasBackground ? (
              <PropertyAccordion
                title="Background"
                summary={backgroundSummary}
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                defaultOpen={false}
              >
                {background}
              </PropertyAccordion>
            ) : null}

            {hasTypography ? (
              <PropertyAccordion
                title="Typography"
                icon={<Heading className="h-3.5 w-3.5" />}
                defaultOpen
              >
                {typography}
              </PropertyAccordion>
            ) : null}

            {hasStyle ? (
              <PropertyAccordion
                title={hasTypography || hasBackground ? "Style" : "Style"}
                icon={<Paintbrush className="h-3.5 w-3.5" />}
                defaultOpen={!hasTypography}
              >
                {style}
              </PropertyAccordion>
            ) : null}

            {hasLayout ? (
              <PropertyAccordion title="Layout" icon={<LayoutTemplate className="h-3.5 w-3.5" />} defaultOpen={false}>
                {layout}
              </PropertyAccordion>
            ) : null}
          </div>
        ) : null}

        {resolvedTab === "settings" ? (
          <div className="space-y-2">
            {hasResponsive ? (
              <PropertyAccordion
                title="Responsive"
                icon={<Settings2 className="h-3.5 w-3.5" />}
                defaultOpen
              >
                {responsive}
              </PropertyAccordion>
            ) : null}

            {hasCode ? (
              <PropertyAccordion
                title="Code and visibility"
                icon={<Code2 className="h-3.5 w-3.5" />}
                defaultOpen={false}
              >
                <div className="space-y-2.5">
                  {advanced}
                  {animation}
                </div>
              </PropertyAccordion>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
