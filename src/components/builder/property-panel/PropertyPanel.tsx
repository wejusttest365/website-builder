import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faThumbtack } from "@fortawesome/free-solid-svg-icons";

export interface PropertyPanelProps {
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeIcon?: React.ReactNode;
  variantControl?: React.ReactNode;
  children?: React.ReactNode;
  content?: React.ReactNode;
  style?: React.ReactNode;
  layout?: React.ReactNode;
  responsive?: React.ReactNode;
  animation?: React.ReactNode;
  advanced?: React.ReactNode;
}

export function PropertyPanel({
  title = "Properties",
  subtitle,
  badgeLabel,
  badgeIcon,
  variantControl,
  children,
  content,
  style,
  layout,
  responsive,
  animation,
  advanced,
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "style" | "advanced">("content");

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="sticky top-0 z-20 border-b border-slate-200/40 bg-white/95 px-3 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-slate-900">{title}</div>
            <div className="mt-2 flex items-center gap-2 text-[13px] font-medium text-slate-900">
              {badgeIcon ? <span className="text-slate-500">{badgeIcon}</span> : null}
              {badgeLabel ? <span className="truncate text-[13px] font-medium">{badgeLabel}</span> : null}
            </div>
            {subtitle ? <div className="mt-1 text-[12px] text-slate-500">{subtitle}</div> : null}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-white text-slate-400 hover:text-slate-600" aria-label="Pin panel">
              <FontAwesomeIcon icon={faThumbtack} className="h-4 w-4" />
            </button>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-white text-slate-500 hover:bg-slate-50" aria-label="Close panel">
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 overflow-visible px-0 py-1">
          {[
            { key: "content", label: "Content" },
            { key: "style", label: "Style" },
            { key: "advanced", label: "Advanced" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`min-w-0 px-3 pb-2 pt-0 text-[12px] font-medium transition ${
                activeTab === tab.key
                  ? "text-violet-600 border-b-2 border-violet-500"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              style={{ borderRadius: 0 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 pb-6">
        {activeTab === "content" && (
          <div className="space-y-3">
            {children}
            {variantControl}
            {content}
          </div>
        )}

        {activeTab === "style" && (
          <div className="space-y-4">
            {style}
            {layout}
            {responsive}
            {animation}
          </div>
        )}

        {activeTab === "advanced" && <div className="space-y-3">{advanced}</div>}
      </div>
    </div>
  );
}
