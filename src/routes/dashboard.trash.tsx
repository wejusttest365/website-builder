import { createFileRoute } from "@tanstack/react-router";
import { MyProjects } from "@/components/builder/MyProjects";

export const Route = createFileRoute("/dashboard/trash")({
  component: TrashPage,
});

function TrashPage() {
  return (
    <MyProjects
      title="Trash"
      subtitle="Deleted projects can be restored or permanently deleted."
      showOnlyTrashed
      hideCreateAction
    />
  );
}