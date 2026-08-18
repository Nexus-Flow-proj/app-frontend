import { useState } from "react";
import { Bot, LoaderCircle, RefreshCcw, Sparkles } from "lucide-react";
import { useLocation, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useElementSize } from "@/hooks/useElementSize";
import { AIFloatingChat } from "../components/ai-panel/AIFloatingChat";
import { WorkshopStage } from "../components/canvas/WorkshopStage";
import WorkshopHeader from "../components/header/WorkshopHeader";
import WorkshopSidebar from "../components/sidebar/WorkshopSidebar";
import { TaskDetailDrawer } from "../components/task-drawer/TaskDetailDrawer";
import { WorkshopToolbar } from "../components/toolbar/WorkshopToolbar";
import { useCanvasShortcuts } from "../hooks/useCanvasShortcuts";
import { useWorkshopController } from "../hooks/useWorkshopController";
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

// function UnsupportedProjectWorkshop() {
//   return (
//     <main className="grid min-h-[70vh] place-items-center p-6">
//       <Card className="max-w-lg text-center">
//         <CardHeader>
//           <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
//             <TriangleAlert />
//           </div>
//           <CardTitle>Project Workshop is not available yet</CardTitle>
//           <CardDescription>
//             This release supports the draft-scoped Onboarding Workshop. Existing
//             project boards remain available from the project overview.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Button asChild>
//             <a href="/dashboard">Return to dashboard</a>
//           </Button>
//         </CardContent>
//       </Card>
//     </main>
//   );
// }

function WorkshopPage() {
  // const { pathname } = useLocation();
  const { id: draftId = "" } = useParams();

  // if (!pathname.startsWith("/drafts/")) return <UnsupportedProjectWorkshop />;
  return <DraftWorkshop draftId={draftId} />;
}

function CanvasStatus() {
  const objectCount = useWorkshopStore((state) => state.objects.length);
  const scale = useWorkshopStore((state) => state.viewport.scale);

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border bg-background/85 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
      {objectCount} items · {Math.round(scale * 100)}%
    </div>
  );
}

function DraftWorkshop({ draftId }: { draftId: string }) {
  const [isExplorerOpen, setExplorerOpen] = useState(false);
  const [stageWrapRef, stageSize] = useElementSize<HTMLDivElement>();
  const controller = useWorkshopController(draftId);
  const objectCount = useWorkshopStore((state) => state.objects.length);
  const canvasId = useWorkshopStore((state) => state.canvasId);
  const detailsObjectId = useWorkshopStore((state) => state.detailsObjectId);
  const {
    sidebarPanelRef,
    isSidebarCollapsed,
    collapseSidebar,
    expandSidebar,
    handleSidebarResize,
  } = useWorkshopResizableSidebar();
  useCanvasShortcuts();
  const { pathname } = useLocation();

  const isCompleted = !pathname.startsWith("/drafts/");
  const isMissing =
    (controller.canvasQuery.error as { statusCode?: number } | null)
      ?.statusCode === 404;
  const fatalError = controller.canvasQuery.isError && !isMissing;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <WorkshopHeader
        draft={controller.draft}
        isDirty={controller.isDirty}
        isSaving={controller.isSaving}
        isGenerating={controller.isGenerating}
        isSubmitting={controller.isSubmitting}
        canSubmit={controller.canSubmit}
        hasCanvas={!!canvasId}
        onSave={controller.save}
        onSubmit={controller.submit}
        onOpenExplorer={() => setExplorerOpen(true)}
        isCompleted={isCompleted}
      />

      {controller.canvasQuery.isLoading ? (
        <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr] gap-px bg-border">
          <Skeleton className="h-full rounded-none" />
          <Skeleton className="h-full rounded-none" />
        </div>
      ) : fatalError ? (
        <div className="grid flex-1 place-items-center p-6">
          <Card className="max-w-md text-center">
            <CardHeader>
              <CardTitle>Couldn’t load the workshop</CardTitle>
              <CardDescription>
                Your draft is safe. Retry when the connection is available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => controller.canvasQuery.refetch()}>
                <RefreshCcw /> Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-0 flex-1"
        >
          <ResizablePanel
            id={WORKSHOP_SIDEBAR_PANEL_ID}
            panelRef={sidebarPanelRef}
            collapsible
            defaultSize={WORKSHOP_SIDEBAR_DEFAULT_SIZE}
            minSize={WORKSHOP_SIDEBAR_MIN_SIZE}
            maxSize={WORKSHOP_SIDEBAR_MAX_SIZE}
            collapsedSize={WORKSHOP_SIDEBAR_COLLAPSED_SIZE}
            onResize={handleSidebarResize}
            className="hidden min-w-0 md:flex"
          >
            <WorkshopSidebar
              collapsed={isSidebarCollapsed}
              onCollapse={collapseSidebar}
              onExpand={expandSidebar}
            />
          </ResizablePanel>
          <ResizableHandle withHandle className="hidden md:flex" />
          <ResizablePanel
            id={WORKSHOP_CANVAS_PANEL_ID}
            minSize="30rem"
            className="min-w-0"
          >
            <div
              ref={stageWrapRef}
              className="relative h-full min-w-0 overflow-hidden"
            >
              {stageSize.width > 0 && stageSize.height > 0 ? (
                <WorkshopStage
                  width={stageSize.width}
                  height={stageSize.height}
                />
              ) : null}
              {objectCount === 0 && !isCompleted ? (
                <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
                  <Card className="pointer-events-auto w-sm border-dashed bg-background/90 text-center shadow-xl backdrop-blur">
                    <CardHeader>
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Bot />
                      </div>
                      <CardTitle>Turn the brief into a visual plan</CardTitle>
                      <CardDescription>
                        Ask AI to create the first structured workshop, or start
                        placing items yourself after a workshop snapshot exists.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => controller.setAiOpen(true)}>
                        <Sparkles /> Generate with AI
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
              {controller.isGenerating ? (
                <div className="absolute inset-0 z-20 grid place-items-center bg-background/45 backdrop-blur-[1px]">
                  <div className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-4 shadow-xl">
                    <LoaderCircle className="animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-semibold">
                        AI is arranging your plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Editing resumes when the saved snapshot arrives.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              <CanvasStatus />
              {<WorkshopToolbar isCompleted={isCompleted} />}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <TaskDetailDrawer
        key={detailsObjectId ?? "closed"}
        objectId={detailsObjectId}
      />
      <Sheet open={isExplorerOpen} onOpenChange={setExplorerOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Canvas explorer</SheetTitle>
          </SheetHeader>
          <WorkshopSidebar
            collapsed={false}
            onCollapse={() => setExplorerOpen(false)}
            onExpand={() => {}}
          />
        </SheetContent>
      </Sheet>
      <AIFloatingChat
        isCompleted={isCompleted}
        open={controller.isAiOpen}
        onOpenChange={controller.setAiOpen}
        messages={controller.messages}
        streamedText={controller.streamedText}
        status={controller.generationStatus}
        error={controller.generationError}
        isGenerating={controller.isGenerating}
        isDirty={controller.isDirty}
        onGenerate={controller.generate}
      />
    </div>
  );
}

export default WorkshopPage;
