import { useEffect } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock, LogIn } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/shared/loading/Loading";
import { dateformat } from "@/lib/format/date";
import { useAuthStore } from "@/store";
import { InviteStatus } from "@/types";
import { QUERY_KEYS } from "@/constants";
import { authService } from "@/features/auth/services";
import { setCsrfToken } from "@/lib/api/csrf";
import {
  useAcceptProjectInvitation,
  useDeclineProjectInvitation,
  useProjectInvitation,
} from "../hooks";
import {
  InvitationActions,
  InvitationDetail,
  InvitationLayout,
  InvitationMessage,
  InvitationProjectSummary,
} from "../components/invitation";

export default function ProjectInvitationPage() {
  const { token = "" } = useParams<{ token: string }>();
  const storedUser = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { data: optionalAuthUser } = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authService.optionalMe,
    enabled: !storedUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
  const {
    data: invitation,
    isLoading,
    isError,
  } = useProjectInvitation(token);
  const { mutate: acceptInvitation, isPending } = useAcceptProjectInvitation();
  const { mutate: declineInvitation, isPending: isDeclining } =
    useDeclineProjectInvitation();
  const user = storedUser ?? optionalAuthUser?.user ?? null;

  useEffect(() => {
    if (!storedUser && optionalAuthUser?.user) {
      setCsrfToken(optionalAuthUser.csrfToken);
      setAuth(optionalAuthUser.user);
    }
  }, [optionalAuthUser?.user, optionalAuthUser?.csrfToken, setAuth, storedUser]);

  if (isLoading) {
    return <Loading fullPage text="Loading invitation..." />;
  }

  if (isError || !invitation) {
    return (
      <InvitationLayout>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Invalid invitation
            </CardTitle>
            <CardDescription>
              This invitation may have expired, been revoked, or already been
              used.
            </CardDescription>
          </CardHeader>
        </Card>
      </InvitationLayout>
    );
  }

  const invitedEmail = invitation.email.toLowerCase();
  const currentEmail = user?.email.toLowerCase();
  const isLoggedInAsInvitedUser = currentEmail === invitedEmail;
  const isExpired = invitation.expiresAt
    ? new Date(invitation.expiresAt) < new Date()
    : false;
  const isAccepted = invitation.status === InviteStatus.ACCEPTED;
  const isRevoked = invitation.status === InviteStatus.REVOKED;
  const isRejected = invitation.status === InviteStatus.REJECTED;
  const isCancelled = invitation.status === InviteStatus.CANCELLED;
  const isClosed = isExpired || isAccepted || isRevoked || isRejected || isCancelled;
  const canAccept = isLoggedInAsInvitedUser && !isClosed;
  const canDecline = isLoggedInAsInvitedUser && !isClosed;
  const showSignIn = !user && !isClosed;
  const projectName =
    invitation.project?.name ?? invitation.projectName ?? "Project invitation";
  const projectColor = invitation.project?.color ?? "#2563eb";
  const projectDescription = invitation.project?.description;
  const roleName =
    invitation.role?.name ??
    invitation.roleName ??
    invitation.roleLabel ??
    "Project role";

  return (
    <InvitationLayout>
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>You have been invited</CardTitle>
              <CardDescription>
                Review the project invitation before joining.
              </CardDescription>
            </div>
            {invitation.status && (
              <Badge variant="outline">{invitation.status}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <InvitationProjectSummary
            name={projectName}
            color={projectColor}
            description={projectDescription}
          />

          <div className="grid gap-3 text-sm">
            <InvitationDetail label="Invited email" value={invitation.email} />
            <InvitationDetail
              label="Assigned role"
              value={roleName}
            />
            {invitation.expiresAt && (
              <InvitationDetail
                label="Expires"
                value={dateformat(invitation.expiresAt)}
                icon={<Clock className="size-4" />}
              />
            )}
          </div>

          {isAccepted && (
            <InvitationMessage
              icon={<CheckCircle2 className="size-4" />}
              title="Invitation already accepted"
              description="This invitation has already been used."
            />
          )}

          {isRejected && (
            <InvitationMessage
              icon={<AlertCircle className="size-4" />}
              title="Invitation declined"
              description="You have previously declined this invitation."
            />
          )}

          {isExpired && (
            <InvitationMessage
              icon={<AlertCircle className="size-4" />}
              title="Invitation expired"
              description="Ask the project admin to send a new invitation."
            />
          )}

          {(isRevoked || isCancelled) && (
            <InvitationMessage
              icon={<AlertCircle className="size-4" />}
              title="Invitation unavailable"
              description="This invitation is no longer available."
            />
          )}

          {!user && !isClosed && (
            <InvitationMessage
              icon={<LogIn className="size-4" />}
              title="Sign in required"
              description="For now, sign in with the invited account before accepting this project invitation."
            />
          )}

          {user && !isLoggedInAsInvitedUser && !isClosed && (
            <InvitationMessage
              icon={<AlertCircle className="size-4" />}
              title="Wrong account"
              description={`You are signed in as ${user.email}. This invite was sent to ${invitation.email}.`}
            />
          )}

          <InvitationActions
            token={token}
            canAccept={canAccept}
            canDecline={canDecline}
            showSignIn={showSignIn}
            isAccepting={isPending}
            isDeclining={isDeclining}
            onAccept={acceptInvitation}
            onDecline={declineInvitation}
          />
        </CardContent>
      </Card>
    </InvitationLayout>
  );
}
