import { useEffect, useState, type CSSProperties } from "react";
import type { WidgetData } from "../widgetRegistry";
import { defaultNavbarWidgetData, isNavbarWidgetData, type NavbarNavItem } from "./NavbarTypes";
import { BaseWidget } from "../BaseWidget";
import { getNavbarVariantPresentation, normalizeNavbarVariant } from "./navbarVariantStyles";
import type { NavbarWidgetData } from "./NavbarTypes";

export interface NavbarProps {
  data: WidgetData;
}

export function Navbar({ data = defaultNavbarWidgetData }: NavbarProps) {
  const navbarData = isNavbarWidgetData(data) ? data : defaultNavbarWidgetData;
  const visible = navbarData.advanced.visibility ?? true;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (!visible) {
    return null;
  }

  const variant = normalizeNavbarVariant(navbarData.variant || "Classic Light");
  const breakpoint = navbarData.layout.breakpoint ?? "lg";
  const logoPosition = navbarData.layout.logoPosition || (variant === "Centered Brand" ? "center" : "left");
  const menuAlignment = navbarData.layout.menuAlignment || "left";
  const mobileMenuAlignment = navbarData.responsive.mobileMenuAlignment || "left";
  const containerMode = navbarData.layout.containerMode || "container";
  const maxWidth = navbarData.layout.maxWidth || "1200px";
  const horizontalPadding = (navbarData.layout.horizontalPadding ?? navbarData.layout.horizontalSpacing) || "1rem";
  const horizontalSpacing = navbarData.layout.horizontalSpacing || "1rem";

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

  const variantStyles = getNavbarVariantPresentation({ ...navbarData, variant } as NavbarWidgetData, {
    breakpoint,
    isMenuOpen,
    isDesktopViewport,
  });
  const navStyle = variantStyles.navStyle;
  const isCenteredLogo = variant === "Centered Brand";
  const collapseId = `${navbarData.advanced.id ?? "navbar-widget"}-collapse`;
  const navItems = Array.isArray(navbarData.content.navItems) ? navbarData.content.navItems : [];
  const splitIndex = Math.max(1, Math.ceil(navItems.length / 2));
  const leftNavItems = isCenteredLogo ? navItems.slice(0, splitIndex) : navItems;
  const rightNavItems = isCenteredLogo ? navItems.slice(splitIndex) : [];

  const toggleDropdown = (itemId: string) => {
    setOpenDropdownId((current) => (current === itemId ? null : itemId));
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setOpenDropdownId(null);
  };

  const renderNavList = (items: NavbarNavItem[], extraClassName = "") => (
    <ul className={`${variantStyles.navListClassName} ${extraClassName}`.trim()} data-wto-widget-element-key="navigation" data-wto-widget-element-type="container">
      {items.map((item, index) => {
        const itemId = `${item.label}-${index}`;
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        return (
          <li className="nav-item wto-navbar-item" key={itemId}>
            <div className="wto-navbar-item-shell">
              {hasChildren ? (
                <>
                  <a
                    className={variantStyles.navLinkClassName}
                    href={item.href || "#"}
                    style={{ color: variantStyles.navTextColor }}
                    data-wto-widget-element-key={`navigationItem-${index}`}
                    data-wto-widget-element-type="link"
                    onClick={(event) => {
                      if (item.href) {
                        if (!isDesktopViewport) {
                          event.preventDefault();
                          toggleDropdown(itemId);
                        }
                      } else {
                        event.preventDefault();
                        toggleDropdown(itemId);
                      }
                    }}
                  >
                    {item.icon ? <i className={`fa-solid fa-${item.icon} me-2`} aria-hidden="true" /> : null}
                    {item.label || "Link"}
                  </a>
                  <button
                    className="wto-navbar-dropdown-toggle"
                    type="button"
                    aria-label={`${openDropdownId === itemId ? "Close" : "Open"} submenu for ${item.label || "link"}`}
                    aria-expanded={openDropdownId === itemId ? "true" : "false"}
                    aria-haspopup="menu"
                    onClick={(event) => {
                      event.preventDefault();
                      toggleDropdown(itemId);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        setOpenDropdownId(null);
                      }
                      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
                        event.preventDefault();
                        toggleDropdown(itemId);
                      }
                    }}
                  >
                    <i className={`fa-solid fa-chevron-${openDropdownId === itemId ? "up" : "down"}`} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <a
                  className={variantStyles.navLinkClassName}
                  href={item.href || "#"}
                  style={{ color: variantStyles.navTextColor }}
                  data-wto-widget-element-key={`navigationItem-${index}`}
                  data-wto-widget-element-type="link"
                  onClick={() => {
                    if (!isDesktopViewport) {
                      closeMenus();
                    }
                  }}
                >
                  {item.icon ? <i className={`fa-solid fa-${item.icon} me-2`} aria-hidden="true" /> : null}
                  {item.label || "Link"}
                </a>
              )}
              {hasChildren ? (
                <div className={`wto-navbar-dropdown-menu ${openDropdownId === itemId ? "wto-navbar-dropdown-menu--open" : ""}`} role="menu" aria-label={`${item.label || "Link"} submenu`}>
                  {item.children?.map((child, childIndex) => (
                    <a
                      key={`${itemId}-child-${childIndex}`}
                      className="wto-navbar-dropdown-link"
                      href={child.href || "#"}
                      role="menuitem"
                      onClick={() => {
                        if (!isDesktopViewport) {
                          closeMenus();
                        }
                        setOpenDropdownId(null);
                      }}
                    >
                      {child.label || "Link"}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );

  const brandContent = navbarData.content.logoImageSrc ? (
    <img
      src={navbarData.content.logoImageSrc}
      alt={navbarData.content.logoText || "Brand"}
      style={{ maxWidth: "100%", width: navbarData.content.logoWidth || "140px", height: "auto" }}
    />
  ) : (
    <span style={{ color: variantStyles.textColor, fontWeight: 700 }}>{navbarData.content.logoText || "Brand"}</span>
  );

  const buttonIcon = navbarData.content.hamburgerIcon || "bars";
  const showCTA = navbarData.content.showCta === true || (navbarData.content.showCta === undefined && navbarData.content.ctaEnabled === true);
  const brandClasses = variantStyles.brandClassName;
  const togglerClasses = variantStyles.togglerClassName;
  const navLabel = navbarData.content.logoText ? `${navbarData.content.logoText} navigation` : "Site navigation";
  const brandLabel = navbarData.content.logoText ? `${navbarData.content.logoText} home` : "Site home";
  const collapseStyle = {
    display: isDesktopViewport || isMenuOpen ? "flex" : "none",
    alignItems: mobileMenuAlignment === "center" ? "center" : mobileMenuAlignment === "right" ? "flex-end" : "flex-start",
  } as CSSProperties;
  const innerContentStyle: CSSProperties = {
    width: "100%",
    minHeight: navbarData.layout.navbarHeight || "72px",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    boxSizing: "border-box",
  };
  const navInlineStyle: CSSProperties = {
    ...navStyle,
    width: "100%",
    maxWidth: "none",
    margin: 0,
    position: "relative",
    ["--wto-hover-color" as string]: variantStyles.navHoverColor,
    ["--wto-active-color" as string]: variantStyles.navActiveColor,
    ["--wto-focus-color" as string]: variantStyles.navActiveColor,
  };
  const alignmentClass = menuAlignment === "center" ? "justify-content-center" : menuAlignment === "right" ? "justify-content-end" : "justify-content-start";
  const brandOrderClass = logoPosition === "center" ? "order-2" : logoPosition === "right" ? "order-3" : "order-1";

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdownId(null);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
   <BaseWidget
  data={navbarData}
  widgetType="navbar"
  title="Navbar"
  variantLabel={navbarData.variant}
  wrapperClassName="w-full"
  contentClassName="overflow-hidden"
  disableSectionWidthStyle={true}
>
      <header
        className={`builder-navbar wto-navbar ${variantStyles.navClassName}`}
        style={navInlineStyle}
        data-widget="navbar"
        data-content-width={containerMode === "fluid" ? "fluid" : "container"}
        aria-label={navLabel}
      >
        <style>{`
          .builder-navbar { width: 100%; max-width: none; margin: 0; position: relative; }
          .builder-navbar__inner { min-height: 72px; display: flex; align-items: center; }
          .builder-navbar__brand {
            flex-shrink: 0;
          }
          .builder-navbar__nav {
            display: flex;
            align-items: center;
            min-width: 0;
          }
          .builder-navbar__actions {
            display: flex;
            align-items: center;
            margin-left: auto;
          }
          .wto-navbar .wto-navbar-item-shell {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }
          .wto-navbar .wto-navbar-dropdown-toggle {
            border: 0;
            background: transparent;
            color: inherit;
            padding: 0.25rem 0.35rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .wto-navbar .wto-navbar-dropdown-menu {
            display: none;
            flex-direction: column;
            gap: 0.25rem;
            position: absolute;
            top: calc(100% + 0.4rem);
            left: 0;
            min-width: 12rem;
            padding: 0.5rem;
            border-radius: 0.75rem;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
            z-index: 20;
          }
          .wto-navbar .wto-navbar-dropdown-menu--open {
            display: flex;
          }
          .wto-navbar .wto-navbar-dropdown-link {
            color: #0f172a;
            text-decoration: none;
            padding: 0.35rem 0.4rem;
            border-radius: 0.5rem;
          }
          .wto-navbar .wto-navbar-dropdown-link:hover {
            background: rgba(15, 23, 42, 0.04);
          }
          .wto-navbar a:focus-visible,
          .wto-navbar button:focus-visible {
            outline: 3px solid var(--wto-focus-color);
            outline-offset: 2px;
            border-radius: 0.45rem;
          }
          .wto-navbar .nav-link:hover {
            color: var(--wto-hover-color) !important;
          }
          .wto-navbar .nav-link[data-active="true"] {
            color: var(--wto-active-color) !important;
          }
          .wto-navbar .wto-navbar-collapse {
            display: none;
            flex-direction: column;
            gap: 0.6rem;
            width: 100%;
            margin-top: 0.75rem;
          }
          .wto-navbar .wto-navbar-collapse[data-open="true"] {
            display: flex;
          }
          .wto-navbar .btn-gradient {
            background: linear-gradient(90deg, #8b5cf6 0%, #2563eb 100%);
            color: #ffffff;
            border: none;
            box-shadow: 0 14px 40px rgba(99, 102, 241, 0.32);
          }
          .wto-navbar .btn-gradient:hover {
            box-shadow: 0 18px 50px rgba(59, 130, 246, 0.38);
          }
          @media (min-width: 992px) {
            .wto-navbar .wto-navbar-collapse {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 0.75rem;
              width: auto;
              margin-top: 0;
            }
            .wto-navbar .wto-navbar-nav {
              display: flex;
              align-items: center;
            }
          }
        `}</style>
        <div className="builder-navbar__inner" style={innerContentStyle}>
          {isCenteredLogo ? (
            <>
              <div className={`d-none d-${breakpoint}-flex flex-grow-1 align-items-center justify-content-between gap-3`}>
                {renderNavList(leftNavItems, `me-auto ${alignmentClass}`)}
                <a className={`${brandClasses} ${brandOrderClass} builder-navbar__brand`} href={navbarData.content.logoHref || "#"} style={variantStyles.brandStyle} data-wto-widget-element-key="logo" data-wto-widget-element-type="container">
                  {brandContent}
                </a>
                {renderNavList(rightNavItems, `ms-auto ${alignmentClass}`)}
              </div>
              <div className={`d-flex d-${breakpoint}-none w-full align-items-center justify-content-between`}>
                <a className={`${brandClasses} ${brandOrderClass} builder-navbar__brand`} href={navbarData.content.logoHref || "#"} style={variantStyles.brandStyle} data-wto-widget-element-key="logo" data-wto-widget-element-type="container">
                  {brandContent}
                </a>
                <button
                  className={`navbar-toggler ${togglerClasses}`.trim()}
                  type="button"
                  aria-controls={collapseId}
                  aria-expanded={isDesktopViewport || isMenuOpen ? "true" : "false"}
                  aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  onClick={() => {
                    if (!isDesktopViewport) {
                      setIsMenuOpen((prev) => !prev);
                    }
                  }}
                  style={{ borderColor: variantStyles.textColor }}
                >
                  {buttonIcon ? (
                    <i className={`fa-solid fa-${buttonIcon}`} style={{ color: variantStyles.textColor, fontSize: "1.1rem" }} aria-hidden="true" />
                  ) : (
                    <span className="navbar-toggler-icon" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <a className={`${brandClasses} ${brandOrderClass} builder-navbar__brand`} href={navbarData.content.logoHref || "#"} style={variantStyles.brandStyle} data-wto-widget-element-key="logo" data-wto-widget-element-type="container">
                {brandContent}
              </a>
              <button
                className={`navbar-toggler ${togglerClasses}`.trim()}
                type="button"
                aria-controls={collapseId}
                aria-expanded={isDesktopViewport || isMenuOpen ? "true" : "false"}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={() => {
                  if (!isDesktopViewport) {
                    setIsMenuOpen((prev) => !prev);
                  }
                }}
                style={{ borderColor: variantStyles.textColor }}
              >
                {buttonIcon ? (
                  <i className={`fa-solid fa-${buttonIcon}`} style={{ color: variantStyles.textColor, fontSize: "1.1rem" }} aria-hidden="true" />
                ) : (
                  <span className="navbar-toggler-icon" />
                )}
              </button>
            </>
          )}
          <div className={`wto-navbar-collapse ${isMenuOpen ? "wto-navbar-collapse--open" : ""}`} id={collapseId} data-open={isDesktopViewport || isMenuOpen ? "true" : "false"} style={collapseStyle}>
            <div className="builder-navbar__nav">
              {isCenteredLogo ? renderNavList(navItems, `flex-wrap ${alignmentClass}`) : renderNavList(navItems, alignmentClass)}
            </div>
            {showCTA ? (
              <div className="builder-navbar__actions">
                <a className={variantStyles.ctaClassName} href={navbarData.content.ctaHref || "#"} data-wto-widget-element-key="ctaButton" data-wto-widget-element-type="button" onClick={() => closeMenus()}>
                  {navbarData.content.ctaLabel}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </BaseWidget>
  );
}
