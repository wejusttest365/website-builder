import { defaultHeroWidgetData, isHeroWidgetData } from "./HeroTypes";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import type { WidgetData } from "../widgetRegistry";
import { SelectControl, TextControl, ColorControl, SliderControl, ToggleControl, SpacingControl, AlignmentControl, TextAreaControl, ImageControl } from "@/components/builder/property-controls";
import { BackgroundProperties } from "../BackgroundProperties";
import { SectionWidthProperties } from "../BaseWidget";
import { resolveHeroLayoutMargin, resolveHeroLayoutPadding } from "../spacing";

export interface HeroPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

export function HeroProperties({ value = defaultHeroWidgetData, onChange, onClose }: HeroPropertiesProps) {
  const heroValue = isHeroWidgetData(value) ? value : defaultHeroWidgetData;
  const updateStyle = (patch: Partial<typeof heroValue.style>) => onChange({ ...heroValue, style: { ...heroValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof heroValue.layout>) => onChange({ ...heroValue, layout: { ...heroValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof heroValue.responsive>) => onChange({ ...heroValue, responsive: { ...heroValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof heroValue.animation>) => onChange({ ...heroValue, animation: { ...heroValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof heroValue.advanced>) => onChange({ ...heroValue, advanced: { ...heroValue.advanced, ...patch } });

  return (
    <PropertyPanel
      title="Hero"
      onClose={onClose}
      content={
        <div className="space-y-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-600">
            Select a child element inside the hero to edit its text, button, or image.
            <div className="mt-2 text-[11px] text-slate-500">Use the + Add Element toolbar to add heading, paragraph, button, or image children.</div>
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
      background={
        <BackgroundProperties
          background={heroValue.style as any}
          onChange={(next) => updateStyle(next)}
        />
      }
      backgroundSummary={!heroValue.style?.type || heroValue.style.type === "none" ? "None" : String(heroValue.style.type)}
      style={
        <div className="space-y-2.5">
          <ColorControl label="Heading Color" value={String(heroValue.style.headingColor ?? "")} onChange={(next) => updateStyle({ headingColor: next })} />
          <ColorControl label="Text Color" value={String(heroValue.style.textColor ?? "")} onChange={(next) => updateStyle({ textColor: next })} />
          <SelectControl
            label="Button Style"
            value={String(heroValue.style.buttonStyle ?? "solid")}
            options={[
              { label: "Solid", value: "solid" },
              { label: "Outline", value: "outline" },
              { label: "Ghost", value: "ghost" },
            ]}
            onChange={(next) => updateStyle({ buttonStyle: next as any })}
          />
          <ColorControl label="Button Color" value={String(heroValue.style.buttonColor ?? "")} onChange={(next) => updateStyle({ buttonColor: next })} />
        </div>
      }
      layout={
        <div className="space-y-2">
          <SectionWidthProperties layout={heroValue.layout} onChange={(patch) => updateLayout(patch)} />
          <AlignmentControl label="Alignment" value={heroValue.layout.align as any} onChange={(next) => updateLayout({ align: next as typeof heroValue.layout.align })} />
          <SelectControl
            label="Container Width"
            value={String(heroValue.layout.containerWidth ?? "standard")}
            options={[
              { label: "Narrow", value: "narrow" },
              { label: "Standard", value: "standard" },
              { label: "Wide", value: "wide" },
            ]}
            onChange={(next) => updateLayout({ containerWidth: next as any })}
          />
          <SelectControl
            label="Content Width"
            value={String(heroValue.layout.contentWidth ?? "standard")}
            options={[
              { label: "Narrow", value: "narrow" },
              { label: "Standard", value: "standard" },
              { label: "Wide", value: "wide" },
            ]}
            onChange={(next) => updateLayout({ contentWidth: next as any })}
          />
          <SelectControl
            label="Image Position"
            value={String(heroValue.layout.imagePosition ?? "right")}
            options={[
              { label: "Right", value: "right" },
              { label: "Left", value: "left" },
              { label: "Bottom", value: "bottom" },
            ]}
            onChange={(next) => updateLayout({ imagePosition: next as any })}
          />
          <SpacingControl label="Padding" value={resolveHeroLayoutPadding(heroValue.layout.padding) as any} onChange={(next) => updateLayout({ padding: next as any })} />
          <SpacingControl label="Margin" value={resolveHeroLayoutMargin(heroValue.layout.margin) as any} onChange={(next) => updateLayout({ margin: next as any })} />
        </div>
      }
      responsive={
        <div className="space-y-2">
          <ToggleControl label="Hide Image on Mobile" checked={heroValue.responsive.hideImageOnMobile ?? false} onChange={(next) => updateResponsive({ hideImageOnMobile: next })} />
          <ToggleControl label="Stack Layout" checked={heroValue.responsive.mobileStack ?? false} onChange={(next) => updateResponsive({ mobileStack: next })} />
          <SpacingControl label="Mobile Padding" value={heroValue.responsive.mobilePadding} onChange={(next) => updateResponsive({ mobilePadding: next as any })} />
        </div>
      }
      animation={
        <div className="space-y-2">
          <SelectControl
            label="Animation Type"
            value={String(heroValue.animation.type ?? "none")}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide up", value: "slide-up" },
              { label: "Zoom", value: "zoom" },
            ]}
            onChange={(next) => updateAnimation({ type: next as any })}
          />
          <SliderControl label="Duration" value={heroValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={heroValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2">
          <TextControl label="CSS Class" value={String(heroValue.advanced.className ?? "")} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={String(heroValue.advanced.id ?? "")} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visibility" checked={heroValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
