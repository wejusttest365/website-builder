import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import {
  AlignmentControl,
  ColorControl,
  ImageControl,
  NumberControl,
  SelectControl,
  SliderControl,
  TextAreaControl,
  TextControl,
  ToggleControl,
} from "@/components/builder/property-controls";
import { getAssetValue, normalizeImagePickerValue } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";
import {
  applyCtaVariant,
  clampCtaOpacity,
  defaultCtaWidgetData,
  isCtaWidgetData,
  type CtaAlignment,
  type CtaBackgroundMode,
  type CtaBackgroundPosition,
  type CtaBackgroundRepeat,
  type CtaBackgroundSize,
  type CtaButtonLayout,
  type CtaGradientDirection,
  type CtaVariant,
  type CtaVerticalAlign,
  type CtaWidgetData,
} from "./CTATypes";

export interface CtaPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
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
  | "paragraph"
  | "primaryButton"
  | "secondaryButton"
  | "background"
  | "general";

function resolveFocus(elementKey: string): FocusPart {
  if (!elementKey) return "general";
  if (elementKey === "eyebrow") return "eyebrow";
  if (elementKey === "heading") return "heading";
  if (elementKey === "paragraph") return "paragraph";
  if (elementKey === "primaryButton") return "primaryButton";
  if (elementKey === "secondaryButton") return "secondaryButton";
  if (elementKey === "background" || elementKey === "overlay") return "background";
  return "general";
}

const FONT_WEIGHT_OPTIONS = [
  { label: "400 ë¿¯Â½ Regular", value: "400" },
  { label: "500 ë¿¯Â½ Medium", value: "500" },
  { label: "600 ë¿¯Â½ Semibold", value: "600" },
  { label: "700 ë¿¯Â½ Bold", value: "700" },
];

const GRADIENT_DIRECTION_OPTIONS = [
  { label: "Left to right", value: "left-right" },
  { label: "Right to left", value: "right-left" },
  { label: "Top to bottom", value: "top-bottom" },
  { label: "Bottom to top", value: "bottom-top" },
  { label: "Diagonal", value: "diagonal" },
];

