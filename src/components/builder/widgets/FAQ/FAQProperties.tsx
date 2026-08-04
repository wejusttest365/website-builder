import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCircleQuestion,
  faClone,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import {
  ColorControl,
  NumberControl,
  SelectControl,
  TextAreaControl,
  TextControl,
  ToggleControl,
} from "@/components/builder/property-controls";
import type { WidgetData } from "../widgetRegistry";
import {
  createFAQItem,
  defaultFAQWidgetData,
  isFAQWidgetData,
  type FAQItem,
  type FAQWidgetData,
} from "./FAQTypes";

export interface FAQPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function toPxNumber(value: unknown, fallback: number): number {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : fallback;
}

function resolveSelectedItemId(
  items: FAQItem[],
  elementKey: string,
  storedId: string,
): string {
  if (elementKey) {
    if (items.some((item) => item.id === elementKey)) return elementKey;
    if (elementKey.startsWith("question-")) {
      const id = elementKey.slice("question-".length);
      if (items.some((item) => item.id === id)) return id;
    }
    if (elementKey.startsWith("answer-")) {
      const id = elementKey.slice("answer-".length);
      if (items.some((item) => item.id === id)) return id;
    }
  }
  if (storedId && items.some((item) => item.id === storedId)) return storedId;
  return items[0]?.id ?? "";
}

const FONT_WEIGHT_OPTIONS = [
  { label: "400 · Regular", value: "400" },
  { label: "500 · Medium", value: "500" },
  { label: "600 · Semibold", value: "600" },
  { label: "700 · Bold", value: "700" },
];

