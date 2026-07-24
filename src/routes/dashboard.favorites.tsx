import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  return <h1>Favorites Page</h1>;
}