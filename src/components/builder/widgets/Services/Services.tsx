import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultServicesWidgetData, isServicesWidgetData } from "./ServicesTypes";
import { buildServicesBootstrapMarkup } from "./ServicesBootstrapExport";

export interface ServicesProps {
  data: WidgetData;
}

export function Services({ data = defaultServicesWidgetData }: ServicesProps) {
  const servicesData = isServicesWidgetData(data) ? data : defaultServicesWidgetData;
  if (servicesData.advanced?.visibility === false) return null;

  const markup = buildServicesBootstrapMarkup(servicesData, { editorMode: true });

  return (
    <BaseWidget
      data={servicesData}
      widgetType="services"
      title="Services"
      variantLabel={servicesData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-services-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
