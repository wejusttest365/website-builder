import React from "react";

export interface LayoutSectionProps {
  children?: React.ReactNode;
  title?: string;
}

export function LayoutSection({ children, title = "Layout" }: LayoutSectionProps) {
  return (
    <section className="rounded-xl border border-[#363636] bg-[#1F1F1F] p-3">
      <div className="mb-2 text-sm font-semibold text-[#F5F5F5]">{title}</div>
      {children ?? <p className="text-sm text-[#969696]">Layout controls go here.</p>}
    </section>
  );
}
