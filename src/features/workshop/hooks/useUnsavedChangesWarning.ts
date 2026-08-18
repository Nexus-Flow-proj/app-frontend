import { useEffect } from "react";
import { useBlocker } from "react-router";

export function useUnsavedChangesWarning(isDirty: boolean) {
  // ─── Browser close / tab refresh ─────────────────────────────
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // ─── In-app navigation ───────────────────────────────────────
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (currentLocation.pathname === nextLocation.pathname) return false;
    return isDirty;
  });

  const confirmLeave = () => blocker.proceed?.();
  const cancelLeave = () => blocker.reset?.();

  return {
    isBlocking: blocker.state === "blocked",
    confirmLeave,
    cancelLeave,
  };
}
