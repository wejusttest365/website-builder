import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/shared")({
  component: SharedPage,
});

function SharedPage() {
  return <h1>Shared Projects</h1>;
}