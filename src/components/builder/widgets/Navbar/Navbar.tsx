import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultNavbarWidgetData, isNavbarWidgetData, normalizeNavbarWidgetData } from "./NavbarTypes";
import { buildNavbarBootstrapMarkup } from "./NavbarBootstrapExport";

export interface NavbarProps {
  data: WidgetData;
}

export function Navbar({ data = defaultNavbarWidgetData }: NavbarProps) {
  const navbarData = normalizeNavbarWidgetData(isNavbarWidgetData(data) ? data : defaultNavbarWidgetData);
  if (navbarData.advanced?.visibility === false) return null;

  const markup = buildNavbarBootstrapMarkup(navbarData, { editorMode: true });

  return (
    <BaseWidget
      data={navbarData}
      widgetType="navbar"
      title="Header"
      variantLabel={navbarData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-navbar-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
