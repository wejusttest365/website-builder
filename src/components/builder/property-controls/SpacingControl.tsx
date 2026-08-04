import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop, faTablet, faMobile, faLink, faLinkSlash } from "@fortawesome/free-solid-svg-icons";
import { createSpacingOverride, getSpacingValueForDevice, hasSpacingValueForDevice, parseSpacingValue, type SpacingDevice, type SpacingValue } from "@/components/builder/widgets/spacing";

export interface SpacingControlProps {
  label?: string;
  value?: string | Record<string, unknown> | null;
  onChange?: (value: unknown) => void;
}

function getDefaultSpacingValue(): SpacingValue {
  return { top: 0, right: 0, bottom: 0, left: 0, unit: "px" };
}

export function SpacingControl({ label = "Spacing", value = "0px", onChange }: SpacingControlProps) {
  const [device, setDevice] = useState<SpacingDevice>("desktop");
  const [linked, setLinked] = useState(true);
  const [deviceValues, setDeviceValues] = useState<Record<SpacingDevice, SpacingValue>>({
    desktop: getDefaultSpacingValue(),
    tablet: getDefaultSpacingValue(),
    mobile: getDefaultSpacingValue(),
  });

  const parsedValue = useMemo(() => parseSpacingValue(value), [value]);
  const inherited = !hasSpacingValueForDevice(value, device);
  const activeValue = deviceValues[device] ?? getDefaultSpacingValue();

  useEffect(() => {
    setDeviceValues({
      desktop: getSpacingValueForDevice(value, "desktop"),
      tablet: getSpacingValueForDevice(value, "tablet"),
      mobile: getSpacingValueForDevice(value, "mobile"),
    });
  }, [value]);

  function emit(nextSpacing: SpacingValue) {
    const normalized = { ...nextSpacing, unit: "px" };
    const nextValue = linked
      ? {
          ...parsedValue,
          desktop: normalized,
          tablet: normalized,
          mobile: normalized,
        }
      : createSpacingOverride(value, device, normalized);
    onChange?.(nextValue);
  }

  function handleChangeSide(side: "top" | "right" | "bottom" | "left", rawValue: string) {
    const num = Number(rawValue || 0);
    const nextSpacing = { ...activeValue, [side]: num, unit: "px" };
    setDeviceValues((prev) => ({ ...prev, [device]: nextSpacing }));
    emit(nextSpacing);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`rounded-md p-2 ${device === "desktop" ? "border border-violet-500 bg-white text-violet-600" : "text-slate-400"}`}
            aria-label="Desktop spacing"
          >
            <FontAwesomeIcon icon={faDesktop} className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`rounded-md p-2 ${device === "tablet" ? "border border-violet-500 bg-white text-violet-600" : "text-slate-400"}`}
            aria-label="Tablet spacing"
          >
            <FontAwesomeIcon icon={faTablet} className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`rounded-md p-2 ${device === "mobile" ? "border border-violet-500 bg-white text-violet-600" : "text-slate-400"}`}
            aria-label="Mobile spacing"
          >
            <FontAwesomeIcon icon={faMobile} className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <input
            className={`h-9 w-full min-w-0 rounded-md border px-2 text-[13px] text-slate-700 ${inherited ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 bg-white"}`}
            value={String(activeValue.top)}
            onChange={(e) => handleChangeSide("top", e.target.value)}
          />
          <div className="mt-1 text-[11px] text-slate-400">Top</div>
        </div>
        <div>
          <input
            className={`h-9 w-full min-w-0 rounded-md border px-2 text-[13px] text-slate-700 ${inherited ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 bg-white"}`}
            value={String(activeValue.right)}
            onChange={(e) => handleChangeSide("right", e.target.value)}
          />
          <div className="mt-1 text-[11px] text-slate-400">Right</div>
        </div>
        <div>
          <input
            className={`h-9 w-full min-w-0 rounded-md border px-2 text-[13px] text-slate-700 ${inherited ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 bg-white"}`}
            value={String(activeValue.bottom)}
            onChange={(e) => handleChangeSide("bottom", e.target.value)}
          />
          <div className="mt-1 text-[11px] text-slate-400">Bottom</div>
        </div>
        <div>
          <input
            className={`h-9 w-full min-w-0 rounded-md border px-2 text-[13px] text-slate-700 ${inherited ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 bg-white"}`}
            value={String(activeValue.left)}
            onChange={(e) => handleChangeSide("left", e.target.value)}
          />
          <div className="mt-1 text-[11px] text-slate-400">Left</div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 text-[12px] font-medium text-slate-600">
          px
        </div>
        <button
          type="button"
          onClick={() => setLinked((s) => !s)}
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-500"
          aria-label={linked ? "Unlink spacing values" : "Link spacing values"}
        >
          <FontAwesomeIcon icon={linked ? faLink : faLinkSlash} className="h-4 w-4" />
        </button>
      </div>
      {inherited ? <div className="mt-2 text-[11px] text-slate-400">Inherited from the previous breakpoint.</div> : null}
    </div>
  );
}
