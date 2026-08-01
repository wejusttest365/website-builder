import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignLeft, faAlignCenter, faAlignRight } from "@fortawesome/free-solid-svg-icons";

export interface AlignmentControlProps {
  label?: string;
  value?: "left" | "center" | "right";
  onChange?: (next: "left" | "center" | "right") => void;
}

export function AlignmentControl({ label = "Alignment", value = "left", onChange }: AlignmentControlProps) {
  const choices: Array<{ key: "left" | "center" | "right"; icon: any; label: string }> = [
    { key: "left", icon: faAlignLeft, label: "Left" },
    { key: "center", icon: faAlignCenter, label: "Center" },
    { key: "right", icon: faAlignRight, label: "Right" },
  ];

  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-600">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        {choices.map((c) => {
          const active = value === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-label={c.label}
              onClick={() => onChange?.(c.key)}
              className={`flex h-8 w-8 items-center justify-center rounded border ${
                active ? "border-violet-500 text-violet-600" : "border-slate-200 text-slate-600"
              } bg-white`}
            >
              <FontAwesomeIcon icon={c.icon} className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    </label>
  );
}
