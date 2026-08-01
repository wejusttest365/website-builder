import React from "react";

export interface StyleSectionProps {
  children?: React.ReactNode;
  title?: string;
}

export function StyleSection({ children, title = "Style" }: StyleSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
      {children ?? <p className="text-sm text-slate-500">Style controls go here.</p>}
    </section>
  );
}
