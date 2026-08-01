import { useEffect, useState } from "react";
import { defaultNavbarWidgetData, isNavbarWidgetData, type NavbarNavItem } from "./NavbarTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { PropertyField } from "@/components/builder/property-panel/PropertyField";
import { PropertyTextInput } from "@/components/builder/property-panel/controls/PropertyTextInput";
import { PropertySelect } from "@/components/builder/property-panel/controls/PropertySelect";
import { PropertyColorControl } from "@/components/builder/property-panel/controls/PropertyColorControl";
import { PropertyRepeater } from "@/components/builder/property-panel/controls/PropertyRepeater";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPalette, faSliders, faCube, faBolt, faEye, faPenNib } from "@fortawesome/free-solid-svg-icons";

export interface NavbarPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function NavbarProperties({ value = defaultNavbarWidgetData, onChange }: NavbarPropertiesProps) {
  const navbarValue = isNavbarWidgetData(value) ? value : defaultNavbarWidgetData;
  const updateContent = (patch: Partial<typeof navbarValue.content>) => onChange({ ...navbarValue, content: { ...navbarValue.content, ...patch } });
  const updateStyle = (patch: Partial<typeof navbarValue.style>) => onChange({ ...navbarValue, style: { ...navbarValue.style, ...patch } });
  const updateLayout = (patch: Partial<typeof navbarValue.layout>) => onChange({ ...navbarValue, layout: { ...navbarValue.layout, ...patch } });
  const updateResponsive = (patch: Partial<typeof navbarValue.responsive>) => onChange({ ...navbarValue, responsive: { ...navbarValue.responsive, ...patch } });
  const updateAnimation = (patch: Partial<typeof navbarValue.animation>) => onChange({ ...navbarValue, animation: { ...navbarValue.animation, ...patch } });
  const updateAdvanced = (patch: Partial<typeof navbarValue.advanced>) => onChange({ ...navbarValue, advanced: { ...navbarValue.advanced, ...patch } });

  const navItems = Array.isArray(navbarValue.content.navItems) ? navbarValue.content.navItems : [];
  const [selectedNavItemId, setSelectedNavItemId] = useState<string | null>(navItems[0]?.label ? `${navItems[0].label}-${0}` : null);

