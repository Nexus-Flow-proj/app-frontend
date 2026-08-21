import { useState } from "react";
import { CanvasObjectType, TaskPriority, TaskStatus } from "@/types/enums";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../constants";
import { useWorkshopStore } from "../store/workshopStore";
import type {
  CanvasObject,
  SectionFrameData,
  SectionFrameKind,
  StickyNoteData,
  TextBoxData,
  StickyNoteKind,
  TaskCardData,
  TaskCardKind,
  WorkshopObjectKind,
} from "../types";

export type TaskDetailFormState = {
  kind: WorkshopObjectKind;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  color: string;
  fontSize: number;
};

const defaultForm: TaskDetailFormState = {
  kind: "Task",
  title: "",
  description: "",
  status: TaskStatus.BACKLOG,
  priority: TaskPriority.MEDIUM,
  dueDate: "",
  color: "#FEF08A",
  fontSize: 18,
};

const TASK_KIND_OPTIONS: TaskCardKind[] = [
  "Task",
  "Milestone",
  "Decision",
  "Risk",
];
const STICKY_KIND_OPTIONS: StickyNoteKind[] = ["Note"];
const SECTION_KIND_OPTIONS: SectionFrameKind[] = ["Feature"];

function formFromObject(obj: CanvasObject | null): TaskDetailFormState {
  if (!obj) return defaultForm;

  if (obj.type === CanvasObjectType.TASK_CARD) {
    const data = obj.data as TaskCardData;
    return {
      kind: data.kind ?? "Task",
      title: data.title,
      description: data.description ?? "",
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ?? "",
      color: defaultForm.color,
      fontSize: defaultForm.fontSize,
    };
  }

  if (obj.type === CanvasObjectType.STICKY_NOTE) {
    const data = obj.data as StickyNoteData;
    return {
      ...defaultForm,
      kind: data.kind ?? "Note",
      title: "Sticky note",
      description: data.content,
      color: data.color,
    };
  }

  if (obj.type === CanvasObjectType.TEXT_BOX) {
    const data = obj.data as TextBoxData;
    return {
      ...defaultForm,
      kind: "Text",
      title: "Text box",
      description: data.content,
      color: data.color ?? "#334155",
      fontSize: data.fontSize ?? 18,
    };
  }

  if (obj.type === CanvasObjectType.SECTION_FRAME) {
    const data = obj.data as SectionFrameData;
    return {
      ...defaultForm,
      kind: "Feature",
      title: data.title,
      description: data.description ?? "",
      color: data.backgroundColor,
    };
  }

  return defaultForm;
}

export function useTaskDetailDrawer(objectId: Nullable<string>) {
  const objects = useWorkshopStore((s) => s.objects);
  const updateObject = useWorkshopStore((s) => s.updateObject);
  const deleteObject = useWorkshopStore((s) => s.deleteObject);
  const closeObjectDetails = useWorkshopStore((s) => s.closeObjectDetails);
  const obj = objectId
    ? (objects.find((item) => item.id === objectId) ?? null)
    : null;

  const [form, setForm] = useState<TaskDetailFormState>(() =>
    formFromObject(obj),
  );

  const setValue = <K extends keyof TaskDetailFormState>(
    key: K,
    value: TaskDetailFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!obj || !form.title.trim()) return;

    if (obj.type === CanvasObjectType.TASK_CARD) {
      updateObject(obj.id, {
        data: {
          ...(obj.data as TaskCardData),
          kind: form.kind as TaskCardKind,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
        },
      });
    }

    if (obj.type === CanvasObjectType.STICKY_NOTE) {
      updateObject(obj.id, {
        data: {
          ...(obj.data as StickyNoteData),
          kind: form.kind as StickyNoteKind,
          content: form.description.trim() || "Empty note",
          color: form.color,
        },
      });
    }

    if (obj.type === CanvasObjectType.TEXT_BOX) {
      updateObject(obj.id, {
        data: {
          ...(obj.data as TextBoxData),
          kind: "Text",
          content: form.description.trim() || "Text",
          color: form.color,
          fontSize: form.fontSize,
        },
      });
    }

    if (obj.type === CanvasObjectType.SECTION_FRAME) {
      updateObject(obj.id, {
        data: {
          ...(obj.data as SectionFrameData),
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          featureName: form.title.trim(),
        },
      });
    }

    closeObjectDetails();
  };

  const handleDelete = () => {
    if (!obj) return;
    deleteObject(obj.id);
    closeObjectDetails();
  };

  const isTask = obj?.type === CanvasObjectType.TASK_CARD;
  const isSticky = obj?.type === CanvasObjectType.STICKY_NOTE;
  const isText = obj?.type === CanvasObjectType.TEXT_BOX;
  const isSection = obj?.type === CanvasObjectType.SECTION_FRAME;
  const kindOptions: WorkshopObjectKind[] =
    obj?.type === CanvasObjectType.SECTION_FRAME
      ? SECTION_KIND_OPTIONS
      : isSticky
        ? STICKY_KIND_OPTIONS
        : TASK_KIND_OPTIONS;

  return {
    obj,
    form,
    isTask,
    isSticky,
    isText,
    isSection,
    kindOptions,
    statusCfg: STATUS_CONFIG[form.status] ?? STATUS_CONFIG.BACKLOG,
    priorityCfg: PRIORITY_CONFIG[form.priority] ?? PRIORITY_CONFIG.LOW,
    setValue,
    handleSave,
    handleDelete,
    closeObjectDetails,
  };
}
