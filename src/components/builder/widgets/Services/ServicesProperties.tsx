import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faBriefcase,
  faClone,
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
  TextAreaControl,
  TextControl,
  ToggleControl,
} from "@/components/builder/property-controls";
import { getAssetValue, normalizeImagePickerValue } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";
import {
  createServiceItem,
  defaultServicesWidgetData,
  isServicesWidgetData,
  type ServiceItem,
  type ServicesWidgetData,
} from "./ServicesTypes";

export interface ServicesPropertiesProps {
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

function resolveServiceSrc(item: ServiceItem | undefined): string {
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

type FocusPart = "image" | "heading" | "description" | "button" | "general";

function resolveSelection(
  services: ServiceItem[],
  elementKey: string,
  storedId: string,
): { serviceId: string; focus: FocusPart } {
  const prefixes: Array<{ prefix: string; focus: FocusPart }> = [
    { prefix: "image-", focus: "image" },
    { prefix: "heading-", focus: "heading" },
    { prefix: "description-", focus: "description" },
    { prefix: "button-", focus: "button" },
  ];
  for (const entry of prefixes) {
    if (elementKey.startsWith(entry.prefix)) {
      const id = elementKey.slice(entry.prefix.length);
      if (services.some((item) => item.id === id)) {
        return { serviceId: id, focus: entry.focus };
      }
    }
  }
  if (elementKey && services.some((item) => item.id === elementKey)) {
    return { serviceId: elementKey, focus: "general" };
  }
  if (storedId && services.some((item) => item.id === storedId)) {
    return { serviceId: storedId, focus: "general" };
  }
  return { serviceId: services[0]?.id ?? "", focus: "general" };
}

const FONT_WEIGHT_OPTIONS = [
  { label: "400 Â· Regular", value: "400" },
  { label: "500 Â· Medium", value: "500" },
  { label: "600 Â· Semibold", value: "600" },
  { label: "700 Â· Bold", value: "700" },
];

export function ServicesProperties({
  value = defaultServicesWidgetData,
  onChange,
  onClose,
}: ServicesPropertiesProps) {
  const servicesValue: ServicesWidgetData = isServicesWidgetData(value)
    ? value
    : defaultServicesWidgetData;
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectElement = useBuilder((s) => s.selectElement);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const section = (pageOf(project)?.sections ?? []).find((s) => s.id === selectedSectionId) ?? null;

  const updateContent = (patch: Partial<ServicesWidgetData["content"]>) =>
    onChange({ ...servicesValue, content: { ...servicesValue.content, ...patch } });
  const updateStyle = (patch: Partial<ServicesWidgetData["style"]>) =>
    onChange({ ...servicesValue, style: { ...servicesValue.style, ...patch } });
  const updateLayout = (patch: Partial<ServicesWidgetData["layout"]>) =>
    onChange({ ...servicesValue, layout: { ...servicesValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<ServicesWidgetData["responsive"]>) =>
    onChange({ ...servicesValue, responsive: { ...servicesValue.responsive, ...patch } });
  const updateAdvanced = (patch: Partial<ServicesWidgetData["advanced"]>) =>
    onChange({ ...servicesValue, advanced: { ...servicesValue.advanced, ...patch } });

  const services = Array.isArray(servicesValue.content.services)
    ? servicesValue.content.services
    : [];

  const selection = useMemo(
    () =>
      resolveSelection(
        services,
        String(selectedElement?.elementKey ?? ""),
        String(servicesValue.content.selectedServiceId ?? ""),
      ),
    [services, selectedElement?.elementKey, servicesValue.content.selectedServiceId],
  );

  const selectedService =
    services.find((item) => item.id === selection.serviceId) ?? services[0];
  const selectedIndex = selectedService
    ? services.findIndex((item) => item.id === selectedService.id)
    : -1;

  const setServices = (next: ServiceItem[], nextSelectedId?: string) => {
    const id =
      nextSelectedId ??
      (next.some((item) => item.id === selection.serviceId)
        ? selection.serviceId
        : next[0]?.id);
    updateContent({ services: next, selectedServiceId: id });
  };

  const focusServiceSelection = (serviceId: string, focus: FocusPart = "general") => {
    if (!section?.widgetInstance) return;
    const elementKey =
      focus === "image"
        ? `image-${serviceId}`
        : focus === "heading"
          ? `heading-${serviceId}`
          : focus === "description"
            ? `description-${serviceId}`
            : focus === "button"
              ? `button-${serviceId}`
              : serviceId;
    const elementType =
      focus === "image"
        ? "image"
        : focus === "button"
          ? "button"
          : focus === "heading" || focus === "description"
            ? "text"
            : "container";
    selectElement({
      kind: "widget",
      index: null,
      tag: focus === "button" ? "a" : focus === "image" ? "img" : "div",
      sectionId: section.id,
      widgetId: section.widgetInstance.id,
      parentWidgetId: section.widgetInstance.id,
      childId: null,
      elementKey,
      elementType,
    });
  };

  const selectService = (serviceId: string, focus: FocusPart = "general") => {
    if (servicesValue.content.selectedServiceId !== serviceId) {
      updateContent({ selectedServiceId: serviceId });
    }
    focusServiceSelection(serviceId, focus);
  };

  const updateService = (serviceId: string, patch: Partial<ServiceItem>) => {
    setServices(
      services.map((item) => (item.id === serviceId ? { ...item, ...patch } : item)),
      serviceId,
    );
  };

  const applyServiceSrc = (serviceId: string, next: string) => {
    const item = services.find((candidate) => candidate.id === serviceId);
    if (!item) return;
    if (!next) {
      updateService(serviceId, { src: "", name: "" });
      return;
    }
    const normalized = normalizeImagePickerValue(next, item.src as any, project?.assets as any);
    const name =
      typeof normalized === "object" && normalized
        ? String((normalized as any).filename || "")
        : "";
    updateService(serviceId, { src: normalized as any, name: name || item.name });
  };

  const actionBtnClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";

  const focus = selection.focus;

  return (
    <PropertyPanel
      title="Services"
      badgeLabel="Services"
      badgeIcon={<FontAwesomeIcon icon={faBriefcase} className="h-3.5 w-3.5" />}
      onClose={onClose}
      variantControl={
        <SelectControl
          label="Variant"
          value={servicesValue.variant}
          options={[{ label: "Service Cards", value: "Service Cards" }]}
          onChange={() => onChange({ ...servicesValue, variant: "Service Cards" })}
        />
      }
      content={
        <div className="space-y-3">
          <div className="min-w-0 w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Services
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = createServiceItem({
                    heading: `New service ${services.length + 1}`,
                  });
                  setServices([...services, next], next.id);
                  focusServiceSelection(next.id);
                }}
                className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                Add Service
              </button>
            </div>

            <div className="space-y-1.5">
              {services.map((item, index) => {
                const thumb = resolveServiceSrc(item);
                const isSelected = item.id === selection.serviceId;
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
                        onClick={() => selectService(item.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1 text-left"
                      >
                        <span className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-slate-700">
                            Service {index + 1}
                          </span>
                          <span className="block truncate text-[11px] text-slate-400">
                            {item.heading || "Untitled service"}
                          </span>
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          title="Duplicate"
                          aria-label="Duplicate"
                          className={actionBtnClass}
                          onClick={() => {
                            const clone = createServiceItem({
                              ...item,
                              id: undefined,
                              heading: `${item.heading || "Service"} (copy)`,
                            });
                            const next = [...services];
                            next.splice(index + 1, 0, clone);
                            setServices(next, clone.id);
                            focusServiceSelection(clone.id);
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
                          onClick={() => setServices(moveItem(services, index, -1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          aria-label="Move down"
                          disabled={index === services.length - 1}
                          className={actionBtnClass}
                          onClick={() => setServices(moveItem(services, index, 1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Remove"
                          aria-label="Remove"
                          disabled={services.length <= 1}
                          className={`${actionBtnClass} hover:text-red-500`}
                          onClick={() => {
                            const next = services.filter((candidate) => candidate.id !== item.id);
                            setServices(next, next[Math.max(0, index - 1)]?.id);
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

          {selectedService ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Selected service {selectedIndex >= 0 ? selectedIndex + 1 : ""}
                {focus !== "general" ? ` Â· ${focus}` : ""}
              </div>

              {(focus === "general" || focus === "image") && (
                <>
                  <ImageControl
                    label="Service image"
                    value={resolveServiceSrc(selectedService)}
                    onChange={(next) => applyServiceSrc(selectedService.id, next)}
                    showAlt
                    alt={String(selectedService.alt ?? "")}
                    onAltChange={(next) => updateService(selectedService.id, { alt: next })}
                    decorative={Boolean((selectedService as { decorative?: boolean }).decorative)}
                    onDecorativeChange={(next) =>
                      updateService(selectedService.id, {
                        decorative: next,
                        alt: next ? "" : selectedService.alt,
                      } as any)
                    }
                  />
                </>
              )}

              {(focus === "general" || focus === "heading") && (
                <>
                  <ToggleControl
                    label="Enable heading"
                    checked={selectedService.showHeading !== false}
                    onChange={(next) => updateService(selectedService.id, { showHeading: next })}
                  />
                  <TextControl
                    label="Heading"
                    value={String(selectedService.heading ?? "")}
                    onChange={(next) => updateService(selectedService.id, { heading: next })}
                  />
                </>
              )}

              {(focus === "general" || focus === "description") && (
                <>
                  <ToggleControl
                    label="Enable description"
                    checked={selectedService.showDescription !== false}
                    onChange={(next) =>
                      updateService(selectedService.id, { showDescription: next })
                    }
                  />
                  <TextAreaControl
                    label="Description"
                    value={String(selectedService.description ?? "")}
                    onChange={(next) => updateService(selectedService.id, { description: next })}
                  />
                </>
              )}

              {(focus === "general" || focus === "button") && (
                <>
                  <ToggleControl
                    label="Enable button"
                    checked={selectedService.showButton !== false}
                    onChange={(next) => updateService(selectedService.id, { showButton: next })}
                  />
                  <TextControl
                    label="Button label"
                    value={String(selectedService.buttonLabel ?? "")}
                    onChange={(next) => updateService(selectedService.id, { buttonLabel: next })}
                  />
                  <TextControl
                    label="Button URL"
                    value={String(selectedService.buttonUrl ?? "")}
                    onChange={(next) => updateService(selectedService.id, { buttonUrl: next })}
                  />
                  <ToggleControl
                    label="Open in new tab"
                    checked={Boolean(selectedService.openInNewTab)}
                    onChange={(next) => updateService(selectedService.id, { openInNewTab: next })}
                  />
                </>
              )}
            </div>
          ) : null}
        </div>
      }
      style={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Section
          </div>
          <ColorControl
            label="Background color"
            value={String(servicesValue.style.backgroundColor ?? "#f8fafc")}
            onChange={(next) => updateStyle({ backgroundColor: next })}
          />
          <NumberControl
            label="Top padding (px)"
            value={toPxNumber(servicesValue.layout.paddingTop, 64)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingTop: `${next}px` })}
          />
          <NumberControl
            label="Bottom padding (px)"
            value={toPxNumber(servicesValue.layout.paddingBottom, 64)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingBottom: `${next}px` })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(servicesValue.layout.paddingX, 24)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingX: `${next}px` })}
          />
          <NumberControl
            label="Content max width (px)"
            value={toPxNumber(servicesValue.style.maxWidth, 1140)}
            min={480}
            max={1600}
            onChange={(next) => updateStyle({ maxWidth: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Layout
          </div>
          <SelectControl
            label="Desktop columns"
            value={String(servicesValue.style.desktopColumns ?? 3)}
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
            ]}
            onChange={(next) => updateStyle({ desktopColumns: Number(next) || 3 })}
          />
          <SelectControl
            label="Tablet columns"
            value={String(servicesValue.style.tabletColumns ?? 2)}
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
            ]}
            onChange={(next) => updateStyle({ tabletColumns: Number(next) || 2 })}
          />
          <SelectControl
            label="Mobile columns"
            value={String(servicesValue.style.mobileColumns ?? 1)}
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
            ]}
            onChange={(next) => updateStyle({ mobileColumns: Number(next) || 1 })}
          />
          <NumberControl
            label="Card gap (px)"
            value={toPxNumber(servicesValue.style.cardGap, 24)}
            min={0}
            max={64}
            onChange={(next) => updateStyle({ cardGap: `${next}px` })}
          />
          <SelectControl
            label="Card alignment"
            value={String(servicesValue.style.cardAlignment ?? "center")}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            onChange={(next) =>
              updateStyle({ cardAlignment: next as "left" | "center" | "right" })
            }
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Card
          </div>
          <ColorControl
            label="Card background color"
            value={String(servicesValue.style.cardBackgroundColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ cardBackgroundColor: next })}
          />
          <ToggleControl
            label="Border"
            checked={servicesValue.style.cardBorderEnabled !== false}
            onChange={(next) => updateStyle({ cardBorderEnabled: next })}
          />
          <ColorControl
            label="Border color"
            value={String(servicesValue.style.cardBorderColor ?? "#e2e8f0")}
            onChange={(next) => updateStyle({ cardBorderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(servicesValue.style.cardBorderWidth, 1)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ cardBorderWidth: `${next}px` })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(servicesValue.style.cardBorderRadius, 16)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ cardBorderRadius: `${next}px` })}
          />
          <SelectControl
            label="Card shadow"
            value={String(servicesValue.style.cardShadow ?? "small")}
            options={[
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
            onChange={(next) =>
              updateStyle({ cardShadow: next as "none" | "small" | "medium" | "large" })
            }
          />
          <NumberControl
            label="Card padding (px)"
            value={toPxNumber(servicesValue.style.cardPadding, 0)}
            min={0}
            max={48}
            onChange={(next) => updateStyle({ cardPadding: `${next}px` })}
          />
          <ToggleControl
            label="Equal card height"
            checked={servicesValue.style.equalCardHeight !== false}
            onChange={(next) => updateStyle({ equalCardHeight: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Image
          </div>
          <NumberControl
            label="Image height (px)"
            value={toPxNumber(servicesValue.style.imageHeight, 200)}
            min={80}
            max={480}
            onChange={(next) => updateStyle({ imageHeight: `${next}px` })}
          />
          <SelectControl
            label="Object fit"
            value={String(servicesValue.style.objectFit ?? "cover")}
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
            ]}
            onChange={(next) => updateStyle({ objectFit: next as "cover" | "contain" })}
          />
          <NumberControl
            label="Image border radius (px)"
            value={toPxNumber(servicesValue.style.imageBorderRadius, 0)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ imageBorderRadius: `${next}px` })}
          />
          <SelectControl
            label="Image position"
            value={String(servicesValue.style.imagePosition ?? "center")}
            options={[
              { label: "Top", value: "top" },
              { label: "Center", value: "center" },
              { label: "Bottom", value: "bottom" },
            ]}
            onChange={(next) =>
              updateStyle({ imagePosition: next as "top" | "center" | "bottom" })
            }
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Heading
          </div>
          <ColorControl
            label="Heading color"
            value={String(servicesValue.style.headingColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ headingColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(servicesValue.style.headingFontSize, 20)}
            min={12}
            max={40}
            onChange={(next) => updateStyle({ headingFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(servicesValue.style.headingFontWeight ?? "700")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ headingFontWeight: next })}
          />
          <NumberControl
            label="Line height"
            value={Number(servicesValue.style.headingLineHeight ?? 1.3)}
            min={1}
            max={2.2}
            step={0.1}
            onChange={(next) => updateStyle({ headingLineHeight: String(next) })}
          />
          <NumberControl
            label="Heading margin bottom (px)"
            value={toPxNumber(servicesValue.style.headingMarginBottom, 10)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ headingMarginBottom: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Description
          </div>
          <ColorControl
            label="Text color"
            value={String(servicesValue.style.descriptionColor ?? "#475569")}
            onChange={(next) => updateStyle({ descriptionColor: next })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(servicesValue.style.descriptionFontSize, 15)}
            min={12}
            max={28}
            onChange={(next) => updateStyle({ descriptionFontSize: `${next}px` })}
          />
          <NumberControl
            label="Line height"
            value={Number(servicesValue.style.descriptionLineHeight ?? 1.6)}
            min={1}
            max={2.4}
            step={0.1}
            onChange={(next) => updateStyle({ descriptionLineHeight: String(next) })}
          />
          <NumberControl
            label="Description margin bottom (px)"
            value={toPxNumber(servicesValue.style.descriptionMarginBottom, 18)}
            min={0}
            max={48}
            onChange={(next) => updateStyle({ descriptionMarginBottom: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Button
          </div>
          <SelectControl
            label="Button alignment"
            value={String(servicesValue.style.buttonAlignment ?? "left")}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            onChange={(next) =>
              updateStyle({ buttonAlignment: next as "left" | "center" | "right" })
            }
          />
          <ColorControl
            label="Background color"
            value={String(servicesValue.style.buttonBackgroundColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ buttonBackgroundColor: next })}
          />
          <ColorControl
            label="Text color"
            value={String(servicesValue.style.buttonTextColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ buttonTextColor: next })}
          />
          <ColorControl
            label="Border color"
            value={String(servicesValue.style.buttonBorderColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ buttonBorderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(servicesValue.style.buttonBorderWidth, 1)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ buttonBorderWidth: `${next}px` })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(servicesValue.style.buttonBorderRadius, 10)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ buttonBorderRadius: `${next}px` })}
          />
          <NumberControl
            label="Font size (px)"
            value={toPxNumber(servicesValue.style.buttonFontSize, 14)}
            min={11}
            max={24}
            onChange={(next) => updateStyle({ buttonFontSize: `${next}px` })}
          />
          <SelectControl
            label="Font weight"
            value={String(servicesValue.style.buttonFontWeight ?? "600")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ buttonFontWeight: next })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(servicesValue.style.buttonPaddingX, 18)}
            min={8}
            max={48}
            onChange={(next) => updateStyle({ buttonPaddingX: `${next}px` })}
          />
          <NumberControl
            label="Vertical padding (px)"
            value={toPxNumber(servicesValue.style.buttonPaddingY, 10)}
            min={4}
            max={32}
            onChange={(next) => updateStyle({ buttonPaddingY: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Hover
          </div>
          <ToggleControl
            label="Enable card hover effect"
            checked={servicesValue.style.hoverEnabled !== false}
            onChange={(next) => updateStyle({ hoverEnabled: next })}
          />
          <NumberControl
            label="Hover lift amount (px)"
            value={toPxNumber(servicesValue.style.hoverLift, 6)}
            min={0}
            max={24}
            onChange={(next) => updateStyle({ hoverLift: `${next}px` })}
          />
          <ToggleControl
            label="Hover shadow"
            checked={servicesValue.style.hoverShadow !== false}
            onChange={(next) => updateStyle({ hoverShadow: next })}
          />
          <ToggleControl
            label="Image zoom on hover"
            checked={servicesValue.style.imageZoomOnHover !== false}
            onChange={(next) => updateStyle({ imageZoomOnHover: next })}
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <ToggleControl
            label="Hide on mobile"
            checked={servicesValue.responsive.hideOnMobile ?? false}
            onChange={(next) => updateResponsive({ hideOnMobile: next })}
          />
          <ToggleControl
            label="Hide on tablet"
            checked={servicesValue.responsive.hideOnTablet ?? false}
            onChange={(next) => updateResponsive({ hideOnTablet: next })}
          />
          <ToggleControl
            label="Hide on desktop"
            checked={servicesValue.responsive.hideOnDesktop ?? false}
            onChange={(next) => updateResponsive({ hideOnDesktop: next })}
          />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl
            label="Custom ID"
            value={servicesValue.advanced.id || ""}
            onChange={(next) => updateAdvanced({ id: next })}
          />
          <TextControl
            label="Custom CSS classes"
            value={servicesValue.advanced.className || ""}
            onChange={(next) => updateAdvanced({ className: next })}
          />
          <ToggleControl
            label="Visible"
            checked={servicesValue.advanced.visibility !== false}
            onChange={(next) => updateAdvanced({ visibility: next })}
          />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[12px] leading-5 text-slate-500">
            Images use editable alt text and buttons keep accessible labels. Prefer high-contrast
            colors for headings and CTAs.
          </div>
        </div>
      }
    />
  );
}
