import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faBuilding,
  faClone,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import {
  ColorControl,
  ImageControl,
  NumberControl,
  SelectControl,
  TextAreaControl,
  TextControl,
  ToggleControl,
} from "@/components/builder/property-controls";
import { getAssetValue, normalizeImagePickerValue } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";
import {
  createAboutFeature,
  defaultAboutWidgetData,
  isAboutWidgetData,
  resolveAboutColumns,
  type AboutColumnPreset,
  type AboutFeatureIcon,
  type AboutFeatureItem,
  type AboutWidgetData,
} from "./AboutTypes";

export interface AboutPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function toPxNumber(value: unknown, fallback: number): number {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : fallback;
}

function resolveImageSrc(src: unknown): string {
  if (typeof src === "object" && src !== null) {
    return String(getAssetValue(src as any) ?? "");
  }
  return String(src || "");
}

type FocusPart =
  | "eyebrow"
  | "heading"
  | "description"
  | "feature"
  | "button"
  | "image"
  | "general";

function resolveFocus(elementKey: string): { focus: FocusPart; featureId?: string } {
  if (!elementKey) return { focus: "general" };
  if (elementKey === "eyebrow") return { focus: "eyebrow" };
  if (elementKey === "heading") return { focus: "heading" };
  if (elementKey === "description") return { focus: "description" };
  if (elementKey === "button") return { focus: "button" };
  if (elementKey === "image") return { focus: "image" };
  if (elementKey.startsWith("feature-")) {
    return { focus: "feature", featureId: elementKey.slice("feature-".length) };
  }
  return { focus: "general" };
}

const FONT_WEIGHT_OPTIONS = [
  { label: "400 Â· Regular", value: "400" },
  { label: "500 Â· Medium", value: "500" },
  { label: "600 Â· Semibold", value: "600" },
  { label: "700 Â· Bold", value: "700" },
];

const COLUMN_PRESET_OPTIONS = [
  { label: "Content 8 / Image 4", value: "8-4" },
  { label: "Content 7 / Image 5", value: "7-5" },
  { label: "Equal 6 / 6", value: "6-6" },
  { label: "Content 5 / Image 7", value: "5-7" },
  { label: "Content 4 / Image 8", value: "4-8" },
  { label: "Custom", value: "custom" },
];

