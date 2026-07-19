import type { WorkshopObjectKind, WorkshopTool } from "../types";

export const TOOL_TO_KIND: Partial<Record<WorkshopTool, WorkshopObjectKind>> = {
  task: "Task",
  sticky: "Note",
  section: "Phase",
};
