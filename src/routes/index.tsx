import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ProjectDashboard } from "@/components/builder/ProjectDashboard";
import { CenteredLoader } from "@/components/ui/CenteredLoader";
import { MainLayout } from "@/components/layout/MainLayout";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LandingPage } from "@/components/landing/LandingPage";
import { useAuth } from "@/lib/auth";
import { useBuilder } from "@/lib/builder/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const initialRedirected = useRef(false);

  useEffect(() => {
    if (!initialRedirected.current && user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
      if (currentPath !== "/") {
        initialRedirected.current = true;
        return;
      }

      setShowProjectDashboard(true);
      initialRedirected.current = true;
      navigate({ to: "/dashboard" as never });
    }
  }, [user, setShowProjectDashboard, navigate]);

  if (!authReady) {
    return (
      <MainLayout>
        <CenteredLoader message="Preparing your website builder…" details="This will only take a moment." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {user ? (
        // authenticated users are redirected to /dashboard; show a placeholder while navigating
        <div className="h-[calc(100vh-100px)] flex items-center justify-center text-sm text-muted-foreground">Redirecting to dashboard…</div>
      ) : (
        <LandingPage />
      )}
    </MainLayout>
  );
}
