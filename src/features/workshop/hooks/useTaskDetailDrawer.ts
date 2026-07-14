import { useState } from "react";
import { CanvasObjectType } from "@/types/enums";
import { useWorkshopStore } from "../store/workshopStore";
import type {
  CanvasObject,
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
} from "../types";

export interface WorkshopDetailFormState {
  title: string;
  description: string;
  dueDate: string;
  noteContent: string;
  noteColor: string;
}

const emptyForm: WorkshopDetailFormState = {
  title: "",
  description: "",
  dueDate: "",
  noteContent: "",
  noteColor: "#FEF3C7",
};

function formFromObject(object: CanvasObject | null): WorkshopDetailFormState {
  if (!object) return emptyForm;

  if (object.type === CanvasObjectType.TASK_CARD) {
    const data = object.data as TaskCardData;
    return {
      ...emptyForm,
      title: data.title,
      description: data.description ?? "",
      dueDate: data.dueDate ?? "",
    };
  }

  if (object.type === CanvasObjectType.STICKY_NOTE) {
    const data = object.data as StickyNoteData;
    return {
      ...emptyForm,
      noteContent: data.content,
      noteColor: data.color,
    };
  }

  const data = object.data as SectionFrameData;
  return {
    ...emptyForm,
    title: data.title,
    description: data.description ?? "",
  };
}

export function useTaskDetailDrawer(objectId: Nullable<string>) {
  const objects = useWorkshopStore((state) => state.objects);
  const isEditing = useWorkshopStore((state) => state.isEditing);
  const updateObject = useWorkshopStore((state) => state.updateObject);
  const deleteObject = useWorkshopStore((state) => state.deleteObject);
  const closeObjectDetails = useWorkshopStore(
    (state) => state.closeObjectDetails,
  );
  const object = objectId
    ? (objects.find((item) => item.id === objectId) ?? null)
    : null;
  const [form, setForm] = useState<WorkshopDetailFormState>(() =>
    formFromObject(object),
  );
  const isTask = object?.type === CanvasObjectType.TASK_CARD;
  const isNote = object?.type === CanvasObjectType.STICKY_NOTE;
  const taskData = isTask ? (object.data as TaskCardData) : null;
  const parentFeature = taskData?.featureId
    ? objects.find((item) => item.id === taskData.featureId)
    : null;

  const setValue = <K extends keyof WorkshopDetailFormState>(
    key: K,
    value: WorkshopDetailFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!isEditing || !object) return;

    if (object.type === CanvasObjectType.TASK_CARD && form.title.trim()) {
      updateObject(object.id, {
        data: {
          ...(object.data as TaskCardData),
          kind: "Task",
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          dueDate: form.dueDate || undefined,
        },
      });
    } else if (
      object.type === CanvasObjectType.SECTION_FRAME &&
      form.title.trim()
    ) {
      updateObject(object.id, {
        data: {
          ...(object.data as SectionFrameData),
          kind: "Feature",
          title: form.title.trim(),
          description: form.description.trim() || undefined,
        },
      });
    } else if (
      object.type === CanvasObjectType.STICKY_NOTE &&
      form.noteContent.trim()
    ) {
      updateObject(object.id, {
        data: {
          ...(object.data as StickyNoteData),
          kind: "Note",
          content: form.noteContent.trim(),
          color: form.noteColor,
        },
      });
    } else {
      return;
    }

    closeObjectDetails();
  };

  const handleDelete = () => {
    if (!isEditing || !object) return;
    deleteObject(object.id);
    closeObjectDetails();
  };

  return {
    object,
    form,
    isEditing,
    isTask,
    isNote,
    parentFeatureTitle: parentFeature
      ? (parentFeature.data as SectionFrameData).title
      : null,
    canSave: isNote
      ? Boolean(form.noteContent.trim())
      : Boolean(form.title.trim()),
    setValue,
    handleSave,
    handleDelete,
    closeObjectDetails,
  };
}
