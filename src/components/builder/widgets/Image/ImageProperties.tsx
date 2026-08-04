import { defaultImageWidgetData, isImageWidgetData } from "./ImageTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { TextControl, SelectControl, ToggleControl, ColorControl, SliderControl, SpacingControl, AlignmentControl, ImageControl } from "@/components/builder/property-controls";
import { BackgroundProperties } from "../BackgroundProperties";
import { SectionWidthProperties } from "../BaseWidget";
import { getAssetValue, normalizeImagePickerValue } from "@/lib/builder/image-storage";
import { useBuilder } from "@/lib/builder/store";

export interface ImagePropertiesProps {
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

function imageNameFromSrc(src: unknown) {
  if (!src) return "";
  if (typeof src === "object" && src !== null) {
    const record = src as Record<string, unknown>;
    return String(record.filename ?? record.name ?? "");
  }
  const text = String(src);
  const parts = text.split("/");
  return parts[parts.length - 1] || text;
}

export function ImageProperties({ value = defaultImageWidgetData, onChange, onClose }: ImagePropertiesProps) {
  const imageValue = isImageWidgetData(value) ? value : defaultImageWidgetData;
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const resolvedSrc = String(getAssetValue(imageValue.content.src) ?? String(imageValue.content.src || ""));
  const updateContent = (patch: Partial<typeof imageValue.content>) => onChange({ ...imageValue, content: { ...imageValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof imageValue.style>) => onChange({ ...imageValue, style: { ...imageValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof imageValue.layout>) => onChange({ ...imageValue, layout: { ...imageValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof imageValue.responsive>) => onChange({ ...imageValue, responsive: { ...imageValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof imageValue.animation>) => onChange({ ...imageValue, animation: { ...imageValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof imageValue.advanced>) => onChange({ ...imageValue, advanced: { ...imageValue.advanced, ...patch } });

  const applySrc = (next: string) => {
    const normalized = normalizeImagePickerValue(
      next,
      imageValue.content.src as any,
      project?.assets as any,
    );
    updateContent({ src: normalized as any });
  };

  const isDecorative = Boolean((imageValue.content as { decorative?: boolean }).decorative);

  return (
    <PropertyPanel
      title="Image"
      onClose={onClose}
      content={
        <div className="space-y-2.5">
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
          <ImageControl
            label="Image"
            value={resolvedSrc}
            onChange={applySrc}
            showAlt
            alt={String(imageValue.content.alt ?? "")}
            onAltChange={(next) => updateContent({ alt: next })}
            decorative={isDecorative}
            onDecorativeChange={(next) =>
              updateContent({
                decorative: next,
                alt: next ? "" : imageValue.content.alt,
              } as any)
            }
          />
          <TextControl
            label="Image name"
            value={imageNameFromSrc(imageValue.content.src)}
            onChange={(next) => {
              const currentSrc = imageValue.content.src;
              if (typeof currentSrc === "object" && currentSrc !== null) {
                updateContent({ src: { ...currentSrc, filename: next } });
              }
            }}
          />
          <TextControl label="Caption" value={String(imageValue.content.caption ?? "")} onChange={(next) => updateContent({ caption: next })} />
          <TextControl label="Link URL" value={String(imageValue.content.url ?? "")} onChange={(next) => updateContent({ url: next })} />
          <ToggleControl label="Open Link in New Tab" checked={imageValue.content.openInNewTab ?? false} onChange={(next) => updateContent({ openInNewTab: next })} />
        </div>
      }
      background={
        <BackgroundProperties
          background={imageValue.style as any}
          onChange={(next) => updateStyle(next as any)}
        />
      }
      backgroundSummary={backgroundSummary(imageValue.style as any)}
      style={
        <div className="space-y-2.5">
          <TextControl label="Width" value={String(imageValue.style.width ?? "")} onChange={(next) => updateStyle({ width: next })} />
          <TextControl label="Height" value={String(imageValue.style.height ?? "")} onChange={(next) => updateStyle({ height: next })} />
          <SelectControl
            label="Object Fit"
            value={String(imageValue.style.objectFit ?? "cover")}
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Fill", value: "fill" },
              { label: "None", value: "none" },
            ]}
            onChange={(next) => updateStyle({ objectFit: next as any })}
          />
          <TextControl label="Border Radius" value={String(imageValue.style.borderRadius ?? "")} onChange={(next) => updateStyle({ borderRadius: next })} />
          <TextControl label="Border Width" value={String(imageValue.style.borderWidth ?? "")} onChange={(next) => updateStyle({ borderWidth: next })} />
          <ColorControl label="Border Color" value={String(imageValue.style.borderColor ?? "")} onChange={(next) => updateStyle({ borderColor: next })} />
          <ToggleControl label="Shadow" checked={imageValue.style.shadow ?? false} onChange={(next) => updateStyle({ shadow: next })} />
          <SliderControl label="Opacity" value={imageValue.style.opacity ?? 1} min={0} max={1} step={0.05} onChange={(next) => updateStyle({ opacity: next })} />
          <ColorControl label="Overlay Color" value={String(imageValue.style.overlayColor ?? "")} onChange={(next) => updateStyle({ overlayColor: next })} />
          <SliderControl label="Overlay Opacity" value={imageValue.style.overlayOpacity ?? 0.3} min={0} max={1} step={0.05} onChange={(next) => updateStyle({ overlayOpacity: next })} />
        </div>
      }
      layout={
        <div className="space-y-2.5">
          <SectionWidthProperties layout={imageValue.layout} onChange={(patch) => updateLayout(patch)} />
          <AlignmentControl label="Alignment" value={imageValue.layout.alignment as any} onChange={(next) => updateLayout({ alignment: next })} />
          <TextControl label="Max Width" value={String(imageValue.layout.maxWidth ?? "")} onChange={(next) => updateLayout({ maxWidth: next })} />
          <SpacingControl label="Margin" value={imageValue.layout.margin as any} onChange={(next) => updateLayout({ margin: next as any })} />
          <SpacingControl label="Padding" value={imageValue.layout.padding as any} onChange={(next) => updateLayout({ padding: next as any })} />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <TextControl label="Desktop Width" value={String(imageValue.responsive.desktopWidth ?? "")} onChange={(next) => updateResponsive({ desktopWidth: next })} />
          <TextControl label="Tablet Width" value={String(imageValue.responsive.tabletWidth ?? "")} onChange={(next) => updateResponsive({ tabletWidth: next })} />
          <TextControl label="Mobile Width" value={String(imageValue.responsive.mobileWidth ?? "")} onChange={(next) => updateResponsive({ mobileWidth: next })} />
          <ToggleControl label="Hide on mobile" checked={imageValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          <ToggleControl label="Hide on tablet" checked={Boolean((imageValue.responsive as any).hideOnTablet)} onChange={(next) => updateResponsive({ hideOnTablet: next } as any)} />
          <ToggleControl label="Hide on desktop" checked={Boolean((imageValue.responsive as any).hideOnDesktop)} onChange={(next) => updateResponsive({ hideOnDesktop: next } as any)} />
        </div>
      }
      animation={
        <div className="space-y-2.5">
          <SelectControl
            label="Entrance Animation"
            value={String(imageValue.animation.entranceAnimation ?? "none")}
            options={[
              { label: "None", value: "none" },
              { label: "Fade", value: "fade" },
              { label: "Slide Up", value: "slide-up" },
              { label: "Slide Down", value: "slide-down" },
            ]}
            onChange={(next) => updateAnimation({ entranceAnimation: next as any })}
          />
          <SliderControl label="Duration" value={imageValue.animation.duration ?? 400} min={100} max={2000} onChange={(next) => updateAnimation({ duration: next })} />
          <SliderControl label="Delay" value={imageValue.animation.delay ?? 0} min={0} max={1000} onChange={(next) => updateAnimation({ delay: next })} />
          <ToggleControl label="Hover Zoom" checked={imageValue.animation.hoverZoom ?? false} onChange={(next) => updateAnimation({ hoverZoom: next })} />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl label="CSS Class" value={String(imageValue.advanced.className ?? "")} onChange={(next) => updateAdvanced({ className: next })} />
          <TextControl label="HTML ID" value={String(imageValue.advanced.id ?? "")} onChange={(next) => updateAdvanced({ id: next })} />
          <ToggleControl label="Visible" checked={imageValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
          <ToggleControl label="Lazy Loading" checked={imageValue.advanced.lazyLoad ?? true} onChange={(next) => updateAdvanced({ lazyLoad: next })} />
        </div>
      }
    />
  );
}
