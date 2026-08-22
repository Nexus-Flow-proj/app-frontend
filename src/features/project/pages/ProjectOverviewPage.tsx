import { useNavigate, useParams } from "react-router";
import { dateformat } from "@/lib/format/date";
import {
  ProjectActivityFeedCard,
  ProjectAwayBriefCard,
  ProjectDetailsCard,
  ProjectOverviewHero,
  ProjectOverviewSkeleton,
  ProjectStatsGrid,
  ProjectUnavailableState,
  type ProjectActivityItem,
} from "../components/overview";
import { useProjectAccess, useProjectSummary } from "../hooks";
import {
  canManageProjectSettings,
  canReadBoard,
} from "../utils/rolePermissions";
import { isProjectAdmin } from "../utils/roles";

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    project,
    role,
    isProjectMember,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProjectAccess(id);
  const {
    data: projectSummary,
    isFetching: isProjectSummaryFetching,
    refetch: refetchProjectSummary,
  } = useProjectSummary(id);

  if (isProjectLoading) {
    return <ProjectOverviewSkeleton />;
  }

  if (isProjectError || !project) {
    return <ProjectUnavailableState />;
  }

  const taskCount = project.tasksCount ?? 0;
  const completedTaskCount = project.completedTasks ?? 0;
  const completedPercent = project.progress ?? 0;
  const createdAt = project.created_at ?? "";
  const updatedAt = project.updated_at ?? "";
  const currentMember = project.currentMember ?? null;
  const projectAdmin =
    currentMember &&
    (currentMember.userId === project.adminId || isProjectAdmin(currentMember))
      ? currentMember
      : null;
  const canManageSettings = role ? canManageProjectSettings(role) : false;
  const canOpenWorkshop = isProjectMember;
  const canOpenBoard = role ? canReadBoard(role) : false;
  const canOpenMiniWorkshop = isProjectMember;
  const adminName = projectAdmin
    ? `${projectAdmin.firstName} ${projectAdmin.lastName}`.trim() ||
      projectAdmin.email
    : "Project admin";
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
          canOpenMiniWorkshop={canOpenMiniWorkshop}
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
          <ProjectAwayBriefCard
            lastVisitedAt={project.currentMember?.lastVisitedAt}
            summary={projectSummary}
            isGenerating={isProjectSummaryFetching}
            onGenerateBrief={() => {
              void refetchProjectSummary();
            }}
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
