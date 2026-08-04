import { defaultHeroWidgetData, getHeroChildItems, isHeroWidgetData, normalizeHeroChildItem } from "./HeroTypes";
import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { createWidgetInstance, getWidgetRegistration } from "../widgetRegistry"; 
import {
  getChildWidgetData,
  type ContainerChildItem,
} from "../Container/ContainerTypes";
import { useBuilder } from "@/lib/builder/store";
import { getSpacingBoxStyle, resolveHeroLayoutMargin, resolveHeroLayoutPadding } from "../spacing";

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
  const device = useBuilder((s) => s.device);
  const spacingDevice = device === "tablet" || device === "mobile" ? device : "desktop";

  if (!visible) {
    return null;
  }

  const children = getHeroChildItems(heroData);
  const imageChildren = children.filter((child) => child.type === "image");
  const buttonChildren = children.filter((child) => child.type === "button");
  const statsWrapperChild = children.find((child) => child.id === "statsCard");
  const statsValueChild = children.find((child) => child.id === "statsValue");
  const statsMetaChild = children.find((child) => child.id === "statsMeta");
  const glowChildren: ContainerChildItem[] = [];
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

  const align = heroData.layout.align ?? "left";
  const contentAlignment = align === "center" ? "text-center" : align === "right" ? "text-end" : "text-start";
  const buttonAlignment = align === "center" ? "justify-content-center" : align === "right" ? "justify-content-end" : "justify-content-start";
  const sectionClassName = layout === "classic" ? "builder-hero builder-hero-classic" : `builder-hero builder-hero--${layout}`;
  const resolvedPadding = resolveHeroLayoutPadding(heroData.layout.padding);
  const resolvedMargin = resolveHeroLayoutMargin(heroData.layout.margin);
  const spacingBox = getSpacingBoxStyle(resolvedPadding, resolvedMargin, spacingDevice);

  function renderChild(child: ContainerChildItem) {
    const normalizedChild = normalizeHeroChildItem(heroData, child);
    const childData = getChildWidgetData(normalizedChild);
    const elementType =
      child.type === "heading" || child.type === "text"
        ? "text"
        : child.type === "button"
        ? "button"
        : child.type === "image"
        ? "image"
        : "container";

    const injectedChildData = {
      ...childData,
      content: { ...(childData.content ?? {}) },
      style: { ...(childData.style ?? {}) },
      layout: { ...(childData.layout ?? {}) },
      responsive: { ...(childData.responsive ?? {}) },
      animation: { ...(childData.animation ?? {}) },
      advanced: { ...(childData.advanced ?? {}) },
      variant: childData.variant,
    } as any;

    if (layout === "classic") {
      if (child.type === "heading") {
        injectedChildData.style = {
          ...injectedChildData.style,
          textColor: injectedChildData.style?.textColor ?? "#f8fafc",
          fontSize: injectedChildData.style?.fontSize ?? "48px",
          fontWeight: injectedChildData.style?.fontWeight ?? "800",
          lineHeight: injectedChildData.style?.lineHeight ?? "0.95",
          letterSpacing: injectedChildData.style?.letterSpacing ?? "-0.04em",
          gradientStart: injectedChildData.style?.gradientStart ?? "#c084fc",
          gradientEnd: injectedChildData.style?.gradientEnd ?? "#fb7185",
        };
        injectedChildData.variant = injectedChildData.variant ?? "Gradient";
      }

      if (child.id === "badge") {
        injectedChildData.style = {
          ...injectedChildData.style,
          color: injectedChildData.style?.color ?? "#e0e7ff",
          backgroundColor: injectedChildData.style?.backgroundColor ?? "rgba(124,58,237,0.18)",
          borderRadius: injectedChildData.style?.borderRadius ?? "999px",
          padding: injectedChildData.style?.padding ?? "0.65rem 1rem",
          fontSize: injectedChildData.style?.fontSize ?? "12px",
          fontWeight: injectedChildData.style?.fontWeight ?? "700",
          letterSpacing: injectedChildData.style?.letterSpacing ?? "0.14em",
          textTransform: injectedChildData.style?.textTransform ?? "uppercase",
        };
      }

      if (child.id === "subheading") {
        injectedChildData.style = {
          ...injectedChildData.style,
          color: injectedChildData.style?.color ?? "#cbd5e1",
          fontSize: injectedChildData.style?.fontSize ?? "16px",
          lineHeight: injectedChildData.style?.lineHeight ?? "1.7",
        };
      }

      if (child.id === "description") {
        injectedChildData.style = {
          ...injectedChildData.style,
          color: injectedChildData.style?.color ?? "#94a3b8",
          fontSize: injectedChildData.style?.fontSize ?? "16px",
          lineHeight: injectedChildData.style?.lineHeight ?? "1.85",
        };
      }

      if (child.type === "button") {
        injectedChildData.style = {
          ...injectedChildData.style,
          borderRadius: injectedChildData.style?.borderRadius ?? "999px",
          shadow: injectedChildData.style?.shadow ?? true,
        };

        if (child.id === "primaryButton") {
          injectedChildData.variant = injectedChildData.variant ?? "Gradient";
          injectedChildData.content = {
            ...injectedChildData.content,
            text: injectedChildData.content?.text ?? "Get Started Free",
            url: String(injectedChildData.content?.url ?? "#"),
          };
          injectedChildData.style = {
            ...injectedChildData.style,
            variant: injectedChildData.style?.variant ?? "Gradient",
            color: injectedChildData.style?.color ?? "Custom",
            customColor: injectedChildData.style?.customColor ?? "#7c3aed",
            fontWeight: injectedChildData.style?.fontWeight ?? "700",
            background: injectedChildData.style?.background ?? "linear-gradient(90deg, #7c3aed, #ec4899, #f97316)",
          };
        }

        if (child.id === "secondaryButton") {
          injectedChildData.variant = injectedChildData.variant ?? "Outline";
          injectedChildData.content = {
            ...injectedChildData.content,
            text: injectedChildData.content?.text ?? "View Live Demo",
            url: String(injectedChildData.content?.url ?? "#"),
          };
          injectedChildData.style = {
            ...injectedChildData.style,
            variant: injectedChildData.style?.variant ?? "Outline",
            color: injectedChildData.style?.color ?? "Custom",
            customColor: injectedChildData.style?.customColor ?? "rgba(255,255,255,0.88)",
            borderWidth: injectedChildData.style?.borderWidth ?? "1px",
            backgroundColor: injectedChildData.style?.backgroundColor ?? "rgba(255,255,255,0.08)",
            backdropFilter: injectedChildData.style?.backdropFilter ?? "blur(10px)",
          };
        }
      }

      if (child.type === "image") {
        injectedChildData.content = {
          ...injectedChildData.content,
          src: injectedChildData.content?.src ?? "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
          alt: injectedChildData.content?.alt ?? "Website design preview",
        };
        injectedChildData.style = {
          ...injectedChildData.style,
          width: injectedChildData.style?.width ?? "100%",
          height: injectedChildData.style?.height ?? "auto",
          objectFit: injectedChildData.style?.objectFit ?? "cover",
          borderRadius: injectedChildData.style?.borderRadius ?? "32px",
        };
        injectedChildData.layout = {
          ...injectedChildData.layout,
          alignment: injectedChildData.layout?.alignment ?? "center",
        };
      }
    }

    const childInstance = createWidgetInstance(child.type, {
      id: `${heroData.id}-${child.id}`,
      content: injectedChildData.content,
      style: injectedChildData.style,
      layout: injectedChildData.layout,
      responsive: injectedChildData.responsive,
      animation: injectedChildData.animation,
      advanced: injectedChildData.advanced,
      variant: injectedChildData.variant,
    } as Partial<WidgetData>);

    const registration = getWidgetRegistration(child.type);
    const Component = registration?.component;

    if (child.id === "statsCard") {
      const cardStyle = childData.style as Record<string, string | number | undefined>;
      const visibility = (childData.advanced?.visibility ?? true) as boolean;
      return (
        <div
          key={child.id}
          data-wto-parent-widget-id={heroData.id}
          data-wto-child-id={child.id}
          data-wto-widget-element-key={child.id}
          data-wto-widget-element-type={elementType}
          className="hero-stats-card"
          style={{
            position: "absolute",
            top: cardStyle.top ?? "1.5rem",
            right: cardStyle.right ?? "1rem",
            bottom: cardStyle.bottom,
            left: cardStyle.left,
            width: cardStyle.width ?? "min(240px, 55%)",
            padding: cardStyle.padding ?? "1rem 1.2rem",
            borderRadius: cardStyle.borderRadius ?? "1.5rem",
            background: cardStyle.backgroundColor ?? "rgba(15,23,42,0.86)",
            border: cardStyle.border ?? "1px solid rgba(255,255,255,0.08)",
            backdropFilter: (cardStyle.backdropFilter ?? "blur(24px)") as string,
            boxShadow: (cardStyle.boxShadow ?? "0 40px 100px rgba(15,23,42,0.45)") as string,
            color: (cardStyle.color ?? "#f8fafc") as string,
            zIndex: 2,
            display: visibility ? undefined : "none",
          }}
        >
          {statsValueChild ? renderChild(statsValueChild) : null}
          {statsMetaChild ? renderChild(statsMetaChild) : null}
        </div>
      );
    }


    const wrapperClassName =
      layout === "classic"
        ? child.id === "badge"
          ? "hero-badge-wrapper"
          : child.id === "heading"
          ? "hero-heading-wrapper"
          : child.id === "image"
          ? "hero-image-inner"
          : child.id === "statsValue"
          ? "hero-stats-card__value"
          : child.id === "statsMeta"
          ? "hero-stats-card__meta"
          : "hero-copy-block"
        : undefined;

    return (
      <div
        key={child.id}
        className={wrapperClassName}
        data-wto-parent-widget-id={heroData.id}
        data-wto-child-id={child.id}
        data-wto-widget-element-key={child.id}
        data-wto-widget-element-type={elementType}
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
  wrapperClassName="w-full"
  contentClassName="overflow-visible"
  disableSectionWidthStyle={true}
>
    <section
      className={sectionClassName}
      data-widget="hero-v2"
      data-hero-id={heroData.advanced.id ?? "hero-widget-v2"}
      style={{
        width: "100%",
        color: "#e2e8f0",
        padding: spacingBox.padding,
        margin: spacingBox.margin,
        boxSizing: "border-box",
        ...(layout === "classic"
          ? {}
          : {
              background:
                "radial-gradient(circle at 85% 20%, rgba(124,58,237,.35), transparent 35%), " +
                "radial-gradient(circle at 10% 90%, rgba(37,99,235,.22), transparent 35%), " +
                "linear-gradient(135deg, #070b1d 0%, #101735 55%, #17103a 100%)",
            }),
      }}
    >
      <div className="container">
        {layout === "classic" ? (
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className={`hero-left-content ${contentAlignment}`}>
                {bodyChildren.map(renderChild)}

                {buttonChildren.length > 0 ? (
                  <>
                    <div className={`d-flex gap-3 flex-wrap ${buttonAlignment} hero-cta-group`}>
                      {buttonChildren.map(renderChild)}
                    </div>
                    {children.find((c) => c.id === "trustText") ? renderChild(children.find((c) => c.id === "trustText") as any) : null}
                  </>
                ) : null}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="hero-image-column position-relative">
                {glowChildren.map(renderChild)}
                <div className="hero-image-frame">
                  {imageChildren.map(renderChild)}
                </div>
                {statsWrapperChild ? renderChild(statsWrapperChild) : null}
              </div>
            </div>
          </div>
        ) : null}

        {layout === "split" ? (
          <div className="row align-items-stretch g-0 overflow-hidden rounded-5 border shadow-lg">
            <div className="col-lg-6 d-flex align-items-center">
              <div className="w-100 p-4 p-md-5">
                <div className={contentAlignment}>
                  {bodyChildren.map(renderChild)}

                  {buttonChildren.length > 0 ? (
                    <div className={`d-flex gap-3 flex-wrap ${buttonAlignment}`}>
                      {buttonChildren.map(renderChild)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="h-100 min-vh-50">
                {imageChildren.map(renderChild)}
              </div>
            </div>
          </div>
        ) : null}

        {layout === "centered" ? (
          <div className="row justify-content-center">
            <div className="col-lg-9 col-xl-8">
              <div className="text-center">
                {bodyChildren.map(renderChild)}

                {buttonChildren.length > 0 ? (
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    {buttonChildren.map(renderChild)}
                  </div>
                ) : null}

                {imageChildren.length > 0 ? (
                  <div className="mt-5 mx-auto" style={{ maxWidth: "620px" }}>
                    {imageChildren.map(renderChild)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        .builder-hero {
          width: 100%;
          max-width: none;
          position: relative;
        }

        .builder-hero .container {
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .builder-hero-classic {
          display: block;
          position: relative;
          overflow: hidden;
          color: #e2e8f0;
          background: radial-gradient(circle at 80% 14%, rgba(99,102,241,0.28), transparent 26%),
            radial-gradient(circle at 10% 88%, rgba(59,130,246,0.18), transparent 30%),
            linear-gradient(135deg, #070b1d 0%, #0f1430 45%, #110f2f 100%);
        }

        .builder-hero-classic .hero-left-content {
          max-width: 720px;
          position: relative;
          z-index: 1;
          padding-right: 1rem;
        }

        .builder-hero-classic .hero-badge-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.8rem 1.35rem;
          border-radius: 999px;
          background: rgba(124,58,237,0.18);
          color: #e0e7ff;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 1.6rem;
          max-width: fit-content;
          position: relative;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(124,58,237,0.25);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        }

        .builder-hero-classic .hero-badge-wrapper::before {
          content: "";
          width: 0.45rem;
          height: 0.45rem;
          border-radius: 999px;
          background: radial-gradient(circle, #8b5cf6 0%, rgba(139,92,246,0.7) 100%);
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          box-shadow: 0 0 20px rgba(139,92,246,0.6);
        }

        .builder-hero-classic .hero-heading-wrapper {
          max-width: 12ch;
          margin-bottom: 1rem;
        }

        .builder-hero-classic .hero-heading-wrapper h1,
        .builder-hero-classic .hero-heading-wrapper h2,
        .builder-hero-classic .hero-heading-wrapper h3,
        .builder-hero-classic .hero-heading-wrapper h4,
        .builder-hero-classic .hero-heading-wrapper h5,
        .builder-hero-classic .hero-heading-wrapper h6 {
          font-size: clamp(3.75rem, 5vw, 5.4rem);
          line-height: 0.94;
          font-weight: 900;
          letter-spacing: -0.05em;
          margin-bottom: 1rem;
          background: linear-gradient(90deg, #c084fc, #ec4899 45%, #f97316 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          text-shadow: 0 20px 80px rgba(124,58,237,0.08);
        }

        .builder-hero-classic .hero-copy-block {
          max-width: 640px;
          max-width: 680px;
          color: #cbd5e1;
          font-size: 1rem;
          line-height: 1.85;
          margin-bottom: 0.95rem;
        }

        .builder-hero-classic .hero-cta-group {
          margin-top: 2.5rem;
        }

        .builder-hero-classic .hero-cta-group a {
          min-width: 12rem;
          padding: 0.95rem 1.7rem !important;
          border-radius: 999px !important;
          font-weight: 700 !important;
          transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
        }

        .builder-hero-classic .hero-cta-group a:hover {
          transform: translateY(-2px);
        }

        .builder-hero-classic .hero-cta-group a:first-child {
          background: linear-gradient(90deg, #7c3aed 0%, #ec4899 50%, #f97316 100%) !important;
          border: 1px solid transparent !important;
          color: #fff !important;
          box-shadow: 0 16px 45px rgba(124,58,237,0.35) !important;
        }

        .builder-hero-classic .hero-cta-group a:last-child {
          background: rgba(255,255,255,0.08) !important;
          border: 1px solid rgba(255,255,255,0.18) !important;
          color: #f8fafc !important;
          backdrop-filter: blur(15px);
        }

        .builder-hero-classic .hero-trust-text {
          margin-top: 1.35rem;
          font-size: 0.95rem;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }

        .builder-hero-classic .hero-image-column {
          position: relative;
          min-height: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-top: 2rem;
        }

        .builder-hero-classic .hero-image-frame {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          border: 1px solid rgba(124,58,237,0.18);
          box-shadow: 0 60px 140px rgba(15,23,42,0.48);
          max-width: 540px;
          width: min(520px, 100%);
          height: auto;
          transition: transform 220ms ease;
        }

        .builder-hero-classic .hero-image-frame:hover {
          transform: translateY(-4px);
        }

        .builder-hero-classic .hero-image-deco {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.9;
          z-index: 0;
        }

        .builder-hero-classic .hero-image-deco--blue {
          width: 260px;
          height: 260px;
          top: -10%;
          left: -14%;
          background: radial-gradient(circle at center, rgba(56,189,248,0.35), transparent 58%);
        }

        .builder-hero-classic .hero-image-deco--violet {
          width: 240px;
          height: 240px;
          bottom: -14%;
          right: -8%;
          background: radial-gradient(circle at center, rgba(124,58,237,0.45), transparent 55%);
        }

        .builder-hero-classic .hero-image-inner {
          width: 100%;
          height: auto;
          min-height: 0;
          min-width: 100%;
        }

        .builder-hero-classic .hero-image-frame img {
          width: 100%;
          height: auto;
          object-fit: cover;
          display: block;
          border-radius: 32px;
          transform: translateZ(0);
        }

        .builder-hero-classic .hero-stats-card {
          position: absolute;
          top: 1.5rem;
          right: 1rem;
          z-index: 2;
          width: min(240px, 55%);
          padding: 1rem 1.2rem;
          border-radius: 1.5rem;
          background: rgba(15,23,42,0.86);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          box-shadow: 0 40px 100px rgba(15,23,42,0.45);
          color: #f8fafc;
          pointer-events: none;
        }

        .builder-hero-classic .hero-stats-card__label {
          color: #a5b4fc;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }

        .builder-hero-classic .hero-stats-card__label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #4f46e5;
          margin-bottom: 0.55rem;
        }

        .builder-hero-classic .hero-stats-card__value {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .builder-hero-classic .hero-stats-card__meta {
          font-size: 0.95rem;
          color: #475569;
        }

        .builder-hero--split {
          display: flex;
          align-items: center;
        }

        .builder-hero--centered {
          display: flex;
          align-items: center;
        }

        .builder-hero--split img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .builder-hero-classic img {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 28px;
          display: block;
        }

        .builder-hero--centered img {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 28px;
          display: block;
        }

        @media (max-width: 991px) {
          .builder-hero,
          .builder-hero-classic,
          .builder-hero--split,
          .builder-hero--centered {
            min-height: auto;
          }

          .builder-hero-classic .hero-stats-card {
            display: none;
          }

          .builder-hero-classic .hero-image-deco--blue,
          .builder-hero-classic .hero-image-deco--violet {
            display: none;
          }

          .builder-hero--split img {
            min-height: 360px;
          }
        }
      `}</style>
    </section>
  </BaseWidget>
);
}
