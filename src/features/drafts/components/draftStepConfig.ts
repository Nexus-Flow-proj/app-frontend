import {
  ClipboardCheck,
  FileText,
  Layers3,
  type LucideIcon,
} from "lucide-react";

export interface DraftStepConfig {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const DRAFT_FORM_STEPS: DraftStepConfig[] = [
  {
    title: "Basics",
    description: "Name, brief, and visual identity",
    icon: FileText,
  },
  {
    title: "Context",
    description: "Category, stack, and timeline",
    icon: Layers3,
  },
  {
    title: "Review",
    description: "Confirm before workshop",
    icon: ClipboardCheck,
  },
];
