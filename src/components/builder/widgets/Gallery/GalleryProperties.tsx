import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faClone,
  faPlus,
  faTableCells,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import {
  ColorControl,
  ImageControl,
  NumberControl,
  SelectControl,
  SliderControl,
  TextControl,
  ToggleControl,
} from "@/components/builder/property-controls";
import { getAssetValue, normalizeImagePickerValue } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";
import {
  createGalleryImage,
  defaultGalleryWidgetData,
  isGalleryWidgetData,
  type GalleryImageItem,
  type GalleryWidgetData,
} from "./GalleryTypes";

export interface GalleryPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function imageNameFromSrc(src: unknown, fallback = "") {
  if (!src) return fallback;
  if (typeof src === "object" && src !== null) {
    const record = src as Record<string, unknown>;
    return String(record.filename ?? record.name ?? fallback);
  }
  const text = String(src);
  const parts = text.split("/");
  return parts[parts.length - 1]?.split("?")[0] || fallback || text;
}

function resolveImageSrc(item: GalleryImageItem | undefined): string {
  if (!item) return "";
  if (typeof item.src === "object" && item.src !== null) {
    return String(getAssetValue(item.src) ?? "");
  }
  return String(item.src || "");
}

function toPxNumber(value: unknown, fallback: number): number {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : fallback;
}

const DESKTOP_COLUMN_OPTIONS = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
];

const TABLET_COLUMN_OPTIONS = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
];

const MOBILE_COLUMN_OPTIONS = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
];

