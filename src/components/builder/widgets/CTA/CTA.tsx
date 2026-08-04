import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultCtaWidgetData, isCtaWidgetData } from "./CTATypes";
import { buildCtaBootstrapMarkup } from "./CTABootstrapExport";

export interface CtaProps {
  data: WidgetData;
}

export function CTA({ data = defaultCtaWidgetData }: CtaProps) {
  const ctaData = isCtaWidgetData(data) ? data : defaultCtaWidgetData;
  if (ctaData.advanced?.visibility === false) return null;

  const markup = buildCtaBootstrapMarkup(ctaData, { editorMode: true });

  return (
    <BaseWidget
      data={ctaData}
      widgetType="cta"
      title="Call To Action"
      variantLabel={ctaData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-cta-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
