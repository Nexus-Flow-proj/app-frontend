import { useMemo } from "react";
import { useParams } from "react-router";
import Loading from "@/components/shared/loading/Loading";
import {
  InviteMemberCard,
  ProjectMembersHeader,
  ProjectMembersTableCard,
  sortProjectMembers,
} from "../components/members";
import { ProjectUnavailableState } from "../components/overview";
import {
  useProjectAccess,
  useProjectMembers,
  useProjectRoles,
  useRemoveProjectMember,
} from "../hooks";
import {
  canChangeMemberRoles,
  canInviteMembers,
  canRemoveMembers,
} from "../utils/rolePermissions";

export default function ProjectMembersPage() {
  const { id } = useParams<{ id: string }>();
  const {
    project,
    currentMember,
    role,
    isLoading: isProjectLoading,
    isError,
  } = useProjectAccess(id);
  const { data: members = [], isLoading: isMembersLoading } =
    useProjectMembers(id);
  const { data: roles = [], isLoading: isRolesLoading } = useProjectRoles(id);
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveProjectMember();

  const sortedMembers = useMemo(() => sortProjectMembers(members), [members]);
  const canInvite = role ? canInviteMembers(role) : false;
  const canRemove = role ? canRemoveMembers(role) : false;
  const canChangeRoles = role ? canChangeMemberRoles(role) : false;

  if (isProjectLoading) {
    return <Loading text="Loading project members..." />;
  }

  if (isError || !project || !id) {
    return <ProjectUnavailableState />;
  }

  function handleRemoveMember(projectId: string, memberId: string) {
    removeMember({ projectId, memberId });
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-1 py-1">
      <ProjectMembersHeader project={project} />
      {canInvite && <InviteMemberCard projectId={id} />}
      <ProjectMembersTableCard
        projectId={id}
        members={sortedMembers}
        roles={roles}
        currentMember={currentMember}
        canChangeRoles={canChangeRoles}
        canRemoveMembers={canRemove}
        isLoading={isMembersLoading || isRolesLoading}
        isBusy={isRemovingMember}
        onRemove={handleRemoveMember}
      />
    </main>
  );
}
