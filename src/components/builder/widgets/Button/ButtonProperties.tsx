import { defaultButtonWidgetData, isButtonWidgetData } from "./ButtonTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { TextControl } from "@/components/builder/property-panel/controls/TextControl";
import { SelectControl } from "@/components/builder/property-panel/controls/SelectControl";
import { ToggleControl } from "@/components/builder/property-panel/controls/ToggleControl";
import { ColorControl } from "@/components/builder/property-panel/controls/ColorControl";
import { SliderControl } from "@/components/builder/property-panel/controls/SliderControl";
import { SpacingControl } from "@/components/builder/property-panel/controls/SpacingControl";
import { IconControl } from "@/components/builder/property-panel/controls/IconControl";
import { AlignmentControl } from "@/components/builder/property-panel/controls/AlignmentControl";
import { SectionWidthProperties } from "../BaseWidget";

export interface ButtonPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function ButtonProperties({ value = defaultButtonWidgetData, onChange }: ButtonPropertiesProps) {
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
      children={
        <div className="space-y-2">
          <TextControl label="Button Text" value={buttonValue.content.text} onChange={(next) => updateContent({ text: next })} />
          <TextControl label="Link URL" value={buttonValue.content.url} onChange={(next) => updateContent({ url: next })} />
          <ToggleControl label="Open in New Tab" checked={buttonValue.content.openInNewTab ?? false} onChange={(next) => updateContent({ openInNewTab: next })} />
          <IconControl label="Icon Left" value={buttonValue.content.iconLeft} onChange={(next) => updateContent({ iconLeft: next })} />
          <IconControl label="Icon Right" value={buttonValue.content.iconRight} onChange={(next) => updateContent({ iconRight: next })} />
        </div>
      }
      style={
        <div className="space-y-2">
          <SelectControl
            label="Style"
            value={buttonValue.variant}
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
            value={buttonValue.style.color}
            options={[
              { label: "Primary", value: "Primary" },
              { label: "Secondary", value: "Secondary" },
              { label: "Success", value: "Success" },
              { label: "Danger", value: "Danger" },
              { label: "Custom", value: "Custom" },
            ]}
            onChange={(next) => updateStyle({ color: next })}
          />
          {buttonValue.style.color === "Custom" ? (
            <ColorControl label="Custom Color" value={buttonValue.style.customColor} onChange={(next) => updateStyle({ customColor: next })} />
          ) : null}
          <SelectControl
            label="Size"
            value={buttonValue.style.size}
            options={[
              { label: "Small", value: "Small" },
              { label: "Medium", value: "Medium" },
              { label: "Large", value: "Large" },
            ]}
            onChange={(next) => updateStyle({ size: next })}
          />
          <ToggleControl label="Full Width" checked={buttonValue.style.fullWidth ?? false} onChange={(next) => updateStyle({ fullWidth: next })} />
          <SelectControl
            label="Display"
            value={buttonValue.style.display ?? "inline"}
            options={[
              { label: "Inline", value: "inline" },
              { label: "Block", value: "block" },
            ]}
            onChange={(next) => updateStyle({ display: next as "inline" | "block" })}
          />
          <TextControl label="Border Radius" value={buttonValue.style.borderRadius} onChange={(next) => updateStyle({ borderRadius: next })} />
          <ToggleControl label="Shadow" checked={buttonValue.style.shadow ?? false} onChange={(next) => updateStyle({ shadow: next })} />
        </div>
      }
      layout={
        <div className="space-y-2">
          <SectionWidthProperties layout={buttonValue.layout} onChange={(patch) => updateLayout(patch)} />
          {/* Alignment uses icon buttons for quick selection */}
          <AlignmentControl label="Alignment" value={buttonValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
          <SpacingControl label="Padding" value={buttonValue.layout.padding} onChange={(next) => updateLayout({ padding: next })} />
          <SpacingControl label="Margin" value={buttonValue.layout.margin} onChange={(next) => updateLayout({ margin: next })} />
        </div>
      }
      responsive={
        <div className="space-y-2">
          <ToggleControl label="Mobile Full Width" checked={buttonValue.responsive.mobileFullWidth ?? false} onChange={(next) => updateResponsive({ mobileFullWidth: next })} />
          <ToggleControl label="Hide on Mobile" checked={buttonValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          <ToggleControl label="Hide on Tablet" checked={buttonValue.responsive.hideOnTablet ?? false} onChange={(next) => updateResponsive({ hideOnTablet: next })} />
          <ToggleControl label="Hide on Desktop" checked={buttonValue.responsive.hideOnDesktop ?? false} onChange={(next) => updateResponsive({ hideOnDesktop: next })} />
        </div>
      }
      animation={
        <div className="space-y-2">
          <SelectControl
            label="Hover Effect"
            value={buttonValue.animation.hoverEffect}
            options={[
              { label: "None", value: "none" },
              { label: "Lift", value: "lift" },
              { label: "Shadow", value: "shadow" },
              { label: "Grow", value: "grow" },
            ]}
            onChange={(next) => updateAnimation({ hoverEffect: next })}
          />
          <SelectControl
            label="Entrance Animation"
            value={buttonValue.animation.entranceAnimation}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Slide Down", value: "slide-down" },
            ]}
            onChange={(next) => updateAnimation({ entranceAnimation: next })}
          />
          <SliderControl label="Duration" value={buttonValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={buttonValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2">
          <TextControl label="CSS Class" value={buttonValue.advanced.className} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={buttonValue.advanced.id} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={buttonValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
        </div>
      }
    />
  );
}
