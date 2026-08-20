import Loading from "@/components/shared/loading/Loading";
import {
  ProfileAvatarCard,
  ProfileErrorState,
  ProfileHeader,
  ProfileProjectsCard,
} from "../components";
import { useMyProfile } from "../hooks";

export default function ProfilePage() {
  const { data: profile, isLoading, error, refetch } = useMyProfile();

  if (isLoading) {
    return <Loading text="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <ProfileErrorState
        message={error ?? "Failed to load profile details."}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 px-1 py-1">
      {/* <ProfileHeader /> */}
      <ProfileAvatarCard profile={profile} />
      <ProfileProjectsCard profile={profile} />
    </main>
  );
}
