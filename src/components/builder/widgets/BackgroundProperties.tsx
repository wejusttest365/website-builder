import { BackgroundControl } from "@/components/builder/property-controls/BackgroundControl";
import type { WidgetBackgroundStyle } from "./BackgroundTypes";

export interface BackgroundPropertiesProps {
  background?: WidgetBackgroundStyle;
  onChange: (value: WidgetBackgroundStyle) => void;
}

export function BackgroundProperties({ background, onChange }: BackgroundPropertiesProps) {
  return (
    <BackgroundControl
      label="Background Type"
      value={background ?? { type: "none" }}
      onChange={onChange}
      tooltip="Choose a shared background for the widget outer shell."
    />
  );
}
