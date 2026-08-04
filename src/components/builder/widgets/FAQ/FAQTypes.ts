import type { WidgetData } from "../widgetRegistry";

export type FAQVariant = "Simple Accordion";
export type FAQIconStyle = "plus-minus" | "chevron" | "arrow";
export type FAQIconPosition = "left" | "right";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  enabled?: boolean;
}

export interface FAQContentGroup extends Record<string, unknown> {
  items?: FAQItem[];
  selectedItemId?: string;
  allowMultiple?: boolean;
  defaultOpenItemId?: string;
  openAllByDefault?: boolean;
  closeAllByDefault?: boolean;
}

export interface FAQStyleGroup extends Record<string, unknown> {
  backgroundColor?: string;
  maxWidth?: string;
  itemBackgroundColor?: string;
  itemOpenBackgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  itemGap?: string;
  questionColor?: string;
  questionFontSize?: string;
  questionFontWeight?: string;
  questionPadding?: string;
  answerColor?: string;
  answerFontSize?: string;
  answerLineHeight?: string;
  answerPadding?: string;
  iconStyle?: FAQIconStyle;
  iconSize?: string;
  iconColor?: string;
  iconPosition?: FAQIconPosition;
  rotateIconWhenOpen?: boolean;
  transitionEnabled?: boolean;
  transitionDuration?: number;
}

export interface FAQLayoutGroup extends Record<string, unknown> {
  paddingTop?: string;
  paddingBottom?: string;
  paddingX?: string;
}

export interface FAQResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface FAQAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: string;
  duration?: number;
  delay?: number;
}

export interface FAQAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  visibility?: boolean;
}

export interface FAQWidgetData extends WidgetData {
  type: "faq";
  variant: FAQVariant;
  content: FAQContentGroup;
  style: FAQStyleGroup;
  layout: FAQLayoutGroup;
  responsive: FAQResponsiveGroup;
  animation: FAQAnimationGroup;
  advanced: FAQAdvancedGroup;
}

export function createFAQId(prefix = "faq") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createFAQItem(partial?: Partial<FAQItem>): FAQItem {
  return {
    id: partial?.id ?? createFAQId("item"),
    question: partial?.question ?? "New question",
    answer: partial?.answer ?? "Add a helpful answer for this question.",
    enabled: partial?.enabled !== false,
  };
}

export function normalizeFAQPx(value: unknown, fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/^\d+(\.\d+)?px$/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric >= 0) return `${numeric}px`;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (match) return `${match[1]}px`;
  return fallback;
}

export function isFAQWidgetData(value: unknown): value is FAQWidgetData {
  return Boolean(value && typeof value === "object" && (value as { type?: string }).type === "faq");
}

export function getEnabledFAQItems(faq: FAQWidgetData): FAQItem[] {
  const items = Array.isArray(faq.content?.items) ? faq.content.items : [];
  return items.filter((item) => item && item.enabled !== false);
}

export function resolveFAQInitialOpenIds(faq: FAQWidgetData): string[] {
  const items = getEnabledFAQItems(faq);
  if (!items.length) return [];
  const content = faq.content ?? {};
  if (content.closeAllByDefault) return [];
  if (content.openAllByDefault) {
    if (content.allowMultiple) return items.map((item) => item.id);
    return [items[0].id];
  }
  const defaultId = String(content.defaultOpenItemId || "");
  if (defaultId && items.some((item) => item.id === defaultId)) return [defaultId];
  return [items[0].id];
}

const DEFAULT_ITEMS: FAQItem[] = [
  createFAQItem({
    id: "faq-item-1",
    question: "What is included with the website builder?",
    answer:
      "You get a full visual editor with ready-made sections, responsive layouts, styling controls, and the ability to preview and export a complete website.",
  }),
  createFAQItem({
    id: "faq-item-2",
    question: "Can I customize every section?",
    answer:
      "Yes. Each widget includes Content, Design, and Settings controls so you can update text, images, spacing, colors, and layout without writing code.",
  }),
  createFAQItem({
    id: "faq-item-3",
    question: "Will my website work on mobile devices?",
    answer:
      "Yes. Sections are built with responsive behavior for desktop, tablet, and mobile, and you can fine-tune visibility and layout per device.",
  }),
  createFAQItem({
    id: "faq-item-4",
    question: "Can I export and host my website anywhere?",
    answer:
      "Yes. You can export clean HTML, CSS, and assets, then upload the files to any static host or traditional web hosting provider.",
  }),
  createFAQItem({
    id: "faq-item-5",
    question: "Do I need coding experience?",
    answer:
      "No. The builder is designed for visual editing. Coding knowledge is optional and only needed if you want to add custom CSS or advanced scripts.",
  }),
];

export const defaultFAQWidgetData: FAQWidgetData = {
  id: "faq-default",
  type: "faq",
  variant: "Simple Accordion",
  content: {
    items: DEFAULT_ITEMS,
    selectedItemId: "faq-item-1",
    allowMultiple: false,
    defaultOpenItemId: "faq-item-1",
    openAllByDefault: false,
    closeAllByDefault: false,
  },
  style: {
    backgroundColor: "transparent",
    maxWidth: "760px",
    itemBackgroundColor: "#ffffff",
    itemOpenBackgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: "1px",
    borderRadius: "12px",
    itemGap: "12px",
    questionColor: "#0f172a",
    questionFontSize: "16px",
    questionFontWeight: "600",
    questionPadding: "16px",
    answerColor: "#475569",
    answerFontSize: "15px",
    answerLineHeight: "1.6",
    answerPadding: "16px",
    iconStyle: "chevron",
    iconSize: "18px",
    iconColor: "#64748b",
    iconPosition: "right",
    rotateIconWhenOpen: true,
    transitionEnabled: true,
    transitionDuration: 280,
  },
  layout: {
    paddingTop: "48px",
    paddingBottom: "48px",
    paddingX: "24px",
  },
  responsive: {
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 280,
    delay: 0,
  },
  advanced: {
    id: "",
    className: "",
    visibility: true,
  },
};
