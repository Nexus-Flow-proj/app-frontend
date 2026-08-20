export type WorkshopObjectKind =
  | "Project"
  | "Phase"
  | "Feature"
  | "Note"
  | "Text"
  | "Task"
  | "Milestone"
  | "Decision"
  | "Risk";

export type SectionFrameKind = Extract<WorkshopObjectKind, "Project" | "Phase" | "Feature">;

export type StickyNoteKind = Extract<WorkshopObjectKind, "Note">;

export type TaskCardKind = Exclude<
  WorkshopObjectKind,
  "Project" | "Phase" | "Feature" | "Note" | "Text"
>;
