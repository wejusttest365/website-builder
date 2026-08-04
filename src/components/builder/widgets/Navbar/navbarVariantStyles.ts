import type { CSSProperties } from "react";
import type { NavbarWidgetData } from "./NavbarTypes";

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

function normalizeColor(color: string | undefined, fallback: string) {
  return color || fallback;
}

function withAlpha(color: string | undefined, alpha: number) {
  const base = normalizeColor(color, "#ffffff");
  if (base.startsWith("#") && base.length === 7) {
    const hex = base.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (base.startsWith("rgba")) {
    return base;
  }
  if (base.startsWith("rgb")) {
    return base.replace("rgb", "rgba").replace(")", `, ${alpha})`);
  }
  return `rgba(255, 255, 255, ${alpha})`;
}

export interface NavbarVariantPresentation {
  containerClassName: string;
  expandClassName: string;
  stickyClassName: string;
  shadowClassName: string;
  borderClassName: string;
  navClassName: string;
  brandClassName: string;
  togglerClassName: string;
  collapseClassName: string;
  navListClassName: string;
  navItemClassName: string;
  navLinkClassName: string;
  ctaClassName: string;
  brandStyle: CSSProperties;
  navStyle: CSSProperties;
  textColor: string;
  navTextColor: string;
  navHoverColor: string;
  navActiveColor: string;
  showCta: boolean;
}

export function normalizeNavbarVariant(variant?: string): NavbarWidgetData["variant"] {
  switch (variant) {
    case "Classic":
      return "Classic Light";
    case "Centered Logo":
      return "Centered Brand";
    case "Transparent":
      return "Minimal No Button";
    case "Glass":
      return "Gradient CTA";
    case "Minimal":
      return "Dark Premium";
    default:
      return (variant as any) || "Classic Light";
  }
}

export function getNavbarVariantPresentation(
  navbarData: NavbarWidgetData,
  options: {
    breakpoint: string;
    isMenuOpen: boolean;
    isDesktopViewport: boolean;
  },
): NavbarVariantPresentation {
  const variant = normalizeNavbarVariant(navbarData.variant);
  const breakpoint = options.breakpoint ?? "lg";
  const stickyClassName = navbarData.layout.sticky ? "sticky-top" : "";
  const expandClassName = `navbar-expand-${breakpoint}`;
  const isClassicLight = variant === "Classic Light";
  const isDarkPremium = variant === "Dark Premium";
  const isGradientCta = variant === "Gradient CTA";
  const isMinimalNoButton = variant === "Minimal No Button";
  const isCenteredBrand = variant === "Centered Brand";

  const textColor = isDarkPremium || isGradientCta ? "#f8fafc" : "#111827";
  const navTextColor = isDarkPremium ? "#CBD5E1" : textColor;
  const navHoverColor = isDarkPremium ? "#ffffff" : isGradientCta ? "#ffffff" : "#2563eb";
  const navActiveColor = isDarkPremium ? "#ffffff" : isGradientCta ? "#ffffff" : textColor;
  const basePadding = isDarkPremium
    ? "1.25rem 1.5rem"
    : isGradientCta
      ? "1.15rem 1.5rem"
      : isMinimalNoButton
        ? "1.4rem 2rem"
        : isCenteredBrand
          ? "1.3rem 1.5rem"
          : "1rem 1.5rem";

  const navStyle: CSSProperties = {
    backgroundColor: isClassicLight
      ? "#ffffff"
      : isDarkPremium
        ? "#070B14"
        : isGradientCta
          ? "#0f172a"
          : isMinimalNoButton
            ? "#f8fafc"
            : "#ffffff",
    backgroundImage: isGradientCta ? "linear-gradient(90deg, #0f172a 0%, #5b21b6 100%)" : undefined,
    color: textColor,
    padding: basePadding,
    borderBottom: isClassicLight
      ? "1px solid rgba(15, 23, 42, 0.08)"
      : isDarkPremium
        ? "1px solid rgba(255,255,255,0.08)"
        : isGradientCta
          ? "1px solid rgba(255,255,255,0.08)"
          : isCenteredBrand
            ? "1px solid rgba(15, 23, 42, 0.08)"
            : isMinimalNoButton
              ? "1px solid rgba(15, 23, 42, 0.08)"
              : undefined,
    boxShadow: isDarkPremium ? "0 10px 30px rgba(0, 0, 0, 0.25)" : isGradientCta ? "0 18px 40px rgba(15, 23, 42, 0.18)" : isClassicLight ? "0 12px 30px rgba(15, 23, 42, 0.06)" : "none",
    borderRadius: isGradientCta ? "0" : "0.75rem",
    transition: "background-color 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  };

  const brandStyle: CSSProperties = {
    width: navbarData.content.logoWidth || (isMinimalNoButton ? "110px" : "140px"),
    fontSize: isMinimalNoButton ? "0.95rem" : "1.05rem",
    letterSpacing: isMinimalNoButton ? "0.08em" : "0.02em",
    color: textColor,
    fontWeight: isMinimalNoButton ? 600 : 700,
  };

  const variantClassName = `wto-navbar--${variant.toLowerCase().replace(/\s+/g, "-")}`;
  const shouldShowMenu = options.isDesktopViewport || options.isMenuOpen;
  const collapseClassName = [
    "collapse",
    "navbar-collapse",
    shouldShowMenu ? "show" : "",
    isCenteredBrand ? "order-lg-3" : "",
    `d-${breakpoint}-flex`,
  ]
    .filter(Boolean)
    .join(" ");

  const navListClassName = [
    "navbar-nav",
    "flex-row",
    "align-items-center",
    isMinimalNoButton ? "gap-5" : isDarkPremium ? "gap-4" : "gap-3",
    isCenteredBrand ? "flex-fill justify-content-between" : "",
    isMinimalNoButton ? "justify-content-center" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const navLinkClassName = isClassicLight
    ? "nav-link text-dark px-3 py-2"
    : isDarkPremium
      ? "nav-link text-white px-3 py-2"
      : isGradientCta
        ? "nav-link text-white px-3 py-2"
        : isMinimalNoButton
          ? "nav-link text-slate-700 px-3 py-2"
          : isCenteredBrand
            ? "nav-link text-slate-800 px-3 py-2"
            : "nav-link";

  const ctaClassName = isClassicLight
    ? "btn btn-primary btn-sm ms-3"
    : isDarkPremium
      ? "btn btn-primary btn-sm ms-3"
      : isGradientCta
        ? "btn btn-gradient btn-sm ms-3"
        : "btn btn-primary btn-sm ms-3";

  const containerClassName = isCenteredBrand
    ? "w-full d-flex align-items-center justify-content-between gap-3"
    : isMinimalNoButton
      ? "w-full d-flex align-items-center justify-content-between gap-6"
      : "w-full d-flex align-items-center justify-content-between gap-3";

  const brandClassName = isCenteredBrand
    ? "navbar-brand mx-auto order-lg-2 text-center flex-shrink-0"
    : "navbar-brand";

  const togglerClassName = [`d-${breakpoint}-none`].join(" ");

  return {
    containerClassName,
    expandClassName,
    stickyClassName,
    shadowClassName: isDarkPremium || isGradientCta ? "" : mapShadowClass(navbarData.style.shadow),
    borderClassName: "",
    navClassName: ["navbar", expandClassName, stickyClassName, variantClassName].filter(Boolean).join(" "),
    brandClassName,
    togglerClassName,
    collapseClassName,
    navListClassName,
    navItemClassName: "nav-item",
    navLinkClassName,
    ctaClassName,
    brandStyle,
    navStyle,
    textColor,
    navTextColor,
    navHoverColor,
    navActiveColor,
    showCta: !isMinimalNoButton && !isCenteredBrand,
  };
}
