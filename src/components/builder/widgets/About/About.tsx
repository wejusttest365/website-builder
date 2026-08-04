import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultAboutWidgetData, isAboutWidgetData } from "./AboutTypes";
import { buildAboutBootstrapMarkup } from "./AboutBootstrapExport";

export interface AboutProps {
  data: WidgetData;
}

export function About({ data = defaultAboutWidgetData }: AboutProps) {
  const aboutData = isAboutWidgetData(data) ? data : defaultAboutWidgetData;
  if (aboutData.advanced?.visibility === false) return null;

  const markup = buildAboutBootstrapMarkup(aboutData, { editorMode: true });

  return (
    <BaseWidget
      data={aboutData}
      widgetType="about"
      title="About Us"
      variantLabel={aboutData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-about-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
