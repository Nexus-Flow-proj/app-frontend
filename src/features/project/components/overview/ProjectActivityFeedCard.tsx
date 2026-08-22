import { CalendarDaysIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProjectActivityItem {
  title: string;
  description: string;
  time: string;
}

interface ProjectActivityFeedCardProps {
  activities: ProjectActivityItem[];
}

export function ProjectActivityFeedCard({
  activities,
}: ProjectActivityFeedCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Activity feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="grid grid-cols-[2rem_1fr] gap-3"
            >
              <div className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CalendarDaysIcon className="size-4" />
              </div>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {activity.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
