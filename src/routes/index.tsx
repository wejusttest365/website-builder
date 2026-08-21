import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CenteredLoader } from "@/components/ui/CenteredLoader";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { authReady } = useAuth();

  useEffect(() => {
    navigate({ to: "/dashboard" as never });
  }, [navigate]);

  if (!authReady) {
    return (
      <MainLayout>
        <CenteredLoader message="Preparing your website builder…" details="This will only take a moment." />
      </MainLayout>
    );
  }

  return null;
}