export function FAQProperties({
  value = defaultFAQWidgetData,
  onChange,
  onClose,
}: FAQPropertiesProps) {
  const faqValue: FAQWidgetData = isFAQWidgetData(value) ? value : defaultFAQWidgetData;
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectElement = useBuilder((s) => s.selectElement);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const section = (pageOf(project)?.sections ?? []).find((s) => s.id === selectedSectionId) ?? null;

  const updateContent = (patch: Partial<FAQWidgetData["content"]>) =>
    onChange({ ...faqValue, content: { ...faqValue.content, ...patch } });
  const updateStyle = (patch: Partial<FAQWidgetData["style"]>) =>
    onChange({ ...faqValue, style: { ...faqValue.style, ...patch } });
  const updateLayout = (patch: Partial<FAQWidgetData["layout"]>) =>
    onChange({ ...faqValue, layout: { ...faqValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<FAQWidgetData["responsive"]>) =>
    onChange({ ...faqValue, responsive: { ...faqValue.responsive, ...patch } });
  const updateAdvanced = (patch: Partial<FAQWidgetData["advanced"]>) =>
    onChange({ ...faqValue, advanced: { ...faqValue.advanced, ...patch } });

  const items = Array.isArray(faqValue.content.items) ? faqValue.content.items : [];

  const selectedItemId = useMemo(
    () =>
      resolveSelectedItemId(
        items,
        String(selectedElement?.elementKey ?? ""),
        String(faqValue.content.selectedItemId ?? ""),
      ),
    [faqValue.content.selectedItemId, items, selectedElement?.elementKey],
  );

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? items[0];
  const selectedIndex = selectedItem
    ? items.findIndex((item) => item.id === selectedItem.id)
    : -1;

  const setItems = (next: FAQItem[], nextSelectedId?: string) => {
    const id =
      nextSelectedId ??
      (next.some((item) => item.id === selectedItemId) ? selectedItemId : next[0]?.id);
    const defaultOpen =
      faqValue.content.defaultOpenItemId &&
      next.some((item) => item.id === faqValue.content.defaultOpenItemId)
        ? faqValue.content.defaultOpenItemId
        : next[0]?.id;
    updateContent({ items: next, selectedItemId: id, defaultOpenItemId: defaultOpen });
  };

  const focusItemSelection = (itemId: string) => {
    if (!section?.widgetInstance) return;
    selectElement({
      kind: "widget",
      index: null,
      tag: "button",
      sectionId: section.id,
      widgetId: section.widgetInstance.id,
      parentWidgetId: section.widgetInstance.id,
      childId: null,
      elementKey: itemId,
      elementType: "container",
    });
  };

  const selectItem = (itemId: string) => {
    if (faqValue.content.selectedItemId !== itemId) {
      updateContent({ selectedItemId: itemId });
    }
    focusItemSelection(itemId);
  };

  const updateItem = (itemId: string, patch: Partial<FAQItem>) => {
    setItems(
      items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
      itemId,
    );
  };

  const actionBtnClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";

  const defaultOpenOptions = items.map((item, index) => ({
    label: `${index + 1}. ${item.question.slice(0, 42)}${item.question.length > 42 ? "…" : ""}`,
    value: item.id,
  }));

  return (
    <PropertyPanel
      title="FAQ"
      badgeLabel="Accordion"
      badgeIcon={<FontAwesomeIcon icon={faCircleQuestion} className="h-3.5 w-3.5" />}
      onClose={onClose}
      variantControl={
        <SelectControl
          label="Variant"
          value={faqValue.variant}
          options={[{ label: "Simple Accordion", value: "Simple Accordion" }]}
          onChange={() => onChange({ ...faqValue, variant: "Simple Accordion" })}
        />
      }
      content={
        <div className="space-y-3">
          <div className="min-w-0 w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                FAQ items
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = createFAQItem({
                    question: `New question ${items.length + 1}`,
                    answer: "Add a helpful answer for this question.",
                  });
                  setItems([...items, next], next.id);
                  focusItemSelection(next.id);
                }}
                className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                Add item
              </button>
            </div>

            <div className="space-y-1.5">
              {items.map((item, index) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    className={[
                      "min-w-0 overflow-hidden rounded-lg border bg-white transition",
                      isSelected ? "border-violet-300 bg-violet-50/40" : "border-slate-200",
                      item.enabled === false ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => selectItem(item.id)}
                        className="min-w-0 flex-1 px-1 py-1 text-left"
                      >
                        <span className="block truncate text-[13px] font-medium text-slate-700">
                          {index + 1}. {item.question || "Untitled question"}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          title="Duplicate"
                          aria-label="Duplicate"
                          className={actionBtnClass}
                          onClick={() => {
                            const clone = createFAQItem({
                              ...item,
                              id: undefined,
                              question: `${item.question} (copy)`,
                            });
                            const next = [...items];
                            next.splice(index + 1, 0, clone);
                            setItems(next, clone.id);
                            focusItemSelection(clone.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faClone} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move up"
                          aria-label="Move up"
                          disabled={index === 0}
                          className={actionBtnClass}
                          onClick={() => setItems(moveItem(items, index, -1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          aria-label="Move down"
                          disabled={index === items.length - 1}
                          className={actionBtnClass}
                          onClick={() => setItems(moveItem(items, index, 1), item.id)}
                        >
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Remove"
                          aria-label="Remove"
                          disabled={items.length <= 1}
                          className={`${actionBtnClass} hover:text-red-500`}
                          onClick={() => {
                            const next = items.filter((candidate) => candidate.id !== item.id);
                            setItems(next, next[Math.max(0, index - 1)]?.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedItem ? (
            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Selected item {selectedIndex >= 0 ? selectedIndex + 1 : ""}
              </div>
              <TextControl
                label="Question"
                value={String(selectedItem.question ?? "")}
                onChange={(next) => updateItem(selectedItem.id, { question: next })}
              />
              <TextAreaControl
                label="Answer"
                value={String(selectedItem.answer ?? "")}
                onChange={(next) => updateItem(selectedItem.id, { answer: next })}
              />
              <ToggleControl
                label="Enable item"
                checked={selectedItem.enabled !== false}
                onChange={(next) => updateItem(selectedItem.id, { enabled: next })}
              />
            </div>
          ) : null}

          <div className="space-y-2.5 rounded-lg border border-slate-200 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Accordion behavior
            </div>
            <SelectControl
              label="Open mode"
              value={faqValue.content.allowMultiple ? "multiple" : "single"}
              options={[
                { label: "Only one item open at a time", value: "single" },
                { label: "Allow multiple items open", value: "multiple" },
              ]}
              onChange={(next) => updateContent({ allowMultiple: next === "multiple" })}
            />
            <SelectControl
              label="Default open item"
              value={String(faqValue.content.defaultOpenItemId || items[0]?.id || "")}
              options={defaultOpenOptions}
              onChange={(next) =>
                updateContent({
                  defaultOpenItemId: next,
                  openAllByDefault: false,
                  closeAllByDefault: false,
                })
              }
            />
            <ToggleControl
              label="Open all by default"
              checked={Boolean(faqValue.content.openAllByDefault)}
              onChange={(next) =>
                updateContent({
                  openAllByDefault: next,
                  closeAllByDefault: next ? false : faqValue.content.closeAllByDefault,
                })
              }
            />
            <ToggleControl
              label="Close all by default"
              checked={Boolean(faqValue.content.closeAllByDefault)}
              onChange={(next) =>
                updateContent({
                  closeAllByDefault: next,
                  openAllByDefault: next ? false : faqValue.content.openAllByDefault,
                })
              }
            />
          </div>
        </div>
      }
      style={
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Container
          </div>
          <ColorControl
            label="Background color"
            value={String(faqValue.style.backgroundColor ?? "transparent")}
            onChange={(next) => updateStyle({ backgroundColor: next })}
          />
          <NumberControl
            label="Maximum content width (px)"
            value={toPxNumber(faqValue.style.maxWidth, 760)}
            min={320}
            max={1400}
            onChange={(next) => updateStyle({ maxWidth: `${next}px` })}
          />
          <NumberControl
            label="Top padding (px)"
            value={toPxNumber(faqValue.layout.paddingTop, 48)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingTop: `${next}px` })}
          />
          <NumberControl
            label="Bottom padding (px)"
            value={toPxNumber(faqValue.layout.paddingBottom, 48)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingBottom: `${next}px` })}
          />
          <NumberControl
            label="Horizontal padding (px)"
            value={toPxNumber(faqValue.layout.paddingX, 24)}
            min={0}
            max={200}
            onChange={(next) => updateLayout({ paddingX: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            FAQ item
          </div>
          <ColorControl
            label="Item background color"
            value={String(faqValue.style.itemBackgroundColor ?? "#ffffff")}
            onChange={(next) => updateStyle({ itemBackgroundColor: next })}
          />
          <ColorControl
            label="Open item background color"
            value={String(faqValue.style.itemOpenBackgroundColor ?? "#f8fafc")}
            onChange={(next) => updateStyle({ itemOpenBackgroundColor: next })}
          />
          <ColorControl
            label="Border color"
            value={String(faqValue.style.borderColor ?? "#e2e8f0")}
            onChange={(next) => updateStyle({ borderColor: next })}
          />
          <NumberControl
            label="Border width (px)"
            value={toPxNumber(faqValue.style.borderWidth, 1)}
            min={0}
            max={8}
            onChange={(next) => updateStyle({ borderWidth: `${next}px` })}
          />
          <NumberControl
            label="Border radius (px)"
            value={toPxNumber(faqValue.style.borderRadius, 12)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ borderRadius: `${next}px` })}
          />
          <NumberControl
            label="Gap between items (px)"
            value={toPxNumber(faqValue.style.itemGap, 12)}
            min={0}
            max={48}
            onChange={(next) => updateStyle({ itemGap: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Question
          </div>
          <ColorControl
            label="Question text color"
            value={String(faqValue.style.questionColor ?? "#0f172a")}
            onChange={(next) => updateStyle({ questionColor: next })}
          />
          <NumberControl
            label="Question font size (px)"
            value={toPxNumber(faqValue.style.questionFontSize, 16)}
            min={12}
            max={36}
            onChange={(next) => updateStyle({ questionFontSize: `${next}px` })}
          />
          <SelectControl
            label="Question font weight"
            value={String(faqValue.style.questionFontWeight ?? "600")}
            options={FONT_WEIGHT_OPTIONS}
            onChange={(next) => updateStyle({ questionFontWeight: next })}
          />
          <NumberControl
            label="Question padding (px)"
            value={toPxNumber(faqValue.style.questionPadding, 16)}
            min={8}
            max={40}
            onChange={(next) => updateStyle({ questionPadding: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Answer
          </div>
          <ColorControl
            label="Answer text color"
            value={String(faqValue.style.answerColor ?? "#475569")}
            onChange={(next) => updateStyle({ answerColor: next })}
          />
          <NumberControl
            label="Answer font size (px)"
            value={toPxNumber(faqValue.style.answerFontSize, 15)}
            min={12}
            max={28}
            onChange={(next) => updateStyle({ answerFontSize: `${next}px` })}
          />
          <NumberControl
            label="Answer line height"
            value={Number(faqValue.style.answerLineHeight ?? 1.6)}
            min={1}
            max={2.4}
            step={0.1}
            onChange={(next) => updateStyle({ answerLineHeight: String(next) })}
          />
          <NumberControl
            label="Answer padding (px)"
            value={toPxNumber(faqValue.style.answerPadding, 16)}
            min={0}
            max={40}
            onChange={(next) => updateStyle({ answerPadding: `${next}px` })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Icon
          </div>
          <SelectControl
            label="Icon style"
            value={String(faqValue.style.iconStyle ?? "chevron")}
            options={[
              { label: "Plus / Minus", value: "plus-minus" },
              { label: "Chevron", value: "chevron" },
              { label: "Arrow", value: "arrow" },
            ]}
            onChange={(next) =>
              updateStyle({ iconStyle: next as "plus-minus" | "chevron" | "arrow" })
            }
          />
          <NumberControl
            label="Icon size (px)"
            value={toPxNumber(faqValue.style.iconSize, 18)}
            min={12}
            max={32}
            onChange={(next) => updateStyle({ iconSize: `${next}px` })}
          />
          <ColorControl
            label="Icon color"
            value={String(faqValue.style.iconColor ?? "#64748b")}
            onChange={(next) => updateStyle({ iconColor: next })}
          />
          <SelectControl
            label="Icon position"
            value={String(faqValue.style.iconPosition ?? "right")}
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
            onChange={(next) => updateStyle({ iconPosition: next as "left" | "right" })}
          />
          <ToggleControl
            label="Rotate icon when open"
            checked={faqValue.style.rotateIconWhenOpen !== false}
            onChange={(next) => updateStyle({ rotateIconWhenOpen: next })}
          />

          <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Animation
          </div>
          <ToggleControl
            label="Enable transition"
            checked={faqValue.style.transitionEnabled !== false}
            onChange={(next) => updateStyle({ transitionEnabled: next })}
          />
          <NumberControl
            label="Transition duration (ms)"
            value={Number(faqValue.style.transitionDuration ?? 280)}
            min={0}
            max={1200}
            step={20}
            onChange={(next) => updateStyle({ transitionDuration: Math.max(0, next) })}
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <ToggleControl
            label="Hide on mobile"
            checked={faqValue.responsive.hideOnMobile ?? false}
            onChange={(next) => updateResponsive({ hideOnMobile: next })}
          />
          <ToggleControl
            label="Hide on tablet"
            checked={faqValue.responsive.hideOnTablet ?? false}
            onChange={(next) => updateResponsive({ hideOnTablet: next })}
          />
          <ToggleControl
            label="Hide on desktop"
            checked={faqValue.responsive.hideOnDesktop ?? false}
            onChange={(next) => updateResponsive({ hideOnDesktop: next })}
          />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl
            label="Custom ID"
            value={faqValue.advanced.id || ""}
            onChange={(next) => updateAdvanced({ id: next })}
          />
          <TextControl
            label="Custom CSS classes"
            value={faqValue.advanced.className || ""}
            onChange={(next) => updateAdvanced({ className: next })}
          />
          <ToggleControl
            label="Visible"
            checked={faqValue.advanced.visibility !== false}
            onChange={(next) => updateAdvanced({ visibility: next })}
          />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[12px] leading-5 text-slate-500">
            Accordion headers use semantic buttons with aria-expanded, aria-controls, and keyboard
            support for Tab, Enter, and Space.
          </div>
        </div>
      }
    />
  );
}
