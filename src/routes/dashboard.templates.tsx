import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  return <h1>Templates Page</h1>;
}