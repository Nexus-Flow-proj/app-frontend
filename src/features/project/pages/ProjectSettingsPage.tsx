import { useParams } from "react-router";
import { MailPlus, Settings2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Loading from "@/components/shared/loading/Loading";
import { InviteMembersForm } from "../components/InviteMembersForm";
import { ProjectUnavailableState } from "../components/overview";
import { useProject } from "../hooks";

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return <Loading text="Loading project settings..." />;
  }

  if (isError || !project || !id) {
    return <ProjectUnavailableState />;
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 px-1 py-1">
      <header className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: project.color ?? "#2563eb" }}
        >
          <Settings2 className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">
            {project.name} settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite teammates and assign their project role.
          </p>
        </div>
      </header>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailPlus className="size-4 text-muted-foreground" />
            Invite member
          </CardTitle>
          <CardDescription>
            Send an invitation email with the role the member should receive
            after accepting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMembersForm projectId={id} />
        </CardContent>
      </Card>
    </main>
  );
}
