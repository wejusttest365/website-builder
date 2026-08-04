import type { ComponentType } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faMagic, faBars, faHeading, faParagraph, faHandPointer, faImage, faSquare, faColumns, faCopyright, faImages, faTableCells, faCircleQuestion, faBriefcase, faBuilding, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { About } from "./About/About";
import { AboutProperties } from "./About/AboutProperties";
import { buildAboutBootstrapMarkup } from "./About/AboutBootstrapExport";
import { defaultAboutWidgetData } from "./About/AboutTypes";
import { CTA } from "./CTA/CTA";
import { CTAProperties } from "./CTA/CTAProperties";
import { buildCtaBootstrapMarkup } from "./CTA/CTABootstrapExport";
import { applyCtaVariant, defaultCtaWidgetData, type CtaVariant } from "./CTA/CTATypes";
import { Services } from "./Services/Services";
import { ServicesProperties } from "./Services/ServicesProperties";
import { buildServicesBootstrapMarkup } from "./Services/ServicesBootstrapExport";
import { defaultServicesWidgetData } from "./Services/ServicesTypes";
import { FAQ } from "./FAQ/FAQ";
import { FAQProperties } from "./FAQ/FAQProperties";
import { buildFAQBootstrapMarkup } from "./FAQ/FAQBootstrapExport";
import { defaultFAQWidgetData } from "./FAQ/FAQTypes";
import { Gallery } from "./Gallery/Gallery";
import { GalleryProperties } from "./Gallery/GalleryProperties";
import { buildGalleryBootstrapMarkup } from "./Gallery/GalleryBootstrapExport";
import { defaultGalleryWidgetData } from "./Gallery/GalleryTypes";
import { Carousel } from "./Carousel/Carousel";
import { CarouselProperties } from "./Carousel/CarouselProperties";
import { buildCarouselBootstrapMarkup } from "./Carousel/CarouselBootstrapExport";
import { defaultCarouselWidgetData } from "./Carousel/CarouselTypes";
import { Footer } from "./Footer/Footer";
import { FooterProperties } from "./Footer/FooterProperties";
import { buildFooterBootstrapMarkup } from "./Footer/FooterBootstrapExport";
import { defaultFooterWidgetData } from "./Footer/FooterTypes";
import { Hero } from "./Hero/Hero";
import { HeroProperties } from "./Hero/HeroProperties";
import { buildHeroBootstrapMarkup } from "./Hero/HeroBootstrapExport";
import { defaultHeroWidgetData } from "./Hero/HeroTypes";
import { Navbar } from "./Navbar/Navbar";
import { NavbarProperties } from "./Navbar/NavbarProperties";
import { buildNavbarBootstrapMarkup } from "./Navbar/NavbarBootstrapExport";
import { defaultNavbarWidgetData } from "./Navbar/NavbarTypes";
import { Heading } from "./Heading/Heading";
import { HeadingProperties } from "./Heading/HeadingProperties";
import { buildHeadingBootstrapMarkup } from "./Heading/HeadingBootstrapExport";
import { defaultHeadingWidgetData } from "./Heading/HeadingTypes";
import { Text } from "./Text/Text";
import { TextProperties } from "./Text/TextProperties";
import { buildTextBootstrapMarkup } from "./Text/TextBootstrapExport";
import { defaultTextWidgetData } from "./Text/TextTypes";
import { Button } from "./Button/Button";
import { ButtonProperties } from "./Button/ButtonProperties";
import { buildButtonBootstrapMarkup } from "./Button/ButtonBootstrapExport";
import { defaultButtonWidgetData } from "./Button/ButtonTypes";
import { Image } from "./Image/Image";
import { ImageProperties } from "./Image/ImageProperties";
import { buildImageBootstrapMarkup } from "./Image/ImageBootstrapExport";
import { defaultImageWidgetData } from "./Image/ImageTypes";
import { Container } from "./Container/Container";
import { ContainerProperties } from "./Container/ContainerProperties";
import { buildContainerBootstrapMarkup } from "./Container/ContainerBootstrapExport";
import { defaultContainerWidgetData } from "./Container/ContainerTypes";
import { Grid } from "./Grid/Grid";
import { GridProperties } from "./Grid/GridProperties";
import { buildGridBootstrapMarkup } from "./Grid/GridBootstrapExport";
import { defaultGridWidgetData, syncGridInstanceToVariant } from "./Grid/GridTypes";
import { registerWidgetEditableElements, type WidgetEditableElementDefinition } from "./elementSelection";
import { renderSectionWidthBootstrapWrapper } from "./BaseWidget";
import { getWidgetBackgroundCss } from "./BackgroundStyle";
import {
  isFullWidthExportHtml,
  normalizeWidgetExport,
  type WidgetExportResult,
} from "@/lib/builder/exportContributions";

