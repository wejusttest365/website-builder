import { createWidgetInstance, getWidgetBootstrapExport, type WidgetData } from "../widgetRegistry";
import { getContainerChildWidgetData, type ContainerChildItem } from "../Container/ContainerTypes";
import { defaultHeroWidgetData, getHeroChildItems, isHeroWidgetData, normalizeHeroChildItem } from "./HeroTypes";
import { getResponsiveSpacingCss, resolveHeroLayoutMargin, resolveHeroLayoutPadding } from "../spacing";

function serializeStyle(style: Record<string, unknown>) {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}:${String(value)};`)
    .join("");
}

function getElementType(type: string) {
  if (type === "heading" || type === "text") return "text";
  if (type === "button") return "button";
  if (type === "image") return "image";
  return "container";
}

export function buildHeroBootstrapMarkup(
  data: WidgetData = defaultHeroWidgetData
): string {
  const heroData = isHeroWidgetData(data) ? data : defaultHeroWidgetData;
  const style = heroData.style;
  const layout = {
    ...heroData.layout,
    padding: resolveHeroLayoutPadding(heroData.layout.padding),
    margin: resolveHeroLayoutMargin(heroData.layout.margin),
  };

  const variant =
    heroData.variant === "Split"
      ? "split"
      : heroData.variant === "Centered"
      ? "centered"
      : "classic";

  const alignClass =
    layout.align === "center"
      ? "text-center"
      : layout.align === "right"
      ? "text-end"
      : "text-start";

  const buttonAlignClass =
    layout.align === "center"
      ? "justify-content-center"
      : layout.align === "right"
      ? "justify-content-end"
      : "justify-content-start";

  const spacingClass = `wto-hero-space-${String(heroData.id || "hero").replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const spacingCss = getResponsiveSpacingCss(layout as Record<string, unknown>, spacingClass);

  const heroStyles = [
    `background:${style.backgroundColor ?? "#f8fafc"};`,
    `color:${style.textColor ?? "#0f172a"};`,
    "width:100%;",
    "box-sizing:border-box;",
  ].join("");

  const children = getHeroChildItems(heroData);
  const bodyChildren = children.filter(
    (child) =>
      child.type !== "button" &&
      child.type !== "image" &&
      child.id !== "statsCard" &&
      child.id !== "statsValue" &&
      child.id !== "statsMeta" &&
      child.id !== "glowA" &&
      child.id !== "glowB"
  );
  const buttonChildren = children.filter((child) => child.type === "button");
  const imageChildren = children.filter((child) => child.type === "image");
  const statsWrapperChild = children.find((child) => child.id === "statsCard");
  const statsValueChild = children.find((child) => child.id === "statsValue");
  const statsMetaChild = children.find((child) => child.id === "statsMeta");
  const glowChildren: typeof children = [];
  const trustChild = children.find((child) => child.id === "trustText");

  const getClassicWrapperClass = (child: { id: string; type: string }) => {
    if (variant !== "classic") {
      return undefined;
    }

    if (child.id === "badge") return "hero-badge-wrapper";
    if (child.id === "heading") return "hero-heading-wrapper";
    if (child.id === "image") return "hero-image-inner";
    if (child.id === "statsValue") return "hero-stats-card__value";
    if (child.id === "statsMeta") return "hero-stats-card__meta";
    return "hero-copy-block";
  };

  const renderChildHtml = (child: {
    id: string;
    type: string;
    data?: Record<string, unknown>;
  }): string => {
    const normalizedChild = normalizeHeroChildItem(heroData, child as ContainerChildItem);
    const childData = getContainerChildWidgetData(normalizedChild);

    if (child.id === "statsCard") {
      return `
        <div
          data-wto-parent-widget-id="${heroData.id}"
          data-wto-child-id="${child.id}"
          data-wto-widget-element-key="${child.id}"
          data-wto-widget-element-type="container"
          class="hero-stats-card"
          style="${serializeStyle(childData.style)}"
        >
          ${statsValueChild ? renderChildHtml(statsValueChild) : ""}
          ${statsMetaChild ? renderChildHtml(statsMetaChild) : ""}
        </div>
      `;
    }

    const childInstance = createWidgetInstance(child.type, {
      content: childData.content,
      style: childData.style,
      layout: childData.layout,
      responsive: childData.responsive,
      animation: childData.animation,
      advanced: childData.advanced,
      variant: childData.variant,
    } as Partial<WidgetData>);

    const childHtml = getWidgetBootstrapExport(child.type, childInstance) || "";
    const wrapperClass = getClassicWrapperClass(child);
    const classAttribute = wrapperClass ? ` class="${wrapperClass}"` : "";

    return `
      <div
        data-wto-parent-widget-id="${heroData.id}"
        data-wto-child-id="${child.id}"
        data-wto-widget-element-key="${child.id}"
        data-wto-widget-element-type="${getElementType(child.type)}"
        ${classAttribute}
      >
        ${childHtml}
      </div>
    `;
  };

  const glowHtml = glowChildren.map(renderChildHtml).join("");
  const statsHtml = statsWrapperChild ? renderChildHtml(statsWrapperChild) : "";
  const bodyHtml = bodyChildren.map(renderChildHtml).join("");
  const buttonHtml = buttonChildren.map(renderChildHtml).join("");
  const imageHtml = imageChildren.map(renderChildHtml).join("");
  const buttonsMarkup = buttonHtml
    ? `
      <div class="d-flex gap-3 flex-wrap ${buttonAlignClass}">
        ${buttonHtml}
      </div>
    `
    : "";

  if (variant === "centered") {
    return `
${spacingCss ? `<style>${spacingCss}</style>` : ""}
<section
  class="builder-hero builder-hero--centered ${spacingClass}"
  style="${heroStyles}"
>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-9 col-xl-8">
        <div class="text-center">
          ${bodyHtml}
          ${buttonsMarkup}
          ${imageHtml ? `<div class="mt-5 mx-auto" style="max-width:620px;">${imageHtml}</div>` : ""}
        </div>
      </div>
    </div>
  </div>
</section>
`;
  }

  if (variant === "split") {
    return `
${spacingCss ? `<style>${spacingCss}</style>` : ""}
<section
  class="builder-hero builder-hero--split ${spacingClass}"
  style="${heroStyles}"
>
  <div class="container">
    <div class="row g-0 align-items-stretch overflow-hidden rounded-5 border shadow-lg">
      <div class="col-lg-6 d-flex align-items-center">
        <div class="w-100 p-4 p-md-5">
          <div class="${alignClass}">
            ${bodyHtml}
            ${buttonsMarkup}
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="h-100 position-relative">
          ${glowHtml}
          ${imageHtml}
          ${statsHtml}
        </div>
      </div>
    </div>
  </div>
</section>
`;
  }

  return `
${spacingCss ? `<style>${spacingCss}</style>` : ""}
<section
  class="builder-hero builder-hero-classic ${spacingClass}"
  style="${heroStyles}"
>
  <div class="container">
    <div class="row align-items-center g-5">
      <div class="col-lg-7">
        <div class="${alignClass}">
          ${bodyHtml}
          ${buttonsMarkup}
          ${buttonHtml ? (trustChild ? renderChildHtml(trustChild) : "") : ""}
        </div>
      </div>

      <div class="col-lg-5">
        <div class="hero-image-column position-relative">
          ${glowHtml}
          <div class="hero-image-frame">
            ${imageHtml}
          </div>
          ${statsHtml}
        </div>
      </div>
    </div>
  </div>
</section>
`;
}
