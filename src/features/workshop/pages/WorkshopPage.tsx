import { WorkshopStage } from "../components/canvas/WorkshopStage";
import WorkshopHeader from "../components/header/workshopHeader";
import { TaskDetailDrawer } from "../components/task-drawer/TaskDetailDrawer";
import { WorkshopSidebar } from "../components/toolbar/WorkshopSidebar";
import { WorkshopToolbar } from "../components/toolbar/WorkshopToolbar";
import { useCanvasShortcuts } from "../hooks/useCanvasShortcuts";
import { useMockWorkshop } from "../hooks/useMockWorkshop";
import { useWorkshopStore } from "../store/workshopStore";
import { useElementSize } from "@/hooks/useElementSize";

function WorkshopPage() {
  const [stageWrapRef, stageSize] = useElementSize<HTMLDivElement>();
  const { objects, connections, viewport } = useMockWorkshop();
  const detailsObjectId = useWorkshopStore((s) => s.detailsObjectId);

  useCanvasShortcuts();

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      {/* Header */}
      <WorkshopHeader stageSize={stageSize} />

      <div className="flex min-h-0 flex-1">
        <WorkshopSidebar />

        <div ref={stageWrapRef} className="relative min-w-0 flex-1">
          {stageSize.width > 0 && stageSize.height > 0 ? (
            <WorkshopStage width={stageSize.width} height={stageSize.height} />
          ) : null}
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-border bg-card/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
            {objects.length} items / {connections.length} connections /{" "}
            {Math.round(viewport.scale * 100)}%
          </div>

          <WorkshopToolbar />
        </div>
      </div>

      <TaskDetailDrawer
        key={detailsObjectId ?? "closed"}
        objectId={detailsObjectId}
      />
    </div>
  );
}

export default WorkshopPage;