export type WidgetCategory = "Layout" | "Navigation" | "Content" | "Business" | "Marketing" | "Media" | "Forms" | "Footer" | "Advanced";

export interface WidgetData {
  id: string;
  type: string;
  variant: string;
  content: Record<string, unknown>;
  style: Record<string, unknown>;
  layout: Record<string, unknown>;
  responsive: Record<string, unknown>;
  animation: Record<string, unknown>;
  advanced: Record<string, unknown>;
}

export interface WidgetDefinition<TData extends WidgetData = WidgetData> {
  id: string;
  type: string;
  displayName: string;
  icon: IconDefinition;
  category: WidgetCategory;
  preview?: string;
  description?: string;
  component: ComponentType<{ data: WidgetData }>;
  propertiesComponent: ComponentType<{ value: WidgetData; onChange: (nextValue: WidgetData) => void; onClose?: () => void }>;
  /** May return HTML string or `{ html, css?, js? }` for shared export assets. */
  bootstrapExporter: (data: WidgetData, context?: WidgetExportContext) => string | WidgetExportResult;
  defaultData: TData;
  supportedVariants: string[];
  defaultVariant: string;
  supportsChildren?: boolean;
  childElementTypes?: string[];
}

export type WidgetRegistration<TData extends WidgetData = WidgetData> = WidgetDefinition<TData>;

export interface WidgetInstance<TData extends WidgetData = WidgetData> extends WidgetData {}

/** Canvas/editor vs preview/export rendering context for bootstrap markup. */
export type WidgetExportContext = {
  editorMode?: boolean;
};

export function getWidgetHtmlFromInstance(instance: WidgetInstance<WidgetData>) {
  return getWidgetBootstrapExport(instance.type, instance);
}

const widgetRegistryById = new Map<string, WidgetDefinition<WidgetData>>();
const widgetRegistryByType = new Map<string, WidgetDefinition<WidgetData>>();

export function registerWidget<TData extends WidgetData>(registration: WidgetDefinition<TData>) {
  const entry: WidgetDefinition<WidgetData> = {
    ...registration,
    component: registration.component,
    propertiesComponent: registration.propertiesComponent,
    bootstrapExporter: registration.bootstrapExporter,
    defaultData: registration.defaultData,
  };
  widgetRegistryById.set(registration.id, entry);
  widgetRegistryByType.set(registration.type, entry);
  return registration;
}

export function getWidgetRegistration(typeOrId: string) {
  return widgetRegistryById.get(typeOrId) ?? widgetRegistryByType.get(typeOrId);
}

export function getAllWidgetRegistrations() {
  return Array.from(widgetRegistryById.values());
}

function cloneWidgetValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneWidgetValue(item)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, cloneWidgetValue(child)])) as T;
  }
  return value;
}

import { getNavbarVariantDefaultShowCta } from "./Navbar/NavbarTypes";
import { applyFooterVariant, type FooterVariant } from "./Footer/FooterTypes";

