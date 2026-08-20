import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectRoleDefinition } from "../../types";
import { getRoleLevelLabel } from "../../utils/roleHierarchy";
import {
  countEnabledPermissions,
  countTotalPermissions,
  summarizePermissions,
} from "../../utils/rolePermissions";
import { RoleRow } from "./RoleRow";

interface RoleListProps {
  roles: ProjectRoleDefinition[];
  isLoading?: boolean;
  isError?: boolean;
  isCreating?: boolean;
  deletingRoleId?: string | null;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onCreate: () => void;
  onEdit: (role: ProjectRoleDefinition) => void;
  onDelete: (role: ProjectRoleDefinition) => void;
}

export function RoleList({
  roles,
  isLoading = false,
  isError = false,
  isCreating = false,
  deletingRoleId,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  onCreate,
  onEdit,
  onDelete,
}: RoleListProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-6">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base sm:text-lg">
            Custom role model
          </CardTitle>
          <CardDescription>
            Manage the roles available for assignment to project members.
          </CardDescription>
        </div>
        <div className="w-full sm:w-auto sm:justify-self-end">
          <Button
            onClick={onCreate}
            disabled={isLoading || isCreating || !canCreate}
            className="w-full sm:w-auto"
          >
            <Plus />
            {isCreating ? "Creating..." : "Create role"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {isError && (
          <Empty className="mb-4 border">
            <EmptyHeader>
              <EmptyTitle>Could not load roles</EmptyTitle>
              <EmptyDescription>
                Refresh the page or try again after checking project access.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <div className="grid gap-3 md:hidden">
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-card p-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-4 h-8 w-full" />
              </div>
            ))}

          {!isLoading &&
            roles.map((role) => (
              <RoleMobileCard
                key={role.id}
                role={role}
                isDeleting={deletingRoleId === role.id}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

          {!isLoading && roles.length === 0 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>No roles yet</EmptyTitle>
                <EmptyDescription>
                  Create a custom role or duplicate a preset to begin.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>

        <div className="hidden overflow-hidden rounded-lg border md:block">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Hierarchy</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-10 w-56" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-52" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading &&
                roles.map((role) => (
                  <RoleRow
                    key={role.id}
                    role={role}
                    isDeleting={deletingRoleId === role.id}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}

              {!isLoading && roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No roles yet</EmptyTitle>
                        <EmptyDescription>
                          Create a custom role or duplicate a preset to begin.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface RoleMobileCardProps {
  role: ProjectRoleDefinition;
  onEdit: (role: ProjectRoleDefinition) => void;
  onDelete: (role: ProjectRoleDefinition) => void;
  isDeleting?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

function RoleMobileCard({
  role,
  onEdit,
  onDelete,
  isDeleting = false,
  canUpdate = true,
  canDelete = true,
}: RoleMobileCardProps) {
  return (
    <article className="rounded-lg border bg-card p-3">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold text-foreground">
              {role.name}
            </h3>
            {role.isSystemRole && (
              <Badge variant="secondary" size="sm">
                System
              </Badge>
            )}
          </div>
          {role.description && (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {role.description}
            </p>
          )}
        </div>
        <Badge variant="outline" size="sm">
          {role.level}
        </Badge>
      </div>

      <dl className="mt-3 grid gap-3 text-xs">
        <div>
          <dt className="font-semibold text-muted-foreground">Hierarchy</dt>
          <dd className="mt-1 text-foreground">
            {getRoleLevelLabel(role.level)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Permissions</dt>
          <dd className="mt-1 text-foreground">
            {summarizePermissions(role.permissions)}
          </dd>
          <dd className="mt-1 text-muted-foreground">
            {countEnabledPermissions(role.permissions)} of{" "}
            {countTotalPermissions()} permissions enabled
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Members</dt>
          <dd className="mt-1 text-foreground">{role.memberCount ?? 0}</dd>
        </div>
      </dl>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={role.isSystemRole || isDeleting || !canUpdate}
          onClick={() => onEdit(role)}
        >
          Edit role
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={role.isSystemRole || isDeleting || !canDelete}
          onClick={() => onDelete(role)}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </article>
  );
}
