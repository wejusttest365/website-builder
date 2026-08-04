import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultCarouselWidgetData, isCarouselWidgetData } from "./CarouselTypes";
import { buildCarouselBootstrapMarkup } from "./CarouselBootstrapExport";

export interface CarouselProps {
  data: WidgetData;
}

export function Carousel({ data = defaultCarouselWidgetData }: CarouselProps) {
  const carouselData = isCarouselWidgetData(data) ? data : defaultCarouselWidgetData;
  if (carouselData.advanced?.visibility === false) return null;

  const markup = buildCarouselBootstrapMarkup(carouselData, { editorMode: true });

  return (
    <BaseWidget
      data={carouselData}
      widgetType="carousel"
      title="Carousel"
      variantLabel={carouselData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-carousel-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
