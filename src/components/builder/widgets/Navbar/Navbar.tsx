import { useEffect, useState } from "react";
import type { WidgetData } from "../widgetRegistry";
import { defaultNavbarWidgetData, isNavbarWidgetData } from "./NavbarTypes";
import { BaseWidget } from "../BaseWidget";

export interface NavbarProps {
  data: WidgetData;
}

function mapShadowClass(shadow: string | undefined) {
  switch (shadow) {
    case "sm":
      return "shadow-sm";
    case "md":
      return "shadow";
    case "lg":
      return "shadow-lg";
    default:
      return "";
  }
}

export function Navbar({ data = defaultNavbarWidgetData }: NavbarProps) {
  const navbarData = isNavbarWidgetData(data) ? data : defaultNavbarWidgetData;
  const visible = navbarData.advanced.visibility ?? true;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  if (!visible) {
    return null;
  }

  const variant = navbarData.variant || defaultNavbarWidgetData.variant;
  const containerClass = "w-full";
  const breakpoint = navbarData.layout.breakpoint ?? "lg";
  const expandClass = `navbar-expand-${breakpoint}`;
  const stickyClass = navbarData.layout.sticky ? "sticky-top" : "";

  useEffect(() => {
    const breakpointWidthMap = { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200 } as const;
    const minWidth = breakpointWidthMap[breakpoint as keyof typeof breakpointWidthMap] ?? 992;

    const updateViewport = () => {
      const desktop = window.innerWidth >= minWidth;
      setIsDesktopViewport(desktop);
      if (!desktop) {
        setIsMenuOpen(false);
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, [breakpoint]);
  const shadowClass = variant === "Transparent" || variant === "Minimal" ? "" : mapShadowClass(navbarData.style.shadow);
  const borderClass = navbarData.style.border && variant !== "Minimal" ? "border" : "";
  const navBackground =
    variant === "Transparent"
      ? "transparent"
      : variant === "Glass"
      ? navbarData.style.backgroundColor || "rgba(255,255,255,0.82)"
      : navbarData.style.backgroundColor || "#ffffff";

  const navStyle: React.CSSProperties = {
    backgroundColor: navBackground,
    color: navbarData.style.textColor || "#212529",
    padding: navbarData.style.padding || "1rem",
    borderColor: navbarData.style.borderColor || "#e9ecef",
    borderStyle: navbarData.style.border && variant !== "Minimal" ? "solid" : undefined,
    borderWidth: navbarData.style.border && variant !== "Minimal" ? "1px" : undefined,
    backdropFilter: variant === "Glass" ? "saturate(180%) blur(14px)" : undefined,
  };

  const brandContent = navbarData.content.logoImageSrc ? (
    <img
      src={navbarData.content.logoImageSrc}
      alt={navbarData.content.logoText || "Brand"}
      style={{ maxWidth: "100%", width: navbarData.content.logoWidth || "140px", height: "auto" }}
    />
  ) : (
    <span style={{ color: navbarData.style.textColor || "#212529", fontWeight: 700 }}>{navbarData.content.logoText || "Brand"}</span>
  );

  const collapseId = `${navbarData.advanced.id ?? "navbar-widget"}-collapse`;
  const navItems = Array.isArray(navbarData.content.navItems) ? navbarData.content.navItems : [];
  const buttonIcon = navbarData.content.hamburgerIcon || "bars";
  const showCTA = Boolean(navbarData.content.ctaLabel);

  const brandClasses = variant === "Centered Logo" ? "navbar-brand mx-auto order-lg-2" : "navbar-brand";
  const togglerClasses = variant === "Centered Logo" ? "order-lg-1" : "";
  const togglerBreakpointClass = `d-${breakpoint}-none`;
  const collapseBreakpointClass = `d-${breakpoint}-flex`;
  const shouldShowMenu = isDesktopViewport || isMenuOpen;
  const collapseClasses = [
    "collapse",
    "navbar-collapse",
    shouldShowMenu ? "show" : "",
    variant === "Centered Logo" ? "order-lg-3" : "",
    collapseBreakpointClass,
  ].filter(Boolean).join(" ");

  return (
    <BaseWidget
      data={navbarData}
      widgetType="navbar"
      title="Navbar"
      variantLabel={navbarData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-hidden"
    >
      <nav className={`navbar ${expandClass} ${stickyClass} ${shadowClass} ${borderClass}`} style={navStyle} data-widget="navbar">
        <div className={containerClass}>
          <a className={brandClasses} href={navbarData.content.logoHref || "#"} style={{ width: navbarData.content.logoWidth || "auto" }} data-wto-widget-element-key="logo" data-wto-widget-element-type="container">
            {brandContent}
          </a>
          <button
            className={`navbar-toggler ${togglerClasses} ${togglerBreakpointClass}`.trim()}
            type="button"
            aria-controls={collapseId}
            aria-expanded={shouldShowMenu ? "true" : "false"}
            aria-label="Toggle navigation"
            onClick={() => {
              if (!isDesktopViewport) {
                setIsMenuOpen((prev) => !prev);
              }
            }}
            style={{ borderColor: navbarData.style.textColor || "#212529" }}
          >
            {buttonIcon ? (
              <i className={`fa-solid fa-${buttonIcon}`} style={{ color: navbarData.style.textColor || "#212529", fontSize: "1.1rem" }} aria-hidden="true" />
            ) : (
              <span className="navbar-toggler-icon" />
            )}
          </button>
          <div className={collapseClasses} id={collapseId}>
            <ul className={`navbar-nav ${variant === "Centered Logo" ? "mx-auto" : "me-auto"} mb-2 mb-lg-0`} data-wto-widget-element-key="navigation" data-wto-widget-element-type="container">
              {navItems.map((item, index) => (
                <li className="nav-item" key={index}>
                  <a className="nav-link" href={item.href || "#"} style={{ color: navbarData.style.textColor || "#212529" }} data-wto-widget-element-key={`navigationItem-${index}`} data-wto-widget-element-type="link">
                    {item.icon ? <i className={`fa-solid fa-${item.icon} me-2`} aria-hidden="true" /> : null}
                    {item.label || "Link"}
                  </a>
                </li>
              ))}
            </ul>
            {showCTA ? (
              <a className="btn btn-primary" href={navbarData.content.ctaHref || "#"} data-wto-widget-element-key="ctaButton" data-wto-widget-element-type="button">
                {navbarData.content.ctaLabel}
              </a>
            ) : null}
          </div>
        </div>
      </nav>
    </BaseWidget>
  );
}