export function GalleryProperties({
  value = defaultGalleryWidgetData,
  onChange,
  onClose,
}: GalleryPropertiesProps) {
  const galleryValue: GalleryWidgetData = isGalleryWidgetData(value)
    ? value
    : defaultGalleryWidgetData;
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectElement = useBuilder((s) => s.selectElement);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const section = (pageOf(project)?.sections ?? []).find((s) => s.id === selectedSectionId) ?? null;

  const updateContent = (patch: Partial<GalleryWidgetData["content"]>) =>
    onChange({ ...galleryValue, content: { ...galleryValue.content, ...patch } });
  const updateStyle = (patch: Partial<GalleryWidgetData["style"]>) =>
    onChange({ ...galleryValue, style: { ...galleryValue.style, ...patch } });
  const updateLayout = (patch: Partial<GalleryWidgetData["layout"]>) =>
    onChange({ ...galleryValue, layout: { ...galleryValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<GalleryWidgetData["responsive"]>) =>
    onChange({ ...galleryValue, responsive: { ...galleryValue.responsive, ...patch } });
  const updateAdvanced = (patch: Partial<GalleryWidgetData["advanced"]>) =>
    onChange({ ...galleryValue, advanced: { ...galleryValue.advanced, ...patch } });

  const images = Array.isArray(galleryValue.content.images) ? galleryValue.content.images : [];

  const selectedImageId = useMemo(() => {
    const key = String(selectedElement?.elementKey ?? "");
    if (key && images.some((item) => item.id === key)) return key;
    const stored = String(galleryValue.content.selectedImageId ?? "");
    if (stored && images.some((item) => item.id === stored)) return stored;
    return images[0]?.id ?? "";
  }, [galleryValue.content.selectedImageId, selectedElement?.elementKey, images]);

  const selectedImage = images.find((item) => item.id === selectedImageId) ?? images[0];
  const selectedIndex = selectedImage
    ? images.findIndex((item) => item.id === selectedImage.id)
    : -1;

  const setImages = (next: GalleryImageItem[], nextSelectedId?: string) => {
    const id =
      nextSelectedId ??
      (next.some((item) => item.id === selectedImageId) ? selectedImageId : next[0]?.id);
    updateContent({ images: next, selectedImageId: id });
  };

  const focusImageSelection = (imageId: string) => {
    if (!section?.widgetInstance) return;
    selectElement({
      kind: "widget",
      index: null,
      tag: "img",
      sectionId: section.id,
      widgetId: section.widgetInstance.id,
      parentWidgetId: section.widgetInstance.id,
      childId: null,
      elementKey: imageId,
      elementType: "image",
    });
  };

  const selectImage = (imageId: string) => {
    if (galleryValue.content.selectedImageId !== imageId) {
      updateContent({ selectedImageId: imageId });
    }
    focusImageSelection(imageId);
  };

  const updateImage = (imageId: string, patch: Partial<GalleryImageItem>) => {
    setImages(
      images.map((item) => (item.id === imageId ? { ...item, ...patch } : item)),
      imageId,
    );
  };

  const applyImageSrc = (imageId: string, next: string) => {
    const item = images.find((candidate) => candidate.id === imageId);
    if (!item) return;
    if (!next) {
      updateImage(imageId, { src: "", name: "" });
      return;
    }
    const normalized = normalizeImagePickerValue(next, item.src as any, project?.assets as any);
    const name =
      typeof normalized === "object" && normalized
        ? String((normalized as any).filename || "")
        : "";
    updateImage(imageId, { src: normalized as any, name: name || item.name });
  };

  const actionBtnClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";

  return (
    <PropertyPanel
      title="Image Gallery"
      badgeLabel="Gallery"
      badgeIcon={<FontAwesomeIcon icon={faTableCells} className="h-3.5 w-3.5" />}
      onClose={onClose}
      variantControl={
        <SelectControl
          label="Variant"
          value={galleryValue.variant}
          options={[{ label: "Simple Grid", value: "Simple Grid" }]}
          onChange={() => onChange({ ...galleryValue, variant: "Simple Grid" })}
        />
      }
      content={
        <div className="space-y-3">
          <div className="min-w-0 w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Images
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = createGalleryImage({
                    alt: `Gallery image ${images.length + 1}`,
                    name: `Gallery image ${images.length + 1}`,
                  });
                  setImages([...images, next], next.id);
                  focusImageSelection(next.id);
                }}
                className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                Add image
              </button>
            </div>

            <div className="space-y-1.5">
              {images.map((item, index) => {
                const thumb = resolveImageSrc(item);
                const isSelected = item.id === selectedImageId;
                const name = item.name || imageNameFromSrc(item.src, `Image ${index + 1}`);
                return (
                  <div
                    key={item.id}
                    className={[
                      "min-w-0 overflow-hidden rounded-lg border bg-white transition",
                      isSelected ? "border-violet-300 bg-violet-50/40" : "border-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => selectImage(item.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1 text-left"
                      >
                        <span className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-slate-700">
                            Image {index + 1}
                          </span>
                          <span className="block truncate text-[11px] text-slate-400">{name}</span>
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          title="Duplicate"
                          aria-label="Duplicate"
                          className={actionBtnClass}
                          onClick={() => {
                            const clone = createGalleryImage({
                              ...item,
                              id: undefined,
                              name: `${name} copy`,
                            });
                            const next = [...images];
                            next.splice(index + 1, 0, clone);
                            setImages(next, clone.id);
                            focusImageSelection(clone.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faClone} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move up"
                          aria-label="Move up"
                          disabled={index === 0}
                          className={actionBtnClass}
                          onClick={() => setImages(moveItem(images, index, -1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          aria-label="Move down"
                          disabled={index === images.length - 1}
                          className={actionBtnClass}
                          onClick={() => setImages(moveItem(images, index, 1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Remove"
                          aria-label="Remove"
                          disabled={images.length <= 1}
                          className={`${actionBtnClass} hover:text-red-500`}
                          onClick={() => {
                            const next = images.filter((candidate) => candidate.id !== item.id);
                            setImages(next, next[Math.max(0, index - 1)]?.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedImage ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Selected image {selectedIndex >= 0 ? selectedIndex + 1 : ""}
              </div>
              <ImageControl
                label="Image"
                value={resolveImageSrc(selectedImage)}
                onChange={(next) => applyImageSrc(selectedImage.id, next)}
                showAlt
                alt={String(selectedImage.alt ?? "")}
                onAltChange={(next) => updateImage(selectedImage.id, { alt: next })}
                decorative={Boolean((selectedImage as { decorative?: boolean }).decorative)}
                onDecorativeChange={(next) =>
                  updateImage(selectedImage.id, {
                    decorative: next,
                    alt: next ? "" : selectedImage.alt,
                  } as any)
                }
              />
              <TextControl
                label="Image name"
                value={selectedImage.name || imageNameFromSrc(selectedImage.src)}
                onChange={(next) => updateImage(selectedImage.id, { name: next })}
              />
              <TextControl
                label="Image link"
                value={String(selectedImage.link ?? "")}
                onChange={(next) => updateImage(selectedImage.id, { link: next })}
              />
              <ToggleControl
                label="Open link in new tab"
                checked={Boolean(selectedImage.openInNewTab)}
                onChange={(next) => updateImage(selectedImage.id, { openInNewTab: next })}
              />
            </div>
          ) : null}
        </div>
      }
      style={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Layout
          </div>
          <SelectControl
            label="Desktop columns"
            value={String(galleryValue.style.desktopColumns ?? 3)}
            options={DESKTOP_COLUMN_OPTIONS}
            onChange={(next) => updateStyle({ desktopColumns: Number(next) || 3 })}
          />
          <SelectControl
            label="Tablet columns"
            value={String(galleryValue.style.tabletColumns ?? 2)}
            options={TABLET_COLUMN_OPTIONS}
            onChange={(next) => updateStyle({ tabletColumns: Number(next) || 2 })}
          />
          <SelectControl
            label="Mobile columns"
            value={String(galleryValue.style.mobileColumns ?? 1)}
            options={MOBILE_COLUMN_OPTIONS}
            onChange={(next) => updateStyle({ mobileColumns: Number(next) || 1 })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Image
          </div>
          <NumberControl
            label="Image height (px)"
            value={toPxNumber(galleryValue.style.imageHeight, 240)}
            min={80}
            max={800}
            onChange={(next) => updateStyle({ imageHeight: `${next}px` })}
          />
          <SelectControl
            label="Object fit"
            value={String(galleryValue.style.objectFit ?? "cover")}
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
            ]}
            onChange={(next) => updateStyle({ objectFit: next as "cover" | "contain" })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(galleryValue.style.borderRadius, 12)}
            min={0}
            max={80}
            onChange={(next) => updateStyle({ borderRadius: `${next}px` })}
          />
          <NumberControl
            label="Image gap (px)"
            value={toPxNumber(galleryValue.style.imageGap, 16)}
            min={0}
            max={64}
            onChange={(next) => updateStyle({ imageGap: `${next}px` })}
          />
          <ToggleControl
            label="Image border"
            checked={Boolean(galleryValue.style.imageBorderEnabled)}
            onChange={(next) => updateStyle({ imageBorderEnabled: next })}
          />
          <ColorControl
            label="Border color"
            value={String(galleryValue.style.borderColor ?? "#e2e8f0")}
            onChange={(next) => updateStyle({ borderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(galleryValue.style.borderWidth, 1)}
            min={0}
            max={12}
            onChange={(next) => updateStyle({ borderWidth: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Hover
          </div>
          <ToggleControl
            label="Enable hover effect"
            checked={galleryValue.style.hoverEnabled !== false}
            onChange={(next) => updateStyle({ hoverEnabled: next })}
          />
          <SliderControl
            label="Hover scale"
            value={Number(galleryValue.style.hoverScale ?? 1.03)}
            min={1}
            max={1.2}
            step={0.01}
            unit=""
            onChange={(next) => updateStyle({ hoverScale: next })}
          />
          <ToggleControl
            label="Hover shadow"
            checked={galleryValue.style.hoverShadow !== false}
            onChange={(next) => updateStyle({ hoverShadow: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Section
          </div>
          <ColorControl
            label="Background color"
            value={String(galleryValue.style.backgroundColor ?? "transparent")}
            onChange={(next) => updateStyle({ backgroundColor: next })}
          />
          <NumberControl
            label="Top padding (px)"
            value={toPxNumber(galleryValue.layout.paddingTop, 40)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingTop: `${next}px` })}
          />
          <NumberControl
            label="Bottom padding (px)"
            value={toPxNumber(galleryValue.layout.paddingBottom, 40)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingBottom: `${next}px` })}
          />
          <NumberControl
            label="Left/right padding (px)"
            value={toPxNumber(galleryValue.layout.paddingX, 24)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingX: `${next}px` })}
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <ToggleControl
            label="Hide on mobile"
            checked={galleryValue.responsive.hideOnMobile ?? false}
            onChange={(next) => updateResponsive({ hideOnMobile: next })}
          />
          <ToggleControl
            label="Hide on tablet"
            checked={galleryValue.responsive.hideOnTablet ?? false}
            onChange={(next) => updateResponsive({ hideOnTablet: next })}
          />
          <ToggleControl
            label="Hide on desktop"
            checked={galleryValue.responsive.hideOnDesktop ?? false}
            onChange={(next) => updateResponsive({ hideOnDesktop: next })}
          />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl
            label="Custom ID"
            value={galleryValue.advanced.id || ""}
            onChange={(next) => updateAdvanced({ id: next })}
          />
          <TextControl
            label="Custom CSS classes"
            value={galleryValue.advanced.className || ""}
            onChange={(next) => updateAdvanced({ className: next })}
          />
          <ToggleControl
            label="Visible"
            checked={galleryValue.advanced.visibility !== false}
            onChange={(next) => updateAdvanced({ visibility: next })}
          />
        </div>
      }
    />
  );
}
