import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import {
  defaultFooterWidgetData,
  getSocialIconClass,
  isFooterWidgetData,
  normalizeFooterFontSize,
  resolveFooterColumnCount,
  resolveFooterResponsiveColumns,
  toMailtoHref,
  toTelHref,
  type FooterAlignment,
  type FooterWidgetData,
} from "./FooterTypes";

function escapeHtml(value: string | undefined) {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeCssIdent(value: string) {
  return String(value || "footer").replace(/[^a-zA-Z0-9_-]/g, "");
}

function alignToFlex(alignment: FooterAlignment | undefined) {
  if (alignment === "center") return "center";
  if (alignment === "right") return "flex-end";
  return "flex-start";
}

function alignToText(alignment: FooterAlignment | undefined) {
  if (alignment === "center") return "center";
  if (alignment === "right") return "right";
  return "left";
}

function attr(name: string, value: string | undefined, editorMode: boolean) {
  if (!editorMode || !value) return "";
  return ` ${name}="${escapeHtml(value)}"`;
}

export function buildFooterBootstrapMarkup(
  data: WidgetData = defaultFooterWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const footer = isFooterWidgetData(data) ? data : defaultFooterWidgetData;
  if (footer.advanced?.visibility === false) return "";

  const style = footer.style ?? {};
  const layout = footer.layout ?? {};
  const content = footer.content ?? {};
  const columns = Array.isArray(content.columns) ? content.columns : [];
  const socialItems = Array.isArray(content.socialItems) ? content.socialItems : [];
  const legalLinks = Array.isArray(content.legalLinks) ? content.legalLinks : [];

  const desktopColumns = resolveFooterColumnCount(footer);
  const { tablet, mobile } = resolveFooterResponsiveColumns(
    desktopColumns,
    footer.responsive?.tabletColumns,
    footer.responsive?.mobileColumns,
  );

  const backgroundColor = String(style.backgroundColor || "#0b1220");
  const textColor = String(style.textColor || "#cbd5e1");
  const headingColor = String(style.headingColor || "#f8fafc");
  const linkColor = String(style.linkColor || textColor);
  const linkHoverColor = String(style.linkHoverColor || "#93c5fd");
  const dividerColor = String(style.dividerColor || "rgba(148,163,184,0.25)");
  const accentColor = String(style.accentColor || "#60a5fa");
  const headingFontSize = normalizeFooterFontSize(style.headingFontSize, "15px");
  const bodyFontSize = normalizeFooterFontSize(style.bodyFontSize, "14px");
  const linkFontSize = normalizeFooterFontSize(style.linkFontSize, "14px");
  const socialIconSize = normalizeFooterFontSize(style.socialIconSize, "18px");
  const fontWeight = String(style.fontWeight || "400");
  const lineHeight = String(style.lineHeight || "1.6");
  const letterSpacing = String(style.letterSpacing || "0px");
  const borderRadius = String(style.borderRadius || "0px");
  const columnGap = String(layout.columnGap || "32px");
  const paddingTop = String(layout.paddingTop || "56px");
  const paddingBottom = String(layout.paddingBottom || "28px");
  const paddingLeft = String(layout.paddingLeft || "24px");
  const paddingRight = String(layout.paddingRight || "24px");
  const brandAlignment = (content.brandAlignment || "left") as FooterAlignment;
  const socialAlignment = (content.socialAlignment || "left") as FooterAlignment;
  const footerClass = `wto-footer-${escapeCssIdent(footer.id)}`;
  const hideOnMobile = Boolean(footer.responsive?.hideOnMobile);
  const hideOnTablet = Boolean(footer.responsive?.hideOnTablet);
  const hideOnDesktop = Boolean(footer.responsive?.hideOnDesktop);
  const fontSizeTablet = String(footer.responsive?.fontSizeTablet || "").trim();
  const fontSizeMobile = String(footer.responsive?.fontSizeMobile || "").trim();
  const tabletFontSize = fontSizeTablet ? normalizeFooterFontSize(fontSizeTablet, bodyFontSize) : "";
  const mobileFontSize = fontSizeMobile ? normalizeFooterFontSize(fontSizeMobile, bodyFontSize) : "";
  const extraClass = footer.advanced?.className ? ` ${escapeHtml(String(footer.advanced.className))}` : "";
  const footerDomId = footer.advanced?.id ? ` id="${escapeHtml(String(footer.advanced.id))}"` : "";
  const hideCss = [
    hideOnMobile
      ? `@media (max-width:767.98px){body:not([data-builder-edit-mode="1"]) .${footerClass}{display:none!important;}body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass}{display:none!important;}}`
      : "",
    hideOnTablet
      ? `@media (min-width:768px) and (max-width:991.98px){body:not([data-builder-edit-mode="1"]) .${footerClass}{display:none!important;}body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass}{display:none!important;}}`
      : "",
    hideOnDesktop
      ? `@media (min-width:992px){body:not([data-builder-edit-mode="1"]) .${footerClass}{display:none!important;}body[data-builder-edit-mode="1"][data-builder-device="desktop"] .${footerClass}{display:none!important;}}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const responsiveFontCss = [
    tabletFontSize
      ? `@media (max-width:991.98px){body:not([data-builder-edit-mode="1"]) .${footerClass}{font-size:${tabletFontSize};}body:not([data-builder-edit-mode="1"]) .${footerClass} .wto-footer-brand-description,.${footerClass} .wto-footer-contact-item,.${footerClass} .wto-footer-link,.${footerClass} .wto-footer-legal-link,.${footerClass} .wto-footer-bottom{font-size:${tabletFontSize}!important;}body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass} .wto-footer-brand-description,body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass} .wto-footer-contact-item,body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass} .wto-footer-link,body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass} .wto-footer-legal-link,body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass} .wto-footer-bottom{font-size:${tabletFontSize}!important;}}`
      : "",
    mobileFontSize
      ? `@media (max-width:767.98px){body:not([data-builder-edit-mode="1"]) .${footerClass} .wto-footer-brand-description,.${footerClass} .wto-footer-contact-item,.${footerClass} .wto-footer-link,.${footerClass} .wto-footer-legal-link,.${footerClass} .wto-footer-bottom{font-size:${mobileFontSize}!important;}body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-brand-description,body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-contact-item,body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-link,body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-legal-link,body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-bottom{font-size:${mobileFontSize}!important;}}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const brandHtml = content.showBrand !== false
    ? (() => {
        const logoSrc = content.showBrandLogo && String(content.brandLogoSrc || "").trim()
          ? String(content.brandLogoSrc).trim()
          : "";
        const brandName = String(content.brandName || "Brand");
        const brandDescription = String(content.brandDescription || "");
        const brandHref = String(content.brandHref || "#");
        const logoWidth = String(content.brandLogoWidth || "140px");
        const brandMedia = logoSrc
          ? `<a href="${escapeHtml(brandHref)}" class="wto-footer-brand-logo"${attr("data-wto-widget-element-key", "brandLogo", editorMode)}${attr("data-wto-widget-element-type", "image", editorMode)} aria-label="${escapeHtml(brandName)} home"><img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(brandName)}" style="max-width:100%;width:${escapeHtml(logoWidth)};height:auto;display:block;" /></a>`
          : `<a href="${escapeHtml(brandHref)}" class="wto-footer-brand-name"${attr("data-wto-widget-element-key", "brandName", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)} style="color:${escapeHtml(headingColor)};font-size:${escapeHtml(headingFontSize)};font-weight:700;text-decoration:none;letter-spacing:${escapeHtml(letterSpacing)};">${escapeHtml(brandName)}</a>`;
        const description = brandDescription
          ? `<p class="wto-footer-brand-description"${attr("data-wto-widget-element-key", "brandDescription", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)} style="margin:0.75rem 0 0;color:${escapeHtml(textColor)};font-size:${escapeHtml(bodyFontSize)};line-height:${escapeHtml(lineHeight)};max-width:28rem;">${escapeHtml(brandDescription)}</p>`
          : "";
        return `<div class="wto-footer-brand"${attr("data-wto-widget-element-key", "brand", editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)} style="text-align:${alignToText(brandAlignment)};display:flex;flex-direction:column;align-items:${alignToFlex(brandAlignment)};">${brandMedia}${description}</div>`;
      })()
    : "";

  const columnsHtml = columns
    .map((column) => {
      const heading =
        column.showHeading !== false && column.heading
          ? `<h3 class="wto-footer-column-heading"${attr("data-wto-widget-element-key", `columnHeading-${column.id}`, editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)} style="margin:0 0 0.9rem;color:${escapeHtml(headingColor)};font-size:${escapeHtml(headingFontSize)};font-weight:600;letter-spacing:${escapeHtml(letterSpacing)};line-height:1.3;">${escapeHtml(column.heading)}</h3>`
          : "";
      const links = (Array.isArray(column.links) ? column.links : [])
        .map((link) => {
          const target = link.openInNewTab ? ` target="_blank" rel="noopener noreferrer"` : "";
          return `<li><a class="wto-footer-link" href="${escapeHtml(link.href || "#")}"${target}${attr("data-wto-widget-element-key", `columnLink-${column.id}-${link.id}`, editorMode)}${attr("data-wto-widget-element-type", "link", editorMode)} style="color:${escapeHtml(linkColor)};font-size:${escapeHtml(linkFontSize)};font-weight:${escapeHtml(fontWeight)};line-height:${escapeHtml(lineHeight)};text-decoration:none;">${escapeHtml(link.label || "Link")}</a></li>`;
        })
        .join("");
      return `<div class="wto-footer-column"${attr("data-wto-widget-element-key", `column-${column.id}`, editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)}>${heading}<ul class="wto-footer-link-list" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.55rem;">${links}</ul></div>`;
    })
    .join("");

  const contactBits: string[] = [];
  if (content.showPhone !== false && content.phone) {
    contactBits.push(`<a class="wto-footer-contact-item" href="${escapeHtml(toTelHref(String(content.phone)))}"${attr("data-wto-widget-element-key", "contactPhone", editorMode)}${attr("data-wto-widget-element-type", "link", editorMode)} style="color:${escapeHtml(linkColor)};font-size:${escapeHtml(bodyFontSize)};text-decoration:none;"><i class="fa-solid fa-phone" aria-hidden="true" style="margin-right:0.5rem;color:${escapeHtml(accentColor)};"></i>${escapeHtml(String(content.phone))}</a>`);
  }
  if (content.showEmail !== false && content.email) {
    contactBits.push(`<a class="wto-footer-contact-item" href="${escapeHtml(toMailtoHref(String(content.email)))}"${attr("data-wto-widget-element-key", "contactEmail", editorMode)}${attr("data-wto-widget-element-type", "link", editorMode)} style="color:${escapeHtml(linkColor)};font-size:${escapeHtml(bodyFontSize)};text-decoration:none;"><i class="fa-solid fa-envelope" aria-hidden="true" style="margin-right:0.5rem;color:${escapeHtml(accentColor)};"></i>${escapeHtml(String(content.email))}</a>`);
  }
  if (content.showAddress !== false && content.address) {
    contactBits.push(`<p class="wto-footer-contact-item"${attr("data-wto-widget-element-key", "contactAddress", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)} style="margin:0;color:${escapeHtml(textColor)};font-size:${escapeHtml(bodyFontSize)};line-height:${escapeHtml(lineHeight)};"><i class="fa-solid fa-location-dot" aria-hidden="true" style="margin-right:0.5rem;color:${escapeHtml(accentColor)};"></i>${escapeHtml(String(content.address))}</p>`);
  }
  if (content.showHours !== false && content.hours) {
    contactBits.push(`<p class="wto-footer-contact-item"${attr("data-wto-widget-element-key", "contactHours", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)} style="margin:0;color:${escapeHtml(textColor)};font-size:${escapeHtml(bodyFontSize)};line-height:${escapeHtml(lineHeight)};"><i class="fa-solid fa-clock" aria-hidden="true" style="margin-right:0.5rem;color:${escapeHtml(accentColor)};"></i>${escapeHtml(String(content.hours))}</p>`);
  }
  const contactHtml = contactBits.length
    ? `<div class="wto-footer-contact"${attr("data-wto-widget-element-key", "contact", editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)} style="display:flex;flex-direction:column;gap:0.65rem;">${contactBits.join("")}</div>`
    : "";

  const socialHtml =
    content.showSocial !== false && socialItems.length
      ? `<div class="wto-footer-social"${attr("data-wto-widget-element-key", "social", editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)} style="display:flex;flex-wrap:wrap;gap:0.65rem;justify-content:${alignToFlex(socialAlignment)};" role="list">${socialItems
          .map((item) => {
            const target = content.socialOpenInNewTab !== false ? ` target="_blank" rel="noopener noreferrer"` : "";
            const label = escapeHtml(item.label || item.platform);
            return `<a class="wto-footer-social-link" href="${escapeHtml(item.href || "#")}"${target} aria-label="${label}"${attr("data-wto-widget-element-key", `social-${item.id}`, editorMode)}${attr("data-wto-widget-element-type", "link", editorMode)} style="width:2.25rem;height:2.25rem;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;color:${escapeHtml(headingColor)};background:rgba(148,163,184,0.12);text-decoration:none;font-size:${escapeHtml(socialIconSize)};" role="listitem"><i class="${escapeHtml(getSocialIconClass(item.platform))}" aria-hidden="true"></i></a>`;
          })
          .join("")}</div>`
      : "";

  const copyrightParts = [
    content.copyrightText ? `<span${attr("data-wto-widget-element-key", "copyright", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(String(content.copyrightText))}</span>` : "",
    content.showAllRightsReserved ? `<span${attr("data-wto-widget-element-key", "allRights", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(String(content.allRightsReservedText || "All rights reserved."))}</span>` : "",
  ].filter(Boolean);
  const legalHtml = legalLinks
    .map((link) => {
      const target = link.openInNewTab ? ` target="_blank" rel="noopener noreferrer"` : "";
      return `<a class="wto-footer-legal-link" href="${escapeHtml(link.href || "#")}"${target}${attr("data-wto-widget-element-key", `legal-${link.id}`, editorMode)}${attr("data-wto-widget-element-type", "link", editorMode)} style="color:${escapeHtml(linkColor)};font-size:${escapeHtml(linkFontSize)};text-decoration:none;">${escapeHtml(link.label || "Legal")}</a>`;
    })
    .join("");

  const bottomHtml =
    content.showBottomBar !== false
      ? `${content.showBottomDivider !== false ? `<div class="wto-footer-divider" style="height:1px;width:100%;background:${escapeHtml(dividerColor)};margin:1.5rem 0 1rem;"></div>` : ""}
      <div class="wto-footer-bottom"${attr("data-wto-widget-element-key", "bottomBar", editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)} style="display:flex;flex-wrap:wrap;gap:0.75rem 1.25rem;align-items:center;justify-content:space-between;color:${escapeHtml(textColor)};font-size:${escapeHtml(bodyFontSize)};">
        <div class="wto-footer-copyright" style="display:flex;flex-wrap:wrap;gap:0.35rem 0.75rem;">${copyrightParts.join("")}</div>
        <div class="wto-footer-legal" style="display:flex;flex-wrap:wrap;gap:0.75rem 1rem;">${legalHtml}</div>
      </div>`
      : "";

  const mainGridHtml = `<div class="wto-footer-main">
    ${brandHtml}
    <div class="wto-footer-columns">${columnsHtml}</div>
    ${contactHtml}
  </div>`;

  return `
<style>
.${footerClass}{
  width:100%;
  max-width:none;
  margin:0;
  box-sizing:border-box;
  background:${backgroundColor};
  color:${textColor};
  border-radius:${borderRadius};
}
.${footerClass} .wto-footer-inner{
  width:100%;
  max-width:1200px;
  margin-inline:auto;
  box-sizing:border-box;
  padding:${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft};
}
.${footerClass} .wto-footer-main{
  display:grid;
  grid-template-columns:minmax(0,1.2fr) minmax(0,2fr) minmax(0,1fr);
  gap:${columnGap};
  align-items:start;
}
.${footerClass} .wto-footer-columns{
  display:grid;
  grid-template-columns:repeat(${desktopColumns},minmax(0,1fr));
  gap:${columnGap};
}
.${footerClass} .wto-footer-link:hover,
.${footerClass} .wto-footer-legal-link:hover,
.${footerClass} .wto-footer-contact-item:hover,
.${footerClass} .wto-footer-social-link:hover{
  color:${linkHoverColor} !important;
}
.${footerClass} .wto-footer-social{ margin-top:1.25rem; }
@media (max-width:991.98px){
  body:not([data-builder-edit-mode="1"]) .${footerClass} .wto-footer-main{
    grid-template-columns:1fr;
  }
  body:not([data-builder-edit-mode="1"]) .${footerClass} .wto-footer-columns{
    grid-template-columns:repeat(${tablet},minmax(0,1fr));
  }
}
@media (max-width:767.98px){
  body:not([data-builder-edit-mode="1"]) .${footerClass} .wto-footer-columns{
    grid-template-columns:repeat(${mobile},minmax(0,1fr));
  }
  body:not([data-builder-edit-mode="1"]) .${footerClass} .wto-footer-bottom{
    flex-direction:column;
    align-items:flex-start;
  }
}
body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass} .wto-footer-main{ grid-template-columns:1fr; }
body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${footerClass} .wto-footer-columns{ grid-template-columns:repeat(${tablet},minmax(0,1fr)); }
body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-main{ grid-template-columns:1fr; }
body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-columns{ grid-template-columns:repeat(${mobile},minmax(0,1fr)); }
body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${footerClass} .wto-footer-bottom{ flex-direction:column; align-items:flex-start; }
${hideCss}
${responsiveFontCss}
</style>
<footer${footerDomId} class="builder-footer wto-footer ${footerClass}${extraClass}" data-widget="footer" data-footer-variant="${escapeHtml(footer.variant)}" style="width:100%;max-width:none;margin:0;background:${escapeHtml(backgroundColor)};color:${escapeHtml(textColor)};border-radius:${escapeHtml(borderRadius)};box-sizing:border-box;" aria-label="Site footer">
  <div class="container wto-footer-inner">
    ${mainGridHtml}
    ${socialHtml}
    ${bottomHtml}
  </div>
</footer>`;
}
