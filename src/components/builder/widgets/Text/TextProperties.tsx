import { defaultTextWidgetData, isTextWidgetData } from "./TextTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { SelectControl, TextControl, TextAreaControl, ColorControl, SliderControl, SpacingControl, ToggleControl, AlignmentControl, FontSizeControl } from "@/components/builder/property-controls";
import { SectionWidthProperties } from "../BaseWidget";

export interface TextPropertiesProps {
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

export function TextProperties({ value = defaultTextWidgetData, onChange, onClose }: TextPropertiesProps) {
  const textValue = isTextWidgetData(value) ? value : defaultTextWidgetData;
  const updateContent = (patch: Partial<typeof textValue.content>) => onChange({ ...textValue, content: { ...textValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof textValue.style>) => onChange({ ...textValue, style: { ...textValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof textValue.layout>) => onChange({ ...textValue, layout: { ...textValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof textValue.responsive>) => onChange({ ...textValue, responsive: { ...textValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof textValue.animation>) => onChange({ ...textValue, animation: { ...textValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof textValue.advanced>) => onChange({ ...textValue, advanced: { ...textValue.advanced, ...patch } });

  const weightValue = String(textValue.style.fontWeight ?? "400");
  const weightOptions = FONT_WEIGHT_OPTIONS.some((option) => option.value === weightValue)
    ? FONT_WEIGHT_OPTIONS
    : [{ label: weightValue || "Default", value: weightValue }, ...FONT_WEIGHT_OPTIONS];

  return (
    <PropertyPanel
      title="Text"
      onClose={onClose}
      content={
        <div className="space-y-2.5">
          <TextAreaControl label="Text content" value={String(textValue.content.text ?? "")} onChange={(next) => updateContent({ text: next })} />
          <ToggleControl label="Rich text" checked={textValue.content.richText ?? false} onChange={(next) => updateContent({ richText: next })} />
          <SelectControl
            label="Variant"
            value={textValue.variant}
            options={[
              { label: "Paragraph", value: "Paragraph" },
              { label: "Lead Text", value: "Lead Text" },
              { label: "Small Text", value: "Small Text" },
              { label: "Muted Text", value: "Muted Text" },
              { label: "Quote", value: "Quote" },
              { label: "Highlight", value: "Highlight" },
            ]}
            onChange={(next) => onChange({ ...textValue, variant: next })}
          />
        </div>
      }
      typography={
        <div className="space-y-2.5">
          <ColorControl label="Text color" value={String(textValue.style.textColor ?? "")} onChange={(next) => updateStyle({ textColor: next })} />
          <FontSizeControl label="Font size" value={textValue.style.fontSize} onChange={(next) => updateStyle({ fontSize: next })} />
          <SelectControl label="Font weight" value={weightValue} options={weightOptions} onChange={(next) => updateStyle({ fontWeight: next })} />
          <TextControl label="Line height" value={String(textValue.style.lineHeight ?? "")} onChange={(next) => updateStyle({ lineHeight: next })} />
          <TextControl label="Letter spacing" value={String(textValue.style.letterSpacing ?? "0px")} onChange={(next) => updateStyle({ letterSpacing: next })} />
          <AlignmentControl label="Text alignment" value={textValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
        </div>
      }
      layout={
        <div className="space-y-2.5">
          <SectionWidthProperties layout={textValue.layout} onChange={(patch) => updateLayout(patch)} />
          <SpacingControl label="Padding" value={textValue.layout.padding as any} onChange={(next) => updateLayout({ padding: next as any })} />
          <SpacingControl label="Margin" value={textValue.layout.margin as any} onChange={(next) => updateLayout({ margin: next as any })} />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <FontSizeControl label="Mobile font size" value={textValue.responsive.fontSizeMobile} onChange={(next) => updateResponsive({ fontSizeMobile: next })} placeholder="Inherit" />
          <FontSizeControl label="Tablet font size" value={textValue.responsive.fontSizeTablet} onChange={(next) => updateResponsive({ fontSizeTablet: next })} placeholder="Inherit" />
          <ToggleControl label="Hide on mobile" checked={textValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          <ToggleControl label="Hide on tablet" checked={textValue.responsive.hideOnTablet ?? false} onChange={(next) => updateResponsive({ hideOnTablet: next })} />
          <ToggleControl label="Hide on desktop" checked={textValue.responsive.hideOnDesktop ?? false} onChange={(next) => updateResponsive({ hideOnDesktop: next })} />
        </div>
      }
      animation={
        <div className="space-y-2.5">
          <ToggleControl label="Enable Animation" checked={textValue.animation.enabled ?? false} onChange={(next) => updateAnimation({ enabled: next })} />
          <SelectControl
            label="Animation Type"
            value={String(textValue.animation.type ?? "none")}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Zoom", value: "zoom" },
            ]}
            onChange={(next) => updateAnimation({ type: next as "none" | "fade" | "slide-up" | "zoom" })}
          />
          <SliderControl label="Duration" value={textValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={textValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl label="CSS Class" value={String(textValue.advanced.className ?? "")} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={String(textValue.advanced.id ?? "")} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={textValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
