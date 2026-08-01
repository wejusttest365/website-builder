import type { WidgetData } from "../widgetRegistry";
import { defaultNavbarWidgetData, isNavbarWidgetData } from "./NavbarTypes";

function escapeHtml(value: string | undefined) {
  if (!value) return "";
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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

export function buildNavbarBootstrapMarkup(data: WidgetData = defaultNavbarWidgetData): string {
  const navbarData = isNavbarWidgetData(data) ? data : defaultNavbarWidgetData;
  const variant = navbarData.variant || defaultNavbarWidgetData.variant;
  const containerClass = "w-100";
  const breakpoint = navbarData.layout.breakpoint ?? "lg";
  const expandClass = `navbar-expand-${breakpoint}`;
  const stickyClass = navbarData.layout.sticky ? "sticky-top" : "";
  const shadowClass = variant === "Transparent" || variant === "Minimal" ? "" : mapShadowClass(navbarData.style.shadow);
  const borderClass = navbarData.style.border && variant !== "Minimal" ? "border" : "";

  const backgroundColor =
    variant === "Transparent"
      ? "transparent"
      : variant === "Glass"
      ? navbarData.style.backgroundColor || "rgba(255,255,255,0.82)"
      : navbarData.style.backgroundColor || "#ffffff";

  const navStyle = [`background-color: ${backgroundColor};`, `color: ${navbarData.style.textColor || "#212529"};`, `padding: ${navbarData.style.padding || "1rem"};`];
  if (navbarData.style.border && variant !== "Minimal") {
    navStyle.push(`border: 1px solid ${navbarData.style.borderColor || "#e9ecef"};`);
  }
  if (variant === "Glass") {
    navStyle.push("backdrop-filter: saturate(180%) blur(14px);");
  }

  const collapseId = `${escapeHtml(navbarData.advanced.id || "navbar-widget")}-collapse`;
  const navItems = Array.isArray(navbarData.content.navItems) ? navbarData.content.navItems : [];
  const hasCta = Boolean(navbarData.content.ctaLabel);
  const isCenteredLogo = variant === "Centered Logo";
  const brandClass = `navbar-brand${isCenteredLogo ? " mx-auto order-lg-2" : ""}`;
  const togglerClass = `navbar-toggler${isCenteredLogo ? " order-lg-1" : ""} d-${breakpoint}-none`;
  const collapseClass = `collapse navbar-collapse${isCenteredLogo ? " order-lg-3" : ""} d-${breakpoint}-flex`;
  const navListClass = `navbar-nav ${isCenteredLogo ? "mx-auto" : "me-auto"} mb-2 mb-lg-0`;
  const buttonIcon = navbarData.content.hamburgerIcon || "";

  const brandHtml = navbarData.content.logoImageSrc
    ? `<img src="${escapeHtml(navbarData.content.logoImageSrc)}" alt="${escapeHtml(navbarData.content.logoText || "Brand")}" style="max-width:100%;width:${escapeHtml(navbarData.content.logoWidth || "140px")};height:auto;" />`
    : `<span style="color:${escapeHtml(navbarData.style.textColor || "#212529")};font-weight:700;">${escapeHtml(navbarData.content.logoText || "Brand")}</span>`;

  const navItemsHtml = navItems
    .map((item) => {
      const iconHtml = item.icon ? `<i class="fa-solid fa-${escapeHtml(String(item.icon))} me-2" aria-hidden="true"></i>` : "";
      return `<li class="nav-item"><a class="nav-link" href="${escapeHtml(String(item.href || "#"))}" style="color:${escapeHtml(navbarData.style.textColor || "#212529")};">${iconHtml}${escapeHtml(String(item.label || "Link"))}</a></li>`;
    })
    .join("");

  const togglerHtml = buttonIcon
    ? `<i class="fa-solid fa-${escapeHtml(buttonIcon)}" style="color:${escapeHtml(navbarData.style.textColor || "#212529")};font-size:1.1rem;" aria-hidden="true"></i>`
    : `<span class="navbar-toggler-icon"></span>`;

  return `
<nav class="navbar ${expandClass} ${stickyClass} ${shadowClass} ${borderClass}" style="${navStyle.join(" ")}">
  <div class="${containerClass}">
    <a class="${brandClass}" href="${escapeHtml(navbarData.content.logoHref || "#")}" style="width:${escapeHtml(navbarData.content.logoWidth || "auto")};">
      ${brandHtml}
    </a>
    <button class="${togglerClass}" type="button" data-bs-toggle="collapse" data-bs-target="#${escapeHtml(collapseId)}" aria-controls="${escapeHtml(collapseId)}" aria-expanded="false" aria-label="Toggle navigation">
      ${togglerHtml}
    </button>
    <div class="${collapseClass}" id="${escapeHtml(collapseId)}">
      <ul class="${navListClass}">
        ${navItemsHtml}
      </ul>
      ${hasCta ? `<a class="btn btn-primary" href="${escapeHtml(navbarData.content.ctaHref || "#")}">${escapeHtml(navbarData.content.ctaLabel || "CTA")}</a>` : ""}
    </div>
  </div>
</nav>`;
}
