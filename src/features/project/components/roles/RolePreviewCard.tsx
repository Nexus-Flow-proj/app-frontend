import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectRoleDefinition } from "../../types";
import {
  getEditableHierarchyScope,
  getReadableHierarchyScope,
} from "../../utils/roleHierarchy";
import {
  countEnabledPermissions,
  countTotalPermissions,
} from "../../utils/rolePermissions";

interface RolePreviewCardProps {
  role: ProjectRoleDefinition;
}

export function RolePreviewCard({ role }: RolePreviewCardProps) {
  const enabledPermissions = countEnabledPermissions(role.permissions);
  const totalPermissions = countTotalPermissions();

  return (
    <Card size="sm" className="rounded-lg bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Role effect</span>
          <Badge variant="outline" size="sm">
            {enabledPermissions}/{totalPermissions}
          </Badge>
        </CardTitle>
        <CardDescription>
          Hierarchy decides whose content this role can act on.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex gap-3">
          <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            Can read own level and higher authority content:{" "}
            <span className="font-medium text-foreground">
              {getReadableHierarchyScope(role.level)}
            </span>
            .
          </p>
        </div>
        <div className="flex gap-3">
          <Pencil className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            Can edit own content and lower-level content:{" "}
            <span className="font-medium text-foreground">
              {getEditableHierarchyScope(role.level)}
            </span>
            .
          </p>
        </div>
        <div className="flex gap-3">
          <Trash2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>Same-level teammate content stays protected from edit/delete.</p>
        </div>
      </CardContent>
    </Card>
  );
}
