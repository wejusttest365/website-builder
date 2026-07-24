import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { ClientOnly } from '@/components/builder/ClientOnly';
import { BuilderShell } from '@/components/builder/BuilderShell';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CenteredLoader } from '@/components/ui/CenteredLoader';
import { MainLayout } from '@/components/layout/MainLayout';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth';
import { useBuilder } from '@/lib/builder/store';
import { getBuilderProject } from "@/services/builderProject";

export const Route = createFileRoute('/editor/$projectId')({
  component: EditorRoute,
});

function EditorRoute() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const loadCloudProject = useBuilder((s) => s.loadCloudProject);
  const selectPage = useBuilder((s) => s.selectPage);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);
  const hasLoadedProjectRef = useRef(false);

  useEffect(() => {
    hasLoadedProjectRef.current = false;
  }, [projectId]);

  useEffect(() => {
    if (!authReady || !user || hasLoadedProjectRef.current) {
      return;
    }

    hasLoadedProjectRef.current = true;

    const loadProject = async () => {
      const builderState = useBuilder.getState();
      const localProject = builderState.projects[projectId];
        const pageIdFromSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('pageId') : null;
        
      if (localProject) {
        builderState.loadProject(projectId);
        builderState.setShowProjectDashboard(false);
          if (pageIdFromSearch) {
            // select the requested page after loading local project
            selectPage(pageIdFromSearch);
          }
        builderState.setShowProjectDashboard(false);
        builderState.setLeftPanelOpen(true);
        builderState.setLeftPanelView('widgets');
        return;
      }

      try {
  const cloudProject = await getBuilderProject(projectId);

  if (!cloudProject?.id) {
    throw new Error("Project not found");
  }

  await builderState.loadCloudProject(projectId);
    builderState.setShowProjectDashboard(false);
  if (pageIdFromSearch) {
    selectPage(pageIdFromSearch);
  }

  builderState.setShowProjectDashboard(false);
  builderState.setLeftPanelOpen(true);
  builderState.setLeftPanelView("widgets");
} catch {
  navigate({ to: "/" });
}
    };

    void loadProject();
  }, [authReady, navigate, projectId, user]);

  if (!authReady) {
    return (
      <MainLayout>
        <CenteredLoader message="Preparing your website builder…" details="This will only take a moment." />
      </MainLayout>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <MainLayout>
      <AppSidebar>
        <ClientOnly
          fallback={
            <CenteredLoader details="Initializing editor…" className="bg-background/50" />
          }
        >
          <BuilderShell />
        </ClientOnly>
      </AppSidebar>
    </MainLayout>
  );
}
