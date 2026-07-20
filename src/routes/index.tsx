import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/builder/ClientOnly";
import { BuilderShell } from "@/components/builder/BuilderShell";
import { ProjectDashboard } from "@/components/builder/ProjectDashboard";
import { MainLayout } from "@/components/layout/MainLayout";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LandingPage } from "@/components/landing/LandingPage";
import { useAuth } from "@/lib/auth";
import { useBuilder } from "@/lib/builder/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, authReady } = useAuth();
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const initialDashboardSet = useRef(false);

  useEffect(() => {
    if (!initialDashboardSet.current && user) {
      setShowProjectDashboard(true);
      initialDashboardSet.current = true;
    }
  }, [user, setShowProjectDashboard]);

  if (!authReady) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-100px)] flex items-center justify-center text-sm text-muted-foreground">
          Loading authentication…
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {user ? (
        <AppSidebar>
          {showProjectDashboard ? (
            <ProjectDashboard onOpenEditor={() => setShowProjectDashboard(false)} />
          ) : (
            <ClientOnly
              fallback={
                <div style={{ height: "100%" }} className="h-screen w-screen flex items-center justify-center text-sm text-muted-foreground">
                  Loading builder…
                </div>
              }
            >
              <BuilderShell />
            </ClientOnly>
          )}
        </AppSidebar>
      ) : (
        <LandingPage />
      )}
    </MainLayout>
  );
}
