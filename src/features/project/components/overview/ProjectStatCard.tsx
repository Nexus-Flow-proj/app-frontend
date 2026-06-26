import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectStatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
}

export function ProjectStatCard({
  icon: Icon,
  label,
  value,
}: ProjectStatCardProps) {
  return (
    <Card size="sm" className="rounded-lg bg-background/70 py-0">
      <CardContent className="flex min-h-32 flex-col justify-between p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Icon className="size-4 text-primary" />
          {label}
        </div>
        <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
