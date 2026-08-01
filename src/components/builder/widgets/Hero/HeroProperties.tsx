import { defaultHeroWidgetData, isHeroWidgetData } from "./HeroTypes";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import type { WidgetData } from "../widgetRegistry";
import { SelectControl } from "@/components/builder/property-panel/controls/SelectControl";
import { TextControl } from "@/components/builder/property-panel/controls/TextControl";
import { TextAreaControl } from "@/components/builder/property-panel/controls/TextAreaControl";
import { ColorControl } from "@/components/builder/property-panel/controls/ColorControl";
import { SliderControl } from "@/components/builder/property-panel/controls/SliderControl";
import { ToggleControl } from "@/components/builder/property-panel/controls/ToggleControl";
import { SpacingControl } from "@/components/builder/property-panel/controls/SpacingControl";
import { ImageControl } from "@/components/builder/property-panel/controls/ImageControl";
import { AlignmentControl } from "@/components/builder/property-panel/controls/AlignmentControl";
import { SectionWidthProperties } from "../BaseWidget";

export interface HeroPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function HeroProperties({ value = defaultHeroWidgetData, onChange }: HeroPropertiesProps) {
  const heroValue = isHeroWidgetData(value) ? value : defaultHeroWidgetData;
  const updateStyle = (patch: Partial<typeof heroValue.style>) => onChange({ ...heroValue, style: { ...heroValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof heroValue.layout>) => onChange({ ...heroValue, layout: { ...heroValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof heroValue.responsive>) => onChange({ ...heroValue, responsive: { ...heroValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof heroValue.animation>) => onChange({ ...heroValue, animation: { ...heroValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof heroValue.advanced>) => onChange({ ...heroValue, advanced: { ...heroValue.advanced, ...patch } });

  return (
    <PropertyPanel
      title="Hero Widget V2"
      children={
        <div className="space-y-3">
          <div className="rounded-lg border border-input bg-background p-3 text-sm text-slate-700">
            Select a child element inside the hero to edit its text, button, or image.
            <div className="mt-2 text-xs text-slate-500">Use the + Add Element toolbar to add heading, paragraph, button, or image children.</div>
          </div>
          <div className="mb-2">
            <SelectControl
              label="Variant"
              value={heroValue.variant}
              options={[
                { label: "Classic", value: "Classic" },
                { label: "Split", value: "Split" },
                { label: "Centered", value: "Centered" },
              ]}
              onChange={(next) => onChange({ ...heroValue, variant: next })}
            />
          </div>
        </div>
      }
      style={
        <div className="space-y-2">
          <SelectControl
            label="Background Type"
            value={heroValue.style.backgroundType}
            options={[
              { label: "Solid", value: "solid" },
              { label: "Gradient", value: "gradient" },
              { label: "Image", value: "image" },
            ]}
            onChange={(next) => updateStyle({ backgroundType: next as typeof heroValue.style.backgroundType })}
          />
          <ColorControl label="Background" value={heroValue.style.backgroundColor} onChange={(next) => updateStyle({ backgroundColor: next })} />
          <ColorControl label="Heading Color" value={heroValue.style.headingColor} onChange={(next) => updateStyle({ headingColor: next })} />
          <ColorControl label="Text Color" value={heroValue.style.textColor} onChange={(next) => updateStyle({ textColor: next })} />
          <SelectControl
            label="Button Style"
            value={heroValue.style.buttonStyle}
            options={[
              { label: "Solid", value: "solid" },
              { label: "Outline", value: "outline" },
              { label: "Ghost", value: "ghost" },
            ]}
            onChange={(next) => updateStyle({ buttonStyle: next as typeof heroValue.style.buttonStyle })}
          />
          <ColorControl label="Button Color" value={heroValue.style.buttonColor} onChange={(next) => updateStyle({ buttonColor: next })} />
        </div>
      }
      layout={
        <div className="space-y-2">
          <SectionWidthProperties layout={heroValue.layout} onChange={(patch) => updateLayout(patch)} />
          <AlignmentControl label="Alignment" value={heroValue.layout.align as any} onChange={(next) => updateLayout({ align: next as typeof heroValue.layout.align })} />
          <SelectControl
            label="Container Width"
            value={heroValue.layout.containerWidth}
            options={[
              { label: "Narrow", value: "narrow" },
              { label: "Standard", value: "standard" },
              { label: "Wide", value: "wide" },
            ]}
            onChange={(next) => updateLayout({ containerWidth: next as typeof heroValue.layout.containerWidth })}
          />
          <SelectControl
            label="Content Width"
            value={heroValue.layout.contentWidth}
            options={[
              { label: "Narrow", value: "narrow" },
              { label: "Standard", value: "standard" },
              { label: "Wide", value: "wide" },
            ]}
            onChange={(next) => updateLayout({ contentWidth: next as typeof heroValue.layout.contentWidth })}
          />
          <SelectControl
            label="Image Position"
            value={heroValue.layout.imagePosition}
            options={[
              { label: "Right", value: "right" },
              { label: "Left", value: "left" },
              { label: "Bottom", value: "bottom" },
            ]}
            onChange={(next) => updateLayout({ imagePosition: next as typeof heroValue.layout.imagePosition })}
          />
          <SpacingControl label="Padding" value={heroValue.layout.padding} onChange={(next) => updateLayout({ padding: next })} />
          <SpacingControl label="Margin" value={heroValue.layout.margin} onChange={(next) => updateLayout({ margin: next })} />
        </div>
      }
      responsive={
        <div className="space-y-2">
          <ToggleControl label="Hide Image on Mobile" checked={heroValue.responsive.hideImageOnMobile} onChange={(next) => updateResponsive({ hideImageOnMobile: next })} />
          <ToggleControl label="Stack Layout" checked={heroValue.responsive.mobileStack} onChange={(next) => updateResponsive({ mobileStack: next })} />
          <SpacingControl label="Mobile Padding" value={heroValue.responsive.mobilePadding} onChange={(next) => updateResponsive({ mobilePadding: next })} />
        </div>
      }
      animation={
        <div className="space-y-2">
          <SelectControl
            label="Animation Type"
            value={heroValue.animation.type}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide up", value: "slide-up" },
              { label: "Zoom", value: "zoom" },
            ]}
            onChange={(next) => updateAnimation({ type: next as typeof heroValue.animation.type })}
          />
          <SliderControl label="Duration" value={heroValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={heroValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2">
          <TextControl label="CSS Class" value={heroValue.advanced.className} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={heroValue.advanced.id} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visibility" checked={heroValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
