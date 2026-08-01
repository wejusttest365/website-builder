import type { ComponentType } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faMagic, faBars, faHeading, faParagraph, faHandPointer, faImage, faSquare, faColumns } from "@fortawesome/free-solid-svg-icons";
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
import { defaultGridWidgetData } from "./Grid/GridTypes";
import { registerWidgetEditableElements, type WidgetEditableElementDefinition } from "./elementSelection";
import { renderSectionWidthBootstrapWrapper } from "./BaseWidget";

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
  propertiesComponent: ComponentType<{ value: WidgetData; onChange: (nextValue: WidgetData) => void }>;
  bootstrapExporter: (data: WidgetData) => string;
  defaultData: TData;
  supportedVariants: string[];
  defaultVariant: string;
  supportsChildren?: boolean;
  childElementTypes?: string[];
}

export type WidgetRegistration<TData extends WidgetData = WidgetData> = WidgetDefinition<TData>;

export interface WidgetInstance<TData extends WidgetData = WidgetData> extends WidgetData {}

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

export function createWidgetInstance(typeOrId: string, overrides: Partial<WidgetInstance<WidgetData>> = {}): WidgetInstance<WidgetData> {
  const registration = getWidgetRegistration(typeOrId);
  if (!registration) {
    throw new Error(`Unknown widget type: ${typeOrId}`);
  }

  const baseData = registration.defaultData;
  const baseVariant = (baseData as WidgetData).variant ?? registration.defaultVariant;
  return {
    id: overrides.id ?? `${registration.type}-${Math.random().toString(36).slice(2, 8)}`,
    type: registration.type,
    variant: overrides.variant ?? baseVariant,
    content: overrides.content ?? cloneWidgetValue(baseData.content),
    style: overrides.style ?? cloneWidgetValue(baseData.style),
    layout: overrides.layout ?? cloneWidgetValue(baseData.layout),
    responsive: overrides.responsive ?? cloneWidgetValue(baseData.responsive),
    animation: overrides.animation ?? cloneWidgetValue(baseData.animation),
    advanced: overrides.advanced ?? cloneWidgetValue(baseData.advanced),
  };
}

export function createWidgetSectionTemplate(typeOrId: string) {
  const registration = getWidgetRegistration(typeOrId);
  const instance = createWidgetInstance(typeOrId);
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

export function getWidgetBootstrapExport(type: string, data: WidgetData) {
  const registration = getWidgetRegistration(type);
  if (!registration) {
    return "";
  }

  const html = registration.bootstrapExporter(data);
  if (!html) return "";
  return renderSectionWidthBootstrapWrapper(data.layout, html);
}

registerWidgetEditableElements("hero", [
  { key: "badge", type: "text", label: "Badge" },
  { key: "heading", type: "text", label: "Heading" },
  { key: "subheading", type: "text", label: "Subheading" },
  { key: "description", type: "text", label: "Description" },
  { key: "primaryButton", type: "button", label: "Primary Button" },
  { key: "secondaryButton", type: "button", label: "Secondary Button" },
  { key: "image", type: "image", label: "Image" },
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
  childElementTypes: ["heading", "text", "button", "image"],
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
  displayName: "Bootstrap Navbar",
  icon: faBars,
  category: "Navigation",
  preview: "Responsive Bootstrap navbar with CTA and logo variants.",
  description: "Bootstrap 5 navbar widget with configurable logo, nav links, CTA, sticky behavior, and visual variants.",
  component: Navbar,
  propertiesComponent: NavbarProperties,
  bootstrapExporter: buildNavbarBootstrapMarkup,
  defaultData: defaultNavbarWidgetData,
  supportedVariants: ["Classic", "Centered Logo", "Transparent", "Glass", "Minimal"],
  defaultVariant: "Classic",
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

export const widgetRegistryEntries = getAllWidgetRegistrations();
