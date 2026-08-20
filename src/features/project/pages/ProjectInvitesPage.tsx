import { useParams } from "react-router";
import Loading from "@/components/shared/loading/Loading";
import { ProjectUnavailableState } from "../components/overview";
import {
  ProjectInvitesSettingsCard,
  ProjectSettingsHeader,
} from "../components/settings";
import { useProject } from "../hooks";

export default function ProjectInvitesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return <Loading text="Loading project invites..." />;
  }

  if (isError || !project) {
    return <ProjectUnavailableState />;
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-4 lg:px-1 lg:py-1">
      <ProjectSettingsHeader project={project} />
      <ProjectInvitesSettingsCard project={project} />
    </main>
  );
}
