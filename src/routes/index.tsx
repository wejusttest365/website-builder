import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@/components/builder/ClientOnly";
import { BuilderShell } from "@/components/builder/BuilderShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WebToolOcean — Drag & Drop Website Builder" },
      {
        name: "description",
        content:
          "Build beautiful, responsive websites without code. Drag pre-built HTML sections, edit inline, and export production-ready HTML, CSS, and JavaScript.",
      },
      { property: "og:title", content: "WebToolOcean Website Builder" },
      {
        property: "og:description",
        content: "Beginner-friendly website builder with a full HTML section library.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly
      fallback={
        <div className="h-screen w-screen flex items-center justify-center text-sm text-muted-foreground">
          Loading builder…
        </div>
      }
    >
      <BuilderShell />
    </ClientOnly>
  );
}
