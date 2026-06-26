import { Link } from "react-router";
import { Loader2, LogIn, UserRoundCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

interface InvitationActionsProps {
  token: string;
  canAccept: boolean;
  canDecline: boolean;
  showSignIn: boolean;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: (token: string) => void;
  onDecline: (token: string) => void;
}

export function InvitationActions({
  token,
  canAccept,
  canDecline,
  showSignIn,
  isAccepting,
  isDeclining,
  onAccept,
  onDecline,
}: InvitationActionsProps) {
  const isBusy = isAccepting || isDeclining;

  if (canAccept || canDecline) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {canAccept && (
          <Button
            type="button"
            isLoading={isAccepting}
            disabled={isBusy}
            onClick={() => onAccept(token)}
            className="w-full text-xs font-bold"
          >
            <UserRoundCheck className="size-4" />
            Accept invitation
          </Button>
        )}
        {canDecline && (
          <Button
            type="button"
            variant="outline"
            isLoading={isDeclining}
            disabled={isBusy}
            onClick={() => onDecline(token)}
            className="w-full text-xs font-bold"
          >
            <XCircle className="size-4" />
            Decline
          </Button>
        )}
      </div>
    );
  }

  if (showSignIn) {
    return (
      <Button asChild className="w-full text-xs font-bold">
        <Link to={`${ROUTES.LOGIN}?inviteToken=${token}`}>
          <LogIn className="size-4" />
          Sign in to accept
        </Link>
      </Button>
    );
  }

  if (!isBusy) {
    return null;
  }

  return (
    <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      Updating invitation...
    </p>
  );
}
