export const TaskStatus = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskType = {
  FEATURE: "FEATURE",
  BUG: "BUG",
  IMPROVEMENT: "IMPROVEMENT",
  DOCUMENTATION: "DOCUMENTATION",
  RESEARCH: "RESEARCH",
  CHORE: "CHORE",
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const TaskSource = {
  MANUAL: "MANUAL",
  AI: "AI",
} as const;
export type TaskSource = (typeof TaskSource)[keyof typeof TaskSource];