  useEffect(() => {
    // Ensure selected nav item resets when nav items change (keeps in sync with store)
    if (!navItems.length) {
      setSelectedNavItemId(null);
      return;
    }
    setSelectedNavItemId((current) => {
      // if current exists in new list keep it, otherwise pick first
      const exists = current ? navItems.some((it, idx) => `${it.label}-${idx}` === current) : false;
      return exists ? current : `${navItems[0].label}-${0}`;
    });
  }, [navItems]);

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
    setSelectedNavItemId(`${nextItems[nextItems.length - 1].label}-${nextItems.length - 1}`);
  };

  const navRepeaterItems = navItems.map((item, index) => ({
    id: `${item.label}-${index}`,
    label: item.label || `Item ${index + 1}`,
  }));

  const activeNavItem = navItems[navItems.findIndex((item, index) => `${item.label}-${index}` === selectedNavItemId)] ?? navItems[0];
  const activeNavIndex = navItems.findIndex((item, index) => `${item.label}-${index}` === selectedNavItemId);

  return (
    <PropertyPanel
      title="Properties"
      subtitle={navbarValue.variant}
      badgeLabel="Bootstrap Navbar"
      badgeIcon={<FontAwesomeIcon icon={faBars} className="h-3.5 w-3.5" />}
      variantControl={
        <PropertyField label="Variant">
          <PropertySelect
            value={navbarValue.variant}
            options={[
              { label: "Classic", value: "Classic" },
              { label: "Centered Logo", value: "Centered Logo" },
              { label: "Transparent", value: "Transparent" },
              { label: "Glass", value: "Glass" },
              { label: "Minimal", value: "Minimal" },
            ]}
            onChange={(next) => onChange({ ...navbarValue, variant: next })}
          />
        </PropertyField>
      }
      content={
        <div className="space-y-2">
          <PropertyField label="Logo Text">
            <PropertyTextInput value={navbarValue.content.logoText} placeholder="Brand" onChange={(next) => updateContent({ logoText: next })} />
          </PropertyField>
          <PropertyField label="Logo Link">
            <PropertyTextInput value={navbarValue.content.logoHref} placeholder="#" onChange={(next) => updateContent({ logoHref: next })} />
          </PropertyField>
          <PropertyField label="Logo Image">
            <PropertyTextInput value={navbarValue.content.logoImageSrc} placeholder="Image URL" onChange={(next) => updateContent({ logoImageSrc: next })} />
          </PropertyField>
          <PropertyField label="Logo Width">
            <PropertyTextInput value={navbarValue.content.logoWidth} placeholder="140px" onChange={(next) => updateContent({ logoWidth: next })} />
          </PropertyField>
          <PropertyField label="CTA Text">
            <PropertyTextInput value={navbarValue.content.ctaLabel} placeholder="Get started" onChange={(next) => updateContent({ ctaLabel: next })} />
          </PropertyField>
          <PropertyField label="CTA Link">
            <PropertyTextInput value={navbarValue.content.ctaHref} placeholder="#" onChange={(next) => updateContent({ ctaHref: next })} />
          </PropertyField>
          <PropertyField label="Navigation Items">
            <PropertyRepeater
              title="Menu items"
              items={navRepeaterItems}
              onAdd={onAddNavItem}
              onRemove={(id) => {
                const index = navItems.findIndex((item, idx) => `${item.label}-${idx}` === id);
                if (index >= 0) onRemoveNavItem(index);
              }}
              renderItem={(item) => {
                const index = Number(item.id.split("-").pop());
                const current = navItems[index];
                return (
                  <div className="space-y-2">
                    <PropertyField label="Label">
                      <PropertyTextInput value={current?.label} onChange={(next) => onUpdateNavItem(index, { label: next })} />
                    </PropertyField>
                    <PropertyField label="Link">
                      <PropertyTextInput value={current?.href} onChange={(next) => onUpdateNavItem(index, { href: next })} />
                    </PropertyField>
                    <PropertyField label="Icon">
                      <PropertyTextInput value={current?.icon || ""} onChange={(next) => onUpdateNavItem(index, { icon: next })} />
                    </PropertyField>
                  </div>
                );
              }}
            />
          </PropertyField>
        </div>
      }
      style={
        <div className="space-y-2">
          <PropertyField label="Background">
            <PropertyColorControl value={navbarValue.style.backgroundColor} onChange={(next) => updateStyle({ backgroundColor: next })} />
          </PropertyField>
          <PropertyField label="Text Color">
            <PropertyColorControl value={navbarValue.style.textColor} onChange={(next) => updateStyle({ textColor: next })} />
          </PropertyField>
          <PropertyField label="Padding">
            <PropertyTextInput value={navbarValue.style.padding} placeholder="1rem" onChange={(next) => updateStyle({ padding: next })} />
          </PropertyField>
          <PropertyField label="Shadow">
            <PropertySelect
              value={navbarValue.style.shadow || "sm"}
              options={[{ label: "None", value: "none" }, { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }]}
              onChange={(next) => updateStyle({ shadow: next })}
            />
          </PropertyField>
          <PropertyField label="Border">
            <PropertySelect
              value={navbarValue.style.border ? "true" : "false"}
              options={[{ label: "Off", value: "false" }, { label: "On", value: "true" }]}
              onChange={(next) => updateStyle({ border: next === "true" })}
            />
          </PropertyField>
          {navbarValue.style.border ? (
            <PropertyField label="Border Color">
              <PropertyColorControl value={navbarValue.style.borderColor} onChange={(next) => updateStyle({ borderColor: next })} />
            </PropertyField>
          ) : null}
        </div>
      }
      layout={
        <div className="space-y-2">
          <SectionWidthProperties layout={navbarValue.layout} onChange={(patch) => updateLayout(patch)} />
          <PropertyField label="Container Width">
            <PropertySelect
              value={navbarValue.layout.containerWidth || "standard"}
              options={[{ label: "Narrow", value: "narrow" }, { label: "Standard", value: "standard" }, { label: "Wide", value: "wide" }, { label: "Full width", value: "full" }]}
              onChange={(next) => updateLayout({ containerWidth: next })}
            />
          </PropertyField>
          <PropertyField label="Breakpoint">
            <PropertySelect
              value={navbarValue.layout.breakpoint || "lg"}
              options={[{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "XL", value: "xl" }, { label: "XXL", value: "xxl" }]}
              onChange={(next) => updateLayout({ breakpoint: next })}
            />
          </PropertyField>
          <PropertyField label="Sticky">
            <PropertySelect value={navbarValue.layout.sticky ? "true" : "false"} options={[{ label: "Off", value: "false" }, { label: "On", value: "true" }]} onChange={(next) => updateLayout({ sticky: next === "true" })} />
          </PropertyField>
          <PropertyField label="Hamburger Icon">
            <PropertyTextInput value={navbarValue.content.hamburgerIcon || "bars"} onChange={(next) => updateContent({ hamburgerIcon: next })} />
          </PropertyField>
        </div>
      }
      responsive={
        <div className="space-y-2">
          <PropertyField label="Hide on Mobile">
            <PropertySelect value={navbarValue.responsive.hideOnMobile ? "true" : "false"} options={[{ label: "No", value: "false" }, { label: "Yes", value: "true" }]} onChange={(next) => updateResponsive({ hideOnMobile: next === "true" })} />
          </PropertyField>
          <PropertyField label="Hide on Tablet">
            <PropertySelect value={navbarValue.responsive.hideOnTablet ? "true" : "false"} options={[{ label: "No", value: "false" }, { label: "Yes", value: "true" }]} onChange={(next) => updateResponsive({ hideOnTablet: next === "true" })} />
          </PropertyField>
          <PropertyField label="Hide on Desktop">
            <PropertySelect value={navbarValue.responsive.hideOnDesktop ? "true" : "false"} options={[{ label: "No", value: "false" }, { label: "Yes", value: "true" }]} onChange={(next) => updateResponsive({ hideOnDesktop: next === "true" })} />
          </PropertyField>
        </div>
      }
      animation={
        <div className="space-y-2">
          <PropertyField label="Animation Type">
            <PropertySelect value={navbarValue.animation.type || "none"} options={[{ label: "None", value: "none" }, { label: "Fade", value: "fade" }, { label: "Slide up", value: "slide-up" }, { label: "Zoom", value: "zoom" }]} onChange={(next) => updateAnimation({ type: next })} />
          </PropertyField>
          <PropertyField label="Duration">
            <PropertyTextInput value={String(navbarValue.animation.duration ?? 400)} onChange={(next) => updateAnimation({ duration: Number(next) || 400 })} />
          </PropertyField>
          <PropertyField label="Delay">
            <PropertyTextInput value={String(navbarValue.animation.delay ?? 0)} onChange={(next) => updateAnimation({ delay: Number(next) || 0 })} />
          </PropertyField>
        </div>
      }
      advanced={
        <div className="space-y-2">
          <PropertyField label="CSS Class">
            <PropertyTextInput value={navbarValue.advanced.className} onChange={(next) => updateAdvanced({ className: next })} />
          </PropertyField>
          <PropertyField label="HTML ID">
            <PropertyTextInput value={navbarValue.advanced.id} onChange={(next) => updateAdvanced({ id: next })} />
          </PropertyField>
          <PropertyField label="Visibility">
            <PropertySelect value={navbarValue.advanced.visibility ? "true" : "false"} options={[{ label: "Visible", value: "true" }, { label: "Hidden", value: "false" }]} onChange={(next) => updateAdvanced({ visibility: next === "true" })} />
          </PropertyField>
        </div>
      }
    />
  );
}
