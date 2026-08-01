import { defaultImageWidgetData, isImageWidgetData } from "./ImageTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { ImageControl } from "@/components/builder/property-panel/controls/ImageControl";
import { TextControl } from "@/components/builder/property-panel/controls/TextControl";
import { SelectControl } from "@/components/builder/property-panel/controls/SelectControl";
import { ToggleControl } from "@/components/builder/property-panel/controls/ToggleControl";
import { ColorControl } from "@/components/builder/property-panel/controls/ColorControl";
import { SliderControl } from "@/components/builder/property-panel/controls/SliderControl";
import { SpacingControl } from "@/components/builder/property-panel/controls/SpacingControl";
import { AlignmentControl } from "@/components/builder/property-panel/controls/AlignmentControl";
import { SectionWidthProperties } from "../BaseWidget";
import { createRemoteImageReference, getAssetValue } from "@/lib/builder/image-storage";

export interface ImagePropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function ImageProperties({ value = defaultImageWidgetData, onChange }: ImagePropertiesProps) {
  const imageValue = isImageWidgetData(value) ? value : defaultImageWidgetData;
  console.log("IMAGE PROPS SRC", {
    widgetId: imageValue.id,
    widgetType: imageValue.type,
    rawSrc: imageValue.content.src,
    resolvedSrc: getAssetValue(imageValue.content.src) ?? String(imageValue.content.src || ""),
  });
  const updateContent = (patch: Partial<typeof imageValue.content>) => onChange({ ...imageValue, content: { ...imageValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof imageValue.style>) => onChange({ ...imageValue, style: { ...imageValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof imageValue.layout>) => onChange({ ...imageValue, layout: { ...imageValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof imageValue.responsive>) => onChange({ ...imageValue, responsive: { ...imageValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof imageValue.animation>) => onChange({ ...imageValue, animation: { ...imageValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof imageValue.advanced>) => onChange({ ...imageValue, advanced: { ...imageValue.advanced, ...patch } });

  return (
    <PropertyPanel
      title="Image"
      children={
        <div className="space-y-2">
          <SelectControl
            label="Variant"
            value={imageValue.variant}
            options={[
              { label: "Standard", value: "Standard" },
              { label: "Rounded", value: "Rounded" },
              { label: "Card Image", value: "Card Image" },
              { label: "Image with Caption", value: "Image with Caption" },
              { label: "Image with Overlay", value: "Image with Overlay" },
            ]}
            onChange={(next) => onChange({ ...imageValue, variant: next })}
          />
        </div>
      }
      content={
        <div className="space-y-2">
          <ImageControl
            label="Upload Image"
            value={getAssetValue(imageValue.content.src) ?? String(imageValue.content.src || "")}
            onChange={(next) => {
              if (!next) {
                updateContent({ src: "" });
                return;
              }

              const currentSrc = imageValue.content.src;
              if (typeof currentSrc === "object" && currentSrc !== null) {
                updateContent({ src: { ...currentSrc, url: next, src: next, sourceType: "remote", filename: createRemoteImageReference(next).filename, provider: "Remote image", attribution: "", isPreview: false, isWatermarked: false } });
              } else {
                updateContent({ src: createRemoteImageReference(next) });
              }
            }}
          />
          <TextControl
            label="Image URL"
            value={getAssetValue(imageValue.content.src) ?? String(imageValue.content.src || "")}
            onChange={(next) => {
              if (!next) {
                updateContent({ src: "" });
                return;
              }

              const currentSrc = imageValue.content.src;
              if (typeof currentSrc === "object" && currentSrc !== null) {
                updateContent({ src: { ...currentSrc, url: next, src: next, sourceType: "remote", filename: createRemoteImageReference(next).filename, provider: "Remote image", attribution: "", isPreview: false, isWatermarked: false } });
              } else {
                updateContent({ src: createRemoteImageReference(next) });
              }
            }}
          />
          <TextControl label="Alt Text" value={imageValue.content.alt} onChange={(next) => updateContent({ alt: next })} />
          <TextControl label="Caption" value={imageValue.content.caption} onChange={(next) => updateContent({ caption: next })} />
          <TextControl label="Link URL" value={imageValue.content.url} onChange={(next) => updateContent({ url: next })} />
          <ToggleControl label="Open Link in New Tab" checked={imageValue.content.openInNewTab ?? false} onChange={(next) => updateContent({ openInNewTab: next })} />
        </div>
      }
      style={
        <div className="space-y-2">
          <TextControl label="Width" value={imageValue.style.width} onChange={(next) => updateStyle({ width: next })} />
          <TextControl label="Height" value={imageValue.style.height} onChange={(next) => updateStyle({ height: next })} />
          <SelectControl
            label="Object Fit"
            value={imageValue.style.objectFit}
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Fill", value: "fill" },
              { label: "None", value: "none" },
            ]}
            onChange={(next) => updateStyle({ objectFit: next })}
          />
          <TextControl label="Border Radius" value={imageValue.style.borderRadius} onChange={(next) => updateStyle({ borderRadius: next })} />
          <TextControl label="Border Width" value={imageValue.style.borderWidth} onChange={(next) => updateStyle({ borderWidth: next })} />
          <ColorControl label="Border Color" value={imageValue.style.borderColor} onChange={(next) => updateStyle({ borderColor: next })} />
          <ToggleControl label="Shadow" checked={imageValue.style.shadow ?? false} onChange={(next) => updateStyle({ shadow: next })} />
          <SliderControl label="Opacity" value={imageValue.style.opacity ?? 1} min={0} max={1} step={0.05} onChange={(next) => updateStyle({ opacity: next })} />
          <ColorControl label="Overlay Color" value={imageValue.style.overlayColor} onChange={(next) => updateStyle({ overlayColor: next })} />
          <SliderControl label="Overlay Opacity" value={imageValue.style.overlayOpacity ?? 0.3} min={0} max={1} step={0.05} onChange={(next) => updateStyle({ overlayOpacity: next })} />
        </div>
      }
      layout={
        <div className="space-y-2">
          <SectionWidthProperties layout={imageValue.layout} onChange={(patch) => updateLayout(patch)} />
          <AlignmentControl label="Alignment" value={imageValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
          <TextControl label="Max Width" value={imageValue.layout.maxWidth} onChange={(next) => updateLayout({ maxWidth: next })} />
          <SpacingControl label="Margin" value={imageValue.layout.margin} onChange={(next) => updateLayout({ margin: next })} />
          <SpacingControl label="Padding" value={imageValue.layout.padding} onChange={(next) => updateLayout({ padding: next })} />
        </div>
      }
      responsive={
        <div className="space-y-2">
          <TextControl label="Desktop Width" value={imageValue.responsive.desktopWidth} onChange={(next) => updateResponsive({ desktopWidth: next })} />
          <TextControl label="Tablet Width" value={imageValue.responsive.tabletWidth} onChange={(next) => updateResponsive({ tabletWidth: next })} />
          <TextControl label="Mobile Width" value={imageValue.responsive.mobileWidth} onChange={(next) => updateResponsive({ mobileWidth: next })} />
          <ToggleControl label="Hide on Mobile" checked={imageValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
        </div>
      }
      animation={
        <div className="space-y-2">
          <SelectControl
            label="Entrance Animation"
            value={imageValue.animation.entranceAnimation}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Slide Down", value: "slide-down" },
            ]}
            onChange={(next) => updateAnimation({ entranceAnimation: next })}
          />
          <SliderControl label="Duration" value={imageValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={imageValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
          <ToggleControl label="Hover Zoom" checked={imageValue.animation.hoverZoom ?? false} onChange={(next) => updateAnimation({ hoverZoom: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2">
          <TextControl label="CSS Class" value={imageValue.advanced.className} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={imageValue.advanced.id} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={imageValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
          <ToggleControl label="Lazy Loading" checked={imageValue.advanced.lazyLoad ?? true} onChange={(next) => updateAdvanced({ lazyLoad: next })} />
        </div>
      }
    />
  );
}
