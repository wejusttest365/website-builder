import { useNavigate } from "@tanstack/react-router";
import { Bookmark, FolderOpen, ChevronRight } from "lucide-react";
import { useBuilder } from "@/lib/builder/store";
import { Button } from "@/components/ui/button";

export function EditorTopMenu() {
  const navigate = useNavigate();
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);

  return <div className="flex items-center gap-2 border-l border-slate-200/80 pl-4" />;
}
