import { ReactNode, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useMounted } from "@/hooks/use-mounted";

export function MainLayout({ children }: { children: ReactNode }) {
  const mounted = useMounted();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-950">
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