export function createWidgetInstance(typeOrId: string, overrides: Partial<WidgetInstance<WidgetData>> = {}): WidgetInstance<WidgetData> {
  const registration = getWidgetRegistration(typeOrId);
  if (!registration) {
    throw new Error(`Unknown widget type: ${typeOrId}`);
  }

  const baseData = registration.defaultData;
  const baseVariant = (baseData as WidgetData).variant ?? registration.defaultVariant;
  const variant = overrides.variant ?? baseVariant;
  const baseContent = cloneWidgetValue(baseData.content);
  const contentOverrides = overrides.content ?? {};
  const defaultShowCta = getNavbarVariantDefaultShowCta(variant);
  const content = registration.type === "navbar"
    ? {
        ...baseContent,
        ...contentOverrides,
        showCta:
          contentOverrides.showCta !== undefined
            ? contentOverrides.showCta
            : defaultShowCta,
        ctaEnabled:
          contentOverrides.ctaEnabled !== undefined
            ? contentOverrides.ctaEnabled
            : contentOverrides.showCta !== undefined
              ? contentOverrides.showCta
              : defaultShowCta,
      }
    : { ...baseContent, ...contentOverrides };

  const instance = {
    id: overrides.id ?? `${registration.type}-${Math.random().toString(36).slice(2, 8)}`,
    type: registration.type,
    variant,
    content,
    style: overrides.style ?? cloneWidgetValue(baseData.style),
    layout: overrides.layout ?? cloneWidgetValue(baseData.layout),
    responsive: overrides.responsive ?? cloneWidgetValue(baseData.responsive),
    animation: overrides.animation ?? cloneWidgetValue(baseData.animation),
    advanced: overrides.advanced ?? cloneWidgetValue(baseData.advanced),
  } as WidgetInstance<WidgetData>;

  if (registration.type === "grid") {
    const hasExplicitColumns = Array.isArray((overrides.content as { columns?: unknown } | undefined)?.columns);
    if (!hasExplicitColumns) {
      return syncGridInstanceToVariant(instance, String(variant || defaultGridWidgetData.variant));
    }
    const columnCount = Array.isArray((instance.content as { columns?: unknown[] }).columns)
      ? ((instance.content as { columns: unknown[] }).columns.length || 1)
      : 1;
    return {
      ...instance,
      layout: {
        ...(instance.layout as Record<string, unknown>),
        columns: Number((instance.layout as { columns?: number } | undefined)?.columns) || columnCount,
      },
    } as WidgetInstance<WidgetData>;
  }

  if (registration.type === "footer") {
    return applyFooterVariant(instance as any, String(variant || defaultFooterWidgetData.variant) as FooterVariant) as WidgetInstance<WidgetData>;
  }

  if (registration.type === "cta") {
    return applyCtaVariant(instance as any, String(variant || defaultCtaWidgetData.variant) as CtaVariant) as WidgetInstance<WidgetData>;
  }

  return instance;
}

export function createWidgetSectionTemplate(typeOrId: string, overrides: Partial<WidgetInstance<WidgetData>> = {}) {
  const registration = getWidgetRegistration(typeOrId);
  const instance = createWidgetInstance(typeOrId, overrides);
  const fallbackHtml = `<section class="py-5"><div class="container"><div class="text-center">${registration?.displayName ?? "Widget"}</div></div></section>`;
  const html = getWidgetBootstrapExport(instance.type, instance) || fallbackHtml;

  return {
    id: `${registration?.type ?? typeOrId}-${instance.id}`,
    name: registration?.displayName ?? "Widget",
    category: registration?.category ?? "Content",
    html,
    thumbBg: "linear-gradient(135deg, #0f172a, #7c3aed)",
    widgetInstance: instance,
  };
}

export function getWidgetComponent(type: string) {
  return getWidgetRegistration(type)?.component;
}

export function getWidgetPropertiesComponent(type: string) {
  return getWidgetRegistration(type)?.propertiesComponent;
}

/**
 * Resolve a widget's export contribution (HTML + optional CSS/JS).
 * Existing string exporters remain supported; richer `{ html, css, js }` results
 * are collected into css/styles.css and js/main.js by the site export pipeline.
 */
export function getWidgetExportContribution(
  type: string,
  data: WidgetData,
  context?: WidgetExportContext,
): WidgetExportResult {
  const registration = getWidgetRegistration(type);
  if (!registration) {
    return { html: "" };
  }

  const normalized = normalizeWidgetExport(registration.bootstrapExporter(data, context));
  let html = normalized.html;
  if (!html) return { html: "" };

  // Full-width widgets already render their own outer section.
  if (!isFullWidthExportHtml(html)) {
    html = renderSectionWidthBootstrapWrapper(
      data.layout,
      getWidgetBackgroundCss(data.style as Record<string, unknown>),
      html,
    );
  }

  return {
    html,
    css: normalized.css,
    js: normalized.js,
  };
}

export function getWidgetBootstrapExport(type: string, data: WidgetData, context?: WidgetExportContext) {
  const contribution = getWidgetExportContribution(type, data, context);
  if (!contribution.html) return "";
  if (contribution.css) {
    return `<style>${contribution.css}</style>\n${contribution.html}`;
  }
  return contribution.html;
}

