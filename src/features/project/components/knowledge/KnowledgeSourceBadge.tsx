import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KnowledgeSourceType } from "../../types";
import {
  getKnowledgeBadgeClassName,
  getKnowledgeSourceLabel,
} from "./knowledge-display";

interface KnowledgeSourceBadgeProps {
  sourceType: KnowledgeSourceType;
  className?: string;
}

export function KnowledgeSourceBadge({
  sourceType,
  className,
}: KnowledgeSourceBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-normal",
        getKnowledgeBadgeClassName(sourceType),
        className,
      )}
    >
      {getKnowledgeSourceLabel(sourceType)}
    </Badge>
  );
}
