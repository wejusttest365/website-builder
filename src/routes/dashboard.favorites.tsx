import { createFileRoute } from "@tanstack/react-router";
import { MyProjects } from "@/components/builder/MyProjects";

export const Route = createFileRoute("/dashboard/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  return (
    <MyProjects
      title="Favorites"
      subtitle="Your starred projects are collected here for quick access."
      showOnlyFavorites
      hideCreateAction
    />
  );
}