registerWidgetEditableElements("hero", [
  { key: "badge", type: "text", label: "Badge" },
  { key: "heading", type: "text", label: "Heading" },
  { key: "subheading", type: "text", label: "Subheading" },
  { key: "description", type: "text", label: "Description" },
  { key: "primaryButton", type: "button", label: "Primary Button" },
  { key: "secondaryButton", type: "button", label: "Secondary Button" },
  { key: "image", type: "image", label: "Image" },
  { key: "statsCard", type: "container", label: "Stats Card" },
  { key: "statsValue", type: "text", label: "Stats Value" },
  { key: "statsMeta", type: "text", label: "Stats Meta" },
  { key: "glowA", type: "container", label: "Glow A" },
  { key: "glowB", type: "container", label: "Glow B" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "hero-v2",
  type: "hero",
  displayName: "Hero Widget V2",
  icon: faMagic,
  category: "Content",
  preview: "Launch a polished hero section",
  description: "Bootstrap-ready hero section with modern variants for marketing and product pages.",
  component: Hero,
  propertiesComponent: HeroProperties,
  bootstrapExporter: buildHeroBootstrapMarkup,
  defaultData: defaultHeroWidgetData,
  supportedVariants: ["Classic", "Split", "Centered"],
  defaultVariant: "Classic",
  supportsChildren: true,
  childElementTypes: ["heading", "text", "button", "image", "container"],
});

registerWidgetEditableElements("navbar", [
  { key: "logo", type: "container", label: "Logo" },
  { key: "navigation", type: "container", label: "Navigation" },
  { key: "navigationItem", type: "link", label: "Navigation Item" },
  { key: "ctaButton", type: "button", label: "CTA Button" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "navbar-v1",
  type: "navbar",
  displayName: "Header",
  icon: faBars,
  category: "Navigation",
  preview: "Responsive Header navbar with CTA and logo variants.",
  description: "Bootstrap 5 navbar widget with configurable logo, nav links, CTA, sticky behavior, and visual variants.",
  component: Navbar,
  propertiesComponent: NavbarProperties,
  bootstrapExporter: buildNavbarBootstrapMarkup,
  defaultData: defaultNavbarWidgetData,
  supportedVariants: ["Classic Light", "Dark Premium", "Gradient CTA", "Minimal No Button", "Centered Brand"],
  defaultVariant: "Classic Light",
});

registerWidgetEditableElements("heading", [{ key: "heading", type: "text", label: "Heading" }] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "heading-v1",
  type: "heading",
  displayName: "Heading",
  icon: faHeading,
  category: "Content",
  preview: "Flexible heading widget with semantic HTML and Bootstrap-ready styling.",
  description: "A production-ready heading widget with variants for section titles, centered headings, gradients, and underline styles.",
  component: Heading,
  propertiesComponent: HeadingProperties,
  bootstrapExporter: buildHeadingBootstrapMarkup,
  defaultData: defaultHeadingWidgetData,
  supportedVariants: ["Simple", "Section Title", "Centered", "Gradient", "Underline"],
  defaultVariant: "Simple",
});

registerWidgetEditableElements("text", [{ key: "text", type: "text", label: "Text" }] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "text-v1",
  type: "text",
  displayName: "Text",
  icon: faParagraph,
  category: "Content",
  preview: "Flexible text widget with semantic paragraphs, quotes, and typographic variants.",
  description: "Bootstrap-ready text widget with rich text toggle, typography controls, and semantic export markup.",
  component: Text,
  propertiesComponent: TextProperties,
  bootstrapExporter: buildTextBootstrapMarkup,
  defaultData: defaultTextWidgetData,
  supportedVariants: ["Paragraph", "Lead Text", "Small Text", "Muted Text", "Quote", "Highlight"],
  defaultVariant: "Paragraph",
});

registerWidgetEditableElements("button", [{ key: "button", type: "button", label: "Button" }] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "button-v1",
  type: "button",
  displayName: "Button",
  icon: faHandPointer,
  category: "Content",
  preview: "Bootstrap-ready button with style, icon, layout, and responsive options.",
  description: "Production-ready button widget with bootstrap export, icon support, custom color options, and responsive behavior.",
  component: Button,
  propertiesComponent: ButtonProperties,
  bootstrapExporter: buildButtonBootstrapMarkup,
  defaultData: defaultButtonWidgetData,
  supportedVariants: ["Filled", "Outline", "Ghost", "Gradient"],
  defaultVariant: "Filled",
});

