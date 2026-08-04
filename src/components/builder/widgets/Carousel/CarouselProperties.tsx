import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faClone,
  faImages,
  faPlus,
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
  createCarouselSlide,
  defaultCarouselWidgetData,
  isCarouselWidgetData,
  type CarouselSlide,
  type CarouselWidgetData,
} from "./CarouselTypes";

export interface CarouselPropertiesProps {
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

function resolveSlideSrc(slide: CarouselSlide | undefined): string {
  if (!slide) return "";
  if (typeof slide.src === "object" && slide.src !== null) {
    return String(getAssetValue(slide.src) ?? "");
  }
  return String(slide.src || "");
}

function toPxNumber(value: unknown, fallback: number): number {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : fallback;
}

export function CarouselProperties({
  value = defaultCarouselWidgetData,
  onChange,
  onClose,
}: CarouselPropertiesProps) {
  const carouselValue: CarouselWidgetData = isCarouselWidgetData(value)
    ? value
    : defaultCarouselWidgetData;
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectElement = useBuilder((s) => s.selectElement);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const section = (pageOf(project)?.sections ?? []).find((s) => s.id === selectedSectionId) ?? null;

  const updateContent = (patch: Partial<CarouselWidgetData["content"]>) =>
    onChange({ ...carouselValue, content: { ...carouselValue.content, ...patch } });
  const updateStyle = (patch: Partial<CarouselWidgetData["style"]>) =>
    onChange({ ...carouselValue, style: { ...carouselValue.style, ...patch } });
  const updateResponsive = (patch: Partial<CarouselWidgetData["responsive"]>) =>
    onChange({ ...carouselValue, responsive: { ...carouselValue.responsive, ...patch } });
  const updateAdvanced = (patch: Partial<CarouselWidgetData["advanced"]>) =>
    onChange({ ...carouselValue, advanced: { ...carouselValue.advanced, ...patch } });

  const slides = Array.isArray(carouselValue.content.slides) ? carouselValue.content.slides : [];

  const selectedSlideId = useMemo(() => {
    const key = String(selectedElement?.elementKey ?? "");
    if (key && slides.some((slide) => slide.id === key)) return key;
    const stored = String(carouselValue.content.selectedSlideId ?? "");
    if (stored && slides.some((slide) => slide.id === stored)) return stored;
    return slides[0]?.id ?? "";
  }, [carouselValue.content.selectedSlideId, selectedElement?.elementKey, slides]);

  const selectedSlide = slides.find((slide) => slide.id === selectedSlideId) ?? slides[0];
  const selectedIndex = selectedSlide ? slides.findIndex((slide) => slide.id === selectedSlide.id) : -1;

  const setSlides = (next: CarouselSlide[], nextSelectedId?: string) => {
    const id = nextSelectedId ?? (next.some((s) => s.id === selectedSlideId) ? selectedSlideId : next[0]?.id);
    updateContent({ slides: next, selectedSlideId: id });
  };

  const focusSlideSelection = (slideId: string) => {
    if (!section?.widgetInstance) return;
    selectElement({
      kind: "widget",
      index: null,
      tag: "img",
      sectionId: section.id,
      widgetId: section.widgetInstance.id,
      parentWidgetId: section.widgetInstance.id,
      childId: null,
      elementKey: slideId,
      elementType: "image",
    });
  };

  const selectSlide = (slideId: string) => {
    if (carouselValue.content.selectedSlideId !== slideId) {
      updateContent({ selectedSlideId: slideId });
    }
    focusSlideSelection(slideId);
  };

  const updateSlide = (slideId: string, patch: Partial<CarouselSlide>) => {
    setSlides(
      slides.map((slide) => (slide.id === slideId ? { ...slide, ...patch } : slide)),
      slideId,
    );
  };

  const applySlideSrc = (slideId: string, next: string) => {
    const slide = slides.find((item) => item.id === slideId);
    if (!slide) return;
    if (!next) {
      updateSlide(slideId, { src: "", name: "" });
      return;
    }
    const normalized = normalizeImagePickerValue(next, slide.src as any, project?.assets as any);
    const name =
      typeof normalized === "object" && normalized
        ? String((normalized as any).filename || "")
        : "";
    updateSlide(slideId, { src: normalized as any, name: name || slide.name });
  };

  const actionBtnClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";

  return (
    <PropertyPanel
      title="Carousel"
      badgeLabel="Carousel"
      badgeIcon={<FontAwesomeIcon icon={faImages} className="h-3.5 w-3.5" />}
      onClose={onClose}
      variantControl={
        <SelectControl
          label="Variant"
          value={carouselValue.variant}
          options={[{ label: "Full-Width Image Slider", value: "Full-Width Image Slider" }]}
          onChange={() => onChange({ ...carouselValue, variant: "Full-Width Image Slider" })}
        />
      }
      content={
        <div className="space-y-3">
          <div className="min-w-0 w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Slides
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = createCarouselSlide({
                    alt: `Slide ${slides.length + 1}`,
                    name: `Slide ${slides.length + 1}`,
                  });
                  setSlides([...slides, next], next.id);
                  focusSlideSelection(next.id);
                }}
                className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                Add Slide
              </button>
            </div>

            <div className="space-y-1.5">
              {slides.map((slide, index) => {
                const thumb = resolveSlideSrc(slide);
                const isSelected = slide.id === selectedSlideId;
                const name = slide.name || imageNameFromSrc(slide.src, `Slide ${index + 1}`);
                return (
                  <div
                    key={slide.id}
                    className={[
                      "min-w-0 overflow-hidden rounded-lg border bg-white transition",
                      isSelected ? "border-violet-300 bg-violet-50/40" : "border-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => selectSlide(slide.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1 text-left"
                      >
                        <span className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-slate-700">
                            Slide {index + 1}
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
                            const clone = createCarouselSlide({
                              ...slide,
                              id: undefined,
                              name: `${name} copy`,
                            });
                            const next = [...slides];
                            next.splice(index + 1, 0, clone);
                            setSlides(next, clone.id);
                            focusSlideSelection(clone.id);
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
                          onClick={() => setSlides(moveItem(slides, index, -1), slide.id)}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          aria-label="Move down"
                          disabled={index === slides.length - 1}
                          className={actionBtnClass}
                          onClick={() => setSlides(moveItem(slides, index, 1), slide.id)}
                        >
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Remove"
                          aria-label="Remove"
                          disabled={slides.length <= 1}
                          className={`${actionBtnClass} hover:text-red-500`}
                          onClick={() => {
                            const next = slides.filter((item) => item.id !== slide.id);
                            setSlides(next, next[Math.max(0, index - 1)]?.id);
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

          {selectedSlide ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Selected slide {selectedIndex >= 0 ? selectedIndex + 1 : ""}
              </div>
              <ImageControl
                label="Slide image"
                value={resolveSlideSrc(selectedSlide)}
                onChange={(next) => applySlideSrc(selectedSlide.id, next)}
                showAlt
                alt={String(selectedSlide.alt ?? "")}
                onAltChange={(next) => updateSlide(selectedSlide.id, { alt: next })}
                decorative={Boolean((selectedSlide as { decorative?: boolean }).decorative)}
                onDecorativeChange={(next) =>
                  updateSlide(selectedSlide.id, {
                    decorative: next,
                    alt: next ? "" : selectedSlide.alt,
                  } as any)
                }
              />
              <TextControl
                label="Image name"
                value={selectedSlide.name || imageNameFromSrc(selectedSlide.src)}
                onChange={(next) => updateSlide(selectedSlide.id, { name: next })}
              />
              <TextControl
                label="Image link"
                value={String(selectedSlide.link ?? "")}
                onChange={(next) => updateSlide(selectedSlide.id, { link: next })}
              />
              <ToggleControl
                label="Open link in new tab"
                checked={Boolean(selectedSlide.openInNewTab)}
                onChange={(next) => updateSlide(selectedSlide.id, { openInNewTab: next })}
              />
            </div>
          ) : null}
        </div>
      }
      style={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Carousel
          </div>
          <NumberControl
            label="Desktop height (px)"
            value={toPxNumber(carouselValue.style.heightDesktop, 560)}
            min={120}
            max={1200}
            onChange={(next) => updateStyle({ heightDesktop: `${next}px` })}
          />
          <NumberControl
            label="Tablet height (px)"
            value={toPxNumber(carouselValue.style.heightTablet, 420)}
            min={100}
            max={1000}
            onChange={(next) => updateStyle({ heightTablet: `${next}px` })}
          />
          <NumberControl
            label="Mobile height (px)"
            value={toPxNumber(carouselValue.style.heightMobile, 280)}
            min={80}
            max={800}
            onChange={(next) => updateStyle({ heightMobile: `${next}px` })}
          />
          <SelectControl
            label="Image fit"
            value={String(carouselValue.style.objectFit ?? "cover")}
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
            ]}
            onChange={(next) => updateStyle({ objectFit: next as "cover" | "contain" })}
          />
          <ColorControl
            label="Background color"
            value={String(carouselValue.style.backgroundColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ backgroundColor: next })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(carouselValue.style.borderRadius, 0)}
            min={0}
            max={80}
            onChange={(next) => updateStyle({ borderRadius: `${next}px` })}
          />
          <ToggleControl
            label="Overflow hidden"
            checked={carouselValue.style.overflowHidden !== false}
            onChange={(next) => updateStyle({ overflowHidden: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Arrows
          </div>
          <ToggleControl
            label="Show arrows"
            checked={carouselValue.style.showArrows !== false}
            onChange={(next) => updateStyle({ showArrows: next })}
          />
          <NumberControl
            label="Arrow size (px)"
            value={toPxNumber(carouselValue.style.arrowSize, 44)}
            min={24}
            max={80}
            onChange={(next) => updateStyle({ arrowSize: `${next}px` })}
          />
          <ColorControl
            label="Arrow color"
            value={String(carouselValue.style.arrowColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ arrowColor: next })}
          />
          <ColorControl
            label="Arrow background color"
            value={String(carouselValue.style.arrowBackgroundColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ arrowBackgroundColor: next })}
          />
          <SliderControl
            label="Arrow background opacity"
            value={Number(carouselValue.style.arrowBackgroundOpacity ?? 0.45)}
            min={0}
            max={1}
            step={0.05}
            unit=""
            onChange={(next) => updateStyle({ arrowBackgroundOpacity: next })}
          />
          <NumberControl
            label="Arrow border radius (px)"
            value={toPxNumber(carouselValue.style.arrowBorderRadius, 9999)}
            min={0}
            max={9999}
            onChange={(next) => updateStyle({ arrowBorderRadius: `${next}px` })}
          />
          <SelectControl
            label="Arrow position"
            value={String(carouselValue.style.arrowPosition ?? "inside")}
            options={[
              { label: "Inside", value: "inside" },
              { label: "Outside", value: "outside" },
            ]}
            onChange={(next) => updateStyle({ arrowPosition: next as "inside" | "outside" })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Dots
          </div>
          <ToggleControl
            label="Show dots"
            checked={carouselValue.style.showDots !== false}
            onChange={(next) => updateStyle({ showDots: next })}
          />
          <NumberControl
            label="Dot size (px)"
            value={toPxNumber(carouselValue.style.dotSize, 10)}
            min={4}
            max={24}
            onChange={(next) => updateStyle({ dotSize: `${next}px` })}
          />
          <ColorControl
            label="Active dot color"
            value={String(carouselValue.style.dotActiveColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ dotActiveColor: next })}
          />
          <ColorControl
            label="Inactive dot color"
            value={String(carouselValue.style.dotInactiveColor ?? "rgba(255,255,255,0.45)")}
            onChange={(next) => updateStyle({ dotInactiveColor: next })}
          />
          <SelectControl
            label="Dot position"
            value={String(carouselValue.style.dotPosition ?? "inside-bottom")}
            options={[
              { label: "Inside bottom", value: "inside-bottom" },
              { label: "Outside bottom", value: "outside-bottom" },
            ]}
            onChange={(next) =>
              updateStyle({ dotPosition: next as "inside-bottom" | "outside-bottom" })
            }
          />
        </div>
      }
      animation={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Autoplay
          </div>
          <ToggleControl
            label="Enable autoplay"
            checked={Boolean(carouselValue.content.autoplay)}
            onChange={(next) => updateContent({ autoplay: next })}
          />
          <NumberControl
            label="Autoplay delay (ms)"
            value={Number(carouselValue.content.autoplayDelay ?? 5000)}
            min={500}
            max={30000}
            step={100}
            onChange={(next) => updateContent({ autoplayDelay: next || 5000 })}
          />
          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Behavior
          </div>
          <ToggleControl
            label="Infinite loop"
            checked={carouselValue.content.infiniteLoop !== false}
            onChange={(next) => updateContent({ infiniteLoop: next })}
          />
          <ToggleControl
            label="Pause autoplay on hover"
            checked={carouselValue.content.pauseOnHover !== false}
            onChange={(next) => updateContent({ pauseOnHover: next })}
          />
          <NumberControl
            label="Transition duration (ms)"
            value={Number(carouselValue.content.transitionDuration ?? 500)}
            min={0}
            max={3000}
            step={50}
            onChange={(next) => updateContent({ transitionDuration: Math.max(0, next) })}
          />
          <ToggleControl
            label="Keyboard navigation"
            checked={carouselValue.content.keyboardNavigation !== false}
            onChange={(next) => updateContent({ keyboardNavigation: next })}
          />
          <ToggleControl
            label="Swipe navigation"
            checked={carouselValue.content.swipeNavigation !== false}
            onChange={(next) => updateContent({ swipeNavigation: next })}
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <ToggleControl
            label="Hide on mobile"
            checked={carouselValue.responsive.hideOnMobile ?? false}
            onChange={(next) => updateResponsive({ hideOnMobile: next })}
          />
          <ToggleControl
            label="Hide on tablet"
            checked={carouselValue.responsive.hideOnTablet ?? false}
            onChange={(next) => updateResponsive({ hideOnTablet: next })}
          />
          <ToggleControl
            label="Hide on desktop"
            checked={carouselValue.responsive.hideOnDesktop ?? false}
            onChange={(next) => updateResponsive({ hideOnDesktop: next })}
          />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl
            label="Custom ID"
            value={carouselValue.advanced.id || ""}
            onChange={(next) => updateAdvanced({ id: next })}
          />
          <TextControl
            label="Custom CSS classes"
            value={carouselValue.advanced.className || ""}
            onChange={(next) => updateAdvanced({ className: next })}
          />
          <ToggleControl
            label="Visible"
            checked={carouselValue.advanced.visibility !== false}
            onChange={(next) => updateAdvanced({ visibility: next })}
          />
        </div>
      }
    />
  );
}
