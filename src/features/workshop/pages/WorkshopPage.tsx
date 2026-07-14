import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useElementSize } from "@/hooks/useElementSize";
import { Layers3, Loader2 } from "lucide-react";
import { useParams } from "react-router";
import { WorkshopStage } from "../components/canvas/WorkshopStage";
import { TaskDetailDrawer } from "../components/task-drawer/TaskDetailDrawer";
import WorkshopSidebar from "../components/sidebar/WorkshopSidebar";
import { WorkshopToolbar } from "../components/toolbar/WorkshopToolbar";
import { useCanvasShortcuts } from "../hooks/useCanvasShortcuts";
import { useWorkshopCanvasSource } from "../hooks/useWorkshopCanvasSource";
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
  const { id: projectId = "" } = useParams<{ id: string }>();
  const source = useWorkshopCanvasSource(projectId);
  const objects = useWorkshopStore((state) => state.objects);
  const connections = useWorkshopStore((state) => state.connections);
  const viewport = useWorkshopStore((state) => state.viewport);
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
      <WorkshopHeader
        stageSize={stageSize}
        isPlanReady={!source.isLoading && !source.isError}
      />

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

            {!source.isLoading && !source.isError && objects.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="max-w-sm rounded-xl border border-dashed border-border bg-card/90 px-8 py-7 text-center shadow-sm backdrop-blur">
                  <Layers3 className="mx-auto h-8 w-8 text-primary" />
                  <h2 className="mt-3 text-sm font-semibold">
                    Start with your first feature
                  </h2>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    Enable edit mode, add features, place their tasks, then connect
                    features to define the Team Board column order.
                  </p>
                </div>
              </div>
            ) : null}

            {source.isLoading ? (
              <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-background/55 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading the Workshop canvas
                </div>
              </div>
            ) : null}

            {source.isError ? (
              <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive shadow-sm">
                The Workshop canvas could not be loaded.
              </div>
            ) : null}
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
