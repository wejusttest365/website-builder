import { ReactNode, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useMounted } from "@/hooks/use-mounted";

export function MainLayout({ children }: { children: ReactNode }) {
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
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-950">
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
