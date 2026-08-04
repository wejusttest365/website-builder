import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultFooterWidgetData, isFooterWidgetData } from "./FooterTypes";
import { buildFooterBootstrapMarkup } from "./FooterBootstrapExport";

export interface FooterProps {
  data: WidgetData;
}

export function Footer({ data = defaultFooterWidgetData }: FooterProps) {
  const footerData = isFooterWidgetData(data) ? data : defaultFooterWidgetData;
  if (footerData.advanced?.visibility === false) return null;

  const markup = buildFooterBootstrapMarkup(footerData, { editorMode: true });

  return (
    <BaseWidget
      data={footerData}
      widgetType="footer"
      title="Footer"
      variantLabel={footerData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-footer-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
