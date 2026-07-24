import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { CenteredLoader } from "@/components/ui/CenteredLoader";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      navigate({ to: "/" });
    }
  }, [authReady, user]);

  if (!authReady) {
    return (
      <MainLayout>
        <CenteredLoader message="Preparing your website builder…" details="This will only take a moment." />
      </MainLayout>
    );
  }

  if (!user) return null;

  return (
    <MainLayout>
      <AppSidebar>
        <Outlet />
      </AppSidebar>
    </MainLayout>
  );
}