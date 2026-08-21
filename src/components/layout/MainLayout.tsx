import { ReactNode, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useMounted } from "@/hooks/use-mounted";
import { useAuthDrawer } from "@/lib/builder/useAuthDrawer";

export function MainLayout({ children, hideHeader, hasSidebar, headerProps }: { children: ReactNode; hideHeader?: boolean; hasSidebar?: boolean; headerProps?: { hideBranding?: boolean; hideProfile?: boolean } }) {
  const mounted = useMounted();
  useAuthDrawer();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    return undefined;
  }, []);

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden bg-[#171717] text-[#F5F5F5] ${hasSidebar ? "pl-[180px]" : ""}`}>
      {!hideHeader ? <Header {...headerProps} /> : null}
      <main className="flex-1 min-h-0 overflow-hidden mainWrapper">{children}</main>
    </div>
  );
}
