import React, { useEffect, useMemo, useState } from "react";
import { defaultImageWidgetData, isImageWidgetData } from "./ImageTypes";
import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { getAssetValue, resolveAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import { useBuilder } from "@/lib/builder/store";
import { getSpacingStyleValue } from "../spacing";

export interface ImageProps {
  data: WidgetData;
}

function getAlignmentClass(alignment?: string) {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-end";
  return "text-start";
}

function isBuilderAssetEntry(value: unknown): value is BuilderAssetEntry {
  return typeof value === "object" && value !== null && ("src" in value || "url" in value);
}

export function Image({ data = defaultImageWidgetData }: ImageProps) {
  const imageData = isImageWidgetData(data) ? data : defaultImageWidgetData;
  const visible = imageData.advanced.visibility ?? true;
  const [hovered, setHovered] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const device = useBuilder((s) => s.device);

  const rawSrc = imageData.content.src;
  const resolvedInitialSrc = useMemo(() => {
    if (isBuilderAssetEntry(rawSrc)) {
      return getAssetValue(rawSrc) ?? "";
    }
    return String(rawSrc || "");
  }, [rawSrc]);

  useEffect(() => {
    let active = true;
    async function resolve() {
      if (isBuilderAssetEntry(rawSrc)) {
        const value = await resolveAssetValue(rawSrc);
        if (!active) return;
        setResolvedSrc(value ?? "");
      } else {
        setResolvedSrc(String(rawSrc || ""));
      }
    }
    void resolve();
    return () => {
      active = false;
    };
  }, [rawSrc]);

  const imageUrl = resolvedSrc || resolvedInitialSrc;
  console.log("FINAL IMAGE SRC", { imageId: imageData.id, imageType: imageData.type, rawSrc, resolvedInitialSrc, resolvedSrc, imageUrl });
  const caption = String(imageData.content.caption || "");
  const altText = String(imageData.content.alt || "Image");
  const link = String(imageData.content.url || "");
  const target = imageData.content.openInNewTab ? "_blank" : undefined;
  const rel = imageData.content.openInNewTab ? "noopener noreferrer" : undefined;

  const wrapperStyle: React.CSSProperties = {
    margin: getSpacingStyleValue(imageData.layout.margin, device),
    padding: getSpacingStyleValue(imageData.layout.padding, device),
    maxWidth: imageData.layout.maxWidth,
    display: imageData.layout.alignment === "center" ? "block" : undefined,
  };

  const imageStyle: React.CSSProperties = {
    width: imageData.style.width || "100%",
    height: imageData.style.height || "auto",
    objectFit: imageData.style.objectFit,
    borderRadius: imageData.style.borderRadius,
    border: imageData.style.borderWidth ? `${imageData.style.borderWidth} solid ${imageData.style.borderColor}` : undefined,
    boxShadow: imageData.style.shadow ? "0 0.75rem 1.5rem rgba(15, 23, 42, 0.12)" : undefined,
    opacity: imageData.style.opacity === undefined ? 1 : imageData.style.opacity,
    display: "block",
    maxWidth: "100%",
  };

  const overlayStyles: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: String(imageData.style.overlayColor || "#000000"),
    opacity: imageData.style.overlayOpacity === undefined ? 0.3 : imageData.style.overlayOpacity,
    transition: "opacity 180ms ease-in-out",
    pointerEvents: "none",
    borderRadius: imageData.style.borderRadius,
  };

  const figureStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    width: imageStyle.width,
    maxWidth: "100%",
  };

  const hasImage = Boolean(imageUrl && !/^\s*$/.test(imageUrl));
  const content = hasImage ? (
    <figure style={figureStyle}>
      <img
        src={imageUrl}
        alt={altText}
        loading={imageData.advanced.lazyLoad ? "lazy" : "eager"}
        style={imageStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {imageData.variant === "Image with Overlay" ? <div style={overlayStyles} /> : null}
      {caption && imageData.variant !== "Card Image" ? (
        <figcaption style={{ marginTop: "0.75rem", color: "#495057", fontSize: "0.95rem", textAlign: "inherit" }} data-wto-widget-element-key="caption" data-wto-widget-element-type="text">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  ) : (
    <div style={{ border: "1px dashed #cbd5e1", borderRadius: "0.75rem", padding: "1.5rem", color: "#475569", background: "#f8fafc", textAlign: "center" }}>
      <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Select or upload an image</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 14l2.5-3 2 2.5L16 10l3 4H6z"/></svg>
        <span style={{ fontSize: "0.9rem" }}>Select or upload an image</span>
      </div>
    </div>
  );

  const cardContent = (
    <figure style={{ ...figureStyle, backgroundColor: "#ffffff", borderRadius: imageData.style.borderRadius, boxShadow: imageData.style.shadow ? "0 0.75rem 1.5rem rgba(15, 23, 42, 0.12)" : undefined, padding: "0.75rem" }}>
      <img
        src={imageUrl}
        alt={altText}
        loading={imageData.advanced.lazyLoad ? "lazy" : "eager"}
        style={imageStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {caption ? (
        <figcaption style={{ marginTop: "0.75rem", color: "#495057", fontSize: "0.95rem" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );

  if (!visible) {
    return null;
  }

  const rendered = imageUrl ? (
    imageData.variant === "Card Image" ? cardContent : content
  ) : (
    <div style={{ border: "1px dashed #d1d5db", borderRadius: "0.75rem", padding: "2rem", color: "#6b7280", background: "#f8fafc" }}>
      <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Image widget</div>
      <div style={{ fontSize: "0.9rem" }}>Upload an image or add a URL in the properties panel.</div>
    </div>
  );

  const inner = link ? (
    <a href={link} target={target} rel={rel} style={{ textDecoration: "none", display: "inline-block" }}>
      {rendered}
    </a>
  ) : (
    rendered
  );

  return (
    <BaseWidget
      data={imageData}
      widgetType="image"
      title="Image"
      variantLabel={imageData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-hidden"
    >
      <div className={getAlignmentClass(imageData.layout.alignment)} style={wrapperStyle}>
        {inner}
      </div>
    </BaseWidget>
  );
}