export function CTAProperties({
  value = defaultCtaWidgetData,
  onChange,
  onClose,
}: CtaPropertiesProps) {
  const ctaValue: CtaWidgetData = isCtaWidgetData(value) ? value : defaultCtaWidgetData;
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectElement = useBuilder((s) => s.selectElement);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const section = (pageOf(project)?.sections ?? []).find((s) => s.id === selectedSectionId) ?? null;

  const updateContent = (patch: Partial<CtaWidgetData["content"]>) =>
    onChange({ ...ctaValue, content: { ...ctaValue.content, ...patch } });
  const updateStyle = (patch: Partial<CtaWidgetData["style"]>) =>
    onChange({ ...ctaValue, style: { ...ctaValue.style, ...patch } });
  const updateLayout = (patch: Partial<CtaWidgetData["layout"]>) =>
    onChange({ ...ctaValue, layout: { ...ctaValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<CtaWidgetData["responsive"]>) =>
    onChange({ ...ctaValue, responsive: { ...ctaValue.responsive, ...patch } });
  const updateAdvanced = (patch: Partial<CtaWidgetData["advanced"]>) =>
    onChange({ ...ctaValue, advanced: { ...ctaValue.advanced, ...patch } });

  const focus = useMemo(
    () => resolveFocus(String(selectedElement?.elementKey ?? "")),
    [selectedElement?.elementKey],
  );

  const selectChild = (
    elementKey: string,
    elementType: "text" | "image" | "button" | "container",
  ) => {
    if (!section?.widgetInstance) return;
    selectElement({
      kind: "widget",
      index: null,
      tag: elementType === "button" ? "a" : elementType === "image" ? "div" : "div",
      sectionId: section.id,
      widgetId: section.widgetInstance.id,
      parentWidgetId: section.widgetInstance.id,
      childId: null,
      elementKey,
      elementType,
    });
  };

  const applyBackgroundImageSrc = (next: string) => {
    if (!next) {
      updateContent({ backgroundImageSrc: "", backgroundImageName: "" });
      return;
    }
    const normalized = normalizeImagePickerValue(
      next,
      ctaValue.content.backgroundImageSrc as any,
      project?.assets as any,
    );
    const name =
      typeof normalized === "object" && normalized
        ? String((normalized as any).filename || "")
        : "";
    updateContent({ backgroundImageSrc: normalized as any, backgroundImageName: name });
  };

  const backgroundMode = (ctaValue.style.backgroundMode || "gradient") as CtaBackgroundMode;
  const showEyebrow = focus === "general" || focus === "eyebrow";
  const showHeading = focus === "general" || focus === "heading";
  const showParagraph = focus === "general" || focus === "paragraph";
  const showPrimary = focus === "general" || focus === "primaryButton";
  const showSecondary = focus === "general" || focus === "secondaryButton";
  const showBackgroundImage = focus === "general" || focus === "background";

  const backgroundSummary =
    backgroundMode === "solid"
      ? "Solid color"
      : backgroundMode === "image"
        ? "Background image"
        : "Linear gradient";

  return (
    <PropertyPanel
      title="Call To Action"
      badgeLabel="CTA"
      badgeIcon={<FontAwesomeIcon icon={faBullhorn} className="h-3.5 w-3.5" />}
      onClose={onClose}
      variantControl={
        <SelectControl
          label="Variant"
          value={ctaValue.variant}
          options={[
            { label: "Gradient / Color CTA", value: "Gradient / Color CTA" },
            { label: "Background Image CTA", value: "Background Image CTA" },
          ]}
          onChange={(next) => onChange(applyCtaVariant(ctaValue, next as CtaVariant))}
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
                checked={ctaValue.content.showEyebrow !== false}
                onChange={(next) => {
                  updateContent({ showEyebrow: next });
                  if (next) selectChild("eyebrow", "text");
                }}
              />
              <TextControl
                label="Eyebrow text"
                value={String(ctaValue.content.eyebrow ?? "")}
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
                checked={ctaValue.content.showHeading !== false}
                onChange={(next) => {
                  updateContent({ showHeading: next });
                  if (next) selectChild("heading", "text");
                }}
              />
              <TextAreaControl
                label="Heading text"
                value={String(ctaValue.content.heading ?? "")}
                onChange={(next) => updateContent({ heading: next })}
              />
            </div>
          ) : null}

          {showParagraph ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Paragraph
              </div>
              <ToggleControl
                label="Enable paragraph"
                checked={ctaValue.content.showParagraph !== false}
                onChange={(next) => {
                  updateContent({ showParagraph: next });
                  if (next) selectChild("paragraph", "text");
                }}
              />
              <TextAreaControl
                label="Paragraph text"
                value={String(ctaValue.content.paragraph ?? "")}
                onChange={(next) => updateContent({ paragraph: next })}
              />
            </div>
          ) : null}

          {showPrimary ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Primary button
              </div>
              <ToggleControl
                label="Enable primary button"
                checked={ctaValue.content.showPrimaryButton !== false}
                onChange={(next) => {
                  updateContent({ showPrimaryButton: next });
                  if (next) selectChild("primaryButton", "button");
                }}
              />
              <TextControl
                label="Button label"
                value={String(ctaValue.content.primaryButtonLabel ?? "")}
                onChange={(next) => updateContent({ primaryButtonLabel: next })}
              />
              <TextControl
                label="Button URL"
                value={String(ctaValue.content.primaryButtonUrl ?? "")}
                onChange={(next) => updateContent({ primaryButtonUrl: next })}
              />
              <ToggleControl
                label="Open in new tab"
                checked={Boolean(ctaValue.content.primaryOpenInNewTab)}
                onChange={(next) => updateContent({ primaryOpenInNewTab: next })}
              />
            </div>
          ) : null}

          {showSecondary ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Secondary button
              </div>
              <ToggleControl
                label="Enable secondary button"
                checked={ctaValue.content.showSecondaryButton !== false}
                onChange={(next) => {
                  updateContent({ showSecondaryButton: next });
                  if (next) selectChild("secondaryButton", "button");
                }}
              />
              <TextControl
                label="Button label"
                value={String(ctaValue.content.secondaryButtonLabel ?? "")}
                onChange={(next) => updateContent({ secondaryButtonLabel: next })}
              />
              <TextControl
                label="Button URL"
                value={String(ctaValue.content.secondaryButtonUrl ?? "")}
                onChange={(next) => updateContent({ secondaryButtonUrl: next })}
              />
              <ToggleControl
                label="Open in new tab"
                checked={Boolean(ctaValue.content.secondaryOpenInNewTab)}
                onChange={(next) => updateContent({ secondaryOpenInNewTab: next })}
              />
            </div>
          ) : null}

          {showBackgroundImage && backgroundMode === "image" ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Background image
              </div>
              <ImageControl
                label="Background image"
                variant="background"
                value={resolveImageSrc(ctaValue.content.backgroundImageSrc)}
                onChange={applyBackgroundImageSrc}
                showAlt
                alt={String(ctaValue.content.backgroundImageAlt ?? "")}
                onAltChange={(next) => updateContent({ backgroundImageAlt: next })}
                decorative={Boolean((ctaValue.content as { backgroundImageDecorative?: boolean }).backgroundImageDecorative)}
                onDecorativeChange={(next) =>
                  updateContent({
                    backgroundImageDecorative: next,
                    backgroundImageAlt: next ? "" : ctaValue.content.backgroundImageAlt,
                  } as any)
                }
              />
            </div>
          ) : null}
        </div>
      }
      backgroundSummary={backgroundSummary}
      background={
        <div className="space-y-2.5">
          <SelectControl
            label="Background mode"
            value={backgroundMode}
            options={[
              { label: "Solid color", value: "solid" },
              { label: "Linear gradient", value: "gradient" },
              { label: "Background image", value: "image" },
            ]}
            onChange={(next) => updateStyle({ backgroundMode: next as CtaBackgroundMode })}
          />

          {backgroundMode === "solid" ? (
            <ColorControl
              label="Background color"
              value={String(ctaValue.style.backgroundColor ?? "#2563eb")}
              onChange={(next) => updateStyle({ backgroundColor: next })}
            />
          ) : null}

          {backgroundMode === "gradient" ? (
            <>
              <ToggleControl
                label="Enable gradient"
                checked={ctaValue.style.gradientEnabled !== false}
                onChange={(next) => updateStyle({ gradientEnabled: next })}
              />
              <ColorControl
                label="Gradient start color"
                value={String(ctaValue.style.gradientStart ?? "#2563eb")}
                onChange={(next) => updateStyle({ gradientStart: next })}
              />
              <ColorControl
                label="Gradient end color"
                value={String(ctaValue.style.gradientEnd ?? "#7c3aed")}
                onChange={(next) => updateStyle({ gradientEnd: next })}
              />
              <SelectControl
                label="Gradient direction"
                value={String(ctaValue.style.gradientDirection ?? "left-right")}
                options={GRADIENT_DIRECTION_OPTIONS}
                onChange={(next) =>
                  updateStyle({ gradientDirection: next as CtaGradientDirection })
                }
              />
              <ColorControl
                label="Fallback solid color"
                value={String(ctaValue.style.backgroundColor ?? "#2563eb")}
                onChange={(next) => updateStyle({ backgroundColor: next })}
              />
            </>
          ) : null}

          {backgroundMode === "image" ? (
            <>
              <ImageControl
                label="Background image"
                variant="background"
                value={resolveImageSrc(ctaValue.content.backgroundImageSrc)}
                onChange={applyBackgroundImageSrc}
                showAlt
                alt={String(ctaValue.content.backgroundImageAlt ?? "")}
                onAltChange={(next) => updateContent({ backgroundImageAlt: next })}
                decorative={Boolean((ctaValue.content as { backgroundImageDecorative?: boolean }).backgroundImageDecorative)}
                onDecorativeChange={(next) =>
                  updateContent({
                    backgroundImageDecorative: next,
                    backgroundImageAlt: next ? "" : ctaValue.content.backgroundImageAlt,
                  } as any)
                }
              />
              <SelectControl
                label="Background size"
                value={String(ctaValue.style.backgroundSize ?? "cover")}
                options={[
                  { label: "Cover", value: "cover" },
                  { label: "Contain", value: "contain" },
                ]}
                onChange={(next) =>
                  updateStyle({ backgroundSize: next as CtaBackgroundSize })
                }
              />
              <SelectControl
                label="Background position"
                value={String(ctaValue.style.backgroundPosition ?? "center")}
                options={[
                  { label: "Center", value: "center" },
                  { label: "Top", value: "top" },
                  { label: "Bottom", value: "bottom" },
                  { label: "Left", value: "left" },
                  { label: "Right", value: "right" },
                ]}
                onChange={(next) =>
                  updateStyle({ backgroundPosition: next as CtaBackgroundPosition })
                }
              />
              <SelectControl
                label="Background repeat"
                value={String(ctaValue.style.backgroundRepeat ?? "no-repeat")}
                options={[
                  { label: "No repeat", value: "no-repeat" },
                  { label: "Repeat", value: "repeat" },
                ]}
                onChange={(next) =>
                  updateStyle({ backgroundRepeat: next as CtaBackgroundRepeat })
                }
              />
              <ColorControl
                label="Fallback background color"
                value={String(ctaValue.style.backgroundColor ?? "#0f172a")}
                onChange={(next) => updateStyle({ backgroundColor: next })}
              />
            </>
          ) : null}

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Overlay
          </div>
          <ToggleControl
            label="Enable overlay"
            checked={Boolean(ctaValue.style.overlayEnabled)}
            onChange={(next) => updateStyle({ overlayEnabled: next })}
          />
          {ctaValue.style.overlayEnabled ? (
            <>
              <ColorControl
                label="Overlay color"
                value={String(ctaValue.style.overlayColor ?? "#0f172a")}
                onChange={(next) => updateStyle({ overlayColor: next })}
              />
              <SliderControl
                label="Overlay opacity"
                value={clampCtaOpacity(ctaValue.style.overlayOpacity, 60)}
                min={0}
                max={100}
                unit="%"
                onChange={(next) => updateStyle({ overlayOpacity: next })}
              />
              <ToggleControl
                label="Use gradient overlay"
                checked={Boolean(ctaValue.style.overlayGradientEnabled)}
                onChange={(next) => updateStyle({ overlayGradientEnabled: next })}
              />
              {ctaValue.style.overlayGradientEnabled ? (
                <>
                  <ColorControl
                    label="Overlay gradient start"
                    value={String(ctaValue.style.overlayGradientStart ?? "#0f172a")}
                    onChange={(next) => updateStyle({ overlayGradientStart: next })}
                  />
                  <ColorControl
                    label="Overlay gradient end"
                    value={String(ctaValue.style.overlayGradientEnd ?? "#1e293b")}
                    onChange={(next) => updateStyle({ overlayGradientEnd: next })}
                  />
                  <SelectControl
                    label="Overlay gradient direction"
                    value={String(ctaValue.style.overlayGradientDirection ?? "top-bottom")}
                    options={GRADIENT_DIRECTION_OPTIONS}
                    onChange={(next) =>
                      updateStyle({
                        overlayGradientDirection: next as CtaGradientDirection,
                      })
                    }
                  />
                </>
              ) : null}
            </>
          ) : null}
        </div>
      }
      layout={
        <div className="space-y-2.5">
          <NumberControl
            label="Top padding (px)"
            value={toPxNumber(ctaValue.layout.paddingTop, 88)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingTop: `${next}px` })}
          />
          <NumberControl
            label="Bottom padding (px)"
            value={toPxNumber(ctaValue.layout.paddingBottom, 88)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingBottom: `${next}px` })}
          />
          <NumberControl
            label="Minimum height (px)"
            value={toPxNumber(ctaValue.style.minHeight, 380)}
            min={160}
            max={900}
            onChange={(next) => updateStyle({ minHeight: `${next}px` })}
          />
          <NumberControl
            label="Content max width (px)"
            value={toPxNumber(ctaValue.style.contentMaxWidth, 760)}
            min={320}
            max={1400}
            onChange={(next) => updateStyle({ contentMaxWidth: `${next}px` })}
          />
          <NumberControl
            label="Content horizontal padding (px)"
            value={toPxNumber(ctaValue.style.contentPaddingX ?? ctaValue.layout.paddingX, 24)}
            min={0}
            max={80}
            onChange={(next) =>
              onChange({
                ...ctaValue,
                style: { ...ctaValue.style, contentPaddingX: `${next}px` },
                layout: { ...ctaValue.layout, paddingX: `${next}px` },
              })
            }
          />
          <AlignmentControl
            label="Horizontal alignment"
            value={(ctaValue.style.horizontalAlign || "center") as CtaAlignment}
            onChange={(next) => updateStyle({ horizontalAlign: next })}
          />
          <SelectControl
            label="Vertical alignment"
            value={String(ctaValue.style.verticalAlign ?? "center")}
            options={[
              { label: "Top", value: "top" },
              { label: "Center", value: "center" },
              { label: "Bottom", value: "bottom" },
            ]}
            onChange={(next) =>
              updateStyle({ verticalAlign: next as CtaVerticalAlign })
            }
          />
        </div>
      }
      typography={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Eyebrow
          </div>
          <ColorControl
            label="Text color"
            value={String(ctaValue.style.eyebrowColor ?? "#e0e7ff")}
            onChange={(next) => updateStyle({ eyebrowColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(ctaValue.style.eyebrowFontSize, 12)}
            min={10}
            max={24}
            onChange={(next) => updateStyle({ eyebrowFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(ctaValue.style.eyebrowFontWeight ?? "700")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ eyebrowFontWeight: next })}
          />
          <NumberControl
            label="Letter spacing (px)"
            value={toPxNumber(ctaValue.style.eyebrowLetterSpacing, 2)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ eyebrowLetterSpacing: `${next}px` })}
          />
          <ColorControl
            label="Background color"
            value={String(ctaValue.style.eyebrowBackgroundColor ?? "rgba(255,255,255,0.14)")}
            onChange={(next) => updateStyle({ eyebrowBackgroundColor: next })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(ctaValue.style.eyebrowBorderRadius, 999)}
            min={0}
            max={999}
            onChange={(next) => updateStyle({ eyebrowBorderRadius: `${next}px` })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(ctaValue.style.eyebrowPaddingX, 14)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ eyebrowPaddingX: `${next}px` })}
          />
          <NumberControl
            label="Vertical padding (px)"
            value={toPxNumber(ctaValue.style.eyebrowPaddingY, 6)}
            min={0}
            max={24}
            onChange={(next) => updateStyle({ eyebrowPaddingY: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Heading
          </div>
          <ColorControl
            label="Text color"
            value={String(ctaValue.style.headingColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ headingColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(ctaValue.style.headingFontSize, 44)}
            min={18}
            max={80}
            onChange={(next) => updateStyle({ headingFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(ctaValue.style.headingFontWeight ?? "700")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ headingFontWeight: next })}
          />
          <TextControl
            label="Line height"
            value={String(ctaValue.style.headingLineHeight ?? "1.15")}
            onChange={(next) => updateStyle({ headingLineHeight: next })}
          />
          <NumberControl
            label="Maximum width (px)"
            value={toPxNumber(ctaValue.style.headingMaxWidth, 720)}
            min={200}
            max={1200}
            onChange={(next) => updateStyle({ headingMaxWidth: `${next}px` })}
          />
          <NumberControl
            label="Margin bottom (px)"
            value={toPxNumber(ctaValue.style.headingMarginBottom, 16)}
            min={0}
            max={64}
            onChange={(next) => updateStyle({ headingMarginBottom: `${next}px` })}
          />
          <ToggleControl
            label="Text shadow"
            checked={Boolean(ctaValue.style.headingTextShadow)}
            onChange={(next) => updateStyle({ headingTextShadow: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Paragraph
          </div>
          <ColorControl
            label="Text color"
            value={String(ctaValue.style.paragraphColor ?? "#eef2ff")}
            onChange={(next) => updateStyle({ paragraphColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(ctaValue.style.paragraphFontSize, 18)}
            min={12}
            max={32}
            onChange={(next) => updateStyle({ paragraphFontSize: `${next}px` })}
          />
          <TextControl
            label="Line height"
            value={String(ctaValue.style.paragraphLineHeight ?? "1.7")}
            onChange={(next) => updateStyle({ paragraphLineHeight: next })}
          />
          <NumberControl
            label="Maximum width (px)"
            value={toPxNumber(ctaValue.style.paragraphMaxWidth, 640)}
            min={200}
            max={1000}
            onChange={(next) => updateStyle({ paragraphMaxWidth: `${next}px` })}
          />
          <NumberControl
            label="Margin bottom (px)"
            value={toPxNumber(ctaValue.style.paragraphMarginBottom, 28)}
            min={0}
            max={64}
            onChange={(next) => updateStyle({ paragraphMarginBottom: `${next}px` })}
          />
        </div>
      }
      style={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Buttons
          </div>
          <SelectControl
            label="Button layout"
            value={String(ctaValue.style.buttonLayout ?? "horizontal")}
            options={[
              { label: "Horizontal", value: "horizontal" },
              { label: "Vertical", value: "vertical" },
            ]}
            onChange={(next) => updateStyle({ buttonLayout: next as CtaButtonLayout })}
          />
          <AlignmentControl
            label="Button alignment"
            value={(ctaValue.style.buttonAlignment || "center") as CtaAlignment}
            onChange={(next) => updateStyle({ buttonAlignment: next })}
          />
          <NumberControl
            label="Gap (px)"
            value={toPxNumber(ctaValue.style.buttonGap, 12)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ buttonGap: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Primary button
          </div>
          <ColorControl
            label="Background color"
            value={String(ctaValue.style.primaryBackgroundColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ primaryBackgroundColor: next })}
          />
          <ColorControl
            label="Text color"
            value={String(ctaValue.style.primaryTextColor ?? "#1e3a8a")}
            onChange={(next) => updateStyle({ primaryTextColor: next })}
          />
          <ColorControl
            label="Border color"
            value={String(ctaValue.style.primaryBorderColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ primaryBorderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(ctaValue.style.primaryBorderWidth, 1)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ primaryBorderWidth: `${next}px` })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(ctaValue.style.primaryBorderRadius, 10)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ primaryBorderRadius: `${next}px` })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(ctaValue.style.primaryFontSize, 15)}
            min={12}
            max={24}
            onChange={(next) => updateStyle({ primaryFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(ctaValue.style.primaryFontWeight ?? "600")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ primaryFontWeight: next })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(ctaValue.style.primaryPaddingX, 24)}
            min={8}
            max={48}
            onChange={(next) => updateStyle({ primaryPaddingX: `${next}px` })}
          />
          <NumberControl
            label="Vertical padding (px)"
            value={toPxNumber(ctaValue.style.primaryPaddingY, 14)}
            min={4}
            max={32}
            onChange={(next) => updateStyle({ primaryPaddingY: `${next}px` })}
          />
          <ColorControl
            label="Hover background"
            value={String(ctaValue.style.primaryHoverBackgroundColor ?? "#f8fafc")}
            onChange={(next) => updateStyle({ primaryHoverBackgroundColor: next })}
          />
          <ColorControl
            label="Hover text color"
            value={String(ctaValue.style.primaryHoverTextColor ?? "#1e3a8a")}
            onChange={(next) => updateStyle({ primaryHoverTextColor: next })}
          />
          <ColorControl
            label="Hover border color"
            value={String(ctaValue.style.primaryHoverBorderColor ?? "#f8fafc")}
            onChange={(next) => updateStyle({ primaryHoverBorderColor: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Secondary button
          </div>
          <ColorControl
            label="Background color"
            value={String(ctaValue.style.secondaryBackgroundColor ?? "transparent")}
            onChange={(next) => updateStyle({ secondaryBackgroundColor: next })}
          />
          <ColorControl
            label="Text color"
            value={String(ctaValue.style.secondaryTextColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ secondaryTextColor: next })}
          />
          <ColorControl
            label="Border color"
            value={String(ctaValue.style.secondaryBorderColor ?? "rgba(255,255,255,0.75)")}
            onChange={(next) => updateStyle({ secondaryBorderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(ctaValue.style.secondaryBorderWidth, 1)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ secondaryBorderWidth: `${next}px` })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(ctaValue.style.secondaryBorderRadius, 10)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ secondaryBorderRadius: `${next}px` })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(ctaValue.style.secondaryFontSize, 15)}
            min={12}
            max={24}
            onChange={(next) => updateStyle({ secondaryFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(ctaValue.style.secondaryFontWeight ?? "600")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ secondaryFontWeight: next })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(ctaValue.style.secondaryPaddingX, 24)}
            min={8}
            max={48}
            onChange={(next) => updateStyle({ secondaryPaddingX: `${next}px` })}
          />
          <NumberControl
            label="Vertical padding (px)"
            value={toPxNumber(ctaValue.style.secondaryPaddingY, 14)}
            min={4}
            max={32}
            onChange={(next) => updateStyle({ secondaryPaddingY: `${next}px` })}
          />
          <ColorControl
            label="Hover background"
            value={String(ctaValue.style.secondaryHoverBackgroundColor ?? "rgba(255,255,255,0.14)")}
            onChange={(next) => updateStyle({ secondaryHoverBackgroundColor: next })}
          />
          <ColorControl
            label="Hover text color"
            value={String(ctaValue.style.secondaryHoverTextColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ secondaryHoverTextColor: next })}
          />
          <ColorControl
            label="Hover border color"
            value={String(ctaValue.style.secondaryHoverBorderColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ secondaryHoverBorderColor: next })}
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Desktop
          </div>
          <NumberControl
            label="Desktop minimum height (px)"
            value={toPxNumber(ctaValue.responsive.desktopMinHeight, 380)}
            min={160}
            max={900}
            onChange={(next) => updateResponsive({ desktopMinHeight: `${next}px` })}
          />
          <NumberControl
            label="Desktop heading font size (px)"
            value={toPxNumber(ctaValue.responsive.desktopHeadingFontSize, 44)}
            min={18}
            max={80}
            onChange={(next) => updateResponsive({ desktopHeadingFontSize: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tablet
          </div>
          <NumberControl
            label="Tablet minimum height (px)"
            value={toPxNumber(ctaValue.responsive.tabletMinHeight, 340)}
            min={160}
            max={800}
            onChange={(next) => updateResponsive({ tabletMinHeight: `${next}px` })}
          />
          <NumberControl
            label="Tablet heading font size (px)"
            value={toPxNumber(ctaValue.responsive.tabletHeadingFontSize, 36)}
            min={16}
            max={64}
            onChange={(next) => updateResponsive({ tabletHeadingFontSize: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Mobile
          </div>
          <NumberControl
            label="Mobile minimum height (px)"
            value={toPxNumber(ctaValue.responsive.mobileMinHeight, 300)}
            min={140}
            max={700}
            onChange={(next) => updateResponsive({ mobileMinHeight: `${next}px` })}
          />
          <NumberControl
            label="Mobile heading font size (px)"
            value={toPxNumber(ctaValue.responsive.mobileHeadingFontSize, 30)}
            min={16}
            max={48}
            onChange={(next) => updateResponsive({ mobileHeadingFontSize: `${next}px` })}
          />
          <ToggleControl
            label="Stack buttons on mobile"
            checked={ctaValue.responsive.stackButtonsOnMobile !== false}
            onChange={(next) => updateResponsive({ stackButtonsOnMobile: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Visibility
          </div>
          <ToggleControl
            label="Hide on mobile"
            checked={Boolean(ctaValue.responsive.hideOnMobile)}
            onChange={(next) => updateResponsive({ hideOnMobile: next })}
          />
          <ToggleControl
            label="Hide on tablet"
            checked={Boolean(ctaValue.responsive.hideOnTablet)}
            onChange={(next) => updateResponsive({ hideOnTablet: next })}
          />
          <ToggleControl
            label="Hide on desktop"
            checked={Boolean(ctaValue.responsive.hideOnDesktop)}
            onChange={(next) => updateResponsive({ hideOnDesktop: next })}
          />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl
            label="Custom ID"
            value={String(ctaValue.advanced.id ?? "")}
            onChange={(next) => updateAdvanced({ id: next })}
          />
          <TextControl
            label="Custom CSS classes"
            value={String(ctaValue.advanced.className ?? "")}
            onChange={(next) => updateAdvanced({ className: next })}
          />
          <ToggleControl
            label="Visible"
            checked={ctaValue.advanced.visibility !== false}
            onChange={(next) => updateAdvanced({ visibility: next })}
          />
        </div>
      }
    />
  );
}
