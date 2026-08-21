import { useState, useCallback, useEffect } from "react";

type PendingAuthAction = {
  type: "preview" | "export" | "publish";
  callback: () => void | Promise<void>;
} | null;

type AuthDrawerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  pendingAction: PendingAuthAction;
  setPendingAction: (action: PendingAuthAction) => void;
  initialMode: "sign-in" | "sign-up";
  setInitialMode: (mode: "sign-in" | "sign-up") => void;
  openDrawer: (mode: "sign-in" | "sign-up", action: PendingAuthAction) => void;
  closeDrawer: () => void;
};

const globalState: AuthDrawerState = {
  open: false,
  setOpen: () => {},
  pendingAction: null,
  setPendingAction: () => {},
  initialMode: "sign-in",
  setInitialMode: () => {},
  openDrawer: () => {},
  closeDrawer: () => {},
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function useAuthDrawer() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((v) => v + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const setOpen = useCallback((open: boolean) => {
    globalState.open = open;
    notify();
  }, []);

  const setPendingAction = useCallback((action: PendingAuthAction) => {
    globalState.pendingAction = action;
    notify();
  }, []);

  const setInitialMode = useCallback((mode: "sign-in" | "sign-up") => {
    globalState.initialMode = mode;
    notify();
  }, []);

  const openDrawer = useCallback((mode: "sign-in" | "sign-up", action: PendingAuthAction) => {
    globalState.initialMode = mode;
    globalState.pendingAction = action;
    globalState.open = true;
    notify();
  }, []);

  const closeDrawer = useCallback(() => {
    globalState.open = false;
    globalState.pendingAction = null;
    notify();
  }, []);

  return {
    open: globalState.open,
    setOpen,
    pendingAction: globalState.pendingAction,
    setPendingAction,
    initialMode: globalState.initialMode,
    setInitialMode,
    openDrawer,
    closeDrawer,
  };
}
