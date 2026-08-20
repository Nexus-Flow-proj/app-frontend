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
    <>
      <div className="grid gap-3 md:hidden">
        {invites.map((invite) => (
          <article key={invite.id} className="rounded-lg border bg-card p-3">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="break-all text-sm font-semibold text-foreground">
                  {invite.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getInviteRoleName(invite)}
                </p>
              </div>
              <ProjectInviteStatusBadge status={invite.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="font-semibold text-muted-foreground">Sent</dt>
                <dd className="mt-1 text-foreground">
                  {formatOptionalDate(invite.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Expires</dt>
                <dd className="mt-1 text-foreground">
                  {formatOptionalDate(invite.expiresAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex justify-end">
              <ProjectInviteActionButton
                invite={invite}
                disabled={isBusy}
                onCancel={onCancel}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border md:block">
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
    </>
  );
}
