import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@/components/builder/ClientOnly";
import { DemoView } from "@/components/builder/DemoView";

export const Route = createFileRoute("/demo/$projectId")({
  component: DemoPage,
});

function DemoPage() {
  const { projectId } = Route.useParams();
  return (
    <ClientOnly>
      <DemoView projectId={projectId} />
    </ClientOnly>
  );
}
