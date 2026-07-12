import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { RecentActivityItem } from "../types";
import { formatRelativeTime } from "../utils/format";
import { DashboardCard } from "./DashboardCard";

interface RecentActivityProps {
  items: RecentActivityItem[];
  onViewAll?: () => void;
  truncate?: boolean;
  variant?: "card" | "sheet";
}

const DOT_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-primary",
  "bg-amber-500",
];

export function RecentActivity({
  items,
  onViewAll,
  truncate = true,
  variant = "card",
}: RecentActivityProps) {
  if (variant === "sheet") {
    return (
      <ActivityList
        items={items}
        truncate={truncate}
        className="space-y-1"
        itemClassName="rounded-lg border border-border/60 bg-card/60 p-3"
        avatarClassName="size-9"
      />
    );
  }

  return (
    <DashboardCard
      title="Recent activity"
      action={
        onViewAll ? (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity yet.</p>
      ) : (
        <ActivityList items={items} truncate={truncate} />
      )}
    </DashboardCard>
  );
}

interface ActivityListProps {
  items: RecentActivityItem[];
  truncate: boolean;
  className?: string;
  itemClassName?: string;
  avatarClassName?: string;
}

function ActivityList({
  items,
  truncate,
  className = "space-y-4",
  itemClassName = "",
  avatarClassName = "size-8",
}: ActivityListProps) {
  const textClass = truncate ? "truncate" : "";

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </p>
    );
  }

  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={item.id} className={`flex items-start gap-3 ${itemClassName}`}>
          <span
            className={`mt-3 h-2 w-2 shrink-0 rounded-full ${
              DOT_COLORS[index % DOT_COLORS.length]
            }`}
          />
          <Avatar className={`${avatarClassName} shrink-0`}>
            <AvatarImage src={item.actor.avatar} alt={item.actor.name} />
            <AvatarFallback className="text-xs">
              {item.actor.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p
                className={`text-sm leading-6 text-foreground ${textClass}`}
                title={
                  truncate ? `${item.actor.name} ${item.message}` : undefined
                }
              >
                <span className="font-medium">{item.actor.name}</span>{" "}
                {item.message}
              </p>
              <span className="shrink-0 pt-0.5 text-sm text-muted-foreground">
                {formatRelativeTime(item.createdAt)}
              </span>
            </div>
            <p className={`text-sm text-muted-foreground ${textClass}`}>
              {item.projectName}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
