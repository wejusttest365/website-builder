import { cn } from "@/lib/utils";

interface SidebarBadgeProps {
  count: number;
  active?: boolean;
  compact?: boolean;
}

export function SidebarBadge({ count, active = false, compact = false }: SidebarBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium leading-none",
        compact
          ? "h-5 min-w-5 px-1.5 text-[10px]"
          : "h-5 min-w-5 px-2 text-[11px]",
        active
          ? "border-primary/20 bg-primary text-primary-foreground"
          : "border-border/60 bg-muted text-muted-foreground"
      )}
    >
      {count}
    </span>
  );
}
