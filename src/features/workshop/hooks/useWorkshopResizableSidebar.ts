import { useCallback, useState } from "react";
import { usePanelRef } from "react-resizable-panels";

export const WORKSHOP_SIDEBAR_PANEL_ID = "workshop-sidebar-panel";
export const WORKSHOP_CANVAS_PANEL_ID = "workshop-canvas-panel";

export const WORKSHOP_SIDEBAR_DEFAULT_SIZE = "22%";
export const WORKSHOP_SIDEBAR_MIN_SIZE = "16rem";
export const WORKSHOP_SIDEBAR_MAX_SIZE = "26rem";
export const WORKSHOP_SIDEBAR_COLLAPSED_SIZE = "2rem";

export function useWorkshopResizableSidebar() {
  const sidebarPanelRef = usePanelRef();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const collapseSidebar = useCallback(() => {
    sidebarPanelRef.current?.collapse();
    setIsSidebarCollapsed(true);
  }, [sidebarPanelRef]);

  const expandSidebar = useCallback(() => {
    const panel = sidebarPanelRef.current;

    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.resize(WORKSHOP_SIDEBAR_DEFAULT_SIZE);
    }

    setIsSidebarCollapsed(false);
  }, [sidebarPanelRef]);

  const handleSidebarResize = useCallback(() => {
    setIsSidebarCollapsed(sidebarPanelRef.current?.isCollapsed() ?? false);
  }, [sidebarPanelRef]);

  return {
    sidebarPanelRef,
    isSidebarCollapsed,
    collapseSidebar,
    expandSidebar,
    handleSidebarResize,
  };
}
