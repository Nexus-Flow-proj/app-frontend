import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useElementSize } from "@/hooks/useElementSize";
import { WorkshopStage } from "../components/canvas/WorkshopStage";
import { TaskDetailDrawer } from "../components/task-drawer/TaskDetailDrawer";
import WorkshopSidebar from "../components/sidebar/WorkshopSidebar";
import { WorkshopToolbar } from "../components/toolbar/WorkshopToolbar";
import { useCanvasShortcuts } from "../hooks/useCanvasShortcuts";
import { useMockWorkshop } from "../hooks/useMockWorkshop";
import {
  WORKSHOP_CANVAS_PANEL_ID,
  WORKSHOP_SIDEBAR_COLLAPSED_SIZE,
  WORKSHOP_SIDEBAR_DEFAULT_SIZE,
  WORKSHOP_SIDEBAR_MAX_SIZE,
  WORKSHOP_SIDEBAR_MIN_SIZE,
  WORKSHOP_SIDEBAR_PANEL_ID,
  useWorkshopResizableSidebar,
} from "../hooks/useWorkshopResizableSidebar";
import { useWorkshopStore } from "../store/workshopStore";
import WorkshopHeader from "../components/header/WorkshopHeader";

function WorkshopPage() {
  const [stageWrapRef, stageSize] = useElementSize<HTMLDivElement>();
  const { objects, connections, viewport } = useMockWorkshop();
  const detailsObjectId = useWorkshopStore((s) => s.detailsObjectId);
  const {
    sidebarPanelRef,
    isSidebarCollapsed,
    collapseSidebar,
    expandSidebar,
    handleSidebarResize,
  } = useWorkshopResizableSidebar();

  useCanvasShortcuts();

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      {/* Header */}
      <WorkshopHeader stageSize={stageSize} />

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        {/* Sidebar */}
        <ResizablePanel
          id={WORKSHOP_SIDEBAR_PANEL_ID}
          panelRef={sidebarPanelRef}
          collapsible
          defaultSize={WORKSHOP_SIDEBAR_DEFAULT_SIZE}
          minSize={WORKSHOP_SIDEBAR_MIN_SIZE}
          maxSize={WORKSHOP_SIDEBAR_MAX_SIZE}
          collapsedSize={WORKSHOP_SIDEBAR_COLLAPSED_SIZE}
          onResize={handleSidebarResize}
          className="min-w-0"
        >
          <WorkshopSidebar
            collapsed={isSidebarCollapsed}
            onCollapse={collapseSidebar}
            onExpand={expandSidebar}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Canvas */}
        <ResizablePanel
          id={WORKSHOP_CANVAS_PANEL_ID}
          minSize="30rem"
          className="min-w-0"
        >
          <div ref={stageWrapRef} className="relative h-full min-w-0">
            {stageSize.width > 0 && stageSize.height > 0 ? (
              <WorkshopStage
                width={stageSize.width}
                height={stageSize.height}
              />
            ) : null}
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-border bg-card/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
              {objects.length} items / {connections.length} connections /{" "}
              {Math.round(viewport.scale * 100)}%
            </div>

            <WorkshopToolbar />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <TaskDetailDrawer
        key={detailsObjectId ?? "closed"}
        objectId={detailsObjectId}
      />
    </div>
  );
}

export default WorkshopPage;
