"use client";

import { useState, useEffect, useMemo } from "react";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { findSectionInProject } from "@/lib/builder/sharedChrome";
import { getWidgetChildItems, buildNormalizedChildData, setWidgetChildItems, findGridColumnIdForChild } from "@/components/builder/widgets/childWidgetUtils";
import { createWidgetInstance, getWidgetPropertiesComponent } from "@/components/builder/widgets/widgetRegistry";
import { PropertyCard, PropertyField } from "@/components/builder/property-ui";
import { PropertiesPanel } from "./PropertiesPanel";
import { X } from "lucide-react";

export function InspectorPanel() {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedId = useBuilder((s) => s.selectedSectionId);
  const selectedElement = useBuilder((s) => s.selectedElement);
  const updateWidgetInstance = useBuilder((s) => s.updateWidgetInstance);
  const pushHistory = useBuilder((s) => s.pushHistory);
  const selectElement = useBuilder((s) => s.selectElement);
  const [activeTab, setActiveTab] = useState<"content" | "style" | "advanced">("content");

  const section = selectedId ? findSectionInProject(project, selectedId, pageOf(project)) : null;
  const widgetInstance = section?.widgetInstance;
  const selectedChildWidget = (() => {
    const selectedChildId = selectedElement?.childId || selectedElement?.elementKey;
    const selectedParentWidgetId = selectedElement?.parentWidgetId || selectedElement?.widgetId;
    if (!selectedChildId || !selectedParentWidgetId || !section?.widgetInstance) return null;
    if (section.widgetInstance.id !== selectedParentWidgetId) return null;
    const resolvedColumnId =
      selectedElement?.columnId ||
      selectedElement?.childContainerId ||
      findGridColumnIdForChild(section.widgetInstance, selectedChildId);
    const children = getWidgetChildItems(section.widgetInstance, resolvedColumnId ? { columnId: resolvedColumnId } : undefined);
    const child = children.find((candidate) => candidate.id === selectedChildId);
    if (!child) return null;
    const childData = child.data as any;
    const normalizedChildStyle = {
      ...childData.style,
      ...((child.type === "heading" || child.type === "text") && childData.style && !childData.style.textColor && childData.style.color
        ? { textColor: String(childData.style.color) }
        : {}),
    } as Record<string, unknown>;
    const childWidgetInstance = createWidgetInstance(child.type, {
      id: `${section.widgetInstance.id}-${child.id}`,
      content: childData.content,
      style: normalizedChildStyle,
      layout: childData.layout,
      responsive: childData.responsive,
      animation: childData.animation,
      advanced: childData.advanced,
      variant: childData.variant ?? (child.type === "button" ? "Filled" : undefined),
    } as any);
    return { child, childWidgetInstance, columnId: resolvedColumnId };
  })();

  const isTextElement = selectedChildWidget && (selectedChildWidget.childWidgetInstance.type === "text" || selectedChildWidget.childWidgetInstance.type === "heading");
  const elementType = isTextElement ? "Text" : selectedElement?.elementType === "image" ? "Image" : selectedElement?.elementType === "button" ? "Button" : "Section";

  if (!section) {
    return (
      <div className="flex h-full flex-col bg-[#171717]">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#2B2B2B] px-3">
          <span className="text-sm font-semibold text-[#F5F5F5]">Properties</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-[#969696]">Select an element on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  if (selectedChildWidget && selectedChildWidget.childWidgetInstance.type === "text") {
    const child = selectedChildWidget.childWidgetInstance;
    const [content, setContent] = useState((child.content as any)?.text || (child.content as any)?.content || "");
    const [fontFamily, setFontFamily] = useState((child.style as any)?.fontFamily || "Inter");
    const [fontWeight, setFontWeight] = useState((child.style as any)?.fontWeight || "700");
    const [fontSize, setFontSize] = useState((child.style as any)?.fontSize || "64px");
    const [lineHeight, setLineHeight] = useState((child.style as any)?.lineHeight || "1.1");
    const [letterSpacing, setLetterSpacing] = useState((child.style as any)?.letterSpacing || "0px");
    const [textColor, setTextColor] = useState((child.style as any)?.textColor || (child.style as any)?.color || "#FFFFFF");
    const [textAlign, setTextAlign] = useState((child.style as any)?.textAlign || "left");

    useEffect(() => {
      const newChild = selectedChildWidget!.childWidgetInstance;
      setContent((newChild.content as any)?.text || (newChild.content as any)?.content || "");
      setFontFamily((newChild.style as any)?.fontFamily || "Inter");
      setFontWeight((newChild.style as any)?.fontWeight || "700");
      setFontSize((newChild.style as any)?.fontSize || "64px");
      setLineHeight((newChild.style as any)?.lineHeight || "1.1");
      setLetterSpacing((newChild.style as any)?.letterSpacing || "0px");
      setTextColor((newChild.style as any)?.textColor || (newChild.style as any)?.color || "#FFFFFF");
      setTextAlign((newChild.style as any)?.textAlign || "left");
    }, [selectedChildWidget?.childWidgetInstance.id]);

    const commit = (patch: Record<string, unknown>) => {
      if (!section?.widgetInstance || !selectedChildWidget) return;
      const resolvedColumnId = selectedChildWidget.columnId || selectedElement?.columnId || selectedElement?.childContainerId || findGridColumnIdForChild(section.widgetInstance, selectedChildWidget.child.id);
      const location = resolvedColumnId ? { childContainerId: resolvedColumnId, columnId: resolvedColumnId } : undefined;
      const children = getWidgetChildItems(section.widgetInstance, location);
      const nextChildren = children.map((c) => {
        if (c.id !== selectedChildWidget.child.id) return c;
        return {
          ...c,
          data: buildNormalizedChildData({
            content: { ...(c.data as any)?.content, ...(patch.content || {}) },
            style: { ...(c.data as any)?.style, ...(patch.style || {}) },
            layout: (c.data as any)?.layout,
            responsive: (c.data as any)?.responsive,
            animation: (c.data as any)?.animation,
            advanced: (c.data as any)?.advanced,
            variant: (c.data as any)?.variant,
          }),
        };
      });
      updateWidgetInstance(section.widgetInstance.id, setWidgetChildItems(section.widgetInstance, nextChildren, location) as any);
      pushHistory();
    };

    return (
      <div className="flex h-full flex-col bg-[#171717]">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#2B2B2B] px-3">
          <span className="text-sm font-semibold text-[#F5F5F5]">{elementType}</span>
          <button type="button" onClick={() => selectElement(null)} className="flex h-6 w-6 items-center justify-center rounded-md text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1 border-b border-[#2B2B2B] px-3 py-2">
          {(["content", "style", "advanced"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-all duration-150 ${activeTab === tab ? "bg-[#2A2A2A] text-[#F5F5F5] shadow-sm" : "text-[#969696] hover:bg-[#242424] hover:text-[#D0D0D0]"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTab === "content" && (
            <div className="p-3">
              <PropertyCard title="Content">
                <PropertyField label="Text">
                  <textarea className="h-32 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" value={content} onChange={(ev) => setContent(ev.target.value)} onBlur={() => commit({ content: { text: content } })} />
                </PropertyField>
              </PropertyCard>
            </div>
          )}
          {activeTab === "style" && (
            <div className="p-3 space-y-3">
              <PropertyCard title="Typography">
                <div className="space-y-3">
                  <PropertyField label="Font Family">
                    <select className="h-9 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); commit({ style: { fontFamily: e.target.value } }); }}>
                      <option>Inter</option><option>Georgia</option><option>Poppins</option><option>Montserrat</option>
                    </select>
                  </PropertyField>
                  <div className="grid grid-cols-2 gap-2">
                    <PropertyField label="Font Weight">
                      <select className="h-9 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" value={fontWeight} onChange={(e) => { setFontWeight(e.target.value); commit({ style: { fontWeight: e.target.value } }); }}>
                        <option>400</option><option>500</option><option>600</option><option>700</option>
                      </select>
                    </PropertyField>
                    <PropertyField label="Font Size">
                      <div className="flex items-center gap-2">
                        <input type="text" className="h-9 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" value={fontSize} onChange={(ev) => setFontSize(ev.target.value)} onBlur={() => commit({ style: { fontSize } })} />
                        <span className="text-xs text-[#969696]">px</span>
                      </div>
                    </PropertyField>
                  </div>
                  <PropertyField label="Line Height">
                    <input type="text" className="h-9 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" value={lineHeight} onChange={(ev) => setLineHeight(ev.target.value)} onBlur={() => commit({ style: { lineHeight } })} />
                  </PropertyField>
                  <PropertyField label="Letter Spacing">
                    <div className="flex items-center gap-2">
                      <input type="text" className="h-9 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" value={letterSpacing} onChange={(ev) => setLetterSpacing(ev.target.value)} onBlur={() => commit({ style: { letterSpacing } })} />
                      <span className="text-xs text-[#969696]">px</span>
                    </div>
                  </PropertyField>
                  <PropertyField label="Text Color">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#363636] bg-[#FFFFFF]">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: textColor }} />
                      </div>
                      <input type="text" className="h-9 flex-1 rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" value={textColor} onChange={(ev) => setTextColor(ev.target.value)} onBlur={() => commit({ style: { textColor } })} />
                    </div>
                  </PropertyField>
                  <PropertyField label="Alignment">
                    <div className="flex items-center gap-1">
                      {(["left", "center", "right", "justify"] as const).map((value) => (
                        <button key={value} type="button" onClick={() => { setTextAlign(value); commit({ style: { textAlign: value } }); }} className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition ${textAlign === value ? "border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15]" : "border-[#363636] text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"}`}>
                          {value === "left" ? "⯇" : value === "center" ? "≡" : value === "right" ? "⯈" : "☰"}
                        </button>
                      ))}
                    </div>
                  </PropertyField>
                </div>
              </PropertyCard>
            </div>
          )}
          {activeTab === "advanced" && (
            <div className="p-3 space-y-2">
              {[
                { key: "spacing", label: "Spacing" },
                { key: "background", label: "Background" },
                { key: "border", label: "Border" },
                { key: "effects", label: "Effects" },
              ].map(({ key, label }) => (
                <CollapsibleSection key={key} label={label}>
                  <div className="space-y-3">
                    <PropertyField label="Padding"><input type="text" className="h-9 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" placeholder="e.g. 16px 24px" /></PropertyField>
                    <PropertyField label="Margin"><input type="text" className="h-9 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" placeholder="e.g. 0px 0px" /></PropertyField>
                  </div>
                </CollapsibleSection>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-between border-t border-[#2B2B2B] p-3">
          <button type="button" className="flex h-8 items-center gap-2 rounded-lg border border-[#363636] bg-transparent px-3 text-xs font-medium text-[#D0D0D0] transition hover:bg-[#242424]">Reset</button>
          <button type="button" className="flex h-8 items-center gap-2 rounded-lg bg-[#FACC15] px-3 text-xs font-medium text-[#111111] transition hover:bg-[#FDE047]">Save Changes</button>
        </div>
      </div>
    );
  }

  return <PropertiesPanelWrapper onClose={() => selectElement(null)}><PropertiesPanel /></PropertiesPanelWrapper>;
}

function PropertiesPanelWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#171717]">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#2B2B2B] px-3">
        <span className="text-sm font-semibold text-[#F5F5F5]">Properties</span>
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function CollapsibleSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#363636] bg-[#1F1F1F]">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-[#D0D0D0] transition hover:bg-[#242424]">
        <span>{label}</span>
        <span className="text-[#969696]">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-[#363636] p-3">{children}</div>}
    </div>
  );
}
