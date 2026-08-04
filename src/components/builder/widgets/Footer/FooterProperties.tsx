import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/free-solid-svg-icons";
import { useBuilder } from "@/lib/builder/store";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { PropertyRepeater } from "@/components/builder/property-panel/controls/PropertyRepeater";
import {
  AlignmentControl,
  ColorControl,
  FontSizeControl,
  ImageControl,
  NumberControl,
  SelectControl,
  TextAreaControl,
  TextControl,
  ToggleControl,
} from "@/components/builder/property-controls";
import type { WidgetData } from "../widgetRegistry";
import {
  FOOTER_SOCIAL_PLATFORMS,
  applyFooterVariant,
  createFooterColumn,
  createFooterLegalLink,
  createFooterLink,
  createFooterSocialItem,
  defaultFooterWidgetData,
  isFooterWidgetData,
  normalizeFooterFontSize,
  resolveFooterColumnCount,
  type FooterColumn,
  type FooterLegalLink,
  type FooterLink,
  type FooterSocialItem,
  type FooterSocialPlatform,
  type FooterVariant,
  type FooterWidgetData,
} from "./FooterTypes";

export interface FooterPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

const FONT_WEIGHT_OPTIONS = [
  { label: "400 · Regular", value: "400" },
  { label: "500 · Medium", value: "500" },
  { label: "600 · Semibold", value: "600" },
  { label: "700 · Bold", value: "700" },
];

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function FooterProperties({
  value = defaultFooterWidgetData,
  onChange,
  onClose,
}: FooterPropertiesProps) {
  const footerValue: FooterWidgetData = isFooterWidgetData(value) ? value : defaultFooterWidgetData;
  const selectedElement = useBuilder((s) => s.selectedElement);
  const elementKey = String(selectedElement?.elementKey ?? "");

  const updateContent = (patch: Partial<FooterWidgetData["content"]>) =>
    onChange({ ...footerValue, content: { ...footerValue.content, ...patch } });
  const updateStyle = (patch: Partial<FooterWidgetData["style"]>) =>
    onChange({ ...footerValue, style: { ...footerValue.style, ...patch } });
  const updateLayout = (patch: Partial<FooterWidgetData["layout"]>) =>
    onChange({ ...footerValue, layout: { ...footerValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<FooterWidgetData["responsive"]>) =>
    onChange({ ...footerValue, responsive: { ...footerValue.responsive, ...patch } });
  const updateAdvanced = (patch: Partial<FooterWidgetData["advanced"]>) =>
    onChange({ ...footerValue, advanced: { ...footerValue.advanced, ...patch } });

  const columns = Array.isArray(footerValue.content.columns) ? footerValue.content.columns : [];
  const socialItems = Array.isArray(footerValue.content.socialItems) ? footerValue.content.socialItems : [];
  const legalLinks = Array.isArray(footerValue.content.legalLinks) ? footerValue.content.legalLinks : [];
  const columnCount = resolveFooterColumnCount(footerValue);

  const setColumns = (next: FooterColumn[]) => updateContent({ columns: next });
  const setSocialItems = (next: FooterSocialItem[]) => updateContent({ socialItems: next });
  const setLegalLinks = (next: FooterLegalLink[]) => updateContent({ legalLinks: next });

  const updateColumn = (columnId: string, patch: Partial<FooterColumn>) => {
    setColumns(columns.map((column) => (column.id === columnId ? { ...column, ...patch } : column)));
  };

  const updateColumnLink = (columnId: string, linkId: string, patch: Partial<FooterLink>) => {
    setColumns(
      columns.map((column) => {
        if (column.id !== columnId) return column;
        const links = Array.isArray(column.links) ? column.links : [];
        return {
          ...column,
          links: links.map((link) => (link.id === linkId ? { ...link, ...patch } : link)),
        };
      }),
    );
  };

  const selectedColumnId = useMemo(() => {
    const match =
      /^column(?:Heading|Link)?-([^-]+)/.exec(elementKey) ||
      /^column-([^-]+)/.exec(elementKey);
    return match?.[1] ?? null;
  }, [elementKey]);

  const showBrandLogoUpload =
    footerValue.content.showBrand !== false &&
    (Boolean(footerValue.content.showBrandLogo) || elementKey === "brandLogo");

  const weightValue = String(footerValue.style.fontWeight ?? "400");
  const weightOptions = FONT_WEIGHT_OPTIONS.some((option) => option.value === weightValue)
    ? FONT_WEIGHT_OPTIONS
    : [{ label: weightValue || "Default", value: weightValue }, ...FONT_WEIGHT_OPTIONS];

  return (
    <PropertyPanel
      title="Footer"
      onClose={onClose}
      badgeLabel="Footer"
      badgeIcon={<FontAwesomeIcon icon={faCopyright} className="h-3.5 w-3.5" />}
      variantControl={
        <SelectControl
          label="Variant"
          value={footerValue.variant}
          options={[
            { label: "Dark / Black Footer", value: "Dark Footer" },
            { label: "Light Gray Footer", value: "Light Footer" },
          ]}
          onChange={(next) => onChange(applyFooterVariant(footerValue, next as FooterVariant))}
        />
      }
      content={
        <div className="space-y-2.5">
          <div className="mb-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
            <div className="font-semibold tracking-wide">GLOBAL COMPONENT</div>
            <div className="mt-0.5 text-violet-800/80">Changes made here apply to all pages.</div>
          </div>
          <ToggleControl
            label="Show brand section"
            checked={footerValue.content.showBrand !== false}
            onChange={(next) => updateContent({ showBrand: next })}
          />
          {footerValue.content.showBrand !== false ? (
            <>
              <TextControl
                label="Brand / logo text"
                value={footerValue.content.brandName ?? ""}
                onChange={(next) => updateContent({ brandName: next })}
              />
              <TextAreaControl
                label="Footer description"
                value={footerValue.content.brandDescription ?? ""}
                onChange={(next) => updateContent({ brandDescription: next })}
              />
              <TextControl
                label="Brand link"
                value={footerValue.content.brandHref ?? ""}
                onChange={(next) => updateContent({ brandHref: next })}
              />
              <ToggleControl
                label="Use logo image"
                checked={Boolean(footerValue.content.showBrandLogo)}
                onChange={(next) => updateContent({ showBrandLogo: next })}
              />
              {showBrandLogoUpload ? (
                <>
                  <ImageControl
                    label="Brand logo"
                    value={footerValue.content.brandLogoSrc || ""}
                    onChange={(next) => updateContent({ brandLogoSrc: next, showBrandLogo: true })}
                    showAlt={false}
                  />
                  <TextControl
                    label="Logo width"
                    value={footerValue.content.brandLogoWidth ?? "140px"}
                    onChange={(next) => updateContent({ brandLogoWidth: next })}
                  />
                </>
              ) : null}
              <AlignmentControl
                label="Brand alignment"
                value={footerValue.content.brandAlignment || "left"}
                onChange={(next) => updateContent({ brandAlignment: next })}
              />
            </>
          ) : null}

          <SelectControl
            label="Column count"
            value={String(columnCount)}
            options={[
              { label: "1 column", value: "1" },
              { label: "2 columns", value: "2" },
              { label: "3 columns", value: "3" },
              { label: "4 columns", value: "4" },
            ]}
            onChange={(next) => updateLayout({ columnCount: Number(next) || 1 })}
          />

          <PropertyRepeater
            title="Footer columns"
            items={columns.map((column) => ({
              id: column.id,
              label:
                selectedColumnId === column.id
                  ? `${column.heading || "Column"} · selected`
                  : column.heading || "Column",
              content: (
                <div className="space-y-2">
                  <ToggleControl
                    label="Show heading"
                    checked={column.showHeading !== false}
                    onChange={(next) => updateColumn(column.id, { showHeading: next })}
                  />
                  <TextControl
                    label="Column title"
                    value={column.heading}
                    onChange={(next) => updateColumn(column.id, { heading: next })}
                  />
                  <PropertyRepeater
                    title="Links"
                    items={(column.links || []).map((link) => ({
                      id: link.id,
                      label: link.label || "Link",
                      content: (
                        <div className="space-y-2">
                          <TextControl
                            label="Link label"
                            value={link.label}
                            onChange={(next) => updateColumnLink(column.id, link.id, { label: next })}
                          />
                          <TextControl
                            label="Link URL"
                            value={link.href}
                            onChange={(next) => updateColumnLink(column.id, link.id, { href: next })}
                          />
                          <ToggleControl
                            label="Open in new tab"
                            checked={Boolean(link.openInNewTab)}
                            onChange={(next) => updateColumnLink(column.id, link.id, { openInNewTab: next })}
                          />
                        </div>
                      ),
                    }))}
                    onAdd={() =>
                      updateColumn(column.id, {
                        links: [...(column.links || []), createFooterLink()],
                      })
                    }
                    onRemove={(id) =>
                      updateColumn(column.id, {
                        links: (column.links || []).filter((link) => link.id !== id),
                      })
                    }
                    onDuplicate={(id) => {
                      const links = column.links || [];
                      const index = links.findIndex((link) => link.id === id);
                      if (index < 0) return;
                      const source = links[index];
                      const next = [...links];
                      next.splice(index + 1, 0, createFooterLink({ ...source, id: createFooterLink().id }));
                      updateColumn(column.id, { links: next });
                    }}
                    onMoveUp={(id) => {
                      const links = column.links || [];
                      const index = links.findIndex((link) => link.id === id);
                      if (index >= 0) updateColumn(column.id, { links: moveItem(links, index, -1) });
                    }}
                    onMoveDown={(id) => {
                      const links = column.links || [];
                      const index = links.findIndex((link) => link.id === id);
                      if (index >= 0) updateColumn(column.id, { links: moveItem(links, index, 1) });
                    }}
                    onReorder={(from, to) =>
                      updateColumn(column.id, { links: reorderItems(column.links || [], from, to) })
                    }
                    renderItem={(item) => item.content}
                  />
                </div>
              ),
            }))}
            onAdd={() => setColumns([...columns, createFooterColumn()])}
            onRemove={(id) => setColumns(columns.filter((column) => column.id !== id))}
            onDuplicate={(id) => {
              const index = columns.findIndex((column) => column.id === id);
              if (index < 0) return;
              const source = columns[index];
              const next = [...columns];
              next.splice(
                index + 1,
                0,
                createFooterColumn({
                  ...source,
                  id: createFooterColumn().id,
                  links: (source.links || []).map((link) =>
                    createFooterLink({ ...link, id: createFooterLink().id }),
                  ),
                }),
              );
              setColumns(next);
            }}
            onMoveUp={(id) => {
              const index = columns.findIndex((column) => column.id === id);
              if (index >= 0) setColumns(moveItem(columns, index, -1));
            }}
            onMoveDown={(id) => {
              const index = columns.findIndex((column) => column.id === id);
              if (index >= 0) setColumns(moveItem(columns, index, 1));
            }}
            onReorder={(from, to) => setColumns(reorderItems(columns, from, to))}
            renderItem={(item) => item.content}
          />

          <ToggleControl
            label="Enable phone"
            checked={footerValue.content.showPhone !== false}
            onChange={(next) => updateContent({ showPhone: next })}
          />
          {footerValue.content.showPhone !== false ? (
            <TextControl
              label="Phone number"
              value={footerValue.content.phone ?? ""}
              onChange={(next) => updateContent({ phone: next })}
            />
          ) : null}
          <ToggleControl
            label="Enable email"
            checked={footerValue.content.showEmail !== false}
            onChange={(next) => updateContent({ showEmail: next })}
          />
          {footerValue.content.showEmail !== false ? (
            <TextControl
              label="Email address"
              value={footerValue.content.email ?? ""}
              onChange={(next) => updateContent({ email: next })}
            />
          ) : null}
          <ToggleControl
            label="Enable address"
            checked={footerValue.content.showAddress !== false}
            onChange={(next) => updateContent({ showAddress: next })}
          />
          {footerValue.content.showAddress !== false ? (
            <TextAreaControl
              label="Contact address"
              value={footerValue.content.address ?? ""}
              onChange={(next) => updateContent({ address: next })}
            />
          ) : null}
          <ToggleControl
            label="Enable business hours"
            checked={footerValue.content.showHours !== false}
            onChange={(next) => updateContent({ showHours: next })}
          />
          {footerValue.content.showHours !== false ? (
            <TextControl
              label="Business hours"
              value={footerValue.content.hours ?? ""}
              onChange={(next) => updateContent({ hours: next })}
            />
          ) : null}

          <ToggleControl
            label="Enable social media"
            checked={footerValue.content.showSocial !== false}
            onChange={(next) => updateContent({ showSocial: next })}
          />
          {footerValue.content.showSocial !== false ? (
            <>
              <AlignmentControl
                label="Social alignment"
                value={footerValue.content.socialAlignment || "left"}
                onChange={(next) => updateContent({ socialAlignment: next })}
              />
              <ToggleControl
                label="Open social links in new tab"
                checked={footerValue.content.socialOpenInNewTab !== false}
                onChange={(next) => updateContent({ socialOpenInNewTab: next })}
              />
              <PropertyRepeater
                title="Social links"
                items={socialItems.map((item) => ({
                  id: item.id,
                  label: item.label || item.platform,
                  content: (
                    <div className="space-y-2">
                      <SelectControl
                        label="Platform"
                        value={item.platform}
                        options={FOOTER_SOCIAL_PLATFORMS.map((platform) => ({
                          label: platform.label,
                          value: platform.value,
                        }))}
                        onChange={(next) => {
                          const platform = next as FooterSocialPlatform;
                          const meta = FOOTER_SOCIAL_PLATFORMS.find((entry) => entry.value === platform);
                          setSocialItems(
                            socialItems.map((social) =>
                              social.id === item.id
                                ? {
                                    ...social,
                                    platform,
                                    label: social.label || meta?.label || platform,
                                  }
                                : social,
                            ),
                          );
                        }}
                      />
                      <TextControl
                        label="Social URL"
                        value={item.href}
                        onChange={(next) =>
                          setSocialItems(
                            socialItems.map((social) =>
                              social.id === item.id ? { ...social, href: next } : social,
                            ),
                          )
                        }
                      />
                      <TextControl
                        label="Accessible label"
                        value={item.label}
                        onChange={(next) =>
                          setSocialItems(
                            socialItems.map((social) =>
                              social.id === item.id ? { ...social, label: next } : social,
                            ),
                          )
                        }
                      />
                    </div>
                  ),
                }))}
                onAdd={() => setSocialItems([...socialItems, createFooterSocialItem()])}
                onRemove={(id) => setSocialItems(socialItems.filter((item) => item.id !== id))}
                onDuplicate={(id) => {
                  const index = socialItems.findIndex((item) => item.id === id);
                  if (index < 0) return;
                  const source = socialItems[index];
                  const next = [...socialItems];
                  next.splice(
                    index + 1,
                    0,
                    createFooterSocialItem({ ...source, id: createFooterSocialItem().id }),
                  );
                  setSocialItems(next);
                }}
                onMoveUp={(id) => {
                  const index = socialItems.findIndex((item) => item.id === id);
                  if (index >= 0) setSocialItems(moveItem(socialItems, index, -1));
                }}
                onMoveDown={(id) => {
                  const index = socialItems.findIndex((item) => item.id === id);
                  if (index >= 0) setSocialItems(moveItem(socialItems, index, 1));
                }}
                onReorder={(from, to) => setSocialItems(reorderItems(socialItems, from, to))}
                renderItem={(item) => item.content}
              />
            </>
          ) : null}

          <ToggleControl
            label="Show bottom bar"
            checked={footerValue.content.showBottomBar !== false}
            onChange={(next) => updateContent({ showBottomBar: next })}
          />
          {footerValue.content.showBottomBar !== false ? (
            <>
              <ToggleControl
                label="Show divider above bottom bar"
                checked={footerValue.content.showBottomDivider !== false}
                onChange={(next) => updateContent({ showBottomDivider: next })}
              />
              <TextControl
                label="Copyright text"
                value={footerValue.content.copyrightText ?? ""}
                onChange={(next) => updateContent({ copyrightText: next })}
              />
              <ToggleControl
                label="Show all rights reserved"
                checked={Boolean(footerValue.content.showAllRightsReserved)}
                onChange={(next) => updateContent({ showAllRightsReserved: next })}
              />
              {footerValue.content.showAllRightsReserved ? (
                <TextControl
                  label="All rights reserved text"
                  value={footerValue.content.allRightsReservedText ?? ""}
                  onChange={(next) => updateContent({ allRightsReservedText: next })}
                />
              ) : null}
              <PropertyRepeater
                title="Legal links"
                items={legalLinks.map((link) => ({
                  id: link.id,
                  label: link.label || "Legal",
                  content: (
                    <div className="space-y-2">
                      <TextControl
                        label="Label"
                        value={link.label}
                        onChange={(next) =>
                          setLegalLinks(
                            legalLinks.map((item) =>
                              item.id === link.id ? { ...item, label: next } : item,
                            ),
                          )
                        }
                      />
                      <TextControl
                        label="URL"
                        value={link.href}
                        onChange={(next) =>
                          setLegalLinks(
                            legalLinks.map((item) =>
                              item.id === link.id ? { ...item, href: next } : item,
                            ),
                          )
                        }
                      />
                      <ToggleControl
                        label="Open in new tab"
                        checked={Boolean(link.openInNewTab)}
                        onChange={(next) =>
                          setLegalLinks(
                            legalLinks.map((item) =>
                              item.id === link.id ? { ...item, openInNewTab: next } : item,
                            ),
                          )
                        }
                      />
                    </div>
                  ),
                }))}
                onAdd={() => setLegalLinks([...legalLinks, createFooterLegalLink()])}
                onRemove={(id) => setLegalLinks(legalLinks.filter((link) => link.id !== id))}
                onDuplicate={(id) => {
                  const index = legalLinks.findIndex((link) => link.id === id);
                  if (index < 0) return;
                  const source = legalLinks[index];
                  const next = [...legalLinks];
                  next.splice(
                    index + 1,
                    0,
                    createFooterLegalLink({ ...source, id: createFooterLegalLink().id }),
                  );
                  setLegalLinks(next);
                }}
                onMoveUp={(id) => {
                  const index = legalLinks.findIndex((link) => link.id === id);
                  if (index >= 0) setLegalLinks(moveItem(legalLinks, index, -1));
                }}
                onMoveDown={(id) => {
                  const index = legalLinks.findIndex((link) => link.id === id);
                  if (index >= 0) setLegalLinks(moveItem(legalLinks, index, 1));
                }}
                onReorder={(from, to) => setLegalLinks(reorderItems(legalLinks, from, to))}
                renderItem={(item) => item.content}
              />
            </>
          ) : null}
        </div>
      }
      style={
        <div className="space-y-2.5">
          <ColorControl
            label="Background color"
            value={footerValue.style.backgroundColor || "#0b1220"}
            onChange={(next) => updateStyle({ backgroundColor: next })}
          />
          <ColorControl
            label="Text color"
            value={footerValue.style.textColor || "#cbd5e1"}
            onChange={(next) => updateStyle({ textColor: next })}
          />
          <ColorControl
            label="Heading color"
            value={footerValue.style.headingColor || "#f8fafc"}
            onChange={(next) => updateStyle({ headingColor: next })}
          />
          <ColorControl
            label="Link color"
            value={footerValue.style.linkColor || "#e2e8f0"}
            onChange={(next) => updateStyle({ linkColor: next })}
          />
          <ColorControl
            label="Link hover color"
            value={footerValue.style.linkHoverColor || "#93c5fd"}
            onChange={(next) => updateStyle({ linkHoverColor: next })}
          />
          <ColorControl
            label="Accent color"
            value={footerValue.style.accentColor || "#60a5fa"}
            onChange={(next) => updateStyle({ accentColor: next })}
          />
          <ColorControl
            label="Divider color"
            value={footerValue.style.dividerColor || "rgba(148,163,184,0.25)"}
            onChange={(next) => updateStyle({ dividerColor: next })}
          />
          <FontSizeControl
            label="Social icon size"
            value={footerValue.style.socialIconSize}
            onChange={(next) => updateStyle({ socialIconSize: next || "18px" })}
            allowEmpty={false}
            placeholder="18"
          />
        </div>
      }
      typography={
        <div className="space-y-2.5">
          <FontSizeControl
            label="Heading font size"
            value={footerValue.style.headingFontSize}
            onChange={(next) => updateStyle({ headingFontSize: next || "15px" })}
            allowEmpty={false}
            placeholder="15"
          />
          <FontSizeControl
            label="Body font size"
            value={footerValue.style.bodyFontSize}
            onChange={(next) => updateStyle({ bodyFontSize: next || "14px" })}
            allowEmpty={false}
            placeholder="14"
          />
          <FontSizeControl
            label="Link font size"
            value={footerValue.style.linkFontSize}
            onChange={(next) => updateStyle({ linkFontSize: next || "14px" })}
            allowEmpty={false}
            placeholder="14"
          />
          <SelectControl
            label="Font weight"
            value={weightValue}
            options={weightOptions}
            onChange={(next) => updateStyle({ fontWeight: next })}
          />
          <TextControl
            label="Line height"
            value={footerValue.style.lineHeight || "1.6"}
            onChange={(next) => updateStyle({ lineHeight: next })}
          />
          <TextControl
            label="Letter spacing"
            value={footerValue.style.letterSpacing || "0px"}
            onChange={(next) =>
              updateStyle({
                letterSpacing: /px$/i.test(next) ? next : normalizeFooterFontSize(next, "0px"),
              })
            }
          />
        </div>
      }
      layout={
        <div className="space-y-2.5">
          <TextControl
            label="Padding top"
            value={footerValue.layout.paddingTop || "56px"}
            onChange={(next) =>
              updateLayout({ paddingTop: /px$/i.test(next) ? next : `${next}px` })
            }
          />
          <TextControl
            label="Padding bottom"
            value={footerValue.layout.paddingBottom || "28px"}
            onChange={(next) =>
              updateLayout({ paddingBottom: /px$/i.test(next) ? next : `${next}px` })
            }
          />
          <TextControl
            label="Padding left"
            value={footerValue.layout.paddingLeft || "24px"}
            onChange={(next) =>
              updateLayout({ paddingLeft: /px$/i.test(next) ? next : `${next}px` })
            }
          />
          <TextControl
            label="Padding right"
            value={footerValue.layout.paddingRight || "24px"}
            onChange={(next) =>
              updateLayout({ paddingRight: /px$/i.test(next) ? next : `${next}px` })
            }
          />
          <TextControl
            label="Column gap"
            value={footerValue.layout.columnGap || "32px"}
            onChange={(next) =>
              updateLayout({ columnGap: /px$/i.test(next) ? next : `${next}px` })
            }
          />
          <NumberControl
            label="Tablet columns"
            value={Number(footerValue.responsive.tabletColumns ?? 2)}
            min={1}
            max={4}
            onChange={(next) => updateResponsive({ tabletColumns: next || 1 })}
          />
          <NumberControl
            label="Mobile columns"
            value={Number(footerValue.responsive.mobileColumns ?? 1)}
            min={1}
            max={4}
            onChange={(next) => updateResponsive({ mobileColumns: next || 1 })}
          />
          <TextControl
            label="Border radius"
            value={footerValue.style.borderRadius || "0px"}
            onChange={(next) =>
              updateStyle({ borderRadius: /px$/i.test(next) ? next : `${next}px` })
            }
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <FontSizeControl
            label="Mobile font size"
            value={footerValue.responsive.fontSizeMobile}
            onChange={(next) => updateResponsive({ fontSizeMobile: next })}
            placeholder="Inherit"
          />
          <FontSizeControl
            label="Tablet font size"
            value={footerValue.responsive.fontSizeTablet}
            onChange={(next) => updateResponsive({ fontSizeTablet: next })}
            placeholder="Inherit"
          />
          <ToggleControl
            label="Hide on mobile"
            checked={footerValue.responsive.hideOnMobile ?? false}
            onChange={(next) => updateResponsive({ hideOnMobile: next })}
          />
          <ToggleControl
            label="Hide on tablet"
            checked={footerValue.responsive.hideOnTablet ?? false}
            onChange={(next) => updateResponsive({ hideOnTablet: next })}
          />
          <ToggleControl
            label="Hide on desktop"
            checked={footerValue.responsive.hideOnDesktop ?? false}
            onChange={(next) => updateResponsive({ hideOnDesktop: next })}
          />
        </div>
      }
      advanced={
        <div className="space-y-2.5">
          <TextControl
            label="Custom ID"
            value={footerValue.advanced.id || ""}
            onChange={(next) => updateAdvanced({ id: next })}
          />
          <TextControl
            label="Custom classes"
            value={footerValue.advanced.className || ""}
            onChange={(next) => updateAdvanced({ className: next })}
          />
          <ToggleControl
            label="Visible"
            checked={footerValue.advanced.visibility !== false}
            onChange={(next) => updateAdvanced({ visibility: next })}
          />
        </div>
      }
    />
  );
}
