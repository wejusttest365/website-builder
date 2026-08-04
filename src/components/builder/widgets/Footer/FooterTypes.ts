import type { WidgetData } from "../widgetRegistry";

export type FooterVariant = "Dark Footer" | "Light Footer";
export type FooterAlignment = "left" | "center" | "right";
export type FooterSocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "whatsapp";

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface FooterColumn {
  id: string;
  heading: string;
  showHeading?: boolean;
  links: FooterLink[];
}

export interface FooterSocialItem {
  id: string;
  platform: FooterSocialPlatform;
  href: string;
  label: string;
}

export interface FooterLegalLink {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface FooterContentGroup extends Record<string, unknown> {
  showBrand?: boolean;
  brandName?: string;
  brandDescription?: string;
  brandLogoSrc?: string;
  brandLogoWidth?: string;
  showBrandLogo?: boolean;
  brandHref?: string;
  brandAlignment?: FooterAlignment;
  columns?: FooterColumn[];
  showPhone?: boolean;
  phone?: string;
  showEmail?: boolean;
  email?: string;
  showAddress?: boolean;
  address?: string;
  showHours?: boolean;
  hours?: string;
  showSocial?: boolean;
  socialItems?: FooterSocialItem[];
  socialAlignment?: FooterAlignment;
  socialOpenInNewTab?: boolean;
  showBottomBar?: boolean;
  copyrightText?: string;
  showAllRightsReserved?: boolean;
  allRightsReservedText?: string;
  legalLinks?: FooterLegalLink[];
  showBottomDivider?: boolean;
}

export interface FooterStyleGroup extends Record<string, unknown> {
  backgroundColor?: string;
  textColor?: string;
  headingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  dividerColor?: string;
  accentColor?: string;
  headingFontSize?: string;
  bodyFontSize?: string;
  linkFontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  socialIconSize?: string;
  borderRadius?: string;
}

export interface FooterLayoutGroup extends Record<string, unknown> {
  columnCount?: number;
  columnGap?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  contentAlignment?: FooterAlignment;
}

export interface FooterResponsiveGroup extends Record<string, unknown> {
  tabletColumns?: number | null;
  mobileColumns?: number | null;
  fontSizeMobile?: string;
  fontSizeTablet?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface FooterAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: string;
  duration?: number;
  delay?: number;
}

export interface FooterAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  visibility?: boolean;
}

export interface FooterWidgetData extends WidgetData {
  type: "footer";
  variant: FooterVariant;
  content: FooterContentGroup;
  style: FooterStyleGroup;
  layout: FooterLayoutGroup;
  responsive: FooterResponsiveGroup;
  animation: FooterAnimationGroup;
  advanced: FooterAdvancedGroup;
}

export const FOOTER_SOCIAL_PLATFORMS: Array<{ value: FooterSocialPlatform; label: string; iconClass: string }> = [
  { value: "facebook", label: "Facebook", iconClass: "fa-brands fa-facebook-f" },
  { value: "instagram", label: "Instagram", iconClass: "fa-brands fa-instagram" },
  { value: "twitter", label: "X / Twitter", iconClass: "fa-brands fa-x-twitter" },
  { value: "linkedin", label: "LinkedIn", iconClass: "fa-brands fa-linkedin-in" },
  { value: "youtube", label: "YouTube", iconClass: "fa-brands fa-youtube" },
  { value: "tiktok", label: "TikTok", iconClass: "fa-brands fa-tiktok" },
  { value: "whatsapp", label: "WhatsApp", iconClass: "fa-brands fa-whatsapp" },
];

export function createFooterId(prefix = "footer") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createFooterLink(partial?: Partial<FooterLink>): FooterLink {
  return {
    id: partial?.id ?? createFooterId("link"),
    label: partial?.label ?? "New link",
    href: partial?.href ?? "#",
    openInNewTab: partial?.openInNewTab ?? false,
  };
}

export function createFooterColumn(partial?: Partial<FooterColumn>): FooterColumn {
  return {
    id: partial?.id ?? createFooterId("column"),
    heading: partial?.heading ?? "Column",
    showHeading: partial?.showHeading !== false,
    links: Array.isArray(partial?.links) ? partial!.links.map((link) => createFooterLink(link)) : [createFooterLink({ label: "Link", href: "#" })],
  };
}

