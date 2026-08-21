import { useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useAuthDrawer } from "./useAuthDrawer";

export function useRequireAuth(actionType?: "preview" | "export" | "publish") {
  const { user } = useAuth();
  const { openDrawer } = useAuthDrawer();

  const requireAuth = useCallback(
    async (callback: () => void | Promise<void>) => {
      if (user) {
        await callback();
        return true;
      }

      if (actionType) {
        openDrawer("sign-in", { type: actionType, callback });
      }

      return false;
    },
    [user, openDrawer, actionType]
  );

  return requireAuth;
}
