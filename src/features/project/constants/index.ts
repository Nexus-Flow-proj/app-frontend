import { ProjectRole } from "@/types";

export const PROJECT_COLORS = [
  { name: "Ocean", value: "#2563eb", swatchClassName: "bg-blue-600" },
  { name: "Emerald", value: "#059669", swatchClassName: "bg-emerald-600" },
  { name: "Violet", value: "#7c3aed", swatchClassName: "bg-violet-600" },
  { name: "Rose", value: "#e11d48", swatchClassName: "bg-rose-600" },
  { name: "Amber", value: "#d97706", swatchClassName: "bg-amber-600" },
  { name: "Slate", value: "#475569", swatchClassName: "bg-slate-600" },
] as const;

export const DEFAULT_PROJECT_COLOR = PROJECT_COLORS[0].value;

export const PROJECT_LIMITS = {
  nameMin: 3,
  nameMax: 60,
  descriptionMax: 280,
} as const;

export const PROJECT_ROLE_OPTIONS = [
  {
    value: ProjectRole.EDITOR,
    label: "Editor",
    description: "Can collaborate on project work.",
  },
  {
    value: ProjectRole.VIEWER,
    label: "Viewer",
    description: "Can view project work.",
  },
  {
    value: ProjectRole.OWNER,
    label: "Owner",
    description: "Full project ownership.",
  },
] as const;
