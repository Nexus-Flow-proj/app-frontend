import {
  ActivityIcon,
  CheckCircle2Icon,
  KanbanSquareIcon,
  UsersRoundIcon,
} from "lucide-react";
import { ProjectStatCard } from "./ProjectStatCard";

interface ProjectStatsGridProps {
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  completedPercent: number;
}

export function ProjectStatsGrid({
  memberCount,
  taskCount,
  completedTaskCount,
  completedPercent,
}: ProjectStatsGridProps) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ProjectStatCard
        icon={UsersRoundIcon}
        label="Members"
        value={memberCount}
      />
      <ProjectStatCard icon={KanbanSquareIcon} label="Tasks" value={taskCount} />
      <ProjectStatCard
        icon={CheckCircle2Icon}
        label="Completed"
        value={completedTaskCount}
      />
      <ProjectStatCard
        icon={ActivityIcon}
        label="Progress"
        value={`${completedPercent}%`}
      />
    </div>
  );
}
