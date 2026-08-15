import { PropertyText } from "./properties/PropertyText";
import {
  PropertyCard as Section,
  PropertyField as Field,
} from "@/components/builder/property-ui";
import { defaultHeroWidgetData, isHeroWidgetData, normalizeHeroChildItem } from "@/components/builder/widgets/Hero/HeroTypes";
import { createWidgetInstance, getWidgetPropertiesComponent } from "@/components/builder/widgets/widgetRegistry";
import { buildNormalizedChildData, findGridColumnIdForChild, getChildWidgetData, getWidgetChildItems, setWidgetChildItems } from "@/components/builder/widgets/childWidgetUtils";
import { normalizeFontSizeToPx } from "@/components/builder/widgets/fontSize";
import { PropertyPanel as TabbedPropertyPanel } from "@/components/builder/property-panel/PropertyPanel";

import { useBuilder, pageOf } from "@/lib/builder/store";
import { findSectionInProject } from "@/lib/builder/sharedChrome";
import { nanoid } from "nanoid";
import { Plus, Trash2, Copy, Eye, EyeOff, UploadCloud, Facebook, Twitter, Instagram, Linkedin, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { ContainerChildItem } from "@/components/builder/widgets/Container/ContainerTypes";

const inputCls =
  "h-10 w-full rounded-xl border border-[#363636] bg-[#171717] px-3 text-sm text-[#F5F5F5] shadow-sm transition-all outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20";
const selectCls = inputCls + " max-w-[10rem]";
 
type PropertyFieldConfig = {
  label: string;
  render: ReactNode;
};

function renderPropertyFieldConfigs(fields: PropertyFieldConfig[]) {
  return fields.map((field, index) => (
    <Field key={`${field.label}-${index}`} label={field.label}>
      {field.render}
    </Field>
  ));
}

function renderPropertySection(title: string, fields: PropertyFieldConfig[]) {
  return (
    <Section title={title}>
      {renderPropertyFieldConfigs(fields)}
    </Section>
  );
}

 

function PropertyNumber({
  value,
  onChange,
  onBlur,
  placeholder,
  min,
  max,
  step,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      className={inputCls}
      value={value}
      placeholder={placeholder ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      min={min}
      max={max}
      step={step}
    />
  );
}

function PropertySlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="range"
      className="w-full"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function PropertySelect({
  value,
  onChange,
  onBlur,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function PropertyColor({ value, onChange, onBlur }: { value: string; onChange: (value: string) => void; onBlur: () => void }) {
  return <ColorInput value={value} onChange={onChange} onBlur={onBlur} />;
}

function textField(
  label: string,
  value: string,
  onChange: (value: string) => void,
  onBlur: () => void,
  placeholder?: string
): PropertyFieldConfig {
  return {
    label,
    render: <PropertyText value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} />,
  };
}

function selectField(
  label: string,
  value: string,
  options: Array<{ label: string; value: string }>,
  onChange: (value: string) => void,
  onBlur: () => void
): PropertyFieldConfig {
  return {
    label,
    render: <PropertySelect value={value} onChange={onChange} onBlur={onBlur} options={options} />,
  };
}

function colorField(label: string, value: string, onChange: (value: string) => void, onBlur: () => void): PropertyFieldConfig {
  return {
    label,
    render: <PropertyColor value={value} onChange={onChange} onBlur={onBlur} />,
  };
}

function PropertyToggle({
  label,
  checked,
  onChange,
  onBlur,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  onBlur?: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-[#363636] bg-[#1F1F1F] px-3 py-2 transition-all duration-150 hover:border-[#4A4A4A]">
      <span className="text-sm text-[#D0D0D0]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        onBlur={onBlur}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/30 ${
          checked ? "border-[#FACC15] bg-[#FACC15]/15" : "border-[#3A3A3A] bg-[#2A2A2A]"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full transition-all duration-200 ${
            checked ? "translate-x-4 bg-[#FACC15] shadow-sm" : "translate-x-0.5 bg-[#9A9A9A]"
          }`}
        />
      </button>
    </label>
  );
}

function PropertyTypography({
  state,
  onChange,
  onBlur,
}: {
  state: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    color: string;
    textAlign: string;
    textTransform: string;
    letterSpacing: string;
  };
  onChange: (key: string, value: string) => void;
  onBlur: () => void;
}) {
  const fontFamilies = [
    "ui-sans-serif, system-ui, sans-serif",
    "Georgia, serif",
    "ui-monospace, monospace",
    '"Inter", sans-serif',
    '"Poppins", sans-serif',
    '"Montserrat", sans-serif',
  ];
  const fontSizes = ["12px", "13px", "14px", "15px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "40px", "48px", "56px", "64px"];
  const normalizedFontSize = normalizeFontSizeToPx(state.fontSize) ?? (state.fontSize || "");

  return (
    <>
      <Field label="Font family">
        <PropertySelect
          value={state.fontFamily || ""}
          options={(state.fontFamily && state.fontFamily.trim() ? [state.fontFamily, ...fontFamilies] : fontFamilies).map((value) => ({ label: value, value }))}
          onChange={(value) => onChange("fontFamily", value)}
          onBlur={onBlur}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font size">
          <PropertySelect
            value={normalizedFontSize}
            options={(normalizedFontSize && normalizedFontSize.trim() ? [normalizedFontSize, ...fontSizes] : fontSizes).map((value) => ({ label: value, value }))}
            onChange={(value) => onChange("fontSize", normalizeFontSizeToPx(value) ?? value)}
            onBlur={onBlur}
          />
        </Field>
        <Field label="Weight">
          <PropertySelect
            value={state.fontWeight || ""}
            options={[
              { label: state.fontWeight || "Default", value: "" },
              { label: "Regular", value: "400" },
              { label: "Medium", value: "500" },
              { label: "Semibold", value: "600" },
              { label: "Bold", value: "700" },
            ]}
            onChange={(value) => onChange("fontWeight", value)}
            onBlur={onBlur}
          />
        </Field>
      </div>
      <Field label="Line height">
        <PropertySelect
          value={state.lineHeight || ""}
          options={[
            { label: state.lineHeight || "Line height", value: "" },
            { label: "1", value: "1" },
            { label: "1.15", value: "1.15" },
            { label: "1.25", value: "1.25" },
            { label: "1.5", value: "1.5" },
            { label: "1.75", value: "1.75" },
            { label: "2", value: "2" },
          ]}
          onChange={(value) => onChange("lineHeight", value)}
          onBlur={onBlur}
        />
      </Field>
      <Field label="Text color">
        <PropertyColor value={state.color || ""} onChange={(value) => onChange("color", value)} onBlur={onBlur} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Align">
          <PropertySelect
            value={state.textAlign || ""}
            options={[
              { label: state.textAlign || "Default", value: "" },
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "Justify", value: "justify" },
            ]}
            onChange={(value) => onChange("textAlign", value)}
            onBlur={onBlur}
          />
        </Field>
        <Field label="Case">
          <PropertySelect
            value={state.textTransform || ""}
            options={[
              { label: state.textTransform || "Default", value: "" },
              { label: "None", value: "none" },
              { label: "Uppercase", value: "uppercase" },
              { label: "Lowercase", value: "lowercase" },
              { label: "Capitalize", value: "capitalize" },
            ]}
            onChange={(value) => onChange("textTransform", value)}
            onBlur={onBlur}
          />
        </Field>
      </div>
      <Field label="Spacing">
        <PropertyText
          value={state.letterSpacing || ""}
          onChange={(value) => onChange("letterSpacing", value)}
          onBlur={onBlur}
          placeholder="0.5px"
        />
      </Field>
    </>
  );
}

function PropertyBorder({
  borderRadius,
  boxShadow,
  onBorderRadiusChange,
  onBoxShadowChange,
  onBlur,
}: {
  borderRadius: string;
  boxShadow: string;
  onBorderRadiusChange: (value: string) => void;
  onBoxShadowChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <>
      <Field label="Border Radius">
        <PropertyText value={borderRadius} onChange={onBorderRadiusChange} onBlur={onBlur} placeholder="e.g. 16px" />
      </Field>
      <Field label="Shadow">
        <PropertySelect
          value={boxShadow}
          options={[
            { label: "None", value: "" },
            { label: "Subtle", value: "0 1px 2px rgba(0,0,0,.06)" },
            { label: "Soft", value: "0 4px 10px rgba(0,0,0,.08)" },
            { label: "Medium", value: "0 10px 30px rgba(0,0,0,.15)" },
            { label: "Large", value: "0 25px 50px -12px rgba(0,0,0,.25)" },
          ]}
          onChange={onBoxShadowChange}
          onBlur={onBlur}
        />
      </Field>
    </>
  );
}

function PropertySpacing({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
}) {
  return <PropertyText value={value} placeholder={placeholder} onChange={onChange} onBlur={onBlur} />;
}

function customField(label: string, render: ReactNode): PropertyFieldConfig {
  return {
    label,
    render,
  };
}

function ColorInput({ value, onChange, onBlur }: { value: string; onChange: (v: string) => void; onBlur: () => void }) {
  const [open, setOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 12, left: 12 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const normalizedValue = (value || "").trim();
  const swatchValue = /^#/.test(normalizedValue) ? normalizedValue : "#ffffff";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = 220;
      const height = 120;
      const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.left));
      const top = Math.min(window.innerHeight - height - 12, Math.max(12, rect.bottom + 8));
      setPickerPosition({ top, left });
    };

    updatePosition();
    const timeoutId = window.setTimeout(updatePosition, 0);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="flex gap-2">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        onBlur={onBlur}
        className="h-8 w-9 shrink-0 rounded border border-[#363636] bg-[#1F1F1F] p-1 shadow-sm transition hover:bg-[#252525]"
        aria-label="Open color picker"
      >
        <span className="block h-full w-full rounded-sm border border-black/10" style={{ backgroundColor: swatchValue }} />
      </button>
      <input
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="transparent"
      />
      {open && mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              className="fixed z-[9999] w-[220px] rounded-lg border border-border bg-popover p-3 shadow-xl"
              style={{ top: pickerPosition.top, left: pickerPosition.left }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={swatchValue}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  className="h-9 w-9 cursor-pointer rounded border border-[#363636] bg-[#1F1F1F] p-0"
                />
                <input
                  className="h-9 w-full rounded border border-[#363636] bg-[#1F1F1F] px-2 text-sm"
                  value={normalizedValue || ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="#ffffff"
                />
              </div>
              <div className="mt-2 text-[11px] text-[#969696]">The picker stays inside the builder window.</div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function PropertiesPanel() {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedId = useBuilder((s) => s.selectedSectionId);
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedElementStyle = useBuilder((s) => s.selectedElementStyle);
  const select = useBuilder((s) => s.selectSection);
  const selectElement = useBuilder((s) => s.selectElement);
  const updateSection = useBuilder((s) => s.updateSection);
  const updateWidgetInstance = useBuilder((s) => s.updateWidgetInstance);
  const pushHistory = useBuilder((s) => s.pushHistory);
  const addAsset = useBuilder((s) => s.addAsset);

  const clearSelection = () => {
    selectElement(null);
    select(null);
  };

  // Hooks must run unconditionally â€” define local React hooks here
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  const section = selectedId
    ? findSectionInProject(project, selectedId, pageOf(project))
    : null;
  const widgetInstance = section?.widgetInstance;
  
  const WidgetPropertiesComponent = widgetInstance ? getWidgetPropertiesComponent(widgetInstance.type) : null;
  const selectedChildWidget = (() => {
    const selectedChildId = selectedElement?.childId || selectedElement?.elementKey;
    const selectedParentWidgetId = selectedElement?.parentWidgetId || selectedElement?.widgetId;
    if (!selectedChildId || !selectedParentWidgetId || !section?.widgetInstance) {
      return null;
    }
    if (section.widgetInstance.id !== selectedParentWidgetId) {
      return null;
    }
    const resolvedColumnId =
      selectedElement?.columnId ||
      selectedElement?.childContainerId ||
      findGridColumnIdForChild(section.widgetInstance, selectedChildId);
    const children = getWidgetChildItems(
      section.widgetInstance,
      resolvedColumnId ? { columnId: resolvedColumnId } : undefined,
    );
    const child = children.find((candidate) => candidate.id === selectedChildId);
    if (!child) {
      return null;
    }
    const normalizedChild = section.widgetInstance.type === "hero" && isHeroWidgetData(section.widgetInstance)
      ? normalizeHeroChildItem(section.widgetInstance, child as ContainerChildItem)
      : (child as ContainerChildItem);
    const childData = getChildWidgetData(normalizedChild);
    const normalizedChildStyle = {
      ...childData.style,
      ...(child.type === "heading" || child.type === "text") && childData.style && !childData.style.textColor && childData.style.color
        ? { textColor: String(childData.style.color) }
        : {},
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
  const SelectedChildPropertiesComponent = selectedChildWidget ? getWidgetPropertiesComponent(selectedChildWidget.childWidgetInstance.type) : null;

  if (!section) {
    return (
      <div className="h-full bg-card p-1 text-sm text-[#969696]">
        <div className="font-semibold text-foreground text-base mb-2">Properties</div>
        Select a section on the canvas to edit its properties.
      </div>
    );
  }

  if (selectedChildWidget && SelectedChildPropertiesComponent) {
    return (
      <div className="h-full overflow-hidden bg-white">
        <SelectedChildPropertiesComponent
          value={selectedChildWidget.childWidgetInstance}
          onClose={clearSelection}
          onChange={(nextValue) => {
            const selectedChildId = selectedElement?.childId || selectedElement?.elementKey;
            const selectedParentWidgetId = selectedElement?.parentWidgetId || selectedElement?.widgetId;
            if (!section?.widgetInstance || section.widgetInstance.id !== selectedParentWidgetId || !selectedChildId) return;
            const resolvedColumnId =
              selectedChildWidget.columnId ||
              selectedElement?.childContainerId ||
              selectedElement?.columnId ||
              findGridColumnIdForChild(section.widgetInstance, selectedChildId);
            const location = resolvedColumnId
              ? { childContainerId: resolvedColumnId, columnId: resolvedColumnId }
              : undefined;
            const children = getWidgetChildItems(section.widgetInstance, location);
            const nextChildren = children.map((child) => child.id === selectedChildId
              ? {
                  ...child,
                  data: buildNormalizedChildData({
                    content: (nextValue.content as Record<string, unknown> | undefined) ?? {},
                    style: (nextValue.style as Record<string, unknown> | undefined) ?? {},
                    layout: (nextValue.layout as Record<string, unknown> | undefined) ?? {},
                    responsive: (nextValue.responsive as Record<string, unknown> | undefined) ?? {},
                    animation: (nextValue.animation as Record<string, unknown> | undefined) ?? {},
                    advanced: (nextValue.advanced as Record<string, unknown> | undefined) ?? {},
                    variant: (nextValue.variant as string | undefined),
                  }),
                }
              : child);
            updateWidgetInstance(section.widgetInstance.id, setWidgetChildItems(section.widgetInstance, nextChildren, location) as any);
            pushHistory();
          }}
        />
      </div>
    );
  }

  if (widgetInstance && WidgetPropertiesComponent) {
    return (
      <div className="h-full overflow-hidden bg-white">
        <WidgetPropertiesComponent
          value={widgetInstance}
          onClose={clearSelection}
          onChange={(nextValue) => {
            updateWidgetInstance(widgetInstance.id, nextValue);
            pushHistory();
          }}
        />
      </div>
    );
  }

  // For non-widget sections, render the legacy section editor shell.

  const style = section.style ?? {};
  const isFooter = /^\s*<footer\b/i.test(section.html);
  const isTopBar = /data-wto-topbar\b/i.test(section.html);
  const isHeaderLike = (section as any).shared === "header" || /<header\b/i.test(section.html) || /<nav\b/i.test(section.html) || /\[data-wto-nav\]/i.test(section.html);
  const isTeamSection = /<section\b[^>]*\b(id=["']?team["']?)|Meet the team|Trusted by teams/i.test(section.html);
  const isElementSelected = Boolean(selectedElement && selectedElement.kind !== "section");
  const showSectionControls = !isElementSelected;
  const textItems = getEditableTextItems(section.html);
  const menuItems = isFooter ? [] : getMenuItems(section.html);
  const linkItems = getLinkItems(section.html);
  const repeater = isFooter ? null : getRepeater(section.html);
  const isAccordion = !!repeater && isAccordionSection(section.html);
  const footerCols = isFooter ? getFooterColumns(section.html) : [];
  const teamGridColumns = isTeamSection ? getTeamGridColumnCount(section.html) : null;
  const selectedTeamGridItem = isTeamSection
    ? getTeamGridItemInfo(section.html, selectedElement?.index ?? 0) ?? getFirstTeamGridItemInfo(section.html)
    : null;
  const selectedTeamGridGap = selectedTeamGridItem ? getTeamGridGap(section.html) : "";
  const showHeaderMenuControls = isHeaderLike;
  const imageItems = getImageItems(section.html);
  const selectedTextItem = selectedElement?.kind === "text" && selectedElement.index != null ? textItems[selectedElement.index] ?? null : null;
  const selectedImageItem = selectedElement?.kind === "image" && selectedElement.index != null ? imageItems[selectedElement.index] ?? null : null;
  const selectedLinkItem = selectedElement?.kind === "link" && selectedElement.index != null ? linkItems[selectedElement.index] ?? null : null;
  const sectionLinkItems = linkItems;
  const selectedContainerStyle = selectedElement?.kind === "container" && selectedElement.index != null ? getContainerStyleState(section.html, selectedElement.index) : null;
  const selectedLinkStyle = selectedElement?.kind === "link" && selectedElement.index != null ? getLinkStyleState(section.html, selectedElement.index) : null;
  const selectedContainerTypography = selectedElement?.kind === "container" && selectedElement.index != null ? getContainerTypographyState(section.html, selectedElement.index) : null;
  const assets = project?.assets;
  const backgroundImage = (style["background-image"] ?? "")
    .replace(/^url\(|\)$/g, "")
    .replace(/^['"]|['"]$/g, "");

  function normalizeAssetPath(path?: string) {
    return String(path || "")
      .replace(/^url\((['"]?)/, "")
      .replace(/['"]?\)$/, "")
      .replace(/^['"]|['"]$/g, "")
      .replace(/^\.\//, "")
      .replace(/^\//, "");
  }

  function resolveAssetSrc(path?: string) {
    const normalizedPath = normalizeAssetPath(path);
    if (/^(images\/|\.\/images\/|\/images\/)/.test(normalizedPath)) {
      const filename = normalizedPath.replace(/^(\.\/)?(\/)?images\//, "");
      const asset = project?.assets?.[filename];
      if (!asset) return normalizedPath;
      if (typeof asset === "string") return asset;
      return asset.previewSrc || asset.src || normalizedPath;
    }
    return normalizedPath;
  }

  function downloadAssetByPath(path?: string) {
    if (!path) return;
    const normalizedPath = normalizeAssetPath(path);
    if (/^data:/.test(normalizedPath)) {
      const m = /^data:([^;]+);base64,(.*)$/.exec(normalizedPath);
      if (!m) return;
      const mime = m[1] || 'application/octet-stream';
      const b64 = m[2];
      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const u8 = new Uint8Array(byteNumbers);
      const blob = new Blob([u8], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset.${mime.split('/')[1] || 'bin'}`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (!project?.assets) return;
    const m = /images\/([^"'\/\s]+)$/.exec(normalizedPath);
    if (!m) return;
    const filename = m[1];
    const asset = project.assets[filename];
    if (!asset) return;
    const dataUrl = typeof asset === 'string' ? asset : asset.previewSrc || asset.src;
    if (!dataUrl || typeof dataUrl !== 'string') return;
    try {
      const parts = dataUrl.split(',');
      const meta = parts[0];
      const b64 = parts[1];
      const mime = meta.match(/data:([^;]+);/)?.[1] || 'application/octet-stream';
      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const u8 = new Uint8Array(byteNumbers);
      const blob = new Blob([u8], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  const set = (k: string, v: string) => {
    const next = { ...style };
    if (v) next[k] = v;
    else delete next[k];
    updateSection(section.id, { style: next });
    // If changing header background, auto-apply a contrasting link color if forcing enabled
    if (k === "background-color" && (section as any).shared === "header") {
      const force = getNavForceFlag(section.html);
      if (force) {
        const color = v ? contrastColorForHex(v) : "";
        const nextHtml = setNavForeground(section.html, color);
        updateHtml(nextHtml);
      }
    }
  };

  const updateHtml = (html: string) => updateSection(section.id, { html });

  function normalizeSelectedColor(color?: string) {
    if (!color) return "";
    const normalized = String(color).trim();
    if (/^transparent$/i.test(normalized)) return "";
    if (/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/i.test(normalized)) return "";
    return normalized;
  }

  const selectedTypographyState = (() => {
    if (selectedElement && selectedElementStyle) {
      return {
        fontFamily: selectedElementStyle.fontFamily || '',
        fontSize: normalizeFontSizeToPx(selectedElementStyle.fontSize) || selectedElementStyle.fontSize || '',
        color: normalizeSelectedColor(selectedElementStyle.color),
        fontWeight: selectedElementStyle.fontWeight || '',
        lineHeight: selectedElementStyle.lineHeight || '',
        textAlign: selectedElementStyle.textAlign || '',
        letterSpacing: selectedElementStyle.letterSpacing || '',
        textTransform: selectedElementStyle.textTransform || '',
      };
    }
    if (selectedElement?.kind === 'text' && selectedTextItem) {
      return { ...selectedTextItem, fontSize: normalizeFontSizeToPx(selectedTextItem.fontSize) || selectedTextItem.fontSize || '' };
    }
    if (selectedElement?.kind === 'link' && selectedLinkStyle) {
      return { ...selectedLinkStyle, fontSize: normalizeFontSizeToPx(selectedLinkStyle.fontSize) || selectedLinkStyle.fontSize || '' };
    }
    if (selectedElement?.kind === 'container' && selectedContainerTypography) {
      return { ...selectedContainerTypography, fontSize: normalizeFontSizeToPx(selectedContainerTypography.fontSize) || selectedContainerTypography.fontSize || '' };
    }
    return {
      fontFamily: style['font-family'] || '',
      fontSize: normalizeFontSizeToPx(style['font-size']) || style['font-size'] || '',
      color: style['color'] || '',
      fontWeight: style['font-weight'] || '',
      lineHeight: style['line-height'] || '',
      textAlign: style['text-align'] || '',
      letterSpacing: style['letter-spacing'] || '',
      textTransform: style['text-transform'] || '',
    };
  })();

  const typographyTargetLabel = (() => {
    if (selectedElement?.kind === 'text') return selectedTextItem?.label || 'Text';
    if (selectedElement?.kind === 'link') return 'Link';
    if (selectedElement?.kind === 'container') return 'Container';
    return 'Section';
  })();

  function applyTypographyChange(key: string, value: string) {
    if (!section) return;
    const nextValue = key === "fontSize" ? (normalizeFontSizeToPx(value) ?? value) : value;
    if (selectedElement?.kind === 'text' && selectedElement.index != null) {
      updateHtml(setTextItemStyle(section.html, selectedElement.index, { [key]: nextValue } as any));
      pushHistory();
      return;
    }
    if (selectedElement?.kind === 'link' && selectedElement.index != null) {
      updateHtml(setLinkStyle(section.html, selectedElement.index, { [key]: nextValue } as any));
      pushHistory();
      return;
    }
    if (selectedElement?.kind === 'container' && selectedElement.index != null) {
      updateHtml(setContainerTypography(section.html, selectedElement.index, { [key]: nextValue } as any));
      pushHistory();
      return;
    }
    set(key, nextValue);
  }

  const contentTabContent = (
    <div className="space-y-4">
      {widgetInstance && WidgetPropertiesComponent ? (
        <div className="rounded-md border border-[#363636] bg-[#1F1F1F] p-2">
          <div className="font-semibold text-foreground text-sm mb-2">Widget Properties</div>
          <WidgetPropertiesComponent
            value={widgetInstance}
            onChange={(nextValue) => {
              updateWidgetInstance(widgetInstance.id, nextValue);
              pushHistory();
            }}
          />
        </div>
      ) : null}

      {showHeaderMenuControls && (() => {
        const brand = findBrandAnchor(section.html);
        if (!brand) return null;
        const brandMode = brand.mode || (brand.src ? "logo" : brand.text ? "text" : "hidden");
        return (
          <div className="rounded-xl border border-[#363636] bg-[#1F1F1F] p-4">
            <div className="text-xs uppercase tracking-wider text-[#969696]">Brand / Logo</div>
            <div className="mt-2 space-y-3">
              <Field label="Display">
                <select
                  className={inputCls}
                  value={brandMode}
                  onChange={(e) => {
                    const mode = e.target.value as "logo" | "text" | "hidden";
                    if (mode === "text") {
                      updateHtml(setBrandMode(section.html, "text", brand.text || "Brand"));
                    } else if (mode === "logo") {
                      updateHtml(setBrandMode(section.html, "logo", brand.text || "Brand"));
                    } else {
                      updateHtml(setBrandMode(section.html, "hidden", brand.text || "Brand"));
                    }
                    pushHistory();
                  }}
                  onBlur={pushHistory}
                >
                  <option value="logo">Logo</option>
                  <option value="text">Text</option>
                  <option value="hidden">Hidden</option>
                </select>
              </Field>

              <Field label="Brand text">
                <input
                  className={inputCls}
                  value={brand.text}
                  placeholder="Brand name"
                  onChange={(e) => updateHtml(setBrandText(section.html, e.target.value))}
                  onBlur={pushHistory}
                />
              </Field>

              {brandMode === "logo" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-32 overflow-hidden rounded-md border border-[#363636] bg-[#1F1F1F] flex items-center justify-center">
                      {brand.src ? (
                        <img src={resolveAssetSrc(brand.src)} alt="logo" className="max-h-full max-w-full object-contain" />
                      ) : brand.hasPlaceholder ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" />
                            <path d="M7 17V8" />
                            <path d="M17 17V5" />
                            <path d="M12 17V11" />
                          </svg>
                        </div>
                      ) : (
                        <span className="text-xs text-[#969696]">No logo</span>
                      )}
                    </div>
                    {brand.src && /^images\//.test(normalizeAssetPath(brand.src)) && (
                      <button className="px-2 py-1 rounded-md border border-[#363636] text-xs" onClick={() => downloadAssetByPath(brand.src)}>
                        Download
                      </button>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-md border border-[#363636] bg-[#1F1F1F] px-3 py-2 text-sm text-[#969696] cursor-pointer hover:bg-[#252525]">
                    <UploadCloud className="h-4 w-4" />
                    Upload logo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = () => {
                          try {
                            const dataUrl = String(r.result);
                            const assetPath = addAsset(dataUrl, f.name);
                            updateHtml(setBrandImage(section.html, assetPath));
                            pushHistory();
                          } catch (err) {
                            console.error("brand upload failed", err);
                          }
                        };
                        r.readAsDataURL(f);
                      }}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        );
      })()}

      {sectionLinkItems.length > 0 ? (
        <Section title="Section CTAs">
          <div className="space-y-3">
            {sectionLinkItems.map((link, index) => (
              <div key={`${link.text || "action"}-${index}`} className="rounded-xl border border-[#363636] bg-[#1F1F1F] p-4 transition-all duration-200 hover:border-[#4A4A4A] hover:bg-white hover:shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-[#F5F5F5]">{link.text || `CTA ${index + 1}`}</h4>
                    <p className="truncate text-xs text-[#969696]">{link.href || "#"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#363636] bg-white text-[#D0D0D0] transition hover:border-[#4A4A4A] hover:bg-[#252525] hover:text-[#FACC15]" title={link.hidden ? "Show CTA" : "Hide CTA"} onClick={() => { updateHtml(toggleLinkVisibility(section.html, index)); pushHistory(); }}>
                      {link.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#363636] bg-white text-[#D0D0D0] transition hover:border-[#4A4A4A] hover:bg-[#2A2A2A] hover:text-[#FACC15]" title="Delete CTA" onClick={() => { updateHtml(removeLinkItem(section.html, index)); pushHistory(); }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Field label="Href">
                    <input className={inputCls} value={link.href} placeholder="# or https://..." onChange={(e) => updateHtml(updateLinkItem(section.html, index, { href: e.target.value }))} onBlur={pushHistory} />
                  </Field>
                  <Field label="Label">
                    <input className={inputCls} value={link.text} placeholder="Button label" onChange={(e) => updateHtml(updateLinkItem(section.html, index, { text: e.target.value }))} onBlur={pushHistory} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {showHeaderMenuControls && (
        <Section title="Menu Items">
          <div className="space-y-2">
            {menuItems.length > 0 ? (
              menuItems.map((item, index) => (
                <div key={`${item.text}-${index}`} className="grid grid-cols-[1fr_74px_28px] gap-1.5">
                  <input className={inputCls} value={item.text} aria-label={`Menu item ${index + 1} label`} onChange={(e) => updateHtml(updateMenuItem(section.html, index, { text: e.target.value }))} onBlur={pushHistory} />
                  <input className={inputCls} value={item.href} aria-label={`Menu item ${index + 1} link`} onChange={(e) => updateHtml(updateMenuItem(section.html, index, { href: e.target.value }))} onBlur={pushHistory} />
                  <button type="button" className="inline-flex h-8 items-center justify-center rounded-md border border-[#363636] text-[#FACC15] hover:bg-destructive/10" title="Remove menu item" onClick={() => { updateHtml(removeMenuItem(section.html, index)); pushHistory(); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-[#363636] bg-[#1F1F1F] px-3 py-2 text-sm text-[#969696]">No menu items detected in this header. Add one below to edit it here.</div>
            )}
            <button type="button" className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-[#363636] bg-[#1F1F1F] text-xs font-medium hover:bg-[#252525]" onClick={() => { updateHtml(addMenuItem(section.html)); pushHistory(); }}>
              <Plus className="h-3.5 w-3.5" /> Add menu item
            </button>
          </div>
        </Section>
      )}

      {showSectionControls && linkItems.length > 0 && (
        <Section title="Links & Buttons">
          <div className="space-y-2">
            {linkItems.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-1.5">
                <input className={inputCls} value={item.text} aria-label={`Link ${index + 1} label`} onChange={(e) => updateHtml(updateLinkItem(section.html, index, { text: e.target.value }))} onBlur={pushHistory} />
                <input className={inputCls} value={item.href} aria-label={`Link ${index + 1} URL`} placeholder="https://â€¦" onChange={(e) => updateHtml(updateLinkItem(section.html, index, { href: e.target.value }))} onBlur={pushHistory} />
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#363636] bg-[#1F1F1F] text-[#969696] hover:bg-[#252525]" title={item.hidden ? "Show element" : "Hide element"} onClick={() => { updateHtml(toggleLinkVisibility(section.html, index)); pushHistory(); }}>
                  {item.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#363636] bg-[#1F1F1F] text-[#969696] hover:bg-[#252525]" title="Remove button" onClick={() => { updateHtml(removeLinkItem(section.html, index)); pushHistory(); }}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {selectedElement?.kind === "text" && selectedTextItem && (
        <Section title="Text">
          <div className="space-y-2 rounded-md border border-[#363636] bg-[#1F1F1F] p-2">
            <Field label={selectedTextItem.label}>
              <input className={inputCls} value={selectedTextItem.text} aria-label={`${selectedTextItem.label} text`} onChange={(e) => updateHtml(updateTextItem(section.html, selectedElement.index ?? 0, e.target.value))} onBlur={pushHistory} />
            </Field>
          </div>
        </Section>
      )}

      {selectedElement?.kind === "image" && selectedImageItem ? (
        <Section title="Image">
          <div className="space-y-2 rounded-md border border-[#363636] bg-[#1F1F1F] p-2">
            <div className="text-xs font-semibold text-[#969696]">{selectedImageItem.label}</div>
            <Field label="ALT">
              <input className={inputCls} value={selectedImageItem.alt} placeholder="ALT" onChange={(e) => updateHtml(updateImageItem(section.html, selectedElement.index ?? 0, { alt: e.target.value }))} onBlur={pushHistory} />
            </Field>
          </div>
        </Section>
      ) : !isElementSelected && imageItems.length > 0 && (
        <Section title="Images">
          {imageItems.map((item, index) => (
            <div key={`${item.label}-${index}`} className="space-y-2 rounded-md border border-[#363636] bg-[#1F1F1F] p-2">
              <div className="text-xs font-semibold text-[#969696]">{item.label}</div>
              <Field label="ALT">
                <input className={inputCls} value={item.alt} placeholder="ALT" onChange={(e) => updateHtml(updateImageItem(section.html, index, { alt: e.target.value }))} onBlur={pushHistory} />
              </Field>
            </div>
          ))}
        </Section>
      )}

      {selectedElement && (selectedElement.kind === "link" || selectedElement.tag === "a" || selectedElement.tag === "button") ? (
        (() => {
          const idx = selectedElement.index ?? -1;
          const linkList = getLinkItems(section.html);
          const curHref = idx >= 0 && linkList[idx] ? linkList[idx].href : "";
          if (idx < 0) return null;
          return (
            <Section title="Link">
              <div className="space-y-2 rounded-md border border-[#363636] bg-[#1F1F1F] p-2">
                <Field label="Href">
                  <input className={inputCls} value={curHref} placeholder="#" onChange={(e) => updateHtml(updateLinkItem(section.html, idx, { href: e.target.value }))} onBlur={pushHistory} />
                </Field>
              </div>
            </Section>
          );
        })()
      ) : null}

    </div>
  );

  const styleTabContent = (
    <div className="space-y-4">
      {!isFooter && (
        <Section title={`Typography Â· ${typographyTargetLabel}`}>
          <Field label="Font family">
            {(() => {
              const families = [
                "ui-sans-serif, system-ui, sans-serif",
                "Georgia, serif",
                "ui-monospace, monospace",
                '"Inter", sans-serif',
                '"Poppins", sans-serif',
                '"Montserrat", sans-serif',
              ];
              const cur = selectedTypographyState.fontFamily || "";
              const opts = cur && cur.trim() ? (families.includes(cur) ? families : [cur, ...families]) : families;
              return (
                <select className={selectCls} value={cur} onChange={(e) => applyTypographyChange('fontFamily', e.target.value)} onBlur={pushHistory}>
                  {opts.map((f) => (<option key={f} value={f}>{f}</option>))}
                </select>
              );
            })()}
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Font size">
              {(() => {
                const sizes = ["12px", "13px", "14px", "15px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "40px", "48px"];
                const cur = selectedTypographyState.fontSize || "";
                const opts = cur && cur.trim() ? (sizes.includes(cur) ? sizes : [cur, ...sizes]) : sizes;
                return (
                  <select className={selectCls} value={cur} onChange={(e) => applyTypographyChange('fontSize', e.target.value)} onBlur={pushHistory}>
                    {opts.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                );
              })()}
            </Field>
            <Field label="Weight">
            {(() => {
              const current = selectedTypographyState.fontWeight || "";
              const standardWeights = ["400", "500", "600", "700"];
              const options = current && current.trim()
                ? (standardWeights.includes(current) ? ["", ...standardWeights] : [current, "", ...standardWeights])
                : ["", ...standardWeights];

              return (
                <select className={selectCls} value={current} onChange={(e) => applyTypographyChange('fontWeight', e.target.value)} onBlur={pushHistory}>
                  {options.map((weight) => (
                    <option key={weight} value={weight}>
                      {weight === "" ? "Default" : weight === "400" ? "Regular" : weight === "500" ? "Medium" : weight === "600" ? "Semibold" : weight === "700" ? "Bold" : weight}
                    </option>
                  ))}
                </select>
              );
            })()}
          </Field>
          </div>
          <Field label="Line height">
            {(() => {
              const current = selectedTypographyState.lineHeight || "";
              const standardLineHeights = ["1", "1.15", "1.25", "1.5", "1.75", "2"];
              const options = current && current.trim()
                ? (standardLineHeights.includes(current) ? ["", ...standardLineHeights] : [current, "", ...standardLineHeights])
                : ["", ...standardLineHeights];

              return (
                <select className={selectCls} value={current} onChange={(e) => applyTypographyChange('lineHeight', e.target.value)} onBlur={pushHistory}>
                  {options.map((lineHeight) => (
                    <option key={lineHeight} value={lineHeight}>
                      {lineHeight === "" ? "Line height" : lineHeight}
                    </option>
                  ))}
                </select>
              );
            })()}
          </Field>
          <Field label="Text color">
            <ColorInput value={selectedTypographyState.color || ""} onChange={(v) => applyTypographyChange('color', v)} onBlur={pushHistory} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Align">
              <select className={selectCls} value={selectedTypographyState.textAlign || ""} onChange={(e) => applyTypographyChange('textAlign', e.target.value)} onBlur={pushHistory}>
                <option value="">{selectedTypographyState.textAlign || "Default"}</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </Field>
            <Field label="Case">
              <select className={selectCls} value={selectedTypographyState.textTransform || ""} onChange={(e) => applyTypographyChange('textTransform', e.target.value)} onBlur={pushHistory}>
                <option value="">{selectedTypographyState.textTransform || "Default"}</option>
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </Field>
          </div>
          <Field label="Spacing">
            <input className={inputCls} value={selectedTypographyState.letterSpacing || ""} placeholder="0.5px" onChange={(e) => applyTypographyChange('letterSpacing', e.target.value)} onBlur={pushHistory} />
          </Field>
        </Section>
      )}

      {showSectionControls && (() => {
        const backgroundFields: PropertyFieldConfig[] = [
          colorField("Color", style["background-color"] ?? "", (v) => set("background-color", v), pushHistory),
          textField("Image URL", (style["background-image"] ?? "").replace(/^url\(|\)$/g, "").replace(/^['\"]|['\"]$/g, ""), (v) => set("background-image", v ? `url("${v}")` : ""), pushHistory, "https://â€¦"),
        ];
        return (
          <Section title="Background">
            {renderPropertyFieldConfigs(backgroundFields)}
          </Section>
        );
      })()}

      {showSectionControls && (() => {
        const animationFields: PropertyFieldConfig[] = [
          selectField("Type", section.animation?.type ?? "", [
            { label: "None", value: "" },
            { label: "Fade in", value: "fade-in" },
            { label: "Fade up", value: "fade-up" },
            { label: "Fade down", value: "fade-down" },
            { label: "Slide left", value: "slide-left" },
            { label: "Slide right", value: "slide-right" },
            { label: "Zoom in", value: "zoom-in" },
            { label: "Zoom out", value: "zoom-out" },
            { label: "Flip", value: "flip" },
            { label: "Bounce", value: "bounce" },
          ], (value) => updateSection(section.id, { animation: { ...(section.animation ?? {}), type: value } }), pushHistory),
          textField("Duration", String(section.animation?.duration ?? ""), (value) => updateSection(section.id, { animation: { ...(section.animation ?? {}), type: section.animation?.type ?? "fade-up", duration: Number(value) || undefined } }), pushHistory, "ms"),
          textField("Delay", String(section.animation?.delay ?? ""), (value) => updateSection(section.id, { animation: { ...(section.animation ?? {}), type: section.animation?.type ?? "fade-up", delay: Number(value) || undefined } }), pushHistory, "ms"),
        ];
        return (
          <Section title="Animation">
            {renderPropertyFieldConfigs(animationFields)}
          </Section>
        );
      })()}
    </div>
  );

  const advancedTabContent = (
    <div className="space-y-4">
      {showSectionControls && (
        <Section title="Advanced">
          <Field label="HTML ID">
            <input className={inputCls} value={section.id} readOnly />
          </Field>
          <Field label="Visibility">
            <div className="space-y-2">
              <PropertyToggle label="Hide on mobile" checked={Boolean((section as any).hiddenOnMobile)} onChange={(value) => updateSection(section.id, { hiddenOnMobile: value } as any)} onBlur={pushHistory} />
              <PropertyToggle label="Hide on tablet" checked={Boolean((section as any).hiddenOnTablet)} onChange={(value) => updateSection(section.id, { hiddenOnTablet: value } as any)} onBlur={pushHistory} />
              <PropertyToggle label="Hide on desktop" checked={Boolean((section as any).hiddenOnDesktop)} onChange={(value) => updateSection(section.id, { hiddenOnDesktop: value } as any)} onBlur={pushHistory} />
              <PropertyToggle label="Sticky" checked={Boolean((section as any).sticky)} onChange={(value) => updateSection(section.id, { sticky: value } as any)} onBlur={pushHistory} />
            </div>
          </Field>
        </Section>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-transparent">
      <div className="flex-1 min-h-0 overflow-hidden text-sm">
        <TabbedPropertyPanel
          title="Section"
          subtitle={section.name}
          badgeLabel={widgetInstance?.type ? widgetInstance.type : "Section"}
          onClose={clearSelection}
          content={contentTabContent}
          style={styleTabContent}
          advanced={advancedTabContent}
        />
      </div>
    </div>
  );
}

function getFooterPhone(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => n.getAttribute && n.getAttribute('data-wto-phone') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setFooterPhone(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-phone') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-phone', 'true');
    el.setAttribute('class', 'text-sm text-gray-300');
    footer.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getFooterEmail(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => n.getAttribute && n.getAttribute('data-wto-email') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setFooterEmail(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-email') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-email', 'true');
    el.setAttribute('class', 'text-sm text-gray-300');
    footer.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getFooterAddress(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => n.getAttribute && n.getAttribute('data-wto-address') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setFooterAddress(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-address') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-address', 'true');
    el.setAttribute('class', 'text-sm text-gray-300');
    footer.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getFooterSocialLink(html: string, social: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  return el ? (el.getAttribute('href') || '') : '';
}

function setFooterSocialLink(html: string, social: string, href: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('a');
    el.setAttribute('data-wto-social', social);
    el.setAttribute('class', 'inline-block text-gray-300 hover:text-white mr-3');
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
    el.textContent = social.charAt(0).toUpperCase() + social.slice(1);
    footer.appendChild(el);
  }
  if (href) el.setAttribute('href', href);
  else el.removeAttribute('href');
  return serialize(doc);
}

function getFooterSocialVisibility(html: string, social: string) {
  const doc = parseHtml(html);
  if (!doc) return true;
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  if (!el) return true;
  const style = el.getAttribute('style') || '';
  return !style.includes('display:none') && !style.includes('display: none');
}

function setFooterSocialVisibility(html: string, social: string, visible: boolean) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  if (!el) return html;
  const style = (el.getAttribute('style') || '').replace(/display\s*:\s*none\s*;?/gi, '').trim();
  const nextStyle = visible ? style : (style ? `${style}; display:none` : 'display:none');
  if (nextStyle) el.setAttribute('style', nextStyle);
  else el.removeAttribute('style');
  return serialize(doc);
}

function getTopBarRoot(doc: Document) {
  return doc.body.querySelector('section[data-wto-topbar]') as HTMLElement | null;
}

function getTopBarPhone(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-phone') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setTopBarPhone(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-phone') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-phone', 'true');
    root.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getTopBarEmail(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-email') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setTopBarEmail(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-email') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-email', 'true');
    root.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getTopBarAddress(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-address') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setTopBarAddress(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-address') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-address', 'true');
    root.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getTopBarHours(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-hours') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setTopBarHours(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-hours') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-hours', 'true');
    root.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getTopBarNote(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-note') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setTopBarNote(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-note') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('data-wto-note', 'true');
    root.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getTopBarButtonText(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-topbar-button') === 'true') as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setTopBarButtonText(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-topbar-button') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('a');
    el.setAttribute('data-wto-topbar-button', 'true');
    el.setAttribute('href', '#');
    root.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getTopBarButtonHref(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-topbar-button') === 'true') as HTMLElement | undefined;
  return el ? (el.getAttribute('href') || '') : '';
}

function setTopBarButtonHref(html: string, href: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-topbar-button') === 'true') as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('a');
    el.setAttribute('data-wto-topbar-button', 'true');
    root.appendChild(el);
  }
  if (href) el.setAttribute('href', href);
  else el.removeAttribute('href');
  return serialize(doc);
}

function getTopBarSocialLink(html: string, social: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const root = getTopBarRoot(doc);
  if (!root) return '';
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  return el ? (el.getAttribute('href') || '') : '';
}

function setTopBarSocialLink(html: string, social: string, href: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  let el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('a');
    el.setAttribute('data-wto-social', social);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
    root.appendChild(el);
  }
  if (href) el.setAttribute('href', href);
  else el.removeAttribute('href');
  return serialize(doc);
}

function getTopBarSocialVisibility(html: string, social: string) {
  const doc = parseHtml(html);
  if (!doc) return true;
  const root = getTopBarRoot(doc);
  if (!root) return true;
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  if (!el) return true;
  const style = el.getAttribute('style') || '';
  return !style.includes('display:none') && !style.includes('display: none');
}

function setTopBarSocialVisibility(html: string, social: string, visible: boolean) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const root = getTopBarRoot(doc);
  if (!root) return html;
  const el = Array.from(root.querySelectorAll('*')).find((n) => n.getAttribute && n.getAttribute('data-wto-social') === social) as HTMLElement | undefined;
  if (!el) return html;
  const style = (el.getAttribute('style') || '').replace(/display\s*:\s*none\s*;?/gi, '').trim();
  const nextStyle = visible ? style : (style ? `${style}; display:none` : 'display:none');
  if (nextStyle) el.setAttribute('style', nextStyle);
  else el.removeAttribute('style');
  return serialize(doc);
}


// --- Helpers and DOM manipulation functions ---

const textSelector = "h1,h2,h3,h4,h5,h6,p,a,button,summary,li,span,strong,em,small,blockquote,cite,div,label";
// Menu links can appear in a variety of structures (ul>li>a or inside elements marked
// with data-wto-nav-menu). Include those so menu items are detected reliably.
const menuSelector = "nav ul li a, ul li a, [data-wto-nav-menu] a, nav [data-wto-nav-menu] a";

function parseHtml(html: string) {
  if (typeof DOMParser === "undefined") return null;
  return new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
}

function serialize(doc: Document) {
  return doc.body.innerHTML;
}

function ensureSummaryChevron(el: HTMLElement) {
  if (el.tagName !== 'SUMMARY') return;
  if (el.querySelector('.wto-chevron')) return;
  const span = document.createElement('span');
  span.className = 'wto-chevron';
  span.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  el.appendChild(span);
}

function isAccordionSection(html: string) {
  const doc = parseHtml(html);
  if (!doc) return false;
  return !!doc.body.querySelector('details');
}

function contrastColorForHex(hex: string) {
  const h = String(hex || "").trim().replace(/^#/, "");
  let r = 0,
    g = 0,
    b = 0;
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length >= 6) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  }
  const srgb = [r, g, b].map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return lum > 0.5 ? "#000000" : "#ffffff";
}

function setStyleColor(styleStr: string | null, color: string) {
  const s = styleStr || "";
  if (!color) {
    return s.replace(/(^|;)\s*color\s*:\s*[^;]+;?/i, "").trim();
  }
  const important = `${color} !important`;
  if (/color\s*:/i.test(s)) {
    return s.replace(/color\s*:\s*[^;]+;?/i, `color:${important};`);
  }
  return (s && !s.trim().endsWith(";") ? s + ";" : s) + `color:${important};`;
}

function setNavForeground(html: string, color: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector("nav") ?? doc.body.querySelector("[data-wto-nav]");
  if (!nav) return html;
  const navStyle = nav.getAttribute("style") ?? "";
  // keep nav-level color inline (non-important) for non-anchor text
  nav.setAttribute("style", setStyleColor(navStyle, color));

  if (!nav.hasAttribute('data-wto-nav')) {
    nav.setAttribute('data-wto-nav', 'true');
  }

  // Inject or update a scoped <style data-wto-nav-style> inside the nav
  const existing = nav.querySelector('style[data-wto-nav-style]');
  const css = color ? `[data-wto-nav] a, [data-wto-nav] button { color: ${color} !important; }` : "";
  if (existing) {
    if (css) existing.textContent = css;
    else existing.remove();
  } else if (css) {
    const styleEl = doc.createElement('style');
    styleEl.setAttribute('data-wto-nav-style', 'true');
    styleEl.textContent = css;
    nav.insertBefore(styleEl, nav.firstChild);
  }

  return serialize(doc);
}

function getNavForceFlag(html: string) {
  const doc = parseHtml(html);
  if (!doc) return true;
  const nav = doc.body.querySelector("nav") ?? doc.body.querySelector("[data-wto-nav]");
  if (!nav) return true;
  return nav.getAttribute('data-wto-force-menu') !== '0';
}

function setNavForce(html: string, enabled: boolean, color?: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector("nav") ?? doc.body.querySelector("[data-wto-nav]");
  if (!nav) return html;
  if (!nav.hasAttribute('data-wto-nav')) {
    nav.setAttribute('data-wto-nav', 'true');
  }
  if (enabled) nav.setAttribute('data-wto-force-menu', '1');
  else nav.removeAttribute('data-wto-force-menu');
  // Apply or remove injected style depending on enabled
  const existing = nav.querySelector('style[data-wto-nav-style]');
  const css = enabled && color ? `[data-wto-nav] a, [data-wto-nav] button { color: ${color} !important; }` : enabled && !color ? existing?.textContent || '' : '';
  if (!enabled) {
    if (existing) existing.remove();
  } else if (color) {
    if (existing) existing.textContent = css;
    else {
      const styleEl = doc.createElement('style');
      styleEl.setAttribute('data-wto-nav-style', 'true');
      styleEl.textContent = css;
      nav.insertBefore(styleEl, nav.firstChild);
    }
  }
  return serialize(doc);
}

// ------------------------ Brand helpers ------------------------

function findBrandElement(doc: Document) {
  const header = doc.body.querySelector('header');
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  const anchors = header ? Array.from(header.querySelectorAll('a')) : [];
  if (nav) anchors.push(...Array.from(nav.querySelectorAll('a')));
  const brandAnchor =
    anchors.find((a) => !a.closest('ul') && !a.closest('li') && !a.closest('[data-wto-nav-menu]') && ((a.getAttribute('href') || '').trim() === '#top' || (header && a.closest('header') && !a.closest('nav')))) ||
    anchors.find((a) => !a.closest('ul') && !a.closest('li') && !a.closest('[data-wto-nav-menu]')) ||
    null;
  if (brandAnchor) return brandAnchor as HTMLElement;
  const fallback = doc.body.querySelector('header') || doc.body.querySelector('nav') || doc.body.querySelector('[data-wto-nav]') || doc.body.querySelector('a') || doc.body.querySelector('div') || doc.body;
  return fallback as HTMLElement;
}

function findBrandAnchor(html: string) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const brand = findBrandElement(doc);
  if (!brand) return null;
  const img = brand.querySelector('img');
  const placeholder = brand.querySelector('[data-wto-brand-placeholder]');
  const text = (brand.textContent ?? '').trim();
  const width = img?.getAttribute('width') ?? img?.style.width ?? '';
  const height = img?.getAttribute('height') ?? img?.style.height ?? '';
  return { src: img?.getAttribute('src') ?? '', text, width, height, mode: img || placeholder ? 'logo' : text ? 'text' : 'hidden', hasPlaceholder: !!placeholder };
}

function setBrandMode(html: string, mode: 'logo' | 'text' | 'hidden', text?: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const brand = findBrandElement(doc);
  if (!brand) return html;
  if (mode === 'hidden') {
    brand.setAttribute('style', (brand.getAttribute('style') || '') + ';display:none');
    brand.textContent = '';
    const img = brand.querySelector('img'); if (img) img.remove();
    const placeholder = brand.querySelector('[data-wto-brand-placeholder]'); if (placeholder) placeholder.remove();
  } else if (mode === 'text') {
    brand.removeAttribute('style');
    const img = brand.querySelector('img'); if (img) img.remove();
    const placeholder = brand.querySelector('[data-wto-brand-placeholder]'); if (placeholder) placeholder.remove();
    brand.textContent = text || 'Brand';
  } else {
    brand.removeAttribute('style');
    const img = brand.querySelector('img'); if (img) img.remove();
    const placeholder = brand.querySelector('[data-wto-brand-placeholder]'); if (placeholder) placeholder.remove();
    brand.textContent = '';
    const existingImg = brand.querySelector('img');
    if (existingImg) {
      existingImg.setAttribute('alt', text || 'logo');
      existingImg.setAttribute('style', 'height:40px;width:auto;object-fit:contain;');
    } else {
      const placeholderEl = doc.createElement('span');
      placeholderEl.setAttribute('data-wto-brand-placeholder', '1');
      placeholderEl.setAttribute('style', 'display:inline-flex;align-items:center;justify-content:center;height:40px;width:40px;border-radius:999px;background:linear-gradient(135deg,#0f172a,#3b82f6);color:white;');
      placeholderEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M7 17V8"/><path d="M17 17V5"/><path d="M12 17V11"/></svg>';
      brand.appendChild(placeholderEl);
    }
  }
  return serialize(doc);
}

function setBrandText(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const brand = findBrandElement(doc);
  if (!brand) return html;
  const img = brand.querySelector('img');
  if (img) {
    img.setAttribute('alt', text);
  } else {
    brand.textContent = text;
  }
  return serialize(doc);
}

function setBrandImage(html: string, path: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const brand = findBrandElement(doc);
  if (!brand) return html;
  const placeholder = brand.querySelector('[data-wto-brand-placeholder]'); if (placeholder) placeholder.remove();
  if (brand.tagName === 'A' || brand.tagName === 'BUTTON') {
    brand.textContent = '';
  } else {
    brand.textContent = '';
  }
  let img = brand.querySelector('img');
  if (!img) {
    img = doc.createElement('img');
    img.setAttribute('alt', 'logo');
    img.setAttribute('style', 'height:40px;width:auto;object-fit:contain;');
    brand.appendChild(img);
  }
  img.setAttribute('src', path);
  img.setAttribute('style', 'height:40px;width:auto;object-fit:contain;');
  return serialize(doc);
}

function setBrandSize(html: string, width?: string, height?: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const brand = findBrandElement(doc);
  if (!brand) return html;
  const img = brand.querySelector('img');
  if (!img) return html;
  if (width) img.setAttribute('width', width);
  else img.removeAttribute('width');
  if (height) img.setAttribute('height', height);
  else img.removeAttribute('height');
  // prefer inline style for non-numeric sizes
  const style = img.getAttribute('style') || '';
  const newStyle = style.replace(/(width|height)\s*:\s*[^;]+;?/g, '').trim();
  img.setAttribute('style', `${newStyle}${width ? `;width:${width}` : ''}${height ? `;height:${height}` : ''}`);
  return serialize(doc);
}

function findHeaderCTAs(html: string) {
  const doc = parseHtml(html);
  if (!doc) return [];
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return [];
  const anchors = Array.from(nav.querySelectorAll('a')).filter((a) => !a.closest('ul') && !a.closest('li'));
  return anchors.slice(1).map((a) => {
    const style = a.getAttribute('style') ?? '';
    const hidden = a.getAttribute('data-wto-hidden') === '1' || /display\s*:\s*none/i.test(style);
    return {
      text: (a.textContent ?? '').trim(),
      href: a.getAttribute('href') ?? '#',
      hidden,
    };
  });
}

function setHeaderCTAHref(html: string, href: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return html;
  const anchors = Array.from(nav.querySelectorAll('a')).filter((a) => !a.closest('ul') && !a.closest('li'));
  const cta = anchors[1];
  if (!cta) return html;
  cta.setAttribute('href', href || '#');
  if (text !== undefined) cta.textContent = text;
  return serialize(doc);
}

function toggleHeaderCTAVisibility(html: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return html;
  const anchors = Array.from(nav.querySelectorAll('a')).filter((a) => !a.closest('ul') && !a.closest('li'));
  const cta = anchors[1];
  if (!cta) return html;
  const hidden = cta.getAttribute('data-wto-hidden') === '1';
  if (hidden) {
    cta.removeAttribute('data-wto-hidden');
    cta.style.display = '';
  } else {
    cta.setAttribute('data-wto-hidden', '1');
    cta.style.display = 'none';
  }
  return serialize(doc);
}

function isEditableTextElement(el: HTMLElement) {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (["script", "style", "svg", "img", "video", "audio", "canvas", "iframe", "input", "textarea", "select"].includes(tag)) return false;
  if (el.closest("[data-wto-toolbar], [data-wto-ignore-edit], [data-wto-nav-btn]")) return false;
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!text) return false;
  if (["a", "button", "summary", "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "span", "strong", "em", "b", "i", "small", "blockquote", "cite", "label"].includes(tag)) return true;
  if (tag === "div") {
    const hasInteractiveChild = !!el.querySelector("a,button,input,select,textarea");
    return !hasInteractiveChild;
  }
  return false;
}

function getImageItems(html: string): { label: string; src: string; alt: string; width: string; height: string; objectFit: string; borderRadius: string; opacity: string }[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLImageElement>("img"))
    .filter((img) => !img.closest("[data-wto-nav], [data-wto-nav-menu], [data-wto-toolbar], [data-wto-ignore-edit]"))
    .map((img, index) => {
      const styleMap = readStyleMap(img.getAttribute("style") ?? "");
      return {
        label: `Image ${index + 1}`,
        src: img.getAttribute("src") ?? "",
        alt: img.getAttribute("alt") ?? "",
        width: styleMap["width"] || "",
        height: styleMap["height"] || "",
        objectFit: styleMap["object-fit"] || "",
        borderRadius: styleMap["border-radius"] || "",
        opacity: styleMap["opacity"] || "",
      };
    });
}

function updateImageItem(html: string, index: number, patch: Partial<{ src: string; alt: string; width: string; height: string; objectFit: string; borderRadius: string; opacity: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLImageElement>("img")).filter((img) => !img.closest("[data-wto-nav], [data-wto-nav-menu], [data-wto-toolbar], [data-wto-ignore-edit]"));
  const img = items[index];
  if (!img) return html;
  if (patch.src !== undefined) img.setAttribute("src", patch.src || "");
  if (patch.alt !== undefined) img.setAttribute("alt", patch.alt || "");
  const styleMap = readStyleMap(img.getAttribute("style") ?? "");
  if (patch.width !== undefined) (patch.width ? (styleMap["width"] = patch.width) : delete styleMap["width"]);
  if (patch.height !== undefined) (patch.height ? (styleMap["height"] = patch.height) : delete styleMap["height"]);
  if (patch.objectFit !== undefined) (patch.objectFit ? (styleMap["object-fit"] = patch.objectFit) : delete styleMap["object-fit"]);
  if (patch.borderRadius !== undefined) (patch.borderRadius ? (styleMap["border-radius"] = patch.borderRadius) : delete styleMap["border-radius"]);
  if (patch.opacity !== undefined) (patch.opacity ? (styleMap["opacity"] = patch.opacity) : delete styleMap["opacity"]);
  img.setAttribute("style", serializeStyleMap(styleMap));
  return serialize(doc);
}

function getEditableTextItems(html: string) {
  const doc = parseHtml(html);
  if (!doc) return [];
  const elements = Array.from(doc.body.querySelectorAll<HTMLElement>(textSelector)).filter(isEditableTextElement);
  return elements
    .filter((el) => !el.querySelector(textSelector) || !Array.from(el.querySelectorAll<HTMLElement>(textSelector)).some((child) => isEditableTextElement(child)))
    .map((el) => {
      const styleMap = readStyleMap(el.getAttribute("style") ?? "");
      return {
        tag: el.tagName.toLowerCase(),
        label: labelForElement(el),
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
        fontSize: styleMap["font-size"] || el.style.fontSize || "",
        fontFamily: styleMap["font-family"] || el.style.fontFamily || "",
        color: styleMap["color"] || el.style.color || "",
        fontWeight: styleMap["font-weight"] || el.style.fontWeight || "",
        lineHeight: styleMap["line-height"] || el.style.lineHeight || "",
        textAlign: styleMap["text-align"] || el.style.textAlign || "",
        letterSpacing: styleMap["letter-spacing"] || el.style.letterSpacing || "",
        textTransform: styleMap["text-transform"] || el.style.textTransform || "",
      };
    })
    .filter((item) => item.text.length > 0);
}

function isTextItemInRepeater(html: string, textIndex: number) {
  const doc = parseHtml(html);
  if (!doc) return false;
  const info = findRepeater(doc);
  if (!info) return false;
  const container = nodeAtPath(doc.body, info.path);
  if (!container) return false;
  const elements = Array.from(doc.body.querySelectorAll<HTMLElement>(textSelector)).filter(isEditableTextElement);
  const el = elements[textIndex];
  if (!el) return false;
  return container.contains(el);
}

function updateTextItem(html: string, index: number, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>(textSelector)).filter(isEditableTextElement);
  const el = items[index];
  if (!el) return serialize(doc);

  const textNodes = Array.from(el.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE) as Text[];
  if (textNodes.length > 0) {
    textNodes[0].textContent = text;
    for (let i = 1; i < textNodes.length; i++) {
      textNodes[i].remove();
    }
  } else {
    const textNode = doc.createTextNode(text);
    const firstNonText = Array.from(el.childNodes).find((node) => node.nodeType !== Node.TEXT_NODE);
    if (firstNonText) el.insertBefore(textNode, firstNonText);
    else el.appendChild(textNode);
  }

  ensureSummaryChevron(el);
  return serialize(doc);
}

function setTextItemStyle(html: string, index: number, patch: Partial<{ fontSize: string; fontFamily: string; color: string; fontWeight: string; lineHeight: string; textAlign: string; letterSpacing: string; textTransform: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>(textSelector)).filter(isEditableTextElement);
  const el = items[index];
  if (!el) return html;
  const styleMap = readStyleMap(el.getAttribute('style') ?? '');
  if (patch.fontSize !== undefined) (patch.fontSize ? (styleMap['font-size'] = patch.fontSize) : delete styleMap['font-size']);
  if (patch.fontFamily !== undefined) (patch.fontFamily ? (styleMap['font-family'] = patch.fontFamily) : delete styleMap['font-family']);
  if (patch.color !== undefined) (patch.color ? (styleMap['color'] = patch.color) : delete styleMap['color']);
  if (patch.fontWeight !== undefined) (patch.fontWeight ? (styleMap['font-weight'] = patch.fontWeight) : delete styleMap['font-weight']);
  if (patch.lineHeight !== undefined) (patch.lineHeight ? (styleMap['line-height'] = patch.lineHeight) : delete styleMap['line-height']);
  if (patch.textAlign !== undefined) (patch.textAlign ? (styleMap['text-align'] = patch.textAlign) : delete styleMap['text-align']);
  if (patch.letterSpacing !== undefined) (patch.letterSpacing ? (styleMap['letter-spacing'] = patch.letterSpacing) : delete styleMap['letter-spacing']);
  if (patch.textTransform !== undefined) (patch.textTransform ? (styleMap['text-transform'] = patch.textTransform) : delete styleMap['text-transform']);
  el.setAttribute('style', serializeStyleMap(styleMap));
  return serialize(doc);
}

function setTextItemTag(html: string, index: number, tag: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>(textSelector)).filter(isEditableTextElement);
  const el = items[index];
  if (!el) return html;
  const allowed = ['h1','h2','h3','h4','h5','h6','p','span','div'];
  const newTag = allowed.includes(tag) ? tag : 'p';
  const newEl = doc.createElement(newTag);
  // copy attributes
  Array.from(el.attributes).forEach((a) => newEl.setAttribute(a.name, a.value));
  // move children
  while (el.firstChild) newEl.appendChild(el.firstChild);
  el.replaceWith(newEl);
  return serialize(doc);
}

function getContainerStyleState(html: string, index: number) {
  const el = getContainerElement(html, index);
  if (!el) return null;
  const styleMap = readStyleMap(el.getAttribute('style') ?? '');
  return {
    backgroundColor: styleMap['background-color'] || '',
    padding: styleMap['padding'] || '',
    margin: styleMap['margin'] || '',
    borderRadius: styleMap['border-radius'] || '',
    width: styleMap['width'] || '',
    height: styleMap['height'] || '',
  };
}

function getElementByWtoIndex(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const elements = Array.from(doc.body.querySelectorAll('*'));
  return elements[index] ?? null;
}

function isSelectableContainer(el: Element | null) {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return !['html', 'body', 'script', 'style', 'svg', 'img', 'video', 'audio', 'canvas', 'iframe', 'input', 'textarea', 'select', 'a', 'button'].includes(tag);
}

function getContainerElement(html: string, index: number) {
  const el = getElementByWtoIndex(html, index);
  if (!el) return null;
  if (isSelectableContainer(el)) return el as HTMLElement;
  return el.closest('div,section,article,aside,main,header,footer,ul,ol,li,form,figure,figcaption,table,tr,td,th') as HTMLElement | null;
}

function setContainerStyle(html: string, index: number, patch: Partial<{ backgroundColor: string; padding: string; margin: string; borderRadius: string; width: string; height: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const el = getContainerElement(html, index);
  if (!el) return html;
  const styleMap = readStyleMap(el.getAttribute('style') ?? '');
  if (patch.backgroundColor !== undefined) (patch.backgroundColor ? (styleMap['background-color'] = patch.backgroundColor) : delete styleMap['background-color']);
  if (patch.padding !== undefined) (patch.padding ? (styleMap['padding'] = patch.padding) : delete styleMap['padding']);
  if (patch.margin !== undefined) (patch.margin ? (styleMap['margin'] = patch.margin) : delete styleMap['margin']);
  if (patch.borderRadius !== undefined) (patch.borderRadius ? (styleMap['border-radius'] = patch.borderRadius) : delete styleMap['border-radius']);
  if (patch.width !== undefined) (patch.width ? (styleMap['width'] = patch.width) : delete styleMap['width']);
  if (patch.height !== undefined) (patch.height ? (styleMap['height'] = patch.height) : delete styleMap['height']);
  el.setAttribute('style', serializeStyleMap(styleMap));
  return serialize(doc);
}

function readStyleMap(styleText: string) {
  const map: Record<string, string> = {};
  styleText.split(';').forEach((part) => {
    const [rawKey, ...rawValue] = part.split(':');
    if (!rawKey) return;
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(':').trim();
    if (key && value) map[key] = value;
  });
  return map;
}

function serializeStyleMap(styleMap: Record<string, string>) {
  return Object.entries(styleMap)
    .map(([key, value]) => `${key}:${value}`)
    .join('; ');
}

function getMenuItems(html: string): { text: string; href: string; hidden: boolean }[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector)).map((el) => {
    const style = el.getAttribute('style') ?? '';
    const hidden = el.getAttribute('data-wto-hidden') === '1' || /display\s*:\s*none/i.test(style);
    return {
      text: (el.textContent ?? "").trim(),
      href: el.getAttribute("href") ?? "#",
      hidden,
    };
  });
}

function updateMenuItem(html: string, index: number, patch: Partial<{ text: string; href: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const links = Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector));
  const link = links[index];
  if (link) {
    if (patch.text !== undefined) link.textContent = patch.text;
    if (patch.href !== undefined) link.setAttribute("href", patch.href || "#");
  }
  return serialize(doc);
}

function toggleMenuItemVisibility(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const links = Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector));
  const link = links[index];
  if (!link) return html;
  const hidden = link.getAttribute('data-wto-hidden') === '1';
  if (hidden) {
    link.removeAttribute('data-wto-hidden');
    link.style.display = '';
  } else {
    link.setAttribute('data-wto-hidden', '1');
    link.style.display = 'none';
  }
  return serialize(doc);
}

function addMenuItem(html: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const list = doc.body.querySelector("nav ul") ?? doc.body.querySelector("ul");
  const sample = list?.querySelector("li a");
  const linkClass = sample?.getAttribute("class") ?? "hover:text-indigo-600";
  const li = doc.createElement("li");
  const a = doc.createElement("a");
  a.href = "#";
  a.className = linkClass;
  a.textContent = "New Menu";
  li.appendChild(a);
  if (list) list.appendChild(li);
  else doc.body.appendChild(li);
  return serialize(doc);
}

function removeMenuItem(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const links = Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector));
  const link = links[index];
  const li = link?.closest("li");
  if (li) li.remove();
  return serialize(doc);
}

function labelForElement(el: HTMLElement) {
  const tag = el.tagName.toLowerCase();
  if (/h[1-6]/.test(tag)) return tag.toUpperCase();
  if (tag === "a") return "Link";
  if (tag === "button") return "Button";
  return "Text";
}

// ------------------------ Links & Buttons ------------------------

function isContentLinkOrButton(el: HTMLElement) {
  return true;
}

function getLinkItems(html: string): { text: string; href: string; hidden: boolean }[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLElement>("a, button"))
    .map((el) => {
      const style = el.getAttribute("style") ?? "";
      const hidden = el.getAttribute("data-wto-hidden") === "1" || /display\s*:\s*none/i.test(style);
      return {
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
        href:
          el.tagName === "A"
            ? el.getAttribute("href") ?? "#"
            : el.getAttribute("data-href") ?? "",
        hidden,
      };
    });
}

function updateLinkItem(html: string, index: number, patch: Partial<{ text: string; href: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return html;
  if (patch.text !== undefined) el.textContent = patch.text;
  if (patch.href !== undefined) {
    if (el.tagName === "A") el.setAttribute("href", patch.href || "#");
    else el.setAttribute("data-href", patch.href);
  }
  return serialize(doc);
}

function getLinkStyleState(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return null;
  const styleMap = readStyleMap(el.getAttribute('style') ?? '');
  return {
    fontSize: styleMap['font-size'] || el.style.fontSize || '',
    fontFamily: styleMap['font-family'] || el.style.fontFamily || '',
    color: styleMap['color'] || el.style.color || '',
    fontWeight: styleMap['font-weight'] || el.style.fontWeight || '',
    lineHeight: styleMap['line-height'] || el.style.lineHeight || '',
    textAlign: styleMap['text-align'] || el.style.textAlign || '',
    letterSpacing: styleMap['letter-spacing'] || el.style.letterSpacing || '',
    textTransform: styleMap['text-transform'] || el.style.textTransform || '',
  };
}

function getContainerTypographyState(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const el = getContainerElement(html, index);
  if (!el) return null;
  const styleMap = readStyleMap(el.getAttribute('style') ?? '');
  return {
    fontSize: styleMap['font-size'] || el.style.fontSize || '',
    fontFamily: styleMap['font-family'] || el.style.fontFamily || '',
    color: styleMap['color'] || el.style.color || '',
    fontWeight: styleMap['font-weight'] || el.style.fontWeight || '',
    lineHeight: styleMap['line-height'] || el.style.lineHeight || '',
    textAlign: styleMap['text-align'] || el.style.textAlign || '',
    letterSpacing: styleMap['letter-spacing'] || el.style.letterSpacing || '',
    textTransform: styleMap['text-transform'] || el.style.textTransform || '',
  };
}

function setLinkStyle(html: string, index: number, patch: Partial<{ fontSize: string; fontFamily: string; color: string; fontWeight: string; lineHeight: string; textAlign: string; letterSpacing: string; textTransform: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return html;
  const styleMap = readStyleMap(el.getAttribute('style') ?? '');
  if (patch.fontSize !== undefined) (patch.fontSize ? (styleMap['font-size'] = patch.fontSize) : delete styleMap['font-size']);
  if (patch.fontFamily !== undefined) (patch.fontFamily ? (styleMap['font-family'] = patch.fontFamily) : delete styleMap['font-family']);
  if (patch.color !== undefined) (patch.color ? (styleMap['color'] = patch.color) : delete styleMap['color']);
  if (patch.fontWeight !== undefined) (patch.fontWeight ? (styleMap['font-weight'] = patch.fontWeight) : delete styleMap['font-weight']);
  if (patch.lineHeight !== undefined) (patch.lineHeight ? (styleMap['line-height'] = patch.lineHeight) : delete styleMap['line-height']);
  if (patch.textAlign !== undefined) (patch.textAlign ? (styleMap['text-align'] = patch.textAlign) : delete styleMap['text-align']);
  if (patch.letterSpacing !== undefined) (patch.letterSpacing ? (styleMap['letter-spacing'] = patch.letterSpacing) : delete styleMap['letter-spacing']);
  if (patch.textTransform !== undefined) (patch.textTransform ? (styleMap['text-transform'] = patch.textTransform) : delete styleMap['text-transform']);
  el.setAttribute('style', serializeStyleMap(styleMap));
  return serialize(doc);
}

function setContainerTypography(html: string, index: number, patch: Partial<{ fontSize: string; fontFamily: string; color: string; fontWeight: string; lineHeight: string; textAlign: string; letterSpacing: string; textTransform: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const el = getContainerElement(html, index);
  if (!el) return html;
  const styleMap = readStyleMap(el.getAttribute('style') ?? '');
  if (patch.fontSize !== undefined) (patch.fontSize ? (styleMap['font-size'] = patch.fontSize) : delete styleMap['font-size']);
  if (patch.fontFamily !== undefined) (patch.fontFamily ? (styleMap['font-family'] = patch.fontFamily) : delete styleMap['font-family']);
  if (patch.color !== undefined) (patch.color ? (styleMap['color'] = patch.color) : delete styleMap['color']);
  if (patch.fontWeight !== undefined) (patch.fontWeight ? (styleMap['font-weight'] = patch.fontWeight) : delete styleMap['font-weight']);
  if (patch.lineHeight !== undefined) (patch.lineHeight ? (styleMap['line-height'] = patch.lineHeight) : delete styleMap['line-height']);
  if (patch.textAlign !== undefined) (patch.textAlign ? (styleMap['text-align'] = patch.textAlign) : delete styleMap['text-align']);
  if (patch.letterSpacing !== undefined) (patch.letterSpacing ? (styleMap['letter-spacing'] = patch.letterSpacing) : delete styleMap['letter-spacing']);
  if (patch.textTransform !== undefined) (patch.textTransform ? (styleMap['text-transform'] = patch.textTransform) : delete styleMap['text-transform']);
  el.setAttribute('style', serializeStyleMap(styleMap));
  return serialize(doc);
}

function removeLinkItem(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return html;
  el.remove();
  return serialize(doc);
}

function toggleLinkVisibility(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return html;
  const current = el.getAttribute("data-wto-hidden") === "1";
  if (current) {
    el.removeAttribute("data-wto-hidden");
    el.style.display = "";
  } else {
    el.setAttribute("data-wto-hidden", "1");
    el.style.display = "none";
  }
  return serialize(doc);
}

// ------------------------ Repeater ------------------------

type RepeaterItem = {
  image: string;
  title: string;
  body: string;
  href: string;
  hasTitle: boolean;
  hasBody: boolean;
  hasLink: boolean;
};

function pathTo(el: Element, root: Element): number[] {
  const p: number[] = [];
  let cur: Element | null = el;
  while (cur && cur !== root) {
    const parentEl: Element | null = cur.parentElement;
    if (!parentEl) break;
    p.unshift(Array.from(parentEl.children).indexOf(cur));
    cur = parentEl;
  }
  return p;
}

function nodeAtPath(root: Element, path: number[]): Element | null {
  let cur: Element | null = root;
  for (const i of path) {
    if (!cur) return null;
    cur = cur.children[i] ?? null;
  }
  return cur;
}

function findRepeater(doc: Document): { container: Element; path: number[] } | null {
  const all = Array.from(doc.body.querySelectorAll("*"));
  let best: { el: Element; count: number; score: number } | null = null;
  for (const el of all) {
    const kids = Array.from(el.children);
    if (kids.length < 2) continue;
    const firstTag = kids[0].tagName;
    const same = kids.every((k) => k.tagName === firstTag);
    if (!same) continue;
    if (el.tagName === "UL" || el.tagName === "OL") continue;
    const cls = el.getAttribute("class") ?? "";
    let score = kids.length;
    if (/grid|columns-|space-y|flex/.test(cls)) score += 10;
    if (firstTag === "DETAILS" || firstTag === "ARTICLE") score += 20;
    if (!best || score > best.score) best = { el, count: kids.length, score };
  }
  if (!best) return null;
  return { container: best.el, path: pathTo(best.el, doc.body) };
}

function describeItem(item: Element): RepeaterItem {
  const img = item.querySelector("img");
  const box = !img
    ? (Array.from(item.querySelectorAll<HTMLElement>("*")).find((e) =>
        /bg-gradient/.test(e.className),
      ) ?? null)
    : null;
  const heading = item.querySelector("h1,h2,h3,h4,h5,h6,summary,strong,.font-bold");
  const bodyEl = item.querySelector("p");
  const link = item.querySelector("a");
  return {
    image: img?.getAttribute("src") ?? "",
    title: (heading?.textContent ?? "").replace(/\s+/g, " ").trim(),
    body: (bodyEl?.textContent ?? "").replace(/\s+/g, " ").trim(),
    href: link?.getAttribute("href") ?? "",
    hasTitle: !!heading,
    hasBody: !!bodyEl,
    hasLink: !!link,
  };
}

function getRepeater(html: string) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const info = findRepeater(doc);
  if (!info) return null;
  const items = Array.from(info.container.children).map((c) => describeItem(c));
  return { path: info.path, items };
}

function withRepeater(
  html: string,
  fn: (doc: Document, container: Element) => void,
): string {
  const doc = parseHtml(html);
  if (!doc) return html;
  const info = findRepeater(doc);
  if (!info) return html;
  const container = nodeAtPath(doc.body, info.path);
  if (!container) return html;
  fn(doc, container);
  return serialize(doc);
}

function setRepeaterItemImage(html: string, index: number, src: string) {
  return withRepeater(html, (doc, container) => {
    const item = container.children[index];
    if (!item) return;
    const existing = item.querySelector("img");
    if (existing) {
      if (src) existing.setAttribute("src", src);
      else existing.remove();
      return;
    }
    const box = Array.from(item.querySelectorAll<HTMLElement>("*")).find((e) =>
      /bg-gradient|aspect-/.test(e.className),
    );
    const target: Element = box ?? item;
    if (!src) return;
    const img = doc.createElement("img");
    const cls = (target.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter(
        (c) =>
          !/^bg-gradient/.test(c) &&
          !/^from-/.test(c) &&
          !/^via-/.test(c) &&
          !/^to-/.test(c) &&
          !/^bg-\[/.test(c),
      )
      .join(" ");
    img.setAttribute("class", (cls + " object-cover w-full h-full").trim());
    img.setAttribute("src", src);
    img.setAttribute("alt", "");
    const wrapper = doc.createElement("div");
    wrapper.setAttribute("class", target.getAttribute("class") ?? "");
    wrapper.setAttribute("style", "overflow:hidden");
    wrapper.appendChild(img);
    target.replaceWith(wrapper);
  });
}

function setRepeaterItemField(
  html: string,
  index: number,
  field: "title" | "body" | "href",
  value: string,
) {
  return withRepeater(html, (_doc, container) => {
    const item = container.children[index];
    if (!item) return;
    if (field === "title") {
      const el = item.querySelector("h1,h2,h3,h4,h5,h6,summary,strong,.font-bold");
      if (el) {
        el.textContent = value;
        ensureSummaryChevron(el as HTMLElement);
      }
    } else if (field === "body") {
      const el = item.querySelector("p");
      if (el) el.textContent = value;
    } else if (field === "href") {
      const el = item.querySelector("a");
      if (el) el.setAttribute("href", value || "#");
    }
  });
}

function duplicateRepeaterItem(html: string, index: number) {
  return withRepeater(html, (_doc, container) => {
    const item = container.children[index];
    if (!item) return;
    const clone = item.cloneNode(true) as Element;
    if (item.nextSibling) container.insertBefore(clone, item.nextSibling);
    else container.appendChild(clone);
  });
}

function removeRepeaterItem(html: string, index: number) {
  return withRepeater(html, (_doc, container) => {
    if (container.children.length <= 1) return;
    const item = container.children[index];
    if (item) item.remove();
  });
}

function addRepeaterItem(html: string) {
  return withRepeater(html, (_doc, container) => {
    const last = container.children[container.children.length - 1];
    if (!last) return;
    const clone = last.cloneNode(true) as Element;
    container.appendChild(clone);
  });
}

function moveRepeaterItem(html: string, index: number, delta: number) {
  return withRepeater(html, (_doc, container) => {
    const len = container.children.length;
    const from = index;
    const to = index + delta;
    if (from < 0 || from >= len) return;
    if (to < 0 || to >= len) return;
    const item = container.children[from];
    const target = container.children[to];
    if (!item || !target) return;
    if (delta > 0) {
      // move down: insert after target
      if (target.nextSibling) container.insertBefore(item, target.nextSibling);
      else container.appendChild(item);
    } else {
      // move up: insert before target
      container.insertBefore(item, target);
    }
  });
}

function moveRepeaterItemTo(html: string, fromIndex: number, toIndex: number) {
  return withRepeater(html, (_doc, container) => {
    const len = container.children.length;
    const from = fromIndex;
    const to = Math.max(0, Math.min(len - 1, toIndex));
    if (from < 0 || from >= len) return;
    if (to < 0 || to >= len) return;
    if (from === to) return;
    const item = container.children[from];
    const target = container.children[to];
    if (!item || !target) return;
    if (from < to) {
      // moving forward: insert after target
      if (target.nextSibling) container.insertBefore(item, target.nextSibling);
      else container.appendChild(item);
    } else {
      // moving backward: insert before target
      container.insertBefore(item, target);
    }
  });
}

// Footer helpers omitted for brevity â€” keep the ones we used earlier

function findFooterColumnElements(doc: Document): Element[] {
  const footer = doc.body.querySelector('footer');
  if (!footer) return [];
  // Prefer explicit lists as columns
  let cols: Element[] = Array.from(footer.querySelectorAll('ul')) as Element[];
  if (cols.length > 0) return cols;
  // Otherwise, direct child elements that contain links/lists
  cols = Array.from(footer.children).filter((c) => !!c.querySelector && !!c.querySelector('a,li')) as Element[];
  if (cols.length > 0) return cols;
  // Fallback: any element under footer with anchors Sectioned by a common parent
  const anchors = Array.from(footer.querySelectorAll('a'));
  const parents = anchors.map((a) => a.closest('div,section') || a.parentElement).filter(Boolean) as Element[];
  // pick unique parents
  return Array.from(new Set(parents));
}

function getFooterColumns(html: string): { heading: string; items: { text: string; href: string; fontSize?: string; color?: string; fontWeight?: string; textAlign?: string }[] }[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  const cols = findFooterColumnElements(doc);
  return cols.map((col) => {
    let heading = '';
    // heading may be an H* or strong inside the column, or a previous sibling when the column is a UL
    const h = col.querySelector('h1,h2,h3,h4,h5,h6,strong');
    if (h && (h.textContent || '').trim()) heading = (h.textContent || '').trim();
    else if (/^UL$|^OL$/.test(col.tagName)) {
      const prev = col.previousElementSibling;
      if (prev && (prev.textContent || '').trim()) heading = (prev.textContent || '').trim();
    }
    // collect anchors
    const items: { text: string; href: string; fontSize?: string; color?: string; fontWeight?: string; textAlign?: string }[] = [];
    const listItems = Array.from(col.querySelectorAll('li'));
      if (listItems.length > 0) {
      for (const li of listItems) {
        const a = li.querySelector('a');
        const targetEl = a ?? li;
        const text = (a?.textContent || li.textContent || '').trim();
        const href = a?.getAttribute('href') ?? '#';
        const styleMap = readStyleMap((targetEl as HTMLElement).getAttribute('style') ?? '');
        if (text.trim()) items.push({ text, href, fontSize: styleMap['font-size'] || '', color: styleMap['color'] || '', fontWeight: styleMap['font-weight'] || '', textAlign: styleMap['text-align'] || '' });
      }
    } else {
      const anchors = Array.from(col.querySelectorAll('a'));
      for (const a of anchors) {
        const text = (a.textContent || '').trim();
        const href = a.getAttribute('href') ?? '#';
        const styleMap = readStyleMap((a as HTMLElement).getAttribute('style') ?? '');
        if (text) items.push({ text, href, fontSize: styleMap['font-size'] || '', color: styleMap['color'] || '', fontWeight: styleMap['font-weight'] || '', textAlign: styleMap['text-align'] || '' });
      }
    }
    return { heading, items };
  });
}

function getTeamGridColumnCount(html: string) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const grid = Array.from(doc.body.querySelectorAll('div[class*="grid"]')).find((el) => {
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    return classes.some((c) => /^md:grid-cols-\d+$/.test(c));
  });
  if (!grid) return null;
  const classes = (grid.getAttribute('class') || '').split(/\s+/);
  const match = classes.find((c) => /^md:grid-cols-\d+$/.test(c));
  if (match) return Number(match.replace('md:grid-cols-', '')) || null;
  const children = Array.from(grid.children).filter((child) => child.nodeType === Node.ELEMENT_NODE);
  return children.length > 0 ? children.length : null;
}

function setTeamGridColumnCount(html: string, count: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const grid = Array.from(doc.body.querySelectorAll('div[class*="grid"]')).find((el) => {
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    return classes.some((c) => /^md:grid-cols-\d+$/.test(c));
  });
  if (!grid) return html;
  const children = Array.from(grid.children).filter((child) => child.nodeType === Node.ELEMENT_NODE) as Element[];
  const targetCount = Math.min(6, Math.max(1, count));
  while (children.length > targetCount) {
    const child = children.pop();
    if (child) child.remove();
  }
  const prototype = children[children.length - 1];
  while (children.length < targetCount) {
    if (!prototype) break;
    const clone = prototype.cloneNode(true) as Element;
    grid.appendChild(clone);
    children.push(clone);
  }
  updateTeamGridColsForWrapper(grid);
  return serialize(doc);
}

function getTeamGridItemInfo(html: string, selectedContainerIndex: number) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const selected = getElementByWtoIndex(html, selectedContainerIndex);
  if (!selected) return null;

  const candidate = selected.closest && (selected.closest('div[class*="grid"]') || selected.closest('section,main,article,aside'));
  const grid = candidate && candidate.matches('div[class*="grid"]') ? candidate : null;
  if (!grid) return null;
  const gridClasses = (grid.getAttribute('class') || '').split(/\s+/);
  if (!gridClasses.some((c) => /^md:grid-cols-\d+$/.test(c))) return null;

  let item: Element | null = selected instanceof Element ? selected : null;
  while (item && item.parentElement && item.parentElement !== grid) {
    item = item.parentElement;
  }
  if (!item || item.parentElement !== grid) return null;
  const children = Array.from(grid.children);
  const itemIndex = children.indexOf(item);
  if (itemIndex === -1) return null;
  return { item, itemIndex, grid, children };
}

function withTeamGridItem(html: string, selectedContainerIndex: number, fn: (doc: Document, grid: Element, item: Element, itemIndex: number) => void) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const selected = getContainerElement(html, selectedContainerIndex);
  if (!selected) return html;
  const grid = selected.closest('div[class*="grid"]');
  if (!grid || grid === selected) return html;
  let item: Element | null = selected;
  while (item && item.parentElement && item.parentElement !== grid) {
    item = item.parentElement;
  }
  if (!item || item.parentElement !== grid) return html;
  const children = Array.from(grid.children);
  const itemIndex = children.indexOf(item);
  if (itemIndex === -1) return html;
  fn(doc, grid, item, itemIndex);
  return serialize(doc);
}

function getFirstTeamGridItemInfo(html: string) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const grid = Array.from(doc.body.querySelectorAll('div[class*="grid"]')).find((el) => {
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    return classes.some((c) => /^md:grid-cols-\d+$/.test(c));
  });
  if (!grid) return null;
  const children = Array.from(grid.children).filter((child) => child.nodeType === Node.ELEMENT_NODE) as Element[];
  if (children.length === 0) return null;
  return { item: children[0], itemIndex: 0, grid, children };
}

function normalizeGapValue(value: string) {
  const normalized = value.trim();
  return normalized;
}

function updateTeamGridColsForWrapper(grid: Element) {
  const children = Array.from(grid.children).filter((child) => child.nodeType === Node.ELEMENT_NODE);
  const cols = Math.max(children.length, 1);
  const classes = (grid.getAttribute('class') || '').split(/\s+/).filter((c) => !/^md:grid-cols-\d+$/.test(c));
  classes.push(`md:grid-cols-${cols}`);
  grid.setAttribute('class', classes.join(' ').trim());
}

function removeTeamGridColumn(html: string, selectedContainerIndex: number) {
  return withTeamGridItem(html, selectedContainerIndex, (_doc, grid, item) => {
    if (grid.children.length <= 1) return;
    item.remove();
    updateTeamGridColsForWrapper(grid);
  });
}

function removeTeamGridColumnByIndex(html: string, columnIndex: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const grid = Array.from(doc.body.querySelectorAll('div[class*="grid"]')).find((el) => {
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    return classes.some((c) => /^md:grid-cols-\d+$/.test(c));
  });
  if (!grid) return html;
  const children = Array.from(grid.children).filter((child) => child.nodeType === Node.ELEMENT_NODE);
  if (children.length <= 1) return html;
  const target = children[columnIndex] as Element | undefined;
  if (!target) return html;
  target.remove();
  updateTeamGridColsForWrapper(grid);
  return serialize(doc);
}

function duplicateTeamGridColumn(html: string, selectedContainerIndex: number) {
  return withTeamGridItem(html, selectedContainerIndex, (_doc, grid, item) => {
    const clone = item.cloneNode(true) as Element;
    if (item.nextSibling) grid.insertBefore(clone, item.nextSibling);
    else grid.appendChild(clone);
    updateTeamGridColsForWrapper(grid);
  });
}

function addTeamGridColumn(html: string, selectedContainerIndex?: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const grid = Array.from(doc.body.querySelectorAll('div[class*="grid"]')).find((el) => {
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    return classes.some((c) => /^md:grid-cols-\d+$/.test(c));
  });
  if (!grid) return html;

  const children = Array.from(grid.children).filter((child) => child.nodeType === Node.ELEMENT_NODE) as Element[];
  let item: Element | null = null;

  if (selectedContainerIndex != null) {
    const selected = getContainerElement(html, selectedContainerIndex);
    if (selected) {
      let candidate: Element | null = selected;
      while (candidate && candidate.parentElement && candidate.parentElement !== grid) {
        candidate = candidate.parentElement;
      }
      if (candidate && candidate.parentElement === grid) item = candidate;
    }
  }

  if (!item) {
    item = children[children.length - 1] ?? null;
  }

  if (!item) return serialize(doc);
  const clone = item.cloneNode(true) as Element;
  if (item.nextSibling) grid.insertBefore(clone, item.nextSibling);
  else grid.appendChild(clone);
  updateTeamGridColsForWrapper(grid);
  return serialize(doc);
}

function getTeamGridGap(html: string) {
  const doc = parseHtml(html);
  if (!doc) return "";
  const grid = Array.from(doc.body.querySelectorAll('div[class*="grid"]')).find((el) => {
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    return classes.some((c) => /^md:grid-cols-\d+$/.test(c));
  });
  if (!grid) return "";
  const style = grid.getAttribute('style') || "";
  const styleMap = readStyleMap(style);
  if (styleMap['gap']) return styleMap['gap'];
  const classes = (grid.getAttribute('class') || '').split(/\s+/);
  const gapClass = classes.find((c) => /^gap-\d+$/.test(c));
  const gapMap: Record<string, string> = {
    'gap-0': '0px',
    'gap-1': '0.25rem',
    'gap-2': '0.5rem',
    'gap-3': '0.75rem',
    'gap-4': '1rem',
    'gap-5': '1.25rem',
    'gap-6': '1.5rem',
    'gap-7': '1.75rem',
    'gap-8': '2rem',
    'gap-9': '2.25rem',
    'gap-10': '2.5rem',
  };
  return gapClass ? gapMap[gapClass] || '' : '';
}

function setTeamGridGap(html: string, gap: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const grid = Array.from(doc.body.querySelectorAll('div[class*="grid"]')).find((el) => {
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    return classes.some((c) => /^md:grid-cols-\d+$/.test(c));
  });
  if (!grid) return html;
  const styleMap = readStyleMap(grid.getAttribute('style') || '');
  const normalized = normalizeGapValue(gap);
  if (normalized) styleMap['gap'] = normalized;
  else delete styleMap['gap'];
  grid.setAttribute('style', serializeStyleMap(styleMap));
  return serialize(doc);
}

function getCommonFooterStyleValue(elements: Element[], key: string) {
  if (elements.length === 0) return '';
  const firstMap = readStyleMap((elements[0] as HTMLElement).getAttribute('style') ?? '');
  const firstValue = firstMap[key] || '';
  for (const el of elements) {
    const styleMap = readStyleMap((el as HTMLElement).getAttribute('style') ?? '');
    if ((styleMap[key] || '') !== firstValue) return '';
  }
  return firstValue;
}

function setFooterElementsStyle(html: string, selector: string, patch: Partial<{ color?: string; fontSize?: string; fontWeight?: string; textAlign?: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const els = Array.from(doc.body.querySelectorAll<HTMLElement>(selector));
  if (els.length === 0) return html;
  els.forEach((el) => {
    const styleMap = readStyleMap(el.getAttribute('style') ?? '');
    if (patch.color !== undefined) {
      if (patch.color) styleMap['color'] = patch.color;
      else delete styleMap['color'];
    }
    if (patch.fontSize !== undefined) {
      if (patch.fontSize) styleMap['font-size'] = patch.fontSize;
      else delete styleMap['font-size'];
    }
    if (patch.fontWeight !== undefined) {
      if (patch.fontWeight) styleMap['font-weight'] = patch.fontWeight;
      else delete styleMap['font-weight'];
    }
    if (patch.textAlign !== undefined) {
      if (patch.textAlign) styleMap['text-align'] = patch.textAlign;
      else delete styleMap['text-align'];
    }
    if (Object.keys(styleMap).length > 0) {
      el.setAttribute('style', serializeStyleMap(styleMap));
    } else {
      el.removeAttribute('style');
    }
  });
  return serialize(doc);
}

function getFooterHeadingColor(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const headings = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong'));
  return getCommonFooterStyleValue(headings, 'color');
}

function getFooterHeadingFontSize(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const headings = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong'));
  return getCommonFooterStyleValue(headings, 'font-size');
}

function setFooterHeadingStyle(html: string, patch: Partial<{ color?: string; fontSize?: string; fontWeight?: string; textAlign?: string }>) {
  return setFooterElementsStyle(html, 'footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong', patch);
}

function getFooterLinkColor(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const links = Array.from(doc.body.querySelectorAll<HTMLElement>('footer a'));
  return getCommonFooterStyleValue(links, 'color');
}

function getFooterLinkFontSize(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const links = Array.from(doc.body.querySelectorAll<HTMLElement>('footer a'));
  return getCommonFooterStyleValue(links, 'font-size');
}

function setFooterLinkStyle(html: string, patch: Partial<{ color?: string; fontSize?: string; fontWeight?: string; textAlign?: string }>) {
  return setFooterElementsStyle(html, 'footer a', patch);
}

function getFooterTextColor(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div'));
  return getCommonFooterStyleValue(allText, 'color');
}

function getFooterTextSize(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div'));
  return getCommonFooterStyleValue(allText, 'font-size');
}

function setFooterTextStyle(html: string, patch: Partial<{ color?: string; fontSize?: string; fontFamily?: string; fontWeight?: string; lineHeight?: string; letterSpacing?: string; textAlign?: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div, footer li'));
  allText.forEach((el) => {
    const styleMap = readStyleMap(el.getAttribute('style') ?? '');
    if (patch.color !== undefined) patch.color ? (styleMap['color'] = patch.color) : delete styleMap['color'];
    if (patch.fontSize !== undefined) patch.fontSize ? (styleMap['font-size'] = patch.fontSize) : delete styleMap['font-size'];
    if (patch.fontFamily !== undefined) patch.fontFamily ? (styleMap['font-family'] = patch.fontFamily) : delete styleMap['font-family'];
    if (patch.fontWeight !== undefined) patch.fontWeight ? (styleMap['font-weight'] = patch.fontWeight) : delete styleMap['font-weight'];
    if (patch.lineHeight !== undefined) patch.lineHeight ? (styleMap['line-height'] = patch.lineHeight) : delete styleMap['line-height'];
    if (patch.letterSpacing !== undefined) patch.letterSpacing ? (styleMap['letter-spacing'] = patch.letterSpacing) : delete styleMap['letter-spacing'];
    if (patch.textAlign !== undefined) patch.textAlign ? (styleMap['text-align'] = patch.textAlign) : delete styleMap['text-align'];
    const styleStr = serializeStyleMap(styleMap);
    if (styleStr) el.setAttribute('style', styleStr);
    else el.removeAttribute('style');
  });
  return serialize(doc);
}

function getFooterFontFamily(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div, footer li'));
  return getCommonFooterStyleValue(allText, 'font-family');
}

function getFooterFontWeight(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div, footer li'));
  return getCommonFooterStyleValue(allText, 'font-weight');
}

function getFooterLineHeight(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div, footer li'));
  return getCommonFooterStyleValue(allText, 'line-height');
}

function getFooterLetterSpacing(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div, footer li'));
  return getCommonFooterStyleValue(allText, 'letter-spacing');
}

function getFooterTextAlign(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const allText = Array.from(doc.body.querySelectorAll<HTMLElement>('footer h1, footer h2, footer h3, footer h4, footer h5, footer h6, footer strong, footer a, footer div, footer li'));
  return getCommonFooterStyleValue(allText, 'text-align');
}

function setFooterColumnHeading(html: string, colIndex: number, heading: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const cols = findFooterColumnElements(doc);
  const col = cols[colIndex];
  if (!col) return html;
  // Try to find an existing heading element
  let h = col.querySelector('h1,h2,h3,h4,h5,h6,strong');
  if (!h && (/^UL$|^OL$/.test(col.tagName))) {
    // create or update previous sibling text node
    const prev = col.previousElementSibling;
    if (prev && /^H[1-6]$/.test(prev.tagName)) {
      prev.textContent = heading;
      return serialize(doc);
    }
    // insert a heading before the list
    h = doc.createElement('h3');
    h.textContent = heading;
    col.parentElement?.insertBefore(h, col);
    return serialize(doc);
  }
  if (!h) {
    h = doc.createElement('h3');
    h.textContent = heading;
    col.insertBefore(h, col.firstChild);
    return serialize(doc);
  }
  h.textContent = heading;
  return serialize(doc);
}

function removeFooterColumn(html: string, colIndex: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const cols = findFooterColumnElements(doc);
  const col = cols[colIndex];
  if (!col) return html;
  
  // If the column is a UL and previous sibling is heading, remove heading too
  const prev = col.previousElementSibling;
  if (prev && /^H[1-6]$/.test(prev.tagName)) prev.remove();
  col.remove();
  
  // Update grid classes based on remaining columns
  const footer = doc.body.querySelector('footer');
  if (footer) {
    let gridWrapper = footer.querySelector('div[class*="grid"]');
    if (!gridWrapper) {
      gridWrapper = footer.children[0] as HTMLElement;
    }
    if (gridWrapper) {
      const remainingCols = Math.max(gridWrapper.children.length, 1);
      const gridClass = gridWrapper.getAttribute('class') || '';
      const updatedClass = gridClass
        .replace(/md:grid-cols-\d+/g, `md:grid-cols-${remainingCols}`)
        .replace(/grid-cols-\d+/g, `grid-cols-1`);
      gridWrapper.setAttribute('class', updatedClass);
    }
  }
  
  return serialize(doc);
}

function updateFooterColumnItem(html: string, colIndex: number, itemIndex: number, patch: Partial<{ text: string; href: string; fontSize?: string; color?: string; fontWeight?: string; textAlign?: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const cols = findFooterColumnElements(doc);
  const col = cols[colIndex];
  if (!col) return html;
  const listItems = Array.from(col.querySelectorAll('li'));
  if (listItems.length > 0) {
    const li = listItems[itemIndex];
    if (!li) return serialize(doc);
    const a = li.querySelector('a');
    if (patch.text !== undefined) {
      if (a) a.textContent = patch.text;
      else li.textContent = patch.text;
    }
    if (patch.href !== undefined) {
      if (a) a.setAttribute('href', patch.href || '#');
      else {
        const na = doc.createElement('a');
        na.setAttribute('href', patch.href || '#');
        na.textContent = li.textContent || patch.href || '#';
        li.textContent = '';
        li.appendChild(na);
      }
    }
    // apply style patches
    const target = (a ?? li) as HTMLElement;
    const styleMap = readStyleMap(target.getAttribute('style') ?? '');
    if (patch.fontSize !== undefined) {
      if (patch.fontSize) styleMap['font-size'] = patch.fontSize;
      else delete styleMap['font-size'];
    }
    if (patch.color !== undefined) {
      if (patch.color) styleMap['color'] = patch.color;
      else delete styleMap['color'];
    }
    if (patch.fontWeight !== undefined) {
      if (patch.fontWeight) styleMap['font-weight'] = patch.fontWeight;
      else delete styleMap['font-weight'];
    }
    if (patch.textAlign !== undefined) {
      if (patch.textAlign) styleMap['text-align'] = patch.textAlign;
      else delete styleMap['text-align'];
    }
    target.setAttribute('style', serializeStyleMap(styleMap));
    return serialize(doc);
  }
  const anchors = Array.from(col.querySelectorAll('a'));
  const a = anchors[itemIndex];
  if (!a) return serialize(doc);
  if (patch.text !== undefined) a.textContent = patch.text;
  if (patch.href !== undefined) a.setAttribute('href', patch.href || '#');
  const styleMap = readStyleMap((a as HTMLElement).getAttribute('style') ?? '');
  if (patch.fontSize !== undefined) {
    if (patch.fontSize) styleMap['font-size'] = patch.fontSize;
    else delete styleMap['font-size'];
  }
  if (patch.color !== undefined) {
    if (patch.color) styleMap['color'] = patch.color;
    else delete styleMap['color'];
  }
  if (patch.fontWeight !== undefined) {
    if (patch.fontWeight) styleMap['font-weight'] = patch.fontWeight;
    else delete styleMap['font-weight'];
  }
  if (patch.textAlign !== undefined) {
    if (patch.textAlign) styleMap['text-align'] = patch.textAlign;
    else delete styleMap['text-align'];
  }
  (a as HTMLElement).setAttribute('style', serializeStyleMap(styleMap));
  return serialize(doc);
}

function removeFooterColumnItem(html: string, colIndex: number, itemIndex: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const cols = findFooterColumnElements(doc);
  const col = cols[colIndex];
  if (!col) return html;
  const listItems = Array.from(col.querySelectorAll('li'));
  if (listItems.length > 0) {
    const li = listItems[itemIndex];
    if (li) li.remove();
    return serialize(doc);
  }
  const anchors = Array.from(col.querySelectorAll('a'));
  const a = anchors[itemIndex];
  if (a) a.remove();
  return serialize(doc);
}

function addFooterColumnItem(html: string, colIndex: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const cols = findFooterColumnElements(doc);
  const col = cols[colIndex];
  if (!col) return html;
  // If column contains a UL, append LI
  const ul = col.querySelector('ul') ?? (col.tagName === 'UL' ? col : null);
  if (ul) {
    const li = doc.createElement('li');
    const a = doc.createElement('a');
    a.setAttribute('href', '#');
    a.textContent = 'New item';
    li.appendChild(a);
    ul.appendChild(li);
    return serialize(doc);
  }
  // Otherwise append an anchor inside the column
  const a = doc.createElement('a');
  a.setAttribute('href', '#');
  a.textContent = 'New item';
  col.appendChild(a);
  return serialize(doc);
}

function addFooterColumn(html: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  
  // Find the main grid wrapper
  let gridWrapper = footer.querySelector('div[class*="grid"]');
  if (!gridWrapper) {
    gridWrapper = footer.children[0] as HTMLElement;
  }
  
  // Create new column
  const wrapper = doc.createElement('div');
  const h = doc.createElement('h3');
  h.textContent = 'New Column';
  const ul = doc.createElement('ul');
  const li = doc.createElement('li');
  const a = doc.createElement('a');
  a.setAttribute('href', '#');
  a.textContent = 'New item';
  li.appendChild(a);
  ul.appendChild(li);
  wrapper.appendChild(h);
  wrapper.appendChild(ul);
  gridWrapper.appendChild(wrapper);
  
  // Update grid classes based on number of columns
  const cols = gridWrapper.children.length;
  const gridClass = gridWrapper.getAttribute('class') || '';
  const updatedClass = gridClass
    .replace(/md:grid-cols-\d+/g, `md:grid-cols-${cols}`)
    .replace(/grid-cols-\d+/g, `grid-cols-1`);
  gridWrapper.setAttribute('class', updatedClass);
  
  return serialize(doc);
}

function hasRepeaterTarget(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return false;
  const info = findRepeater(doc);
  if (!info) return false;
  const container = nodeAtPath(doc.body, info.path);
  if (!container) return false;
  const item = container.children[index];
  if (!item) return false;
  const a = item.querySelector('a');
  return !!(a && a.getAttribute('target') === '_blank');
}

function setRepeaterItemTarget(html: string, index: number, openInNewTab: boolean) {
  return withRepeater(html, (doc, container) => {
    const item = container.children[index];
    if (!item) return;
    const a = item.querySelector('a');
    if (!a) return;
    if (openInNewTab) a.setAttribute('target', '_blank');
    else a.removeAttribute('target');
  });
}

function getFooterCopyright(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => /Â©/.test(n.textContent || '')) as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setFooterCopyright(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => /Â©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('class', 'border-t border-gray-800 py-6 text-center text-xs');
    footer.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getFooterCopyrightColor(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '#000000';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => /Â©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) return '#000000';
  const color = el.getAttribute('style')?.match(/color:\s*([^;]+)/)?.[1];
  return color || '#000000';
}

function setFooterCopyrightColor(html: string, color: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => /Â©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('class', 'border-t border-gray-800 py-6 text-center text-xs');
    footer.appendChild(el);
  }
  const style = el.getAttribute('style') || '';
  el.setAttribute('style', `${style};color:${color}`);
  return serialize(doc);
}

function getFooterCopyrightFontSize(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => /Â©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) return '';
  const size = el.getAttribute('style')?.match(/font-size:\s*([^;]+)/)?.[1];
  return size || '';
}

function setFooterCopyrightFontSize(html: string, size: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => /Â©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('class', 'border-t border-gray-800 py-6 text-center text-xs');
    footer.appendChild(el);
  }
  const style = (el.getAttribute('style') || '').replace(/font-size:\s*[^;]+;?/gi, '').trim();
  const nextStyle = [style, size ? `font-size:${size}` : ''].filter(Boolean).join(';');
  el.setAttribute('style', nextStyle);
  return serialize(doc);
}

export default PropertiesPanel;
