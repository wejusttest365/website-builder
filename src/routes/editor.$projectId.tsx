import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { ClientOnly } from '@/components/builder/ClientOnly';
import { BuilderShell } from '@/components/builder/BuilderShell';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CenteredLoader } from '@/components/ui/CenteredLoader';
import { MainLayout } from '@/components/layout/MainLayout';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth';
import { getStoredBuilderState, useBuilder } from '@/lib/builder/store';
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
  const hydrate = useBuilder((s) => s.hydrate);
  const hydrated = useBuilder((s) => s.hydrated);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const hasLoadedProjectRef = useRef(false);

  useEffect(() => {
    hasLoadedProjectRef.current = false;
  }, [projectId]);

  useEffect(() => {
    if (!authReady || !user || hasLoadedProjectRef.current) {
      return;
    }

    if (!hydrated) {
      hydrate();
      return;
    }

    hasLoadedProjectRef.current = true;

    const loadProject = async () => {
      const pageIdFromSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('pageId') : null;
      let builderState = useBuilder.getState();
      let localProject = builderState.projects[projectId];

      if (!localProject) {
        const storedState = getStoredBuilderState();
        if (storedState.projects[projectId]) {
          console.warn("EditorRoute fallback: local project present in storage but missing from builder state; rehydrating store from persisted state.", {
            projectId,
            storedProjectIds: Object.keys(storedState.projects),
          });
          useBuilder.setState({
            projects: storedState.projects,
            hydrated: true,
            leftPanelOpen: storedState.leftPanelOpen ?? builderState.leftPanelOpen,
            leftPanelView: storedState.leftPanelView ?? builderState.leftPanelView,
            showProjectDashboard: false,
          });
          builderState = useBuilder.getState();
          localProject = builderState.projects[projectId];
        }
      }

      // console.log("EditorRoute loadProject", {
      //   projectId,
      //   hydrated: builderState.hydrated,
      //   localProject: Boolean(localProject),
      //   currentProjectId: builderState.currentProjectId,
      //   projectIds: Object.keys(builderState.projects),
      //   showProjectDashboard: builderState.showProjectDashboard,
      // });

      if (localProject) {
        builderState.loadProject(projectId);
        builderState.setShowProjectDashboard(false);
        if (pageIdFromSearch) {
          selectPage(pageIdFromSearch);
        }
        return;
      }

      try {
        const cloudProject = await getBuilderProject(projectId);

        if (!cloudProject?.id) {
          throw new Error("Project not found");
        }

        await loadCloudProject(projectId);
        setShowProjectDashboard(false);
        if (pageIdFromSearch) {
          selectPage(pageIdFromSearch);
        }
      } catch (error) {
        console.error("EditorRoute loadProject failed", error);
        navigate({ to: "/" });
      }
    };

    void loadProject();
  }, [authReady, hydrated, hydrate, loadCloudProject, navigate, projectId, selectPage, setShowProjectDashboard, user]);

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
