import { ReactNode, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useMounted } from "@/hooks/use-mounted";

export function MainLayout({ children, hideHeader }: { children: ReactNode; hideHeader?: boolean }) {
  const mounted = useMounted();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    // Avoid mutating global html/body overflow which can cause layout
    // shifts when file pickers or dialogs open. Keep layout constrained
    // using component-level styles instead.
    return undefined;
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-950">
      {!hideHeader ? <Header /> : null}
      <main className="flex-1 min-h-0 overflow-hidden mainWrapper">{children}</main>
    </div>
  );
}
