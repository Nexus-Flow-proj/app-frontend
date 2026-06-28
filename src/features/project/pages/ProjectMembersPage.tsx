import { useMemo } from "react";
import { useParams } from "react-router";
import Loading from "@/components/shared/loading/Loading";
import { useAuthStore } from "@/store";
import type { ProjectRole } from "@/types";
import {
  InviteMemberCard,
  ProjectMembersHeader,
  ProjectMembersTableCard,
  sortProjectMembers,
} from "../components/members";
import { ProjectUnavailableState } from "../components/overview";
import {
  useProject,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMemberRole,
} from "../hooks";

export default function ProjectMembersPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const {
    data: project,
    isLoading: isProjectLoading,
    isError,
  } = useProject(id);
  const { data: members = [], isLoading: isMembersLoading } =
    useProjectMembers(id);
  const { mutate: updateRole, isPending: isUpdatingRole } =
    useUpdateProjectMemberRole();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveProjectMember();

  const sortedMembers = useMemo(() => sortProjectMembers(members), [members]);

  if (isProjectLoading) {
    return <Loading text="Loading project members..." />;
  }

  if (isError || !project || !id) {
    return <ProjectUnavailableState />;
  }

  function handleRoleChange(
    projectId: string,
    memberId: string,
    roleLabel: ProjectRole,
  ) {
    updateRole({ projectId, memberId, roleLabel });
  }

  function handleRemoveMember(projectId: string, memberId: string) {
    removeMember({ projectId, memberId });
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-1 py-1">
      <ProjectMembersHeader project={project} />
      <InviteMemberCard projectId={id} />
      <ProjectMembersTableCard
        projectId={id}
        members={sortedMembers}
        currentUser={user}
        isLoading={isMembersLoading}
        isBusy={isUpdatingRole || isRemovingMember}
        onRoleChange={handleRoleChange}
        onRemove={handleRemoveMember}
      />
    </main>
  );
}