export function createFooterSocialItem(partial?: Partial<FooterSocialItem>): FooterSocialItem {
  const platform = partial?.platform ?? "facebook";
  const platformMeta = FOOTER_SOCIAL_PLATFORMS.find((item) => item.value === platform);
  return {
    id: partial?.id ?? createFooterId("social"),
    platform,
    href: partial?.href ?? "#",
    label: partial?.label ?? platformMeta?.label ?? "Social",
  };
}

export function createFooterLegalLink(partial?: Partial<FooterLegalLink>): FooterLegalLink {
  return {
    id: partial?.id ?? createFooterId("legal"),
    label: partial?.label ?? "Legal",
    href: partial?.href ?? "#",
    openInNewTab: partial?.openInNewTab ?? false,
  };
}

export function getFooterVariantStyles(variant: FooterVariant): FooterStyleGroup {
  if (variant === "Light Footer") {
    return {
      backgroundColor: "#f8fafc",
      textColor: "#475569",
      headingColor: "#0f172a",
      linkColor: "#334155",
      linkHoverColor: "#2563eb",
      dividerColor: "#e2e8f0",
      accentColor: "#2563eb",
      headingFontSize: "15px",
      bodyFontSize: "14px",
      linkFontSize: "14px",
      fontWeight: "400",
      lineHeight: "1.6",
      letterSpacing: "0px",
      socialIconSize: "18px",
      borderRadius: "0px",
    };
  }
  return {
    backgroundColor: "#0b1220",
    textColor: "#cbd5e1",
    headingColor: "#f8fafc",
    linkColor: "#e2e8f0",
    linkHoverColor: "#93c5fd",
    dividerColor: "rgba(148,163,184,0.25)",
    accentColor: "#60a5fa",
    headingFontSize: "15px",
    bodyFontSize: "14px",
    linkFontSize: "14px",
    fontWeight: "400",
    lineHeight: "1.6",
    letterSpacing: "0px",
    socialIconSize: "18px",
    borderRadius: "0px",
  };
}

export function normalizeFooterFontSize(value: unknown, fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/^\d+(\.\d+)?px$/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return `${numeric}px`;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (match) return `${match[1]}px`;
  return fallback;
}

export function resolveFooterColumnCount(footer: Pick<FooterWidgetData, "layout" | "content">): number {
  const fromLayout = Number(footer.layout?.columnCount);
  if (Number.isFinite(fromLayout) && fromLayout > 0) {
    return Math.max(1, Math.min(4, Math.round(fromLayout)));
  }
  const fromContent = Array.isArray(footer.content?.columns) ? footer.content.columns.length : 3;
  return Math.max(1, Math.min(4, fromContent || 3));
}

export function resolveFooterResponsiveColumns(
  desktopColumns: number,
  tabletColumns?: number | null,
  mobileColumns?: number | null,
): { desktop: number; tablet: number; mobile: number } {
  const desktop = Math.max(1, Math.min(4, desktopColumns || 1));
  const tablet =
    tabletColumns == null || !Number.isFinite(Number(tabletColumns))
      ? Math.min(2, desktop)
      : Math.max(1, Math.min(4, Math.round(Number(tabletColumns))));
  const mobile =
    mobileColumns == null || !Number.isFinite(Number(mobileColumns))
      ? 1
      : Math.max(1, Math.min(4, Math.round(Number(mobileColumns))));
  return { desktop, tablet, mobile };
}

export function getSocialIconClass(platform: FooterSocialPlatform): string {
  return FOOTER_SOCIAL_PLATFORMS.find((item) => item.value === platform)?.iconClass ?? "fa-solid fa-link";
}

export function toTelHref(phone: string): string {
  const cleaned = String(phone || "").replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "tel:";
}

export function toMailtoHref(email: string): string {
  const cleaned = String(email || "").trim();
  return cleaned ? `mailto:${cleaned}` : "mailto:";
}

