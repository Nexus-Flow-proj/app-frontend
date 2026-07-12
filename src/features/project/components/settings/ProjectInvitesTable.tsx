import Loading from "@/components/shared/loading/Loading";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dateformat } from "@/lib/format/date";
import { MailOpen } from "lucide-react";
import type { ProjectInviteListItem } from "../../types";
import { ProjectInviteActionButton } from "./ProjectInviteActionButton";
import { ProjectInviteStatusBadge } from "./ProjectInviteStatusBadge";

interface ProjectInvitesTableProps {
  invites: ProjectInviteListItem[];
  isLoading?: boolean;
  isBusy?: boolean;
  onCancel: (inviteId: string) => void;
}

function formatOptionalDate(value?: string | null) {
  return value ? dateformat(value) : "Not set";
}

function getInviteRoleName(invite: ProjectInviteListItem) {
  return invite.role?.name ?? invite.roleName ?? invite.roleLabel ?? "Project role";
}

export function ProjectInvitesTable({
  invites,
  isLoading = false,
  isBusy = false,
  onCancel,
}: ProjectInvitesTableProps) {
  if (isLoading) {
    return <Loading text="Loading invites..." />;
  }

  if (invites.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailOpen className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No invites yet</EmptyTitle>
          <EmptyDescription>
            Invitations sent to this project will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="min-w-52 font-medium">
                {invite.email}
              </TableCell>
              <TableCell>{getInviteRoleName(invite)}</TableCell>
              <TableCell>
                <ProjectInviteStatusBadge status={invite.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatOptionalDate(invite.createdAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatOptionalDate(invite.expiresAt)}
              </TableCell>
              <TableCell className="text-right">
                <ProjectInviteActionButton
                  invite={invite}
                  disabled={isBusy}
                  onCancel={onCancel}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