export function AboutProperties({
  value = defaultAboutWidgetData,
  onChange,
  onClose,
}: AboutPropertiesProps) {
  const aboutValue: AboutWidgetData = isAboutWidgetData(value) ? value : defaultAboutWidgetData;
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectElement = useBuilder((s) => s.selectElement);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const section = (pageOf(project)?.sections ?? []).find((s) => s.id === selectedSectionId) ?? null;

  const updateContent = (patch: Partial<AboutWidgetData["content"]>) =>
    onChange({ ...aboutValue, content: { ...aboutValue.content, ...patch } });
  const updateStyle = (patch: Partial<AboutWidgetData["style"]>) =>
    onChange({ ...aboutValue, style: { ...aboutValue.style, ...patch } });
  const updateLayout = (patch: Partial<AboutWidgetData["layout"]>) =>
    onChange({ ...aboutValue, layout: { ...aboutValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<AboutWidgetData["responsive"]>) =>
    onChange({ ...aboutValue, responsive: { ...aboutValue.responsive, ...patch } });
  const updateAdvanced = (patch: Partial<AboutWidgetData["advanced"]>) =>
    onChange({ ...aboutValue, advanced: { ...aboutValue.advanced, ...patch } });

  const features = Array.isArray(aboutValue.content.features) ? aboutValue.content.features : [];
  const columns = resolveAboutColumns(
    aboutValue.style.columnPreset,
    aboutValue.style.contentColumns,
  );

  const focusInfo = useMemo(
    () => resolveFocus(String(selectedElement?.elementKey ?? "")),
    [selectedElement?.elementKey],
  );

  const selectedFeatureId = useMemo(() => {
    if (focusInfo.featureId && features.some((item) => item.id === focusInfo.featureId)) {
      return focusInfo.featureId;
    }
    const stored = String(aboutValue.content.selectedFeatureId ?? "");
    if (stored && features.some((item) => item.id === stored)) return stored;
    return features[0]?.id ?? "";
  }, [aboutValue.content.selectedFeatureId, features, focusInfo.featureId]);

  const selectedFeature =
    features.find((item) => item.id === selectedFeatureId) ?? features[0];
  const selectedFeatureIndex = selectedFeature
    ? features.findIndex((item) => item.id === selectedFeature.id)
    : -1;

  const setFeatures = (next: AboutFeatureItem[], nextSelectedId?: string) => {
    const id =
      nextSelectedId ??
      (next.some((item) => item.id === selectedFeatureId) ? selectedFeatureId : next[0]?.id);
    updateContent({ features: next, selectedFeatureId: id });
  };

  const selectChild = (
    elementKey: string,
    elementType: "text" | "image" | "button" | "container",
  ) => {
    if (!section?.widgetInstance) return;
    selectElement({
      kind: "widget",
      index: null,
      tag: elementType === "button" ? "a" : elementType === "image" ? "img" : "div",
      sectionId: section.id,
      widgetId: section.widgetInstance.id,
      parentWidgetId: section.widgetInstance.id,
      childId: null,
      elementKey,
      elementType,
    });
  };

  const updateFeature = (featureId: string, patch: Partial<AboutFeatureItem>) => {
    setFeatures(
      features.map((item) => (item.id === featureId ? { ...item, ...patch } : item)),
      featureId,
    );
  };

  const applyImageSrc = (next: string) => {
    if (!next) {
      updateContent({ imageSrc: "", imageName: "" });
      return;
    }
    const normalized = normalizeImagePickerValue(
      next,
      aboutValue.content.imageSrc as any,
      project?.assets as any,
    );
    const name =
      typeof normalized === "object" && normalized
        ? String((normalized as any).filename || "")
        : "";
    updateContent({ imageSrc: normalized as any, imageName: name });
  };

  const applyColumnPreset = (preset: AboutColumnPreset) => {
    const resolved = resolveAboutColumns(preset, aboutValue.style.contentColumns);
    updateStyle({
      columnPreset: resolved.preset,
      contentColumns: resolved.content,
      imageColumns: resolved.image,
    });
  };

  const applyContentColumns = (contentCols: number) => {
    const content = Math.max(1, Math.min(11, contentCols));
    updateStyle({
      columnPreset: "custom",
      contentColumns: content,
      imageColumns: 12 - content,
    });
  };

  const actionBtnClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";

  const focus = focusInfo.focus;
  const showEyebrow = focus === "general" || focus === "eyebrow";
  const showHeading = focus === "general" || focus === "heading";
  const showDescription = focus === "general" || focus === "description";
  const showFeatures = focus === "general" || focus === "feature";
  const showButton = focus === "general" || focus === "button";
  const showImage = focus === "general" || focus === "image";

  return (
    <PropertyPanel
      title="About Us"
      badgeLabel="About"
      badgeIcon={<FontAwesomeIcon icon={faBuilding} className="h-3.5 w-3.5" />}
      onClose={onClose}
      variantControl={
        <SelectControl
          label="Variant"
          value={aboutValue.variant}
          options={[{ label: "Split Content", value: "Split Content" }]}
          onChange={() => onChange({ ...aboutValue, variant: "Split Content" })}
        />
      }
      content={
        <div className="space-y-3">
          {showEyebrow ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Eyebrow
              </div>
              <ToggleControl
                label="Enable eyebrow"
                checked={aboutValue.content.showEyebrow !== false}
                onChange={(next) => updateContent({ showEyebrow: next })}
              />
              <TextControl
                label="Eyebrow text"
                value={String(aboutValue.content.eyebrow ?? "")}
                onChange={(next) => updateContent({ eyebrow: next })}
              />
            </div>
          ) : null}

          {showHeading ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Heading
              </div>
              <ToggleControl
                label="Enable heading"
                checked={aboutValue.content.showHeading !== false}
                onChange={(next) => updateContent({ showHeading: next })}
              />
              <TextAreaControl
                label="Heading text"
                value={String(aboutValue.content.heading ?? "")}
                onChange={(next) => updateContent({ heading: next })}
              />
            </div>
          ) : null}

          {showDescription ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Description
              </div>
              <ToggleControl
                label="Enable description"
                checked={aboutValue.content.showDescription !== false}
                onChange={(next) => updateContent({ showDescription: next })}
              />
              <TextAreaControl
                label="Description text"
                value={String(aboutValue.content.description ?? "")}
                onChange={(next) => updateContent({ description: next })}
              />
            </div>
          ) : null}

          {showFeatures ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Feature list
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = createAboutFeature({ text: "New feature" });
                    setFeatures([...features, next], next.id);
                    selectChild(`feature-${next.id}`, "text");
                  }}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                  Add feature
                </button>
              </div>
              <ToggleControl
                label="Enable feature list"
                checked={aboutValue.content.showFeatures !== false}
                onChange={(next) => updateContent({ showFeatures: next })}
              />
              <div className="space-y-1.5">
                {features.map((item, index) => {
                  const isSelected = item.id === selectedFeatureId;
                  return (
                    <div
                      key={item.id}
                      className={[
                        "min-w-0 overflow-hidden rounded-lg border bg-white",
                        isSelected ? "border-violet-300 bg-violet-50/40" : "border-slate-200",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            updateContent({ selectedFeatureId: item.id });
                            selectChild(`feature-${item.id}`, "text");
                          }}
                          className="min-w-0 flex-1 truncate px-1 py-1 text-left text-[13px] font-medium text-slate-700"
                        >
                          {index + 1}. {item.text || "Untitled feature"}
                        </button>
                        <button
                          type="button"
                          className={actionBtnClass}
                          title="Duplicate"
                          onClick={() => {
                            const clone = createAboutFeature({
                              ...item,
                              id: undefined,
                              text: `${item.text} (copy)`,
                            });
                            const next = [...features];
                            next.splice(index + 1, 0, clone);
                            setFeatures(next, clone.id);
                            selectChild(`feature-${clone.id}`, "text");
                          }}
                        >
                          <FontAwesomeIcon icon={faClone} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className={actionBtnClass}
                          disabled={index === 0}
                          title="Move up"
                          onClick={() => setFeatures(moveItem(features, index, -1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className={actionBtnClass}
                          disabled={index === features.length - 1}
                          title="Move down"
                          onClick={() => setFeatures(moveItem(features, index, 1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className={`${actionBtnClass} hover:text-red-500`}
                          disabled={features.length <= 1}
                          title="Remove"
                          onClick={() => {
                            const next = features.filter((candidate) => candidate.id !== item.id);
                            setFeatures(next, next[Math.max(0, index - 1)]?.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedFeature ? (
                <div className="space-y-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Selected feature {selectedFeatureIndex >= 0 ? selectedFeatureIndex + 1 : ""}
                  </div>
                  <TextControl
                    label="Feature text"
                    value={String(selectedFeature.text ?? "")}
                    onChange={(next) => updateFeature(selectedFeature.id, { text: next })}
                  />
                  <SelectControl
                    label="Icon"
                    value={String(selectedFeature.icon ?? "check")}
                    options={[
                      { label: "Check", value: "check" },
                      { label: "Star", value: "star" },
                      { label: "Bolt", value: "bolt" },
                      { label: "Circle", value: "circle" },
                      { label: "None", value: "none" },
                    ]}
                    onChange={(next) =>
                      updateFeature(selectedFeature.id, { icon: next as AboutFeatureIcon })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {showButton ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Button
              </div>
              <ToggleControl
                label="Enable button"
                checked={aboutValue.content.showButton !== false}
                onChange={(next) => updateContent({ showButton: next })}
              />
              <TextControl
                label="Button label"
                value={String(aboutValue.content.buttonLabel ?? "")}
                onChange={(next) => updateContent({ buttonLabel: next })}
              />
              <TextControl
                label="Button URL"
                value={String(aboutValue.content.buttonUrl ?? "")}
                onChange={(next) => updateContent({ buttonUrl: next })}
              />
              <ToggleControl
                label="Open in new tab"
                checked={Boolean(aboutValue.content.openInNewTab)}
                onChange={(next) => updateContent({ openInNewTab: next })}
              />
            </div>
          ) : null}

          {showImage ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Image
              </div>
              <ToggleControl
                label="Enable image"
                checked={aboutValue.content.showImage !== false}
                onChange={(next) => updateContent({ showImage: next })}
              />
              <ImageControl
                label="Image"
                value={resolveImageSrc(aboutValue.content.imageSrc)}
                onChange={applyImageSrc}
                showAlt
                alt={String(aboutValue.content.imageAlt ?? "")}
                onAltChange={(next) => updateContent({ imageAlt: next })}
                decorative={aboutValue.content.imageAlt === "" && Boolean((aboutValue.content as { imageDecorative?: boolean }).imageDecorative)}
                onDecorativeChange={(next) =>
                  updateContent({
                    imageDecorative: next,
                    imageAlt: next ? "" : aboutValue.content.imageAlt,
                  } as any)
                }
              />
            </div>
          ) : null}
        </div>
      }
      style={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Section
          </div>
          <ColorControl
            label="Background color"
            value={String(aboutValue.style.backgroundColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ backgroundColor: next })}
          />
          <NumberControl
            label="Top padding (px)"
            value={toPxNumber(aboutValue.layout.paddingTop, 72)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingTop: `${next}px` })}
          />
          <NumberControl
            label="Bottom padding (px)"
            value={toPxNumber(aboutValue.layout.paddingBottom, 72)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingBottom: `${next}px` })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(aboutValue.layout.paddingX, 24)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingX: `${next}px` })}
          />
          <NumberControl
            label="Content max width (px)"
            value={toPxNumber(aboutValue.style.maxWidth, 1140)}
            min={480}
            max={1600}
            onChange={(next) => updateStyle({ maxWidth: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Column layout
          </div>
          <SelectControl
            label="Column layout"
            value={String(aboutValue.style.columnPreset ?? "7-5")}
            options={COLUMN_PRESET_OPTIONS}
            onChange={(next) => applyColumnPreset(next as AboutColumnPreset)}
          />
          <NumberControl
            label="Content column width"
            value={columns.content}
            min={1}
            max={11}
            onChange={applyContentColumns}
          />
          <NumberControl
            label="Image column width"
            value={columns.image}
            min={1}
            max={11}
            onChange={(next) => applyContentColumns(12 - Math.max(1, Math.min(11, next)))}
          />
          <NumberControl
            label="Column gap (px)"
            value={toPxNumber(aboutValue.style.columnGap, 32)}
            min={0}
            max={80}
            onChange={(next) => updateStyle({ columnGap: `${next}px` })}
          />
          <SelectControl
            label="Vertical alignment"
            value={String(aboutValue.style.verticalAlign ?? "center")}
            options={[
              { label: "Top", value: "top" },
              { label: "Center", value: "center" },
              { label: "Bottom", value: "bottom" },
            ]}
            onChange={(next) =>
              updateStyle({ verticalAlign: next as "top" | "center" | "bottom" })
            }
          />
          <SelectControl
            label="Content alignment"
            value={String(aboutValue.style.contentAlignment ?? "left")}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            onChange={(next) =>
              updateStyle({ contentAlignment: next as "left" | "center" | "right" })
            }
          />
          <SelectControl
            label="Image position"
            value={String(aboutValue.style.imageSide ?? "right")}
            options={[
              { label: "Right", value: "right" },
              { label: "Left", value: "left" },
            ]}
            onChange={(next) => updateStyle({ imageSide: next as "left" | "right" })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Image
          </div>
          <NumberControl
            label="Image height (px)"
            value={toPxNumber(aboutValue.style.imageHeight, 420)}
            min={160}
            max={800}
            onChange={(next) => updateStyle({ imageHeight: `${next}px` })}
          />
          <SelectControl
            label="Object fit"
            value={String(aboutValue.style.objectFit ?? "cover")}
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
            ]}
            onChange={(next) => updateStyle({ objectFit: next as "cover" | "contain" })}
          />
          <SelectControl
            label="Object position"
            value={String(aboutValue.style.objectPosition ?? "center")}
            options={[
              { label: "Center", value: "center" },
              { label: "Top", value: "top" },
              { label: "Bottom", value: "bottom" },
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
            onChange={(next) =>
              updateStyle({
                objectPosition: next as "center" | "top" | "bottom" | "left" | "right",
              })
            }
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(aboutValue.style.imageBorderRadius, 18)}
            min={0}
            max={48}
            onChange={(next) => updateStyle({ imageBorderRadius: `${next}px` })}
          />
          <ToggleControl
            label="Image border"
            checked={Boolean(aboutValue.style.imageBorderEnabled)}
            onChange={(next) => updateStyle({ imageBorderEnabled: next })}
          />
          <ColorControl
            label="Border color"
            value={String(aboutValue.style.imageBorderColor ?? "#e2e8f0")}
            onChange={(next) => updateStyle({ imageBorderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(aboutValue.style.imageBorderWidth, 1)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ imageBorderWidth: `${next}px` })}
          />
          <SelectControl
            label="Image shadow"
            value={String(aboutValue.style.imageShadow ?? "medium")}
            options={[
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
            onChange={(next) =>
              updateStyle({ imageShadow: next as "none" | "small" | "medium" | "large" })
            }
          />
          <ToggleControl
            label="Image hover zoom"
            checked={aboutValue.style.imageZoomOnHover !== false}
            onChange={(next) => updateStyle({ imageZoomOnHover: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Eyebrow typography
          </div>
          <ColorControl
            label="Text color"
            value={String(aboutValue.style.eyebrowColor ?? "#2563eb")}
            onChange={(next) => updateStyle({ eyebrowColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(aboutValue.style.eyebrowFontSize, 12)}
            min={10}
            max={20}
            onChange={(next) => updateStyle({ eyebrowFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(aboutValue.style.eyebrowFontWeight ?? "700")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ eyebrowFontWeight: next })}
          />
          <NumberControl
            label="Letter spacing (px)"
            value={toPxNumber(aboutValue.style.eyebrowLetterSpacing, 2)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ eyebrowLetterSpacing: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Heading typography
          </div>
          <ColorControl
            label="Text color"
            value={String(aboutValue.style.headingColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ headingColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(aboutValue.style.headingFontSize, 36)}
            min={18}
            max={64}
            onChange={(next) => updateStyle({ headingFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(aboutValue.style.headingFontWeight ?? "700")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ headingFontWeight: next })}
          />
          <NumberControl
            label="Line height"
            value={Number(aboutValue.style.headingLineHeight ?? 1.2)}
            min={1}
            max={2}
            step={0.05}
            onChange={(next) => updateStyle({ headingLineHeight: String(next) })}
          />
          <NumberControl
            label="Margin bottom (px)"
            value={toPxNumber(aboutValue.style.headingMarginBottom, 16)}
            min={0}
            max={48}
            onChange={(next) => updateStyle({ headingMarginBottom: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Description typography
          </div>
          <ColorControl
            label="Text color"
            value={String(aboutValue.style.descriptionColor ?? "#475569")}
            onChange={(next) => updateStyle({ descriptionColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(aboutValue.style.descriptionFontSize, 16)}
            min={12}
            max={28}
            onChange={(next) => updateStyle({ descriptionFontSize: `${next}px` })}
          />
          <NumberControl
            label="Line height"
            value={Number(aboutValue.style.descriptionLineHeight ?? 1.7)}
            min={1}
            max={2.4}
            step={0.05}
            onChange={(next) => updateStyle({ descriptionLineHeight: String(next) })}
          />
          <NumberControl
            label="Margin bottom (px)"
            value={toPxNumber(aboutValue.style.descriptionMarginBottom, 20)}
            min={0}
            max={48}
            onChange={(next) => updateStyle({ descriptionMarginBottom: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Feature list
          </div>
          <ColorControl
            label="Text color"
            value={String(aboutValue.style.featureColor ?? "#334155")}
            onChange={(next) => updateStyle({ featureColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(aboutValue.style.featureFontSize, 15)}
            min={12}
            max={24}
            onChange={(next) => updateStyle({ featureFontSize: `${next}px` })}
          />
          <ColorControl
            label="Icon color"
            value={String(aboutValue.style.featureIconColor ?? "#2563eb")}
            onChange={(next) => updateStyle({ featureIconColor: next })}
          />
          <NumberControl
            label="Item gap (px)"
            value={toPxNumber(aboutValue.style.featureItemGap, 10)}
            min={0}
            max={32}
            onChange={(next) => updateStyle({ featureItemGap: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Button
          </div>
          <SelectControl
            label="Button alignment"
            value={String(aboutValue.style.buttonAlignment ?? "left")}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            onChange={(next) =>
              updateStyle({ buttonAlignment: next as "left" | "center" | "right" })
            }
          />
          <ColorControl
            label="Background color"
            value={String(aboutValue.style.buttonBackgroundColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ buttonBackgroundColor: next })}
          />
          <ColorControl
            label="Text color"
            value={String(aboutValue.style.buttonTextColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ buttonTextColor: next })}
          />
          <ColorControl
            label="Border color"
            value={String(aboutValue.style.buttonBorderColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ buttonBorderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(aboutValue.style.buttonBorderWidth, 1)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ buttonBorderWidth: `${next}px` })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(aboutValue.style.buttonBorderRadius, 10)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ buttonBorderRadius: `${next}px` })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(aboutValue.style.buttonFontSize, 14)}
            min={11}
            max={24}
            onChange={(next) => updateStyle({ buttonFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(aboutValue.style.buttonFontWeight ?? "600")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ buttonFontWeight: next })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(aboutValue.style.buttonPaddingX, 20)}
            min={8}
            max={48}
            onChange={(next) => updateStyle({ buttonPaddingX: `${next}px` })}
          />
          <NumberControl
            label="Vertical padding (px)"
            value={toPxNumber(aboutValue.style.buttonPaddingY, 12)}
            min={4}
            max={32}
            onChange={(next) => updateStyle({ buttonPaddingY: `${next}px` })}
          />
          <ColorControl
            label="Hover background color"
            value={String(aboutValue.style.buttonHoverBackgroundColor ?? "#1e293b")}
            onChange={(next) => updateStyle({ buttonHoverBackgroundColor: next })}
          />
          <ColorControl
            label="Hover text color"
            value={String(aboutValue.style.buttonHoverTextColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ buttonHoverTextColor: next })}
          />
          <ColorControl
            label="Hover border color"
            value={String(aboutValue.style.buttonHoverBorderColor ?? "#1e293b")}
            onChange={(next) => updateStyle({ buttonHoverBorderColor: next })}
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <SelectControl
            label="Tablet layout"
            value={String(aboutValue.responsive.tabletLayout ?? "columns")}
            options={[
              { label: "Keep columns side by side", value: "columns" },
              { label: "Stack content and image", value: "stack" },
            ]}
            onChange={(next) =>
              updateResponsive({ tabletLayout: next as "columns" | "stack" })
            }
          />
          <SelectControl
            label="Mobile order"
            value={String(aboutValue.responsive.mobileOrder ?? "content-image")}
            options={[
              { label: "Content then image", value: "content-image" },
              { label: "Image then content", value: "image-content" },
            ]}
            onChange={(next) =>
              updateResponsive({
                mobileOrder: next as "content-image" | "image-content",
              })
            }
          />
          <SelectControl
            label="Mobile content alignment"
            value={String(aboutValue.responsive.mobileContentAlignment ?? "left")}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            onChange={(next) =>
              updateResponsive({
                mobileContentAlignment: next as "left" | "center" | "right",
              })
            }
          />
          <ToggleControl
            label="Hide on mobile"
            checked={aboutValue.responsive.hideOnMobile ?? false}
            onChange={(next) => updateResponsive({ hideOnMobile: next })}
          />
          <ToggleControl
            label="Hide on tablet"
            checked={aboutValue.responsive.hideOnTablet ?? false}
            onChange={(next) => updateResponsive({ hideOnTablet: next })}
          />
          <ToggleControl
            label="Hide on desktop"
            checked={aboutValue.responsive.hideOnDesktop ?? false}
            onChange={(next) => updateResponsive({ hideOnDesktop: next })}
          />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl
            label="Custom ID"
            value={aboutValue.advanced.id || ""}
            onChange={(next) => updateAdvanced({ id: next })}
          />
          <TextControl
            label="Custom CSS classes"
            value={aboutValue.advanced.className || ""}
            onChange={(next) => updateAdvanced({ className: next })}
          />
          <ToggleControl
            label="Visible"
            checked={aboutValue.advanced.visibility !== false}
            onChange={(next) => updateAdvanced({ visibility: next })}
          />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[12px] leading-5 text-slate-500">
            Image uses editable alt text and the Learn More link keeps an accessible label. Prefer
            high-contrast colors for heading and button.
          </div>
        </div>
      }
    />
  );
}
