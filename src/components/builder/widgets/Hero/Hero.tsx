import { defaultHeroWidgetData, getHeroChildItems, isHeroWidgetData } from "./HeroTypes";
import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { createWidgetInstance, getWidgetRegistration } from "../widgetRegistry";
import { getChildWidgetData } from "../Container/ContainerTypes";

export interface HeroProps {
  data: WidgetData;
}

function getVariantLayout(variant: string) {
  switch (variant) {
    case "Split":
      return "split";
    case "Centered":
      return "centered";
    default:
      return "classic";
  }
}

export function Hero({ data = defaultHeroWidgetData }: HeroProps) {
  const heroData = isHeroWidgetData(data) ? data : defaultHeroWidgetData;
  const visible = heroData.advanced.visibility ?? true;
  const layout = getVariantLayout(heroData.variant ?? defaultHeroWidgetData.variant);

  if (!visible) {
    return null;
  }

  const children = getHeroChildItems(heroData);
  const leftChildren = children.filter((child) => child.type !== "image");
  const imageChildren = children.filter((child) => child.type === "image");
  const buttonChildren = leftChildren.filter((child) => child.type === "button");
  const nonButtonChildren = leftChildren.filter((child) => child.type !== "button");

  const align = heroData.layout.align ?? "left";
  const contentAlignment = align === "center" ? "text-center" : align === "right" ? "text-end" : "text-start";
  const buttonAlignment = align === "center" ? "justify-content-center" : align === "right" ? "justify-content-end" : "justify-content-start";
  const imagePlacement = layout === "centered" ? "order-2 mt-4 mt-lg-0" : "order-2 mt-4 mt-lg-0";

  function renderChild(child: { id: string; type: string; data?: Record<string, unknown> }) {
    const childData = getChildWidgetData(child);
    const childInstance = createWidgetInstance(child.type, {
      id: `${heroData.id}-${child.id}`,
      content: childData.content,
      style: childData.style,
      layout: childData.layout,
      responsive: childData.responsive,
      animation: childData.animation,
      advanced: childData.advanced,
      variant: childData.variant,
    } as Partial<WidgetData>);
    const registration = getWidgetRegistration(child.type);
    const Component = registration?.component;

    return (
      <div
        key={child.id}
        data-wto-parent-widget-id={heroData.id}
        data-wto-child-id={child.id}
        data-wto-widget-element-key={child.id}
        data-wto-widget-element-type="container"
      >
        {Component ? <Component data={childInstance as WidgetData} /> : null}
      </div>
    );
  }

  return (
    <BaseWidget
      data={heroData}
      widgetType="hero"
      title="Hero Widget"
      variantLabel={heroData.variant}
      wrapperClassName="py-5"
      contentClassName="overflow-hidden"
    >
      <section
        className="py-0"
        data-widget="hero-v2"
        data-hero-id={heroData.advanced.id ?? "hero-widget-v2"}
        style={{
          background: heroData.style.backgroundColor ?? "#f8fafc",
          color: heroData.style.textColor ?? "#0f172a",
          paddingTop: `${heroData.style.paddingY ?? 5}rem`,
          paddingBottom: `${heroData.style.paddingY ?? 5}rem`,
        }}
      >
        <div className="w-full">
          <div className={`row align-items-center g-4 ${layout === "centered" ? "justify-content-center" : ""}`}>
            <div className={`col-lg-7 ${layout === "centered" ? "text-center" : ""}`}>
              <div className={contentAlignment}>
                {nonButtonChildren.map(renderChild)}
                {buttonChildren.length > 0 ? (
                  <div className={`d-flex gap-3 flex-wrap ${buttonAlignment}`}>
                    {buttonChildren.map(renderChild)}
                  </div>
                ) : null}
              </div>
            </div>
            {imageChildren.length > 0 ? (
              <div className={`col-lg-5 ${imagePlacement}`}>
                {imageChildren.map(renderChild)}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </BaseWidget>
  );
}
