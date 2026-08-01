import { defaultHeadingWidgetData, isHeadingWidgetData } from "./HeadingTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { SelectControl } from "@/components/builder/property-panel/controls/SelectControl";
import { TextControl } from "@/components/builder/property-panel/controls/TextControl";
import { ColorControl } from "@/components/builder/property-panel/controls/ColorControl";
import { SliderControl } from "@/components/builder/property-panel/controls/SliderControl";
import { SpacingControl } from "@/components/builder/property-panel/controls/SpacingControl";
import { ToggleControl } from "@/components/builder/property-panel/controls/ToggleControl";
import { AlignmentControl } from "@/components/builder/property-panel/controls/AlignmentControl";
import { SectionWidthProperties } from "../BaseWidget";

export interface HeadingPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function HeadingProperties({ value = defaultHeadingWidgetData, onChange }: HeadingPropertiesProps) {
  const headingValue = isHeadingWidgetData(value) ? value : defaultHeadingWidgetData;
  const updateContent = (patch: Partial<typeof headingValue.content>) => onChange({ ...headingValue, content: { ...headingValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof headingValue.style>) => onChange({ ...headingValue, style: { ...headingValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof headingValue.layout>) => onChange({ ...headingValue, layout: { ...headingValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof headingValue.responsive>) => onChange({ ...headingValue, responsive: { ...headingValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof headingValue.animation>) => onChange({ ...headingValue, animation: { ...headingValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof headingValue.advanced>) => onChange({ ...headingValue, advanced: { ...headingValue.advanced, ...patch } });

  return (
    <PropertyPanel
      title="Heading"
      children={
        <div className="mb-2">
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
        </div>
      }
      content={
        <div className="space-y-2">
          <TextControl label="Text" value={headingValue.content.text} onChange={(next) => updateContent({ text: next })} />
          <SelectControl
            label="Heading Level"
            value={headingValue.content.headingLevel}
            options={[
              { label: "H1", value: "h1" },
              { label: "H2", value: "h2" },
              { label: "H3", value: "h3" },
              { label: "H4", value: "h4" },
              { label: "H5", value: "h5" },
              { label: "H6", value: "h6" },
            ]}
            onChange={(next) => updateContent({ headingLevel: next })}
          />
          {headingValue.variant === "Section Title" ? (
            <TextControl label="Section Label" value={headingValue.content.label} onChange={(next) => updateContent({ label: next })} />
          ) : null}
        </div>
      }
      style={
        <div className="space-y-2">
          <ColorControl label="Text Color" value={headingValue.style.textColor} onChange={(next) => updateStyle({ textColor: next })} />
          <TextControl label="Font Size" value={headingValue.style.fontSize} onChange={(next) => updateStyle({ fontSize: next })} />
          <TextControl label="Font Weight" value={headingValue.style.fontWeight} onChange={(next) => updateStyle({ fontWeight: next })} />
          <TextControl label="Line Height" value={headingValue.style.lineHeight} onChange={(next) => updateStyle({ lineHeight: next })} />
          <TextControl label="Letter Spacing" value={headingValue.style.letterSpacing} onChange={(next) => updateStyle({ letterSpacing: next })} />
          {headingValue.variant === "Gradient" ? (
            <>
              <ColorControl label="Gradient Start" value={headingValue.style.gradientStart} onChange={(next) => updateStyle({ gradientStart: next })} />
              <ColorControl label="Gradient End" value={headingValue.style.gradientEnd} onChange={(next) => updateStyle({ gradientEnd: next })} />
            </>
          ) : null}
          {headingValue.variant === "Underline" ? (
            <ColorControl label="Underline Color" value={headingValue.style.underlineColor} onChange={(next) => updateStyle({ underlineColor: next })} />
          ) : null}
        </div>
      }
      layout={
        <div className="space-y-2">
          <SectionWidthProperties layout={headingValue.layout} onChange={(patch) => updateLayout(patch)} />
          <AlignmentControl label="Alignment" value={headingValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
          <SpacingControl label="Padding" value={headingValue.layout.padding} onChange={(next) => updateLayout({ padding: next })} />
          <SpacingControl label="Margin" value={headingValue.layout.margin} onChange={(next) => updateLayout({ margin: next })} />
        </div>
      }
      responsive={
        <div className="space-y-2">
          <TextControl label="Mobile Font Size" value={headingValue.responsive.fontSizeMobile} onChange={(next) => updateResponsive({ fontSizeMobile: next })} />
          <TextControl label="Tablet Font Size" value={headingValue.responsive.fontSizeTablet} onChange={(next) => updateResponsive({ fontSizeTablet: next })} />
          <ToggleControl label="Hide on Mobile" checked={headingValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          <ToggleControl label="Hide on Tablet" checked={headingValue.responsive.hideOnTablet ?? false} onChange={(next) => updateResponsive({ hideOnTablet: next })} />
          <ToggleControl label="Hide on Desktop" checked={headingValue.responsive.hideOnDesktop ?? false} onChange={(next) => updateResponsive({ hideOnDesktop: next })} />
        </div>
      }
      animation={
        <div className="space-y-2">
          <ToggleControl label="Enable Animation" checked={headingValue.animation.enabled ?? false} onChange={(next) => updateAnimation({ enabled: next })} />
          <SelectControl
            label="Animation Type"
            value={headingValue.animation.type}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Zoom", value: "zoom" },
            ]}
            onChange={(next) => updateAnimation({ type: next })}
          />
          <SliderControl label="Duration" value={headingValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={headingValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2">
          <TextControl label="CSS Class" value={headingValue.advanced.className} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={headingValue.advanced.id} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={headingValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
