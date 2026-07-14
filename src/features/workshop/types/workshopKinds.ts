export type WorkshopObjectKind = "Feature" | "Task" | "Note";

export type SectionFrameKind = Extract<WorkshopObjectKind, "Feature">;

export type StickyNoteKind = Extract<WorkshopObjectKind, "Note">;

export type TaskCardKind = Extract<WorkshopObjectKind, "Task">;
