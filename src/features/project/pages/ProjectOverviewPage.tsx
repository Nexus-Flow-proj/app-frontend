import { useNavigate, useParams } from "react-router";
import { dateformat } from "@/lib/format/date";
import { useAuthStore } from "@/store";
import {
  ProjectActivityFeedCard,
  ProjectDetailsCard,
  ProjectMembersCard,
  ProjectOverviewHero,
  ProjectOverviewSkeleton,
  ProjectStatsGrid,
  ProjectUnavailableState,
  type ProjectActivityItem,
} from "../components/overview";
import { useProject, useProjectMembers } from "../hooks";
import { findProjectMemberForUser, isProjectOwner } from "../utils/roles";

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProject(id);
  const { data: members = [], isLoading: isMembersLoading } =
    useProjectMembers(id);

  if (isProjectLoading) {
    return <ProjectOverviewSkeleton />;
  }

  if (isProjectError || !project) {
    return <ProjectUnavailableState />;
  }

  const taskCount = project.taskCount ?? 0;
  const completedTaskCount = project.completedTaskCount ?? 0;
  const completedPercent =
    taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
  const createdAt = project.created_at ?? "";
  const updatedAt = project.updated_at ?? "";
  const ownerCount = members.filter((member) => isProjectOwner(member)).length;
  const owner = members.find((member) => isProjectOwner(member)) ?? members[0];
  const currentMember = findProjectMemberForUser(members, user);
  const canManageSettings = isProjectOwner(currentMember);
  const ownerName = owner
    ? `${owner.firstName} ${owner.lastName}`.trim() || owner.email
    : "Not loaded";
  const activityFeed: ProjectActivityItem[] = [
    {
      title: "Project created",
      description: `${project.name} was created${owner ? ` by ${ownerName}` : ""}.`,
      time: createdAt ? dateformat(createdAt) : "Recently",
    },
    {
      title: "Owner role assigned",
      description: `${ownerName} is currently listed as the project owner/admin.`,
      time: createdAt ? dateformat(createdAt) : "Recently",
    },
    {
      title: "Workspace initialized",
      description: "Workshop, board, settings, and member areas are ready.",
      time: updatedAt ? dateformat(updatedAt) : "Today",
    },
  ];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-1 py-1">
      <section className="rounded-lg border bg-muted/30 p-6">
        <ProjectOverviewHero
          project={project}
          createdAt={createdAt}
          canManageSettings={canManageSettings}
          onNavigate={navigate}
        />
        <ProjectStatsGrid
          memberCount={project.memberCount}
          taskCount={taskCount}
          completedTaskCount={completedTaskCount}
          completedPercent={completedPercent}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid">
          <ProjectMembersCard
            members={members}
            ownerCount={ownerCount}
            isLoading={isMembersLoading}
          />
        </div>

        <div className="grid gap-6">
          <ProjectDetailsCard
            project={project}
            ownerName={ownerName}
            createdAt={createdAt}
            updatedAt={updatedAt}
          />
          <ProjectActivityFeedCard activities={activityFeed} />
        </div>
      </section>
    </main>
  );
}
