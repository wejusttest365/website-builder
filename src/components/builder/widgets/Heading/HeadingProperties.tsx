import { defaultHeadingWidgetData, isHeadingWidgetData } from "./HeadingTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { SelectControl, TextControl, ColorControl, SliderControl, SpacingControl, ToggleControl, AlignmentControl, FontSizeControl } from "@/components/builder/property-controls";
import { SectionWidthProperties } from "../BaseWidget";

export interface HeadingPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

const FONT_WEIGHT_OPTIONS = [
  { label: "400 · Regular", value: "400" },
  { label: "500 · Medium", value: "500" },
  { label: "600 · Semibold", value: "600" },
  { label: "700 · Bold", value: "700" },
  { label: "800 · Extra bold", value: "800" },
];

export function HeadingProperties({ value = defaultHeadingWidgetData, onChange, onClose }: HeadingPropertiesProps) {
  const headingValue = isHeadingWidgetData(value) ? value : defaultHeadingWidgetData;
  const updateContent = (patch: Partial<typeof headingValue.content>) => onChange({ ...headingValue, content: { ...headingValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof headingValue.style>) => onChange({ ...headingValue, style: { ...headingValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof headingValue.layout>) => onChange({ ...headingValue, layout: { ...headingValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof headingValue.responsive>) => onChange({ ...headingValue, responsive: { ...headingValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof headingValue.animation>) => onChange({ ...headingValue, animation: { ...headingValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof headingValue.advanced>) => onChange({ ...headingValue, advanced: { ...headingValue.advanced, ...patch } });

  const weightValue = String(headingValue.style.fontWeight ?? "500");
  const weightOptions = FONT_WEIGHT_OPTIONS.some((option) => option.value === weightValue)
    ? FONT_WEIGHT_OPTIONS
    : [{ label: weightValue || "Default", value: weightValue }, ...FONT_WEIGHT_OPTIONS];

  return (
    <PropertyPanel
      title="Heading"
      onClose={onClose}
      content={
        <div className="space-y-2.5">
          <TextControl label="Heading text" value={String(headingValue.content.text ?? "")} onChange={(next) => updateContent({ text: next })} />
          <SelectControl
            label="HTML tag"
            value={String(headingValue.content.headingLevel ?? "h2")}
            options={[
              { label: "h1", value: "h1" },
              { label: "h2", value: "h2" },
              { label: "h3", value: "h3" },
              { label: "h4", value: "h4" },
              { label: "h5", value: "h5" },
              { label: "h6", value: "h6" },
            ]}
            onChange={(next) => updateContent({ headingLevel: next as any })}
          />
          <TextControl
            label="Link (optional)"
            value={String(headingValue.content.link ?? "")}
            placeholder="https://example.com"
            onChange={(next) => updateContent({ link: next })}
          />
          <SelectControl
            label="Variant"
            value={headingValue.variant}
            options={[
              { label: "Simple", value: "Simple" },
              { label: "Section Title", value: "Section Title" },
              { label: "Centered", value: "Centered" },
              { label: "Gradient", value: "Gradient" },
              { label: "Underline", value: "Underline" },
            ]}
            onChange={(next) => onChange({ ...headingValue, variant: next })}
          />
          {headingValue.variant === "Section Title" ? (
            <TextControl label="Section Label" value={String(headingValue.content.label ?? "")} onChange={(next) => updateContent({ label: next })} />
          ) : null}
        </div>
      }
      typography={
        <div className="space-y-2.5">
          <ColorControl
            label="Text color"
            value={String(headingValue.style.textColor ?? "")}
            onChange={(next) => {
              if (headingValue.variant === "Gradient") {
                onChange({
                  ...headingValue,
                  variant: "Simple",
                  style: { ...headingValue.style, textColor: next },
                });
                return;
              }
              updateStyle({ textColor: next });
            }}
          />
          {headingValue.variant === "Gradient" ? (
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                const solidColor = String(headingValue.style.textColor || headingValue.style.gradientStart || headingValue.style.gradientEnd || "#111827").trim();
                onChange({
                  ...headingValue,
                  variant: "Simple",
                  style: { ...headingValue.style, textColor: solidColor },
                });
              }}
            >
              Use solid color
            </button>
          ) : null}
          <FontSizeControl
            label="Font size"
            value={headingValue.style.fontSize}
            onChange={(next) => updateStyle({ fontSize: next })}
          />
          <SelectControl
            label="Font weight"
            value={weightValue}
            options={weightOptions}
            onChange={(next) => updateStyle({ fontWeight: next })}
          />
          <TextControl label="Line height" value={String(headingValue.style.lineHeight ?? "")} onChange={(next) => updateStyle({ lineHeight: next })} />
          <TextControl label="Letter spacing" value={String(headingValue.style.letterSpacing ?? "0px")} onChange={(next) => updateStyle({ letterSpacing: next })} />
          <AlignmentControl label="Text alignment" value={headingValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
          {headingValue.variant === "Gradient" ? (
            <>
              <ColorControl label="Gradient Start" value={String(headingValue.style.gradientStart ?? "")} onChange={(next) => updateStyle({ gradientStart: next })} />
              <ColorControl label="Gradient End" value={String(headingValue.style.gradientEnd ?? "")} onChange={(next) => updateStyle({ gradientEnd: next })} />
            </>
          ) : null}
          {headingValue.variant === "Underline" ? (
            <ColorControl label="Underline Color" value={String(headingValue.style.underlineColor ?? "")} onChange={(next) => updateStyle({ underlineColor: next })} />
          ) : null}
        </div>
      }
      layout={
        <div className="space-y-2.5">
          <SectionWidthProperties layout={headingValue.layout} onChange={(patch) => updateLayout(patch)} />
          <SpacingControl label="Padding" value={headingValue.layout.padding} onChange={(next) => updateLayout({ padding: next as any })} />
          <SpacingControl label="Margin" value={headingValue.layout.margin} onChange={(next) => updateLayout({ margin: next as any })} />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <FontSizeControl label="Mobile font size" value={headingValue.responsive.fontSizeMobile} onChange={(next) => updateResponsive({ fontSizeMobile: next })} placeholder="Inherit" />
          <FontSizeControl label="Tablet font size" value={headingValue.responsive.fontSizeTablet} onChange={(next) => updateResponsive({ fontSizeTablet: next })} placeholder="Inherit" />
          <ToggleControl label="Hide on mobile" checked={headingValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          <ToggleControl label="Hide on tablet" checked={headingValue.responsive.hideOnTablet ?? false} onChange={(next) => updateResponsive({ hideOnTablet: next })} />
          <ToggleControl label="Hide on desktop" checked={headingValue.responsive.hideOnDesktop ?? false} onChange={(next) => updateResponsive({ hideOnDesktop: next })} />
        </div>
      }
      animation={
        <div className="space-y-2.5">
          <ToggleControl label="Enable Animation" checked={headingValue.animation.enabled ?? false} onChange={(next) => updateAnimation({ enabled: next })} />
          <SelectControl
            label="Animation Type"
            value={String(headingValue.animation.type ?? "none")}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Zoom", value: "zoom" },
            ]}
            onChange={(next) => updateAnimation({ type: next as "none" | "fade" | "slide-up" | "zoom" })}
          />
          <SliderControl label="Duration" value={headingValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={headingValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl label="CSS Class" value={String(headingValue.advanced.className ?? "")} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={String(headingValue.advanced.id ?? "")} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={headingValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
