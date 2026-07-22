export const DRAFT_COLORS = [
  { name: "Ocean", value: "#2563eb", swatchClassName: "bg-blue-600" },
  { name: "Emerald", value: "#059669", swatchClassName: "bg-emerald-600" },
  { name: "Violet", value: "#7c3aed", swatchClassName: "bg-violet-600" },
  { name: "Rose", value: "#e11d48", swatchClassName: "bg-rose-600" },
  { name: "Amber", value: "#d97706", swatchClassName: "bg-amber-600" },
  { name: "Slate", value: "#475569", swatchClassName: "bg-slate-600" },
] as const;

export const DEFAULT_DRAFT_COLOR = DRAFT_COLORS[0].value;

export const ProjectCategory = {
  PROGRAMMING: "programming",
  MARKETING: "marketing",
  DESIGN: "design",
  GENERAL: "general",
} as const;

export type ProjectCategory =
  (typeof ProjectCategory)[keyof typeof ProjectCategory];

export const DRAFT_CATEGORY_OPTIONS = [
  { label: "Programming", value: ProjectCategory.PROGRAMMING },
  { label: "Marketing", value: ProjectCategory.MARKETING },
  { label: "Design", value: ProjectCategory.DESIGN },
  { label: "General", value: ProjectCategory.GENERAL },
] as const;

export const CUSTOM_OPTION_VALUE = "__custom__";

export const PROGRAMMING_TARGET_STACK_OPTIONS = [
  "React + Node.js",
  "React + NestJS",
  "Vue + Laravel",
  "Python + FastAPI",
  "React Native + Firebase",
  CUSTOM_OPTION_VALUE,
] as const;

export const PROGRAMMING_LANGUAGE_OPTIONS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "PHP",
  "Dart",
  CUSTOM_OPTION_VALUE,
] as const;

export const MARKETING_CHANNEL_OPTIONS = [
  "SEO + content",
  "Paid ads",
  "Email marketing",
  "Social media",
  "Influencer campaigns",
  CUSTOM_OPTION_VALUE,
] as const;

export const MARKETING_AUDIENCE_OPTIONS = [
  "B2B teams",
  "Startup founders",
  "Students",
  "Local customers",
  "Enterprise buyers",
  CUSTOM_OPTION_VALUE,
] as const;

export const DESIGN_DELIVERABLE_OPTIONS = [
  "Wireframes",
  "High-fidelity UI",
  "Design system",
  "Brand identity",
  "Clickable prototype",
  CUSTOM_OPTION_VALUE,
] as const;

export const DESIGN_TOOL_OPTIONS = [
  "Figma",
  "FigJam",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Framer",
  CUSTOM_OPTION_VALUE,
] as const;

export const DRAFT_LIMITS = {
  titleMin: 3,
  titleMax: 80,
  descriptionMin: 10,
  descriptionMax: 600,
  customConstraintMin: 1,
  customConstraintMax: 180,
  estimatedTimeMin: 1,
  estimatedTimeMax: 104,
} as const;
