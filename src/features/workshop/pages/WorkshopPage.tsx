import { useState } from "react";
import { useParams } from "react-router";
import { Crosshair, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkshopStage } from "../components/canvas/WorkshopStage";
import { TaskDetailDrawer } from "../components/task-drawer/TaskDetailDrawer";
import { WorkshopSidebar } from "../components/toolbar/WorkshopSidebar";
import { WorkshopToolbar } from "../components/toolbar/WorkshopToolbar";
import { useCanvasState } from "../hooks/useCanvasState";
import { useMockWorkshop } from "../hooks/useMockWorkshop";
import { useWorkshopStore } from "../store/workshopStore";
import { useElementSize } from "@/hooks/useElementSize";
import { ADD_ITEMS } from "../constants/addItemsKind";
import type { WorkshopObjectKind } from "../types/workshopKinds";

function WorkshopPage() {
  const { id: projectId } = useParams();
  const [stageWrapRef, stageSize] = useElementSize<HTMLDivElement>();
  const [openObjectId, setOpenObjectId] = useState<Nullable<string>>(null);
  const { nodes, edges, viewport, addItem, setViewport } = useMockWorkshop();
  const isDirty = useWorkshopStore((s) => s.isDirty);

  useCanvasState();

  const canvasPointAtCenter = () => ({
    x: (stageSize.width / 2 - viewport.x) / viewport.scale,
    y: (stageSize.height / 2 - viewport.y) / viewport.scale,
  });

  const handleAddItem = (kind: WorkshopObjectKind) => {
    const id = addItem(kind, canvasPointAtCenter());
    setOpenObjectId(id);
  };

  const handleResetView = () => {
    setViewport({ x: 32, y: 32, scale: 0.82 });
  };

  const handleFitView = () => {
    if (nodes.length === 0 || stageSize.width === 0 || stageSize.height === 0) {
      handleResetView();
      return;
    }

    const bounds = nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.x),
        minY: Math.min(acc.minY, node.y),
        maxX: Math.max(acc.maxX, node.x + node.width),
        maxY: Math.max(acc.maxY, node.y + node.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );
    const padding = 96;
    const contentW = bounds.maxX - bounds.minX + padding * 2;
    const contentH = bounds.maxY - bounds.minY + padding * 2;
    const scale = Math.min(
      1.15,
      Math.max(
        0.28,
        Math.min(stageSize.width / contentW, stageSize.height / contentH),
      ),
    );

    setViewport({
      scale,
      x: stageSize.width / 2 - ((bounds.minX + bounds.maxX) / 2) * scale,
      y: stageSize.height / 2 - ((bounds.minY + bounds.maxY) / 2) * scale,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" />
            <h1 className="truncate text-sm font-semibold">Main Workshop</h1>
            {isDirty && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Local edits
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mock canvas for project {projectId ?? "planning"}.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {ADD_ITEMS.map(({ kind, icon: Icon }) => (
            <Button
              key={kind}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs"
              onClick={() => handleAddItem(kind)}
            >
              <Icon className="h-3.5 w-3.5" />
              {kind}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleFitView}
            aria-label="Fit workshop view"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleResetView}
            aria-label="Reset workshop view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <WorkshopToolbar />
        <WorkshopSidebar />
        <div ref={stageWrapRef} className="relative min-w-0 flex-1">
          {stageSize.width > 0 && stageSize.height > 0 ? (
            <WorkshopStage
              width={stageSize.width}
              height={stageSize.height}
              onObjectOpen={setOpenObjectId}
            />
          ) : null}
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-border bg-card/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
            {nodes.length} items / {edges.length} connections /{" "}
            {Math.round(viewport.scale * 100)}%
          </div>
        </div>
      </div>

      <TaskDetailDrawer
        key={openObjectId ?? "closed"}
        objectId={openObjectId}
        onClose={() => setOpenObjectId(null)}
      />
    </div>
  );
}

export default WorkshopPage;
