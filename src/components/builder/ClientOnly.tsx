import { type ReactNode } from "react";
import { useMounted } from "@/hooks/use-mounted";

export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
