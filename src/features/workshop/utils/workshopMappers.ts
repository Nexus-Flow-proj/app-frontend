import { CanvasObjectType } from "@/types/enums";
import type {
  Canvas,
  CanvasObject,
  CanvasObjectData,
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
  SaveWorkshopDto,
  WorkshopCanvasResponseDto,
  WorkshopObjectDto,
} from "../types";

export function fromWorkshopDto(dto: WorkshopCanvasResponseDto): Canvas {
  return {
    id: dto.id,
    draftId: dto.draftId,
    objects: dto.objects.map(fromObjectDto),
    viewport: dto.viewport ?? {
      x: dto.viewportX ?? 0,
      y: dto.viewportY ?? 0,
      scale: dto.zoomLevel ?? 1,
    },
    createdAt: "",
    updatedAt: "",
  };
}

export function fromObjectDto(dto: WorkshopObjectDto): CanvasObject {
  const data = { ...dto.data } as unknown as CanvasObjectData;

  if (dto.type === CanvasObjectType.TASK_CARD) {
    const task = data as TaskCardData;
    const record = dto.data;
    task.title = String(record.taskName ?? record.title ?? "Untitled task");
    task.description =
      String(record.taskDescription ?? record.description ?? "") || undefined;
    task.kind = "Task";
    task.status = (record.status as TaskCardData["status"]) ?? "BACKLOG";
    task.priority = (record.priority as TaskCardData["priority"]) ?? "MEDIUM";
  }

  if (dto.type === CanvasObjectType.SECTION_FRAME) {
    const frame = data as SectionFrameData;
    const record = dto.data;
    frame.title = String(
      record.featureName ?? record.title ?? "Untitled section",
    );
    frame.featureName = frame.title;
    frame.kind =
      record.kind === "Project" ||
      record.kind === "Phase" ||
      record.kind === "Feature"
        ? record.kind
        : "Feature";
    frame.backgroundColor = String(
      record.color ?? record.backgroundColor ?? "#f5f3ff",
    );
    frame.borderColor = String(record.borderColor ?? "#c4b5fd");
  }

  if (dto.type === CanvasObjectType.STICKY_NOTE) {
    const note = data as StickyNoteData;
    note.kind = "Note";
    note.content = String(dto.data.content ?? "");
    note.color = String(dto.data.color ?? "#fef08a");
    note.fontSize = Number(dto.data.fontSize ?? 14);
  }

  return {
    id: dto.id,
    workshopId: dto.workshopId,
    parentFrameId:
      dto.parentFrameId ??
      (dto.type === CanvasObjectType.TASK_CARD &&
      typeof dto.data.featureId === "string"
        ? dto.data.featureId
        : null),
    type: dto.type,
    x: dto.x ?? dto.positionX ?? 0,
    y: dto.y ?? dto.positionY ?? 0,
    width: dto.width,
    height: dto.height,
    rotation: dto.rotation ?? 0,
    zIndex: dto.zIndex,
    data,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toObjectDto(object: CanvasObject): WorkshopObjectDto {
  const source = object.data as unknown as Record<string, unknown>;
  let data: Record<string, unknown>;

  if (object.type === CanvasObjectType.SECTION_FRAME) {
    data = definedEntries({
      kind: source.kind,
      title: source.title,
      description: source.description,
      backgroundColor: source.backgroundColor,
      borderColor: source.borderColor,
    });
  } else if (object.type === CanvasObjectType.TASK_CARD) {
    data = definedEntries({
      kind: source.kind,
      title: source.title,
      description: source.description,
      featureId: object.parentFrameId ?? undefined,
    });
  } else if (object.type === CanvasObjectType.STICKY_NOTE) {
    data = definedEntries({
      kind: source.kind,
      content: source.content,
      color: source.color,
      fontSize: source.fontSize,
    });
  } else if (object.type === CanvasObjectType.TEXT_BOX) {
    data = definedEntries({
      kind: source.kind,
      content: source.content,
      color: source.color,
      fontSize: source.fontSize,
    });
  } else {
    data = definedEntries({
      title: source.title,
      description: source.description,
      content: source.content,
    });
  }

  return {
    id: object.id,
    type: object.type,
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    rotation: object.rotation,
    zIndex: object.zIndex,
    data,
  };
}

function definedEntries(
  values: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
}

export function toSaveWorkshopDto(
  canvas: Pick<Canvas, "viewport" | "objects">,
): SaveWorkshopDto {
  return {
    viewport: canvas.viewport,
    objects: canvas.objects.map(toObjectDto),
    connections: [],
  };
}
