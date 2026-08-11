import { useNavigate, useParams } from "react-router";
import { ArrowLeft, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/shared/loading/Loading";
import { ProfileAvatarCard, ProfileErrorState } from "../components";
import { useUserProfile } from "../hooks";

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading, error, refetch } = useUserProfile(userId);

  if (isLoading) {
    return <Loading text="Loading member profile..." />;
  }

  if (error || !profile) {
    return (
      <ProfileErrorState
        message={error ?? "Failed to load member profile details."}
        onRetry={() => refetch()}
      />
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 px-1 py-1">
      {/* Header with Back Button */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UserCircle className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">
              {fullName}&apos;s Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Team member profile overview and skills.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="shrink-0 text-xs font-semibold"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
      </header>

      <ProfileAvatarCard profile={profile} readonly />
    </main>
  );
}
