import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@/components/builder/ClientOnly";
import { BuilderShell } from "@/components/builder/BuilderShell";
import { MainLayout } from "@/components/layout/MainLayout";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <MainLayout>
      <ClientOnly
        fallback={
          <div style={{ height: "100%" }} className="h-screen w-screen flex items-center justify-center text-sm text-muted-foreground">
            Loading builder…
          </div>
        }
      >
        <BuilderShell />
      </ClientOnly>
    </MainLayout>
  );
}
