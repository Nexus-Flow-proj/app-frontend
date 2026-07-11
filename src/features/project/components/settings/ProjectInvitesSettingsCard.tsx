import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCancelProjectInvite,
  useProjectInvites,
} from "../../hooks";
import type { ProjectDetails, ProjectInviteListItem } from "../../types";
import { ProjectInvitesTable } from "./ProjectInvitesTable";

interface ProjectInvitesSettingsCardProps {
  project: ProjectDetails;
}

const INVITES_PAGE_LIMIT = 10;

interface InvitePayloadWithMeta {
  data?: unknown;
  invites?: unknown;
  items?: unknown;
  results?: unknown;
  meta?: unknown;
}

function isInvitePayloadWithMeta(value: unknown): value is InvitePayloadWithMeta {
  return typeof value === "object" && value !== null;
}

function getInviteList(value: unknown): ProjectInviteListItem[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isInvitePayloadWithMeta(value)) {
    return [];
  }

  if (Array.isArray(value.invites)) {
    return value.invites;
  }

  if (Array.isArray(value.items)) {
    return value.items;
  }

  if (Array.isArray(value.results)) {
    return value.results;
  }

  if (Array.isArray(value.data)) {
    return value.data;
  }

  return [];
}

function getNestedMeta(value: unknown) {
  return isInvitePayloadWithMeta(value) ? value.meta : undefined;
}

function isPaginationMeta(value: unknown): value is PaginationMeta {
  return (
    typeof value === "object" &&
    value !== null &&
    "page" in value &&
    "totalPages" in value &&
    "hasNext" in value &&
    "hasPrev" in value
  );
}

export function ProjectInvitesSettingsCard({
  project,
}: ProjectInvitesSettingsCardProps) {
  const [page, setPage] = useState(1);
  const invitesQuery = useProjectInvites(project.id, {
    page,
    limit: INVITES_PAGE_LIMIT,
  });
  const cancelInvite = useCancelProjectInvite();

  const responseData = invitesQuery.data?.data;
  const invites = getInviteList(responseData);
  const metaValue = invitesQuery.data?.meta ?? getNestedMeta(responseData);
  const meta = isPaginationMeta(metaValue) ? metaValue : undefined;
  const isBusy = cancelInvite.isPending;

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="size-4 text-muted-foreground" />
          Project invites
        </CardTitle>
        <CardDescription>
          Review invitation status and cancel pending access links.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => invitesQuery.refetch()}
            disabled={invitesQuery.isFetching}
          >
            Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        {invitesQuery.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Could not load project invites. Try refreshing the table.
          </div>
        ) : null}

        <ProjectInvitesTable
          invites={invites}
          isLoading={invitesQuery.isLoading}
          isBusy={isBusy}
          onCancel={(inviteId) =>
            cancelInvite.mutate({ projectId: project.id, inviteToken: inviteId })
          }
        />

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!meta.hasPrev || invitesQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!meta.hasNext || invitesQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
