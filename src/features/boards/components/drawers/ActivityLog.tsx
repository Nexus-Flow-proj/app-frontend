import { format } from "date-fns";
import UserLink from "@/components/shared/UserLink";
import type { ActivityEvent } from "../../types";

interface ActivityLogProps {
  events: ActivityEvent[];
}

export function ActivityLog({ events }: ActivityLogProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border pt-4 space-y-2.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Activity
      </p>
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-2.5">
          <div className="size-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground">
              <UserLink
                userId={event.actor.id}
                name={event.actor.name}
                className="font-medium text-foreground mr-1"
              />
              {event.action}
            </span>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              {format(new Date(event.createdAt), "MMM d 'at' h:mm a")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
