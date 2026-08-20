import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CloudOff,
  Download,
  FileJson,
  Image as ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MyEmpty } from "@/components/shared/feedback/MyEmpty";
import ModeToggle from "@/components/shared/ModeToggle";
import { ProjectWorkspaceNavigation } from "@/components/shared/ProjectWorkspaceNavigation";
import { useProjectTasks } from "@/features/boards/hooks/useProjectTasks";
import type { BoardMember, Task } from "@/features/boards/types";
import { useProject } from "@/features/project/hooks";
import { useProjectMembers } from "@/features/project/hooks/useProjectMembers";
import { useAuthStore } from "@/store/authStore";
import { CanvasSearchDialog } from "../components/canvas/CanvasSearchDialog";
import {
  MiniWorkshopEditor,
  type MiniWorkshopEditorHandle,
} from "../components/canvas/MiniWorkshopEditor";
import { ObjectEditorDialog } from "../components/canvas/ObjectEditorDialog";
import { ExistingTaskPickerDialog } from "../components/tasks/ExistingTaskPickerDialog";
import { PersonalTaskDialog } from "../components/tasks/PersonalTaskDialog";
import { TaskPlacementDialog } from "../components/tasks/TaskPlacementDialog";
import { TemplateGalleryDialog } from "../components/templates/TemplateGalleryDialog";
import { useMiniWorkshop } from "../hooks/useMiniWorkshop";
import { useSaveMiniWorkshop } from "../hooks/useSaveMiniWorkshop";
import { useMiniWorkshopStore } from "../store/miniWorkshopStore";
import type {
  CanvasPoint,
  MiniCanvasObject,
  WhiteboardTemplate,
} from "../types";
import {
  compressMiniWorkshopImage,
  downloadDataUrl,
  downloadJson,
} from "../utils/images";
import {
  createBoardTaskObject,
  createImageObject,
  createPersonalTaskObject,
} from "../utils/objectFactory";
import type { PersonalTaskDto } from "../validation/personal-task.schema";
import { UnsavedChangesDialog } from "@/features/workshop/components/UnsavedChangesDialog";

function memberName(member: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  return `${member.firstName} ${member.lastName}`.trim() || member.email;
}

function fileName(name: string, extension: string) {
  return `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mini-workshop"
  }.${extension}`;
}

function MiniWorkshopPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id ?? "");
  const workshopQuery = useMiniWorkshop(id);
  const projectQuery = useProject(id);
  const tasksQuery = useProjectTasks(id);
  const membersQuery = useProjectMembers(id);
  const saveMutation = useSaveMiniWorkshop(id);
  const editorRef = useRef<MiniWorkshopEditorHandle>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const dirty = useMiniWorkshopStore((state) => state.dirty);
  const objectsById = useMiniWorkshopStore((state) => state.objectsById);
  const objectOrder = useMiniWorkshopStore((state) => state.objectOrder);
  const loadScene = useMiniWorkshopStore((state) => state.loadScene);
  const scene = useMiniWorkshopStore((state) => state.scene);
  const markClean = useMiniWorkshopStore((state) => state.markClean);
  const addObjects = useMiniWorkshopStore((state) => state.addObjects);
  const addAsset = useMiniWorkshopStore((state) => state.addAsset);
  const updateObject = useMiniWorkshopStore((state) => state.updateObject);

  const [placementPoint, setPlacementPoint] = useState<CanvasPoint>({
    x: 0,
    y: 0,
  });
  const [placementDialogOpen, setPlacementDialogOpen] = useState(false);
  const [personalTaskOpen, setPersonalTaskOpen] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<MiniCanvasObject | null>(
    null,
  );

  const tasks = tasksQuery.data?.tasks ?? [];
  const members = useMemo<BoardMember[]>(
    () =>
      (membersQuery.data ?? []).map((member) => ({
        id: member.userId,
        name: memberName(member),
        avatar: member.avatarUrl ?? undefined,
        avatarUrl: member.avatarUrl ?? undefined,
        isActive: member.isOnline,
      })),
    [membersQuery.data],
  );
  const objects = useMemo(
    () => objectOrder.map((objectId) => objectsById[objectId]).filter(Boolean),
    [objectOrder, objectsById],
  );

  useEffect(() => {
    if (workshopQuery.data?.schemaVersion === 2)
      loadScene(workshopQuery.data.scene);
  }, [
    loadScene,
    workshopQuery.data?.id,
    workshopQuery.data?.revision,
    workshopQuery.data?.scene,
    workshopQuery.data?.schemaVersion,
  ]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const nextZ = useCallback(
    () =>
      objectOrder.length
        ? Math.max(
            ...objectOrder.map(
              (objectId) => objectsById[objectId]?.zIndex ?? 0,
            ),
          ) + 1
        : 1,
    [objectOrder, objectsById],
  );
  const handleTaskPlacement = useCallback((point: CanvasPoint) => {
    setPlacementPoint(point);
    setPlacementDialogOpen(true);
  }, []);
  const handlePersonalTask = useCallback(
    (task: PersonalTaskDto) => {
      addObjects([
        createPersonalTaskObject(
          { x: placementPoint.x - 170, y: placementPoint.y - 85 },
          task,
          nextZ(),
        ),
      ]);
      setPersonalTaskOpen(false);
    },
    [addObjects, nextZ, placementPoint],
  );
  const handleExistingTasks = useCallback(
    (selectedTasks: Task[]) => {
      const columns = Math.min(
        3,
        Math.max(1, Math.ceil(Math.sqrt(selectedTasks.length))),
      );
      addObjects(
        selectedTasks.map((task, index) =>
          createBoardTaskObject(
            {
              x: placementPoint.x + (index % columns) * 370 - 170,
              y: placementPoint.y + Math.floor(index / columns) * 200 - 85,
            },
            task,
            nextZ() + index,
          ),
        ),
      );
    },
    [addObjects, nextZ, placementPoint],
  );
  const handleInsertTemplate = useCallback(
    (template: WhiteboardTemplate) => {
      const center = editorRef.current?.viewportCenter() ?? { x: 0, y: 0 };
      const built = template.build({ x: center.x - 450, y: center.y - 280 });
      addObjects(built.objects, built.connections);
    },
    [addObjects],
  );

  const handleImage = useCallback(
    async (file?: File) => {
      if (!file) return;
      try {
        const asset = await compressMiniWorkshopImage(file);
        const center = editorRef.current?.viewportCenter() ?? { x: 0, y: 0 };
        addAsset(asset);
        addObjects([
          createImageObject(
            { x: center.x - 160, y: center.y - 110 },
            asset,
            nextZ(),
          ),
        ]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add this image.",
        );
      }
    },
    [addAsset, addObjects, nextZ],
  );

  const handleEditSave = useCallback(
    (object: MiniCanvasObject, primary: string, secondary: string) => {
      let data: MiniCanvasObject["data"] = object.data;
      if (object.type === "SHAPE") data = { ...object.data, text: primary };
      if (object.type === "TEXT" || object.type === "STICKY_NOTE")
        data = { text: primary };
      if (object.type === "FRAME")
        data = { title: primary, description: secondary };
      if (object.type === "PERSONAL_TASK")
        data = { ...object.data, title: primary, description: secondary };
      if (object.type === "IMAGE") data = { ...object.data, alt: primary };
      updateObject(object.id, { data } as Partial<MiniCanvasObject>);
      setEditingObject(null);
    },
    [updateObject],
  );

  const handleSave = useCallback(() => {
    const document = workshopQuery.data;
    if (!document) return;
    saveMutation.mutate(
      { schemaVersion: 2, revision: document.revision, scene: scene() },
      { onSuccess: () => markClean() },
    );
  }, [markClean, saveMutation, scene, workshopQuery.data]);

  if (workshopQuery.isLoading || projectQuery.isLoading)
    return (
      <div className="flex h-screen flex-col bg-background p-4">
        <Skeleton className="mb-4 h-12 w-full" />
        <Skeleton className="min-h-0 flex-1 rounded-xl" />
      </div>
    );
  if (workshopQuery.isError || !workshopQuery.data)
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <MyEmpty
          icon={CloudOff}
          title="Mini Workshop could not be loaded"
          description="Check the Mini Workshop backend contract and try again. Your Team Board was not changed."
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go back
            </Button>
            <Button onClick={() => workshopQuery.refetch()}>Try again</Button>
          </div>
        </MyEmpty>
      </div>
    );

  const projectName = projectQuery.data?.name || "Project";
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <header className="z-30 flex min-h-16 shrink-0 items-center gap-3 border-b bg-sidebar px-4 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-semibold">{projectName}</h1>
            <Badge variant={dirty ? "secondary" : "outline"}>
              {dirty ? "Unsaved" : "Saved"}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Private Mini Workshop · your visual thinking space
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ProjectWorkspaceNavigation
            projectId={id}
            draftId={projectQuery.data?.draftId}
            current="mini-workshop"
          />
          <Input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Upload canvas image"
            onChange={(event) => {
              void handleImage(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  const url = editorRef.current?.exportPng();
                  if (url) downloadDataUrl(url, fileName(projectName, "png"));
                }}
              >
                <ImageIcon />
                PNG image
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  downloadJson(
                    { schemaVersion: 2, scene: scene() },
                    fileName(projectName, "json"),
                  )
                }
              >
                <FileJson />
                Editable JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            disabled={!dirty || saveMutation.isPending}
            onClick={handleSave}
          >
            {saveMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span className="hidden sm:inline">
              {saveMutation.isPending ? "Saving" : "Save"}
            </span>
          </Button>
        </div>
      </header>
      <main className="relative min-h-0 flex-1">
        <MiniWorkshopEditor
          ref={editorRef}
          tasks={tasks}
          onTaskPlacement={handleTaskPlacement}
          onTemplates={() => setTemplatesOpen(true)}
          onImage={() => imageInputRef.current?.click()}
          onSearch={() => setSearchOpen(true)}
          onEditObject={setEditingObject}
        />
      </main>

      <TaskPlacementDialog
        open={placementDialogOpen}
        onOpenChange={setPlacementDialogOpen}
        onCreatePersonal={() => {
          setPlacementDialogOpen(false);
          setPersonalTaskOpen(true);
        }}
        onChooseExisting={() => {
          setPlacementDialogOpen(false);
          setTaskPickerOpen(true);
        }}
      />
      <PersonalTaskDialog
        open={personalTaskOpen}
        onOpenChange={setPersonalTaskOpen}
        onSubmit={handlePersonalTask}
      />
      <ExistingTaskPickerDialog
        open={taskPickerOpen}
        tasks={tasks}
        members={members}
        currentUserId={currentUserId}
        isLoading={tasksQuery.isLoading}
        onOpenChange={setTaskPickerOpen}
        onAdd={handleExistingTasks}
      />
      <TemplateGalleryDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onInsert={handleInsertTemplate}
      />
      <CanvasSearchDialog
        open={searchOpen}
        objects={objects}
        onOpenChange={setSearchOpen}
        onChoose={(object) => editorRef.current?.centerObject(object)}
      />
      <ObjectEditorDialog
        key={editingObject?.id ?? "closed"}
        object={editingObject}
        onOpenChange={(open) => {
          if (!open) setEditingObject(null);
        }}
        onSave={handleEditSave}
      />

      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
      {/* <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              Your latest Mini Workshop content changes have not been saved.
              Viewport movement alone does not trigger this warning.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}

export default MiniWorkshopPage;
