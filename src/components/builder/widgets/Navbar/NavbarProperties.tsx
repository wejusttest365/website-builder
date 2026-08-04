import { defaultNavbarWidgetData, getNavbarVariantDefaultShowCta, isNavbarWidgetData, type NavbarNavItem } from "./NavbarTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { PropertyField } from "@/components/builder/property-panel/PropertyField";
import { PropertyRepeater } from "@/components/builder/property-panel/controls/PropertyRepeater";
import { TextControl, SelectControl, ColorControl, ToggleControl, AlignmentControl, ImageControl } from "@/components/builder/property-controls";
import { BackgroundProperties } from "../BackgroundProperties";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export interface NavbarPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

export function NavbarProperties({ value = defaultNavbarWidgetData, onChange, onClose }: NavbarPropertiesProps) {
  const navbarValue = isNavbarWidgetData(value) ? value : defaultNavbarWidgetData;
  const updateContent = (patch: Partial<typeof navbarValue.content>) => onChange({ ...navbarValue, content: { ...navbarValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof navbarValue.style>) => onChange({ ...navbarValue, style: { ...navbarValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof navbarValue.layout>) => onChange({ ...navbarValue, layout: { ...navbarValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof navbarValue.responsive>) => onChange({ ...navbarValue, responsive: { ...navbarValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof navbarValue.animation>) => onChange({ ...navbarValue, animation: { ...navbarValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof navbarValue.advanced>) => onChange({ ...navbarValue, advanced: { ...navbarValue.advanced, ...patch } });

  const navItems = Array.isArray(navbarValue.content.navItems) ? navbarValue.content.navItems : [];

  const onUpdateNavItem = (index: number, patch: Partial<NavbarNavItem>) => {
    const nextItems = [...navItems];
    nextItems[index] = { ...nextItems[index], ...patch };
    updateContent({ navItems: nextItems });
  };

  const onRemoveNavItem = (index: number) => {
    const nextItems = navItems.filter((_, idx) => idx !== index);
    updateContent({ navItems: nextItems });
  };

  const onAddNavItem = () => {
    const nextItems = [...navItems, { label: "New link", href: "#" }];
    updateContent({ navItems: nextItems });
  };

  const onDuplicateNavItem = (index: number) => {
    const source = navItems[index];
    if (!source) return;
    const nextItems = [...navItems];
    nextItems.splice(index + 1, 0, { ...source });
    updateContent({ navItems: nextItems });
  };

  const onMoveNavItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= navItems.length) return;
    const nextItems = [...navItems];
    const [item] = nextItems.splice(index, 1);
    nextItems.splice(nextIndex, 0, item);
    updateContent({ navItems: nextItems });
  };

  const onReorderNavItems = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= navItems.length || toIndex >= navItems.length) return;
    const nextItems = [...navItems];
    const [item] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, item);
    updateContent({ navItems: nextItems });
  };

  const navRepeaterItems = navItems.map((item, index) => ({
    id: `nav-item-${index}`,
    label: item.label || `Item ${index + 1}`,
  }));

  const resolveNavIndex = (id: string) => {
    const match = /^nav-item-(\d+)$/.exec(id);
    if (!match) return -1;
    const index = Number(match[1]);
    return Number.isFinite(index) ? index : -1;
  };

  return (
    <PropertyPanel
      title="Navbar"
      onClose={onClose}
      subtitle={navbarValue.variant}
      badgeLabel="Navbar"
      badgeIcon={<FontAwesomeIcon icon={faBars} className="h-3.5 w-3.5" />}
      variantControl={
        <SelectControl
          label="Variant"
          value={navbarValue.variant}
          options={[
            { label: "Classic Light", value: "Classic Light" },
            { label: "Dark Premium", value: "Dark Premium" },
            { label: "Gradient CTA", value: "Gradient CTA" },
            { label: "Minimal No Button", value: "Minimal No Button" },
            { label: "Centered Brand", value: "Centered Brand" },
          ]}
          onChange={(next) => {
              const showCtaByDefault = getNavbarVariantDefaultShowCta(next);
            const nextContent = { ...navbarValue.content, showCta: showCtaByDefault, ctaEnabled: showCtaByDefault };
            const nextLayout = next === "Gradient CTA" ? { ...navbarValue.layout, backgroundFullWidth: true } : navbarValue.layout;
            onChange({ ...navbarValue, variant: next, content: nextContent, layout: nextLayout });
          }}
        />
      }
      content={
        <div className="space-y-2">
          <div className="mb-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
            <div className="font-semibold tracking-wide">GLOBAL COMPONENT</div>
            <div className="mt-0.5 text-violet-800/80">Changes made here apply to all pages.</div>
          </div>
          <TextControl label="Logo Text" value={navbarValue.content.logoText ?? ""} placeholder="Brand" onChange={(next) => updateContent({ logoText: next })} />
          <TextControl label="Logo Link" value={navbarValue.content.logoHref ?? ""} placeholder="#" onChange={(next) => updateContent({ logoHref: next })} />
          <ImageControl
            label="Logo Image"
            value={navbarValue.content.logoImageSrc ?? ""}
            onChange={(next) => updateContent({ logoImageSrc: next })}
            showAlt={false}
          />
          <TextControl label="Logo Width" value={navbarValue.content.logoWidth ?? ""} placeholder="140px" onChange={(next) => updateContent({ logoWidth: next })} />
          <ToggleControl label="CTA Visible" checked={navbarValue.content.showCta !== false} onChange={(next) => updateContent({ showCta: next, ctaEnabled: next })} />
          {navbarValue.content.showCta !== false ? (
            <>
              <TextControl label="CTA Text" value={navbarValue.content.ctaLabel ?? ""} placeholder="Get started" onChange={(next) => updateContent({ ctaLabel: next })} />
              <TextControl label="CTA Link" value={navbarValue.content.ctaHref ?? ""} placeholder="#" onChange={(next) => updateContent({ ctaHref: next })} />
              <SelectControl
                label="CTA Style"
                value={navbarValue.style.ctaStyle || "primary"}
                options={[
                  { label: "Primary", value: "primary" },
                  { label: "Secondary", value: "secondary" },
                  { label: "Outline", value: "outline" },
                ]}
                onChange={(next) => updateStyle({ ctaStyle: next as NonNullable<typeof navbarValue.style.ctaStyle> })}
              />
            </>
          ) : null}
          <PropertyRepeater
            title="Navigation Items"
            items={navRepeaterItems}
            onAdd={onAddNavItem}
            onRemove={(id) => {
              const index = resolveNavIndex(id);
              if (index >= 0) onRemoveNavItem(index);
            }}
            onDuplicate={(id) => {
              const index = resolveNavIndex(id);
              if (index >= 0) onDuplicateNavItem(index);
            }}
            onMoveUp={(id) => {
              const index = resolveNavIndex(id);
              if (index >= 0) onMoveNavItem(index, -1);
            }}
            onMoveDown={(id) => {
              const index = resolveNavIndex(id);
              if (index >= 0) onMoveNavItem(index, 1);
            }}
            onReorder={onReorderNavItems}
            renderItem={(_item, index) => {
              const current = navItems[index];
              if (!current) return null;
              return (
                <div className="min-w-0 space-y-2">
                  <TextControl label="Label" value={current.label ?? ""} onChange={(next) => onUpdateNavItem(index, { label: next })} />
                  <TextControl label="Link" value={current.href ?? ""} onChange={(next) => onUpdateNavItem(index, { href: next })} />
                  <TextControl label="Icon" value={current.icon ?? ""} onChange={(next) => onUpdateNavItem(index, { icon: next })} />
                </div>
              );
            }}
          />
        </div>
      }
      style={
        <div className="space-y-2">
          <BackgroundProperties
            background={navbarValue.style as any}
            onChange={(next) => updateStyle(next)}
          />
          <PropertyField label="Text Color">
            <ColorControl label="" value={navbarValue.style.textColor ?? "#111827"} onChange={(next) => updateStyle({ textColor: next })} />
          </PropertyField>
          <PropertyField label="Padding">
            <TextControl label="" value={navbarValue.style.padding ?? "1rem"} placeholder="1rem" onChange={(next) => updateStyle({ padding: next })} />
          </PropertyField>
          <PropertyField label="Shadow">
            <SelectControl
              label=""
              value={navbarValue.style.shadow || "sm"}
              options={[{ label: "None", value: "none" }, { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }]}
              onChange={(next) => updateStyle({ shadow: next as NonNullable<typeof navbarValue.style.shadow> })}
            />
          </PropertyField>
          <PropertyField label="Border">
            <ToggleControl label="" checked={navbarValue.style.border ?? false} onChange={(next) => updateStyle({ border: next })} />
          </PropertyField>
          {navbarValue.style.border ? (
            <PropertyField label="Border Color">
              <ColorControl label="" value={navbarValue.style.borderColor ?? "#e2e8f0"} onChange={(next) => updateStyle({ borderColor: next })} />
            </PropertyField>
          ) : null}
        </div>
      }
      layout={
        <div className="space-y-2">
          <PropertyField label="Navbar background width">
            <ToggleControl
              label=""
              checked={navbarValue.layout.backgroundFullWidth !== false}
              onChange={(next) => updateLayout({ backgroundFullWidth: next })}
            />
          </PropertyField>
          <PropertyField label="Navbar content width">
            <SelectControl
              label="Navbar content width"
              value={navbarValue.layout.containerMode === "fluid" ? "fluid" : "container"}
              options={[
                { label: "Container", value: "container" },
                { label: "Container Fluid", value: "fluid" },
              ]}
              onChange={(next) => updateLayout({ containerMode: next as NonNullable<typeof navbarValue.layout.containerMode> })}
            />
          </PropertyField>
          <PropertyField label="Navbar height">
            <TextControl label="" value={navbarValue.layout.navbarHeight ?? "72px"} placeholder="72px" onChange={(next) => updateLayout({ navbarHeight: next })} />
          </PropertyField>
          <PropertyField label="Logo alignment">
            <AlignmentControl
              label="Logo alignment"
              value={navbarValue.layout.logoPosition || "left"}
              onChange={(next) => updateLayout({ logoPosition: next as NonNullable<typeof navbarValue.layout.logoPosition> })}
            />
          </PropertyField>
          <PropertyField label="Navigation alignment">
            <AlignmentControl
              label="Navigation alignment"
              value={navbarValue.layout.menuAlignment || "left"}
              onChange={(next) => updateLayout({ menuAlignment: next as NonNullable<typeof navbarValue.layout.menuAlignment> })}
            />
          </PropertyField>
          <PropertyField label="Navigation spacing">
            <TextControl label="" value={navbarValue.layout.horizontalSpacing ?? "1rem"} placeholder="1rem" onChange={(next) => updateLayout({ horizontalSpacing: next })} />
          </PropertyField>
          <PropertyField label="Breakpoint">
            <SelectControl
              label=""
              value={navbarValue.layout.breakpoint || "lg"}
              options={[{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "XL", value: "xl" }, { label: "XXL", value: "xxl" }]}
              onChange={(next) => updateLayout({ breakpoint: next as NonNullable<typeof navbarValue.layout.breakpoint> })}
            />
          </PropertyField>
          <PropertyField label="Sticky">
            <ToggleControl label="" checked={navbarValue.layout.sticky ?? false} onChange={(next) => updateLayout({ sticky: next })} />
          </PropertyField>
          <PropertyField label="Hamburger Icon">
            <TextControl label="" value={navbarValue.content.hamburgerIcon ?? "bars"} onChange={(next) => updateContent({ hamburgerIcon: next })} />
          </PropertyField>
        </div>
      }
      responsive={
        <div className="space-y-2">
          <PropertyField label="Hide on Mobile">
            <ToggleControl label="" checked={navbarValue.responsive.hideOnMobile ?? false} onChange={(next) => updateResponsive({ hideOnMobile: next })} />
          </PropertyField>
          <PropertyField label="Hide on Tablet">
            <ToggleControl label="" checked={navbarValue.responsive.hideOnTablet ?? false} onChange={(next) => updateResponsive({ hideOnTablet: next })} />
          </PropertyField>
          <PropertyField label="Hide on Desktop">
            <ToggleControl label="" checked={navbarValue.responsive.hideOnDesktop ?? false} onChange={(next) => updateResponsive({ hideOnDesktop: next })} />
          </PropertyField>
        </div>
      }
      animation={
        <div className="space-y-2">
          <PropertyField label="Animation Type">
            <SelectControl label="" value={navbarValue.animation.type || "none"} options={[{ label: "None", value: "none" }, { label: "Fade", value: "fade" }, { label: "Slide up", value: "slide-up" }, { label: "Zoom", value: "zoom" }]} onChange={(next) => updateAnimation({ type: next as NonNullable<typeof navbarValue.animation.type> })} />
          </PropertyField>
          <PropertyField label="Duration">
            <TextControl label="" value={String(navbarValue.animation.duration ?? 400)} onChange={(next) => updateAnimation({ duration: Number(next) || 400 })} />
          </PropertyField>
          <PropertyField label="Delay">
            <TextControl label="" value={String(navbarValue.animation.delay ?? 0)} onChange={(next) => updateAnimation({ delay: Number(next) || 0 })} />
          </PropertyField>
        </div>
      }
      advanced={
        <div className="space-y-2">
          <PropertyField label="CSS Class">
            <TextControl label="" value={navbarValue.advanced.className ?? ""} onChange={(next) => updateAdvanced({ className: next })} />
          </PropertyField>
          <PropertyField label="HTML ID">
            <TextControl label="" value={navbarValue.advanced.id ?? ""} onChange={(next) => updateAdvanced({ id: next })} />
          </PropertyField>
          <PropertyField label="Visibility">
            <ToggleControl label="" checked={navbarValue.advanced.visibility ?? true} onChange={(next) => updateAdvanced({ visibility: next })} />
          </PropertyField>
        </div>
      }
    />
  );
}
