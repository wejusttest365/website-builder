import type { WidgetData } from "../widgetRegistry";
import { defaultNavbarWidgetData, isNavbarWidgetData, type NavbarNavItem } from "./NavbarTypes";

function escapeHtml(value: string | undefined) {
  if (!value) return "";
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function breakpointMinWidth(breakpoint: string | undefined) {
  switch (breakpoint) {
    case "sm":
      return 576;
    case "md":
      return 768;
    case "xl":
      return 1200;
    case "xxl":
      return 1400;
    case "lg":
    default:
      return 992;
  }
}

function normalizeNavbarVariant(variant: string | undefined) {
  const variants = new Set([
    "Classic Light",
    "Dark Premium",
    "Gradient CTA",
    "Minimal No Button",
    "Centered Brand",
    "Centered Logo",
    "Transparent",
    "Minimal",
    "Classic",
  ]);
  return variants.has(variant ?? "") ? variant! : "Classic Light";
}

function getNavbarVariantPresentation(
  navbarData: NavbarWidgetData,
  _options: { breakpoint: string; isMenuOpen: boolean; isDesktopViewport: boolean },
) {
  const variant = normalizeNavbarVariant(navbarData.variant);
  const textColor = navbarData.style.textColor || (variant === "Dark Premium" ? "#f8fafc" : "#212529");
  const navTextColor = navbarData.style.textColor || (variant === "Dark Premium" ? "#f8fafc" : "#212529");
  const navHoverColor = navbarData.style.hoverColor || "#2563eb";
  const navActiveColor = navbarData.style.activeColor || "#0f172a";
  const brandClassName = "builder-navbar__brand";
  const navClassName = variant === "Centered Brand" ? "wto-navbar--centered-brand" : "";

  const navStyle: Record<string, string | undefined> = {};
  if (variant === "Gradient CTA") {
    navStyle.backgroundColor = navbarData.style.backgroundColor || "#ffffff";
    navStyle.backgroundImage = "linear-gradient(90deg, #8b5cf6 0%, #2563eb 100%)";
    navStyle.boxShadow = navbarData.style.shadow === "none" ? "none" : "0 10px 30px rgba(15, 23, 42, 0.08)";
  } else if (variant === "Transparent") {
    navStyle.backgroundColor = "transparent";
    navStyle.boxShadow = "none";
    navStyle.borderBottom = "none";
  } else if (variant === "Dark Premium") {
    navStyle.backgroundColor = navbarData.style.backgroundColor || "#0f172a";
    navStyle.boxShadow = navbarData.style.shadow === "none" ? "none" : "0 10px 30px rgba(15, 23, 42, 0.18)";
  } else {
    navStyle.backgroundColor = navbarData.style.backgroundColor || "#ffffff";
    if (navbarData.style.shadow !== "none") {
      navStyle.boxShadow = "0 10px 30px rgba(15, 23, 42, 0.08)";
    }
  }

  return {
    navStyle,
    textColor,
    navTextColor,
    navHoverColor,
    navActiveColor,
    navClassName,
    brandClassName,
  };
}

export function buildNavbarBootstrapMarkup(data: WidgetData = defaultNavbarWidgetData): string {
  const navbarData = isNavbarWidgetData(data) ? data : defaultNavbarWidgetData;
  const breakpoint = navbarData.layout.breakpoint ?? "lg";
  const bpMin = breakpointMinWidth(breakpoint);
  const bpMax = bpMin - 0.02;
  const navItems = Array.isArray(navbarData.content.navItems) ? navbarData.content.navItems : [];
  const containerMode = navbarData.layout.containerMode || "container";
  const maxWidth = navbarData.layout.maxWidth || "1200px";

  const variantStyles = getNavbarVariantPresentation(navbarData, {
    breakpoint,
    isMenuOpen: false,
    isDesktopViewport: true,
  });

  const variant = normalizeNavbarVariant(navbarData.variant);
  const backgroundFullWidth = navbarData.layout.backgroundFullWidth !== false;
  const backgroundFullWidthStyle =
    variant === "Gradient CTA" || backgroundFullWidth
      ? `width: 100%; max-width: none; margin: 0;`
      : `max-width: ${escapeHtml(maxWidth)}; margin-left: auto; margin-right: auto;`;
  const navStyle = [
    backgroundFullWidthStyle,
    `background-color: ${variantStyles.navStyle.backgroundColor ?? "#ffffff"};`,
    variantStyles.navStyle.backgroundImage ? `background-image: ${variantStyles.navStyle.backgroundImage};` : "",
    variantStyles.navStyle.boxShadow ? `box-shadow: ${variantStyles.navStyle.boxShadow};` : "",
    variantStyles.navStyle.borderBottom ? `border-bottom: ${variantStyles.navStyle.borderBottom};` : "",
    `color: ${variantStyles.textColor || navbarData.style.textColor || "#212529"};`,
    `padding: ${variantStyles.navStyle.padding ?? navbarData.style.padding ?? "1rem"};`,
  ].filter(Boolean);
  const isCenteredLogo = variant === "Centered Brand";
  const splitIndex = Math.max(1, Math.ceil(navItems.length / 2));
  const leftNavItems = isCenteredLogo ? navItems.slice(0, splitIndex) : navItems;
  const rightNavItems = isCenteredLogo ? navItems.slice(splitIndex) : [];
  const innerWrapperStyle = [`width:100%;`, `display:flex;`, `align-items:center;`, `flex-wrap:wrap;`, `box-sizing:border-box;`, `gap:0.75rem;`]
    .filter(Boolean)
    .join("");
  if (navbarData.style.border && variant !== "Minimal No Button" && variant !== "Centered Brand") {
    navStyle.push(`border: 1px solid ${navbarData.style.borderColor || "#e9ecef"};`);
  }
  if (variant === "Gradient CTA") {
    navStyle.push("border-radius: 0;");
  }

  const collapseId = `${escapeHtml(navbarData.advanced.id || "navbar-widget")}-collapse`;
  const hasCta =
    navbarData.content.showCta === true || (navbarData.content.showCta === undefined && navbarData.content.ctaEnabled === true);
  const navLabel = escapeHtml(navbarData.content.logoText ? `${navbarData.content.logoText} navigation` : "Site navigation");
  const brandLabel = escapeHtml(navbarData.content.logoText ? `${navbarData.content.logoText} home` : "Site home");
  const brandClass = variantStyles.brandClassName;
  // Avoid Bootstrap .collapse / .navbar-collapse — they hide menus without Bootstrap Collapse JS.
  const togglerClass = "wto-navbar-toggler";
  const collapseClass = "wto-navbar-collapse";
  const navListClass = ["wto-navbar-nav", "navbar-nav", "align-items-center", "mb-0", "list-unstyled"]
    .filter(Boolean)
    .join(" ");
  const buttonIcon = navbarData.content.hamburgerIcon || "";
  const ctaStyle = navbarData.style.ctaStyle || "primary";

  const brandHtml = navbarData.content.logoImageSrc
    ? `<img src="${escapeHtml(navbarData.content.logoImageSrc)}" alt="${escapeHtml(navbarData.content.logoText || "Brand")}" style="max-width:100%;width:${escapeHtml(navbarData.content.logoWidth || "140px")};height:auto;" />`
    : `<span style="color:${escapeHtml(variantStyles.textColor)};font-weight:700;">${escapeHtml(navbarData.content.logoText || "Brand")}</span>`;

  const navItemsHtml = (items: NavbarNavItem[]) =>
    items
      .map((item) => {
        const iconHtml = item.icon
          ? `<i class="fa-solid fa-${escapeHtml(String(item.icon))} me-2" aria-hidden="true"></i>`
          : "";
        return `<li class="nav-item"><a class="nav-link" href="${escapeHtml(String(item.href || "#"))}" style="color:${escapeHtml(variantStyles.navTextColor)};">${iconHtml}${escapeHtml(String(item.label || "Link"))}</a></li>`;
      })
      .join("");

  const togglerHtml = buttonIcon
    ? `<i class="fa-solid fa-${escapeHtml(buttonIcon)}" style="color:${escapeHtml(variantStyles.textColor)};font-size:1.1rem;" aria-hidden="true"></i>`
    : `<span class="wto-navbar-toggler-icon" aria-hidden="true"></span>`;

  const innerClass = containerMode === "fluid" ? "container-fluid" : "container";
  const toggleScript = `var panel=document.getElementById('${escapeHtml(collapseId)}');if(panel){var open=panel.getAttribute('data-open')==='true';var next=open?'false':'true';panel.setAttribute('data-open',next);panel.classList.toggle('is-open',next==='true');this.setAttribute('aria-expanded',next);}`;

  return `
<header class="builder-navbar wto-navbar ${variantStyles.navClassName} w-100" style="${navStyle.join(" ")}" aria-label="${navLabel}" data-content-width="${containerMode === "fluid" ? "fluid" : "container"}">
  <style>
    .builder-navbar.wto-navbar { width: 100%; max-width: none; margin: 0; position: relative; }
    .builder-navbar .builder-navbar__inner { width: 100%; max-width: var(--builder-content-max-width, 1200px); margin-inline: auto; padding-inline: 24px; display: flex; align-items: center; flex-wrap: wrap; box-sizing: border-box; gap: 0.75rem; }
    .builder-navbar[data-content-width="fluid"] .builder-navbar__inner { max-width: none; }
    .builder-navbar .builder-navbar__brand { flex-shrink: 0; }
    .builder-navbar .builder-navbar__nav { display: flex; align-items: center; min-width: 0; }
    .builder-navbar .builder-navbar__actions { display: flex; align-items: center; margin-left: auto; }
    .wto-navbar .wto-navbar-nav { display: flex; align-items: center; gap: 0.25rem 1.25rem; margin: 0; padding: 0; list-style: none; }
    .wto-navbar .wto-navbar-nav .nav-link { display: inline-flex; align-items: center; text-decoration: none; white-space: nowrap; padding: 0.35rem 0.15rem; }
    .wto-navbar .wto-navbar-item-shell { position: relative; display: flex; align-items: center; gap: 0.35rem; }
    .wto-navbar .wto-navbar-dropdown-toggle { border: 0; background: transparent; color: inherit; padding: 0.25rem 0.35rem; }
    .wto-navbar .wto-navbar-dropdown-menu { display: none; flex-direction: column; gap: 0.25rem; position: absolute; top: calc(100% + 0.4rem); left: 0; min-width: 12rem; padding: 0.5rem; border-radius: 0.75rem; background: rgba(255,255,255,0.96); border: 1px solid rgba(15,23,42,0.08); box-shadow: 0 12px 30px rgba(15,23,42,0.12); }
    .wto-navbar .wto-navbar-dropdown-menu--open { display: flex; }
    .wto-navbar a:focus-visible, .wto-navbar button:focus-visible { outline: 3px solid ${escapeHtml(variantStyles.navActiveColor)}; outline-offset: 2px; border-radius: 0.45rem; }
    .wto-navbar .nav-link:hover { color: ${escapeHtml(variantStyles.navHoverColor)} !important; }
    .wto-navbar .nav-link[data-active="true"] { color: ${escapeHtml(variantStyles.navActiveColor)} !important; }
    .wto-navbar .btn-gradient { background: linear-gradient(90deg, #8b5cf6 0%, #2563eb 100%); color: #ffffff; border: none; box-shadow: 0 14px 40px rgba(99, 102, 241, 0.32); }
    .wto-navbar .btn-gradient:hover { box-shadow: 0 18px 50px rgba(59, 130, 246, 0.38); }
    .wto-navbar .wto-navbar-toggler {
      display: none;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      width: 42px;
      height: 42px;
      padding: 0;
      border: 1px solid rgba(15,23,42,0.15);
      border-radius: 0.5rem;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .wto-navbar .wto-navbar-toggler-icon {
      display: block;
      width: 1.25rem;
      height: 1.25rem;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(15, 23, 42, 0.85)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 100%;
    }
    .wto-navbar .wto-navbar-collapse {
      display: none;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      gap: 0.75rem;
      flex-basis: 100%;
    }
    .wto-navbar .wto-navbar-collapse[data-open="true"],
    .wto-navbar .wto-navbar-collapse.is-open {
      display: flex;
    }
    .wto-navbar .wto-navbar-desktop-split { display: none; }
    @media (min-width: ${bpMin}px) {
      .wto-navbar .wto-navbar-toggler { display: none !important; }
      .wto-navbar .wto-navbar-collapse {
        display: flex !important;
        flex-direction: row;
        align-items: center;
        width: auto;
        flex: 1 1 auto;
        flex-basis: auto;
        gap: 1rem;
      }
      .wto-navbar .wto-navbar-nav { flex-direction: row; flex-wrap: wrap; }
      .wto-navbar .wto-navbar-desktop-split { display: flex; flex: 1 1 auto; align-items: center; justify-content: space-between; min-width: 0; }
      .wto-navbar .wto-navbar-mobile-brand { display: none !important; }
      .wto-navbar.wto-navbar--centered-brand .wto-navbar-collapse { display: none !important; }
    }
    @media (max-width: ${bpMax}px) {
      .wto-navbar .wto-navbar-toggler { display: inline-flex !important; }
      .wto-navbar .wto-navbar-desktop-split { display: none !important; }
      .wto-navbar .wto-navbar-collapse {
        display: none;
        flex-direction: column;
        width: 100%;
        flex-basis: 100%;
      }
      .wto-navbar .wto-navbar-collapse[data-open="true"],
      .wto-navbar .wto-navbar-collapse.is-open {
        display: flex;
      }
      .wto-navbar .wto-navbar-nav { flex-direction: column; align-items: flex-start; width: 100%; gap: 0.35rem; }
      .wto-navbar .builder-navbar__actions { margin-left: 0; width: 100%; }
    }
  </style>
  <div class="${innerClass} builder-navbar__inner" style="${innerWrapperStyle}">
    ${
      isCenteredLogo
        ? `<div class="wto-navbar-desktop-split">
      <ul class="${navListClass}">
        ${navItemsHtml(leftNavItems)}
      </ul>
      <a class="${brandClass} builder-navbar__brand" href="${escapeHtml(navbarData.content.logoHref || "#")}" style="width:${escapeHtml(navbarData.content.logoWidth || "auto")};color:${escapeHtml(variantStyles.textColor || navbarData.style.textColor || "#212529")};" aria-label="${brandLabel}">
        ${brandHtml}
      </a>
      <ul class="${navListClass}">
        ${navItemsHtml(rightNavItems)}
      </ul>
    </div>
    <a class="${brandClass} builder-navbar__brand wto-navbar-mobile-brand" href="${escapeHtml(navbarData.content.logoHref || "#")}" style="width:${escapeHtml(navbarData.content.logoWidth || "auto")};color:${escapeHtml(variantStyles.textColor || navbarData.style.textColor || "#212529")};" aria-label="${brandLabel}">
      ${brandHtml}
    </a>`
        : `<a class="${brandClass} builder-navbar__brand" href="${escapeHtml(navbarData.content.logoHref || "#")}" style="width:${escapeHtml(navbarData.content.logoWidth || "auto")};color:${escapeHtml(variantStyles.textColor || navbarData.style.textColor || "#212529")};" aria-label="${brandLabel}">
      ${brandHtml}
    </a>`
    }
    <button class="${togglerClass}" type="button" aria-controls="${escapeHtml(collapseId)}" aria-expanded="false" aria-label="Toggle navigation" onclick="${toggleScript}">
      ${togglerHtml}
    </button>
    <div class="${collapseClass}" id="${escapeHtml(collapseId)}" data-open="false">
      <div class="builder-navbar__nav">
        <ul class="${navListClass}">
          ${navItemsHtml(navItems)}
        </ul>
      </div>
      ${
        hasCta
          ? `<div class="builder-navbar__actions"><a class="btn ${ctaStyle === "primary" ? "btn-primary" : ctaStyle === "secondary" ? "btn-secondary" : "btn-outline-primary"}" href="${escapeHtml(navbarData.content.ctaHref || "#")}">${escapeHtml(navbarData.content.ctaLabel || "CTA")}</a></div>`
          : ""
      }
    </div>
  </div>
</header>`;
}
