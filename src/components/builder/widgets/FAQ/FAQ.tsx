import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultFAQWidgetData, isFAQWidgetData } from "./FAQTypes";
import { buildFAQBootstrapMarkup } from "./FAQBootstrapExport";

export interface FAQProps {
  data: WidgetData;
}

export function FAQ({ data = defaultFAQWidgetData }: FAQProps) {
  const faqData = isFAQWidgetData(data) ? data : defaultFAQWidgetData;
  if (faqData.advanced?.visibility === false) return null;

  const markup = buildFAQBootstrapMarkup(faqData, { editorMode: true });

  return (
    <BaseWidget
      data={faqData}
      widgetType="faq"
      title="FAQ"
      variantLabel={faqData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-faq-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
