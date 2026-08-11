import { FolderKanban } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { dateformat } from "@/lib/format/date";
import type { UserProfile } from "../types";

interface ProfileProjectsCardProps {
  profile: UserProfile;
}

export function ProfileProjectsCard({ profile }: ProfileProjectsCardProps) {
  const navigate = useNavigate();
  const ownedProjectIds = new Set(
    (profile.ownedProjects ?? []).map((p) => p.id),
  );
  const memberships = profile.projectMemberships ?? [];

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="size-4 text-muted-foreground" />
          Project memberships
        </CardTitle>
        <CardDescription>
          Projects you are currently part of or own.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {memberships.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            You are not currently a member of any projects.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-md border">
            {memberships.map((membership) => {
              const isOwner = ownedProjectIds.has(membership.projectId);
              return (
                <div
                  key={membership.id}
                  onClick={() =>
                    navigate(ROUTES.PROJECT_OVERVIEW(membership.projectId))
                  }
                  className="flex cursor-pointer items-center justify-between gap-4 p-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {membership.projectName}
                      </p>
                      {isOwner && (
                        <Badge variant="default" size="xs" shape="pill">
                          Owner
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Joined {dateformat(membership.joinedAt)}
                    </p>
                  </div>

                  <Badge variant="outline" size="sm" shape="pill">
                    {membership.role}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
