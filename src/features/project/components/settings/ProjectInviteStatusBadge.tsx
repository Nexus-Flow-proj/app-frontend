import { Badge } from "@/components/ui/badge";
import { InviteStatus } from "@/types";

interface ProjectInviteStatusBadgeProps {
  status: InviteStatus;
}

const STATUS_LABELS: Record<InviteStatus, string> = {
  [InviteStatus.PENDING]: "Pending",
  [InviteStatus.ACCEPTED]: "Accepted",
  [InviteStatus.REJECTED]: "Rejected",
  [InviteStatus.EXPIRED]: "Expired",
  [InviteStatus.REVOKED]: "Revoked",
  [InviteStatus.CANCELLED]: "Cancelled",
};

function normalizeInviteStatus(status: InviteStatus): InviteStatus {
  return status.toUpperCase() as InviteStatus;
}

export function ProjectInviteStatusBadge({
  status,
}: ProjectInviteStatusBadgeProps) {
  const normalizedStatus = normalizeInviteStatus(status);
  const label = STATUS_LABELS[normalizedStatus] ?? status;

  if (normalizedStatus === InviteStatus.PENDING) {
    return (
      <Badge variant="secondary" shape="rounded">
        {label}
      </Badge>
    );
  }

  if (normalizedStatus === InviteStatus.ACCEPTED) {
    return (
      <Badge shape="rounded" className="bg-emerald-600 text-white">
        {label}
      </Badge>
    );
  }

  if (
    normalizedStatus === InviteStatus.REVOKED ||
    normalizedStatus === InviteStatus.CANCELLED
  ) {
    return (
      <Badge variant="destructive" shape="rounded">
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" shape="rounded">
      {label}
    </Badge>
  );
}
