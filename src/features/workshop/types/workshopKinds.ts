export type WorkshopObjectKind =
  | "Project"
  | "Phase"
  | "Task"
  | "Milestone"
  | "Note"
  | "Decision"
  | "Risk";

export type SectionFrameKind = Extract<WorkshopObjectKind, "Project" | "Phase">;

export type StickyNoteKind = Extract<WorkshopObjectKind, "Note">;

export type TaskCardKind = Exclude<
  WorkshopObjectKind,
  "Project" | "Phase" | "Note"
>;
