import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants";

export function ProjectUnavailableState() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md rounded-lg text-center">
        <CardHeader>
          <CardTitle>Project unavailable</CardTitle>
          <CardDescription>
            This project could not be loaded. It may have been removed, or your
            access may have changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
