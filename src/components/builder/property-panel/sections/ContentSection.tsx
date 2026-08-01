import React from "react";

export interface ContentSectionProps {
  children?: React.ReactNode;
  title?: string;
}

export function ContentSection({ children, title = "Content" }: ContentSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
      {children ?? <p className="text-sm text-slate-500">Content controls go here.</p>}
    </section>
  );
}
