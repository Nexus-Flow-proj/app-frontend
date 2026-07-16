import { useNavigate, useParams } from "react-router";
import { dateformat } from "@/lib/format/date";
import { ROUTES } from "@/constants";
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
import { useProjectAccess, useProjectMembers } from "../hooks";
import {
  canManageProjectSettings,
  canReadBoard,
  canReadWorkshop,
} from "../utils/rolePermissions";
import { isProjectAdmin } from "../utils/roles";

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    project,
    role,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProjectAccess(id);
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
  const adminCount = members.filter((member) => isProjectAdmin(member)).length;
  const projectAdmin =
    members.find((member) => member.userId === project.adminId) ??
    members.find((member) => isProjectAdmin(member)) ??
    members[0];
  const canManageSettings = role ? canManageProjectSettings(role) : false;
  const canOpenWorkshop = role ? canReadWorkshop(role) : false;
  const canOpenBoard = role ? canReadBoard(role) : false;
  const adminName = projectAdmin
    ? `${projectAdmin.firstName} ${projectAdmin.lastName}`.trim() ||
      projectAdmin.email
    : "Not loaded";
  const activityFeed: ProjectActivityItem[] = [
    {
      title: "Project created",
      description: `${project.name} was created${
        projectAdmin ? ` by ${adminName}` : ""
      }.`,
      time: createdAt ? dateformat(createdAt) : "Recently",
    },
    {
      title: "Project admin assigned",
      description: `${adminName} is currently listed as a project admin.`,
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
          canOpenWorkshop={canOpenWorkshop}
          canOpenBoard={canOpenBoard}
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
            adminCount={adminCount}
            isLoading={isMembersLoading}
            onOpenMembers={() => navigate(ROUTES.PROJECT_MEMBERS(project.id))}
          />
        </div>

        <div className="grid gap-6">
          <ProjectDetailsCard
            project={project}
            adminName={adminName}
            createdAt={createdAt}
            updatedAt={updatedAt}
          />
          <ProjectActivityFeedCard activities={activityFeed} />
        </div>
      </section>
    </main>
  );
}
