import { defaultButtonWidgetData, isButtonWidgetData } from "./ButtonTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { TextControl, SelectControl, ToggleControl, ColorControl, SliderControl, SpacingControl, AlignmentControl, IconControl, FontSizeControl } from "@/components/builder/property-controls";
import { BackgroundProperties } from "../BackgroundProperties";
import { SectionWidthProperties } from "../BaseWidget";

export interface ButtonPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

function backgroundSummary(style: Record<string, unknown>) {
  const type = String(style?.type ?? "none");
  if (type === "none" || !type) return "None";
  if (type === "color") return String(style.color || "Color");
  if (type === "gradient") return "Gradient";
  if (type === "image") return "Image";
  return type;
}

export function ButtonProperties({ value = defaultButtonWidgetData, onChange, onClose }: ButtonPropertiesProps) {
  const buttonValue = isButtonWidgetData(value) ? value : defaultButtonWidgetData;
  const updateContent = (patch: Partial<typeof buttonValue.content>) => onChange({ ...buttonValue, content: { ...buttonValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof buttonValue.style>) => onChange({ ...buttonValue, style: { ...buttonValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof buttonValue.layout>) => onChange({ ...buttonValue, layout: { ...buttonValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof buttonValue.responsive>) => onChange({ ...buttonValue, responsive: { ...buttonValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof buttonValue.animation>) => onChange({ ...buttonValue, animation: { ...buttonValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof buttonValue.advanced>) => onChange({ ...buttonValue, advanced: { ...buttonValue.advanced, ...patch } });

  return (
    <PropertyPanel
      title="Button"
      onClose={onClose}
      content={
        <div className="space-y-2.5">
          <TextControl label="Button label" value={String(buttonValue.content.text ?? "")} onChange={(next) => updateContent({ text: next })} />
          <TextControl label="Link" value={String(buttonValue.content.url ?? "")} onChange={(next) => updateContent({ url: next })} />
          <ToggleControl label="Open in new tab" checked={buttonValue.content.openInNewTab ?? false} onChange={(next) => updateContent({ openInNewTab: next })} />
          <IconControl label="Icon Left" value={buttonValue.content.iconLeft} onChange={(next) => updateContent({ iconLeft: next })} />
          <IconControl label="Icon Right" value={buttonValue.content.iconRight} onChange={(next) => updateContent({ iconRight: next })} />
        </div>
      }
      background={
        <BackgroundProperties
          background={buttonValue.style as any}
          onChange={(next) => updateStyle(next as any)}
        />
      }
      backgroundSummary={backgroundSummary(buttonValue.style as any)}
      typography={
        <div className="space-y-2.5">
          <FontSizeControl label="Font size" value={buttonValue.style.fontSize} onChange={(next) => updateStyle({ fontSize: next })} />
          <AlignmentControl label="Text alignment" value={buttonValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
        </div>
      }
      style={
        <div className="space-y-2.5">
          <SelectControl
            label="Style"
            value={String(buttonValue.variant ?? "Filled")}
            options={[
              { label: "Filled", value: "Filled" },
              { label: "Outline", value: "Outline" },
              { label: "Ghost", value: "Ghost" },
              { label: "Gradient", value: "Gradient" },
            ]}
            onChange={(next) => onChange({ ...buttonValue, variant: next, style: { ...buttonValue.style, variant: next } })}
          />
          <SelectControl
            label="Color"
            value={String(buttonValue.style.color ?? "Primary")}
            options={[
              { label: "Primary", value: "Primary" },
              { label: "Secondary", value: "Secondary" },
              { label: "Success", value: "Success" },
              { label: "Danger", value: "Danger" },
              { label: "Custom", value: "Custom" },
            ]}
            onChange={(next) => updateStyle({ color: next as any })}
          />
          {buttonValue.style.color === "Custom" ? (
            <ColorControl label="Custom Color" value={String(buttonValue.style.customColor ?? "")} onChange={(next) => updateStyle({ customColor: next })} />
          ) : null}
          <SelectControl
            label="Size"
            value={String(buttonValue.style.size ?? "Medium")}
            options={[
              { label: "Small", value: "Small" },
              { label: "Medium", value: "Medium" },
              { label: "Large", value: "Large" },
            ]}
            onChange={(next) => updateStyle({ size: next as any })}
          />
          <ToggleControl label="Full Width" checked={buttonValue.style.fullWidth ?? false} onChange={(next) => updateStyle({ fullWidth: next })} />
          <SelectControl
            label="Display"
            value={String(buttonValue.style.display ?? "inline")}
            options={[
              { label: "Inline", value: "inline" },
              { label: "Block", value: "block" },
            ]}
            onChange={(next) => updateStyle({ display: next as "inline" | "block" })}
          />
          <TextControl label="Border Radius" value={String(buttonValue.style.borderRadius ?? "")} onChange={(next) => updateStyle({ borderRadius: next })} />
          <ToggleControl label="Shadow" checked={buttonValue.style.shadow ?? false} onChange={(next) => updateStyle({ shadow: next })} />
        </div>
      }
      layout={
        <div className="space-y-2.5">
          <SectionWidthProperties layout={buttonValue.layout} onChange={(patch) => updateLayout(patch)} />
          <SpacingControl label="Padding" value={buttonValue.layout.padding} onChange={(next) => updateLayout({ padding: next as any })} />
          <SpacingControl label="Margin" value={buttonValue.layout.margin} onChange={(next) => updateLayout({ margin: next as any })} />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <ToggleControl label="Mobile Full Width" checked={buttonValue.responsive.mobileFullWidth ?? false} onChange={(next) => updateResponsive({ mobileFullWidth: next })} />
          <ToggleControl label="Hide on mobile" checked={buttonValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          <ToggleControl label="Hide on tablet" checked={buttonValue.responsive.hideOnTablet ?? false} onChange={(next) => updateResponsive({ hideOnTablet: next })} />
          <ToggleControl label="Hide on desktop" checked={buttonValue.responsive.hideOnDesktop ?? false} onChange={(next) => updateResponsive({ hideOnDesktop: next })} />
        </div>
      }
      animation={
        <div className="space-y-2.5">
          <SelectControl
            label="Hover Effect"
            value={String(buttonValue.animation.hoverEffect ?? "none")}
            options={[
              { label: "None", value: "none" },
              { label: "Lift", value: "lift" },
              { label: "Shadow", value: "shadow" },
              { label: "Grow", value: "grow" },
            ]}
            onChange={(next) => updateAnimation({ hoverEffect: next as any })}
          />
          <SelectControl
            label="Entrance Animation"
            value={String(buttonValue.animation.entranceAnimation ?? "none")}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Slide Down", value: "slide-down" },
            ]}
            onChange={(next) => updateAnimation({ entranceAnimation: next as any })}
          />
          <SliderControl label="Duration" value={buttonValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={buttonValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl label="CSS Class" value={String(buttonValue.advanced.className ?? "")} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={String(buttonValue.advanced.id ?? "")} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={buttonValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
