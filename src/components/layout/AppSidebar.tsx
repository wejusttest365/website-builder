"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { AppNav } from "@/components/layout/AppNav";

export function AppSidebar({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#171717] text-[#F5F5F5]">
      <AppNav />
      {children}
    </div>
  );
}
