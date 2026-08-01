import React from "react";

export interface ImageControlProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function ImageControl({ label = "Image", value = "", onChange }: ImageControlProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input value={value} placeholder="Image URL" onChange={(event) => onChange?.(event.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm" />
    </label>
  );
}
