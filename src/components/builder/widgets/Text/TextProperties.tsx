import { defaultTextWidgetData, isTextWidgetData } from "./TextTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { SelectControl } from "@/components/builder/property-panel/controls/SelectControl";
import { TextControl } from "@/components/builder/property-panel/controls/TextControl";
import { TextAreaControl } from "@/components/builder/property-panel/controls/TextAreaControl";
import { ColorControl } from "@/components/builder/property-panel/controls/ColorControl";
import { SliderControl } from "@/components/builder/property-panel/controls/SliderControl";
import { SpacingControl } from "@/components/builder/property-panel/controls/SpacingControl";
import { ToggleControl } from "@/components/builder/property-panel/controls/ToggleControl";
import { AlignmentControl } from "@/components/builder/property-panel/controls/AlignmentControl";
import { SectionWidthProperties } from "../BaseWidget";

export interface TextPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function TextProperties({ value = defaultTextWidgetData, onChange }: TextPropertiesProps) {
  const textValue = isTextWidgetData(value) ? value : defaultTextWidgetData;
  const updateContent = (patch: Partial<typeof textValue.content>) => onChange({ ...textValue, content: { ...textValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof textValue.style>) => onChange({ ...textValue, style: { ...textValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof textValue.layout>) => onChange({ ...textValue, layout: { ...textValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof textValue.responsive>) => onChange({ ...textValue, responsive: { ...textValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof textValue.animation>) => onChange({ ...textValue, animation: { ...textValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof textValue.advanced>) => onChange({ ...textValue, advanced: { ...textValue.advanced, ...patch } });

  return (
    <PropertyPanel
      title="Text"
      children={
        <div className="mb-2">
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
      content={
        <div className="space-y-2">
          <TextAreaControl label="Text Content" value={textValue.content.text} onChange={(next) => updateContent({ text: next })} />
          <ToggleControl label="Rich Text" checked={textValue.content.richText ?? false} onChange={(next) => updateContent({ richText: next })} />
        </div>
      }
      style={
        <div className="space-y-2">
          <ColorControl label="Text Color" value={textValue.style.textColor} onChange={(next) => updateStyle({ textColor: next })} />
          <TextControl label="Font Size" value={textValue.style.fontSize} onChange={(next) => updateStyle({ fontSize: next })} />
          <TextControl label="Font Weight" value={textValue.style.fontWeight} onChange={(next) => updateStyle({ fontWeight: next })} />
          <TextControl label="Line Height" value={textValue.style.lineHeight} onChange={(next) => updateStyle({ lineHeight: next })} />
          <TextControl label="Letter Spacing" value={textValue.style.letterSpacing} onChange={(next) => updateStyle({ letterSpacing: next })} />
        </div>
      }
      layout={
        <div className="space-y-2">
          <SectionWidthProperties layout={textValue.layout} onChange={(patch) => updateLayout(patch)} />
          <AlignmentControl label="Alignment" value={textValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
          <SpacingControl label="Padding" value={textValue.layout.padding} onChange={(next) => updateLayout({ padding: next })} />
          <SpacingControl label="Margin" value={textValue.layout.margin} onChange={(next) => updateLayout({ margin: next })} />
        </div>
      }
      responsive={
        <div className="space-y-2">
          <TextControl label="Mobile Font Size" value={textValue.responsive.fontSizeMobile} onChange={(next) => updateResponsive({ fontSizeMobile: next })} />
          <TextControl label="Tablet Font Size" value={textValue.responsive.fontSizeTablet} onChange={(next) => updateResponsive({ fontSizeTablet: next })} />
          <ToggleControl label="Hide on Mobile" checked={textValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          <ToggleControl label="Hide on Tablet" checked={textValue.responsive.hideOnTablet ?? false} onChange={(next) => updateResponsive({ hideOnTablet: next })} />
          <ToggleControl label="Hide on Desktop" checked={textValue.responsive.hideOnDesktop ?? false} onChange={(next) => updateResponsive({ hideOnDesktop: next })} />
        </div>
      }
      animation={
        <div className="space-y-2">
          <ToggleControl label="Enable Animation" checked={textValue.animation.enabled ?? false} onChange={(next) => updateAnimation({ enabled: next })} />
          <SelectControl
            label="Animation Type"
            value={textValue.animation.type}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Zoom", value: "zoom" },
            ]}
            onChange={(next) => updateAnimation({ type: next })}
          />
          <SliderControl label="Duration" value={textValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={textValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2">
          <TextControl label="CSS Class" value={textValue.advanced.className} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={textValue.advanced.id} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={textValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
