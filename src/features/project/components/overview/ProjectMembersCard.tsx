import { UsersRoundIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectMemberSummary } from "../../types";
import { ProjectMemberRow } from "./ProjectMemberRow";

interface ProjectMembersCardProps {
  members: ProjectMemberSummary[];
  ownerCount: number;
  isLoading: boolean;
}

export function ProjectMembersCard({
  members,
  ownerCount,
  isLoading,
}: ProjectMembersCardProps) {
  return (
    <Card className="h-full rounded-lg">
      <CardHeader>
        <CardTitle>Project members</CardTitle>
        <CardDescription>
          {members.length} connected member{members.length === 1 ? "" : "s"} ·{" "}
          {ownerCount} owner{ownerCount === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-14" />
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {members.map((member) => (
              <ProjectMemberRow key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <UsersRoundIcon className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No members loaded yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Members will appear here once the project membership endpoint
              returns data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
