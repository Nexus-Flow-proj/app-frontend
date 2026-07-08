import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { RecentActivityItem } from "../types";
import { formatRelativeTime } from "../utils/format";

interface RecentActivityProps {
  items: RecentActivityItem[];
  onViewAll?: () => void;
}

// Fixed accent dots to visually separate feed entries - not theme-dependent.
const DOT_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-primary",
  "bg-amber-500",
];

export function RecentActivity({ items, onViewAll }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  DOT_COLORS[index % DOT_COLORS.length]
                }`}
              />
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={item.actor.avatar} alt={item.actor.name} />
                <AvatarFallback className="text-xs">
                  {item.actor.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  <span className="font-medium">{item.actor.name}</span>{" "}
                  {item.message}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.projectName}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(item.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}