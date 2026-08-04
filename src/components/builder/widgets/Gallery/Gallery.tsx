import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { defaultGalleryWidgetData, isGalleryWidgetData } from "./GalleryTypes";
import { buildGalleryBootstrapMarkup } from "./GalleryBootstrapExport";

export interface GalleryProps {
  data: WidgetData;
}

export function Gallery({ data = defaultGalleryWidgetData }: GalleryProps) {
  const galleryData = isGalleryWidgetData(data) ? data : defaultGalleryWidgetData;
  if (galleryData.advanced?.visibility === false) return null;

  const markup = buildGalleryBootstrapMarkup(galleryData, { editorMode: true });

  return (
    <BaseWidget
      data={galleryData}
      widgetType="gallery"
      title="Image Gallery"
      variantLabel={galleryData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
      disableSectionWidthStyle={true}
      as="div"
    >
      <div
        className="wto-gallery-react-host w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </BaseWidget>
  );
}
