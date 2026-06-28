import Loading from "@/components/shared/loading/Loading";
import type { User, ProjectRole } from "@/types";
import type { ProjectMemberSummary } from "../../types";
import { ProjectMemberRow } from "./ProjectMemberRow";

interface ProjectMembersTableProps {
  projectId: string;
  members: ProjectMemberSummary[];
  currentUser?: User | null;
  isLoading?: boolean;
  isBusy?: boolean;
  onRoleChange: (projectId: string, memberId: string, role: ProjectRole) => void;
  onRemove: (projectId: string, memberId: string) => void;
}

export function ProjectMembersTable({
  projectId,
  members,
  currentUser,
  isLoading = false,
  isBusy = false,
  onRoleChange,
  onRemove,
}: ProjectMembersTableProps) {
  if (isLoading) {
    return <Loading text="Loading members..." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-190 text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member) => (
            <ProjectMemberRow
              key={member.id}
              member={member}
              currentUser={currentUser}
              isBusy={isBusy}
              onRoleChange={(memberId, role) =>
                onRoleChange(projectId, memberId, role)
              }
              onRemove={(memberId) => onRemove(projectId, memberId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
