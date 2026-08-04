import { ControlWrapper } from "./ControlWrapper";
import { ButtonGroupControl } from "./ButtonGroupControl";
import { ColorControl } from "./ColorControl";
import { ImageControl } from "./ImageControl";
import type { WidgetBackgroundStyle, WidgetBackgroundType } from "@/components/builder/widgets/BackgroundTypes";

const options: Array<{ label: string; value: WidgetBackgroundType }> = [
  { label: "None", value: "none" },
  { label: "Color", value: "color" },
  { label: "Gradient", value: "gradient" },
  { label: "Image", value: "image" },
];

export interface BackgroundControlProps {
  label?: string;
  value?: WidgetBackgroundStyle;
  onChange: (value: WidgetBackgroundStyle) => void;
  hint?: string;
  tooltip?: string;
}

export function BackgroundControl({
  label = "Background",
  value = {},
  onChange,
  hint,
  tooltip,
}: BackgroundControlProps) {
  const backgroundType = (value.type || "none") as WidgetBackgroundType;

  const updateValue = (patch: Partial<WidgetBackgroundStyle>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="space-y-3">
      <ButtonGroupControl
        label={label}
        value={backgroundType}
        options={options.map((option) => ({ ...option, icon: undefined }))}
        onChange={(next) => updateValue({ type: next })}
        hint={hint}
        tooltip={tooltip}
      />

      {backgroundType === "color" ? (
        <ColorControl
          label="Background color"
          value={String(value.color ?? "")}
          onChange={(next) => updateValue({ color: next })}
        />
      ) : null}

      {backgroundType === "gradient" ? (
        <div className="space-y-2">
          <ColorControl
            label="Gradient start"
            value={String(value.gradientStart ?? "")}
            onChange={(next) => updateValue({ gradientStart: next })}
          />
          <ColorControl
            label="Gradient end"
            value={String(value.gradientEnd ?? "")}
            onChange={(next) => updateValue({ gradientEnd: next })}
          />
          <ColorControl
            label="Fallback color"
            value={String(value.color ?? "")}
            onChange={(next) => updateValue({ color: next })}
          />
        </div>
      ) : null}

      {backgroundType === "image" ? (
        <div className="space-y-2">
          <ImageControl
            label="Background Image"
            variant="background"
            value={String(value.image ?? "")}
            onChange={(next) => updateValue({ image: next })}
          />
          <ColorControl
            label="Fallback color"
            value={String(value.color ?? "")}
            onChange={(next) => updateValue({ color: next })}
          />
        </div>
      ) : null}
    </div>
  );
}