registerWidgetEditableElements("image", [
  { key: "image", type: "image", label: "Image" },
  { key: "caption", type: "text", label: "Caption" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "image-v1",
  type: "image",
  displayName: "Image",
  icon: faImage,
  category: "Content",
  preview: "Responsive image widget with caption, overlay, and Bootstrap-friendly export.",
  description: "Production-ready image widget using existing builder image upload and Bootstrap-compatible semantic HTML.",
  component: Image,
  propertiesComponent: ImageProperties,
  bootstrapExporter: buildImageBootstrapMarkup,
  defaultData: defaultImageWidgetData,
  supportedVariants: ["Standard", "Rounded", "Card Image", "Image with Caption", "Image with Overlay"],
  defaultVariant: "Standard",
});

registerWidgetEditableElements("container", [
  { key: "content", type: "container", label: "Content" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "container-v1",
  type: "container",
  displayName: "Container",
  icon: faSquare,
  category: "Layout",
  preview: "Drop content widgets into a reusable container area.",
  description: "A flexible content-area widget for grouping heading, text, button, and image items.",
  component: Container,
  propertiesComponent: ContainerProperties,
  bootstrapExporter: buildContainerBootstrapMarkup,
  defaultData: defaultContainerWidgetData,
  supportedVariants: ["Simple", "Stacked", "Grid", "Card"],
  defaultVariant: "Simple",
  supportsChildren: true,
  childElementTypes: ["heading", "text", "button", "image"],
});

registerWidgetEditableElements("grid", [{ key: "content", type: "container", label: "Grid Content" }] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "grid-v1",
  type: "grid",
  displayName: "Grid Layout",
  icon: faColumns,
  category: "Layout",
  preview: "Create responsive multi-column layouts from the builder canvas.",
  description: "A bootstrap-friendly grid widget for creating responsive column-based sections.",
  component: Grid,
  propertiesComponent: GridProperties,
  bootstrapExporter: buildGridBootstrapMarkup,
  defaultData: defaultGridWidgetData,
  supportedVariants: ["One column", "Two equal columns", "Three equal columns", "Four equal columns", "Wide left", "Wide right", "Sidebar left", "Sidebar right"],
  defaultVariant: "One column",
  supportsChildren: true,
  childElementTypes: ["heading", "text", "button", "image"],
});

registerWidgetEditableElements("footer", [
  { key: "brand", type: "container", label: "Brand" },
  { key: "brandLogo", type: "image", label: "Brand Logo" },
  { key: "brandName", type: "text", label: "Brand Name" },
  { key: "brandDescription", type: "text", label: "Brand Description" },
  { key: "contact", type: "container", label: "Contact" },
  { key: "social", type: "container", label: "Social" },
  { key: "bottomBar", type: "container", label: "Bottom Bar" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "footer-v1",
  type: "footer",
  displayName: "Footer",
  icon: faCopyright,
  category: "Footer",
  preview: "Premium dark and light footers with columns, contact, and social links.",
  description: "Fully editable footer widget with brand, link columns, contact info, social media, and legal bottom bar.",
  component: Footer,
  propertiesComponent: FooterProperties,
  bootstrapExporter: buildFooterBootstrapMarkup,
  defaultData: defaultFooterWidgetData,
  supportedVariants: ["Dark Footer", "Light Footer"],
  defaultVariant: "Dark Footer",
});

registerWidgetEditableElements("carousel", [
  { key: "slide", type: "image", label: "Slide Image" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "carousel-v1",
  type: "carousel",
  displayName: "Carousel",
  icon: faImages,
  category: "Media",
  preview: "Full-width image slider with arrows, dots, and autoplay.",
  description: "Professional full-width image carousel with slide management, arrows, dots, and interactive settings.",
  component: Carousel,
  propertiesComponent: CarouselProperties,
  bootstrapExporter: buildCarouselBootstrapMarkup,
  defaultData: defaultCarouselWidgetData,
  supportedVariants: ["Full-Width Image Slider"],
  defaultVariant: "Full-Width Image Slider",
});


registerWidgetEditableElements("gallery", [
  { key: "image", type: "image", label: "Gallery Image" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "gallery-v1",
  type: "gallery",
  displayName: "Image Gallery",
  icon: faTableCells,
  category: "Media",
  preview: "Simple responsive image gallery with equal tiles and clean spacing.",
  description: "Responsive Bootstrap-compatible image gallery with column controls, hover effects, and image management.",
  component: Gallery,
  propertiesComponent: GalleryProperties,
  bootstrapExporter: buildGalleryBootstrapMarkup,
  defaultData: defaultGalleryWidgetData,
  supportedVariants: ["Simple Grid"],
  defaultVariant: "Simple Grid",
});


registerWidgetEditableElements("faq", [
  { key: "item", type: "container", label: "FAQ Item" },
  { key: "question", type: "text", label: "Question" },
  { key: "answer", type: "text", label: "Answer" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "faq-v1",
  type: "faq",
  displayName: "FAQ",
  icon: faCircleQuestion,
  category: "Content",
  preview: "Clean accordion FAQ with expandable questions and answers.",
  description: "Professional FAQ accordion with single or multiple open modes, accessible headers, and full styling controls.",
  component: FAQ,
  propertiesComponent: FAQProperties,
  bootstrapExporter: buildFAQBootstrapMarkup,
  defaultData: defaultFAQWidgetData,
  supportedVariants: ["Simple Accordion"],
  defaultVariant: "Simple Accordion",
});


registerWidgetEditableElements("services", [
  { key: "service", type: "container", label: "Service Card" },
  { key: "image", type: "image", label: "Service Image" },
  { key: "heading", type: "text", label: "Service Heading" },
  { key: "description", type: "text", label: "Service Description" },
  { key: "button", type: "button", label: "Service Button" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "services-v1",
  type: "services",
  displayName: "Services",
  icon: faBriefcase,
  category: "Business",
  preview: "Professional service cards with image, heading, description, and CTA.",
  description: "Responsive services section with editable cards, column controls, and hover styling.",
  component: Services,
  propertiesComponent: ServicesProperties,
  bootstrapExporter: buildServicesBootstrapMarkup,
  defaultData: defaultServicesWidgetData,
  supportedVariants: ["Service Cards"],
  defaultVariant: "Service Cards",
});


registerWidgetEditableElements("about", [
  { key: "eyebrow", type: "text", label: "Eyebrow" },
  { key: "heading", type: "text", label: "Heading" },
  { key: "description", type: "text", label: "Description" },
  { key: "feature", type: "text", label: "Feature" },
  { key: "button", type: "button", label: "Button" },
  { key: "image", type: "image", label: "Image" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "about-v1",
  type: "about",
  displayName: "About Us",
  icon: faBuilding,
  category: "Content",
  preview: "Split About Us section with content, features, CTA, and image.",
  description: "Professional split-content About Us section with editable text, features, button, image, and Bootstrap column controls.",
  component: About,
  propertiesComponent: AboutProperties,
  bootstrapExporter: buildAboutBootstrapMarkup,
  defaultData: defaultAboutWidgetData,
  supportedVariants: ["Split Content"],
  defaultVariant: "Split Content",
});


registerWidgetEditableElements("cta", [
  { key: "eyebrow", type: "text", label: "Eyebrow" },
  { key: "heading", type: "text", label: "Heading" },
  { key: "paragraph", type: "text", label: "Paragraph" },
  { key: "primaryButton", type: "button", label: "Primary Button" },
  { key: "secondaryButton", type: "button", label: "Secondary Button" },
  { key: "background", type: "image", label: "Background" },
  { key: "overlay", type: "container", label: "Overlay" },
] satisfies WidgetEditableElementDefinition[]);

registerWidget({
  id: "cta-v1",
  type: "cta",
  displayName: "Call To Action",
  icon: faBullhorn,
  category: "Marketing",
  preview: "Full-width CTA with gradient or background image variants.",
  description: "Premium call-to-action section with editable content, gradient or image backgrounds, overlay controls, and Bootstrap-compatible export.",
  component: CTA,
  propertiesComponent: CTAProperties,
  bootstrapExporter: buildCtaBootstrapMarkup,
  defaultData: defaultCtaWidgetData,
  supportedVariants: ["Gradient / Color CTA", "Background Image CTA"],
  defaultVariant: "Gradient / Color CTA",
});

export const widgetRegistryEntries = getAllWidgetRegistrations();
