import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MainLayout } from "@/components/layout/MainLayout";

interface DashboardPageShellProps {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardPageShell({ title, description, actions, children }: DashboardPageShellProps) {
  return (
    <MainLayout hideHeader hasSidebar>
      <AppSidebar>
        <div className="mx-auto min-h-[calc(100vh-100px)] max-w-[1580px] px-3 py-4 sm:px-4 lg:px-6">
          <section className="rounded-[32px] bg-[#1F1F1F] p-6 shadow-sm ring-1 ring-[#363636]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FACC15]">Dashboard</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F5F5F5]">{title}</h1>
                <p className="mt-2 text-base leading-7 text-[#969696]">{description}</p>
              </div>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </section>

          <div className="mt-6">{children}</div>
        </div>
      </AppSidebar>
    </MainLayout>
  );
}
