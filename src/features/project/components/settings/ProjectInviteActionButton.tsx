import { Ban, CircleSlash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteStatus } from "@/types";
import type { ProjectInviteListItem } from "../../types";

interface ProjectInviteActionButtonProps {
  invite: ProjectInviteListItem;
  disabled?: boolean;
  onCancel: (inviteId: string) => void;
}

export function ProjectInviteActionButton({
  invite,
  disabled = false,
  onCancel,
}: ProjectInviteActionButtonProps) {
  const inviteId = invite.id;
  const status = invite.status.toUpperCase() as InviteStatus;
  const isPending = status === InviteStatus.PENDING;
  const isMissingInviteId = !inviteId;
  const isDisabled = disabled || isMissingInviteId;

  if (!isPending) {
    return (
      <Badge
        variant="outline"
        shape="rounded"
        className="inline-flex gap-1.5 text-muted-foreground"
      >
        <CircleSlash className="size-3.5" />
        No further actions
      </Badge>
    );
  }

  if (isMissingInviteId) {
    return (
      <Badge
        variant="outline"
        shape="rounded"
        className="inline-flex text-muted-foreground"
      >
        Missing invite id
      </Badge>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={isPending ? "outline" : "destructive"}
          size="sm"
          disabled={isDisabled}
          className="text-xs font-bold"
        >
          <Ban className="size-3.5" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel invite?</AlertDialogTitle>
          <AlertDialogDescription>
            The pending invitation for {invite.email} will no longer be usable.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep invite</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onCancel(inviteId)}
          >
            Cancel invite
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
