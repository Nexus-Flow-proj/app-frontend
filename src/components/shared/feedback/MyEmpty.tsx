import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface MyEmptyProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  mediaClassName?: string;
  contentClassName?: string;
}

export function MyEmpty({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerClassName,
  mediaClassName,
  contentClassName,
}: MyEmptyProps) {
  return (
    <Empty className={cn("min-h-90", className)}>
      <EmptyHeader className={headerClassName}>
        {Icon && (
          <EmptyMedia
            variant="icon"
            className={cn(
              "size-16 rounded-2xl border border-border text-muted-foreground [&_svg:not([class*='size-'])]:size-7",
              mediaClassName,
            )}
          >
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && (
          <EmptyDescription className="text-xs">{description}</EmptyDescription>
        )}
      </EmptyHeader>

      {children && (
        <EmptyContent className={contentClassName}>{children}</EmptyContent>
      )}
    </Empty>
  );
}
