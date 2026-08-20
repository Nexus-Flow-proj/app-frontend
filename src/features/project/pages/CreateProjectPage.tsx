import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateProjectForm } from "../components/CreateProjectForm";

export default function CreateProjectPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">
          Create project
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Set up the workspace your team will use for planning, workshop notes,
          and the board.
        </p>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            These basics can be changed later from project settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProjectForm />
        </CardContent>
      </Card>
    </main>
  );
}
