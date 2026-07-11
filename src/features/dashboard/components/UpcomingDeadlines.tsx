import { FileText, ImageIcon, Landmark, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UpcomingDeadline } from "../types";
import { formatDueLabel, priorityStyles } from "../utils/format";

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadline[];
  onViewAll?: () => void;
  /** false inside the drawer, where there's room to show the full text */
  truncate?: boolean;
}

const FALLBACK_ICONS = [FileText, Landmark, ImageIcon, ListChecks];

export function UpcomingDeadlines({
  deadlines,
  onViewAll,
  truncate = true,
}: UpcomingDeadlinesProps) {
  const textClass = truncate ? "truncate" : "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">
          Upcoming Deadlines
        </CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming deadlines.
          </p>
        ) : (
          <ul className="space-y-1">
            {deadlines.map((deadline, index) => {
              const Icon = FALLBACK_ICONS[index % FALLBACK_ICONS.length];
              const priority = priorityStyles[deadline.priority];

              return (
                <li
                  key={deadline.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 hover:bg-accent"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm text-foreground ${textClass}`}
                        title={truncate ? deadline.title : undefined}
                      >
                        {deadline.title}
                      </p>
                      <p className={`text-xs text-muted-foreground ${textClass}`}>
                        {deadline.projectName}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDueLabel(deadline.dueDate)}
                    </span>
                    <Badge variant="outline" className={priority.className}>
                      {priority.label}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}