export function applyFooterVariant(instance: FooterWidgetData, variant: FooterVariant): FooterWidgetData {
  const variantStyles = getFooterVariantStyles(variant);
  return {
    ...instance,
    variant,
    style: {
      ...instance.style,
      ...variantStyles,
    },
  };
}

export const defaultFooterWidgetData: FooterWidgetData = {
  id: "footer-default",
  type: "footer",
  variant: "Dark Footer",
  content: {
    showBrand: true,
    brandName: "Brand",
    brandDescription: "Build better websites with a modern, flexible website builder.",
    brandLogoSrc: "",
    brandLogoWidth: "140px",
    showBrandLogo: false,
    brandHref: "#",
    brandAlignment: "left",
    columns: [
      createFooterColumn({
        id: "col-product",
        heading: "Product",
        links: [
          createFooterLink({ id: "p1", label: "Features", href: "#features" }),
          createFooterLink({ id: "p2", label: "Templates", href: "#templates" }),
          createFooterLink({ id: "p3", label: "Pricing", href: "#pricing" }),
          createFooterLink({ id: "p4", label: "Integrations", href: "#integrations" }),
        ],
      }),
      createFooterColumn({
        id: "col-company",
        heading: "Company",
        links: [
          createFooterLink({ id: "c1", label: "About", href: "#about" }),
          createFooterLink({ id: "c2", label: "Careers", href: "#careers" }),
          createFooterLink({ id: "c3", label: "Blog", href: "#blog" }),
          createFooterLink({ id: "c4", label: "Contact", href: "#contact" }),
        ],
      }),
      createFooterColumn({
        id: "col-resources",
        heading: "Resources",
        links: [
          createFooterLink({ id: "r1", label: "Help Center", href: "#help" }),
          createFooterLink({ id: "r2", label: "Documentation", href: "#docs" }),
          createFooterLink({ id: "r3", label: "Community", href: "#community" }),
          createFooterLink({ id: "r4", label: "Status", href: "#status" }),
        ],
      }),
    ],
    showPhone: true,
    phone: "+1 (555) 123-4567",
    showEmail: true,
    email: "hello@example.com",
    showAddress: true,
    address: "123 Business Avenue, New York, NY",
    showHours: true,
    hours: "Mon–Fri, 9:00 AM–6:00 PM",
    showSocial: true,
    socialItems: [
      createFooterSocialItem({ id: "s1", platform: "facebook", href: "https://facebook.com", label: "Facebook" }),
      createFooterSocialItem({ id: "s2", platform: "instagram", href: "https://instagram.com", label: "Instagram" }),
      createFooterSocialItem({ id: "s3", platform: "twitter", href: "https://x.com", label: "X / Twitter" }),
      createFooterSocialItem({ id: "s4", platform: "linkedin", href: "https://linkedin.com", label: "LinkedIn" }),
    ],
    socialAlignment: "left",
    socialOpenInNewTab: true,
    showBottomBar: true,
    copyrightText: `© ${new Date().getFullYear()} Brand. All rights reserved.`,
    showAllRightsReserved: false,
    allRightsReservedText: "All rights reserved.",
    legalLinks: [
      createFooterLegalLink({ id: "l1", label: "Privacy Policy", href: "#privacy" }),
      createFooterLegalLink({ id: "l2", label: "Terms of Service", href: "#terms" }),
      createFooterLegalLink({ id: "l3", label: "Accessibility", href: "#accessibility" }),
    ],
    showBottomDivider: true,
  },
  style: getFooterVariantStyles("Dark Footer"),
  layout: {
    columnCount: 3,
    columnGap: "32px",
    paddingTop: "56px",
    paddingBottom: "28px",
    paddingLeft: "24px",
    paddingRight: "24px",
    contentAlignment: "left",
  },
  responsive: {
    tabletColumns: 2,
    mobileColumns: 1,
    fontSizeMobile: "",
    fontSizeTablet: "",
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 400,
    delay: 0,
  },
  advanced: {
    id: "",
    className: "",
    visibility: true,
  },
};

export function isFooterWidgetData(value: WidgetData): value is FooterWidgetData {
  return value?.type === "footer";
}
