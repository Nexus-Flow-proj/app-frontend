import type { KnowledgeSourceType } from "../../types";

export const KNOWLEDGE_SOURCE_OPTIONS: Array<{
  value: KnowledgeSourceType;
  label: string;
  description: string;
}> = [
  {
    value: "policy",
    label: "Policy",
    description: "Strict team rules and assignment logic.",
  },
  {
    value: "guideline",
    label: "Guideline",
    description: "Coding, review, and delivery standards.",
  },
  {
    value: "decision",
    label: "Decision",
    description: "Architecture and product decisions.",
  },
  {
    value: "documentation",
    label: "Documentation",
    description: "Domain notes and project reference material.",
  },
];

export const KNOWLEDGE_TEMPLATES = [
  "Assign tasks to the developer with the lowest current workload.",
  "Bug fixes require unit tests before closing.",
  "Frontend tasks require React and TypeScript experience.",
] as const;

export function getKnowledgeSourceLabel(sourceType: KnowledgeSourceType) {
  return (
    KNOWLEDGE_SOURCE_OPTIONS.find((option) => option.value === sourceType)
      ?.label ?? "Policy"
  );
}

export function getKnowledgeBadgeClassName(sourceType: KnowledgeSourceType) {
  switch (sourceType) {
    case "guideline":
      return "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300";
    case "decision":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "documentation":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "policy":
    default:
      return "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";
  }
}
