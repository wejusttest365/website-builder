import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/trash")({
  component: TrashPage,
});

function TrashPage() {
  return <h1>Trash</h1>;
}