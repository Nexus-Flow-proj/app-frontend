import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { RoleRow } from "./RoleRow";

interface RoleListProps {
  roles: ProjectRoleDefinition[];
  isLoading?: boolean;
  isError?: boolean;
  isCreating?: boolean;
  deletingRoleId?: string | null;
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
  onCreate,
  onEdit,
  onDelete,
}: RoleListProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Custom role model</CardTitle>
        <CardDescription>
          Manage the roles available for assignment to project members.
        </CardDescription>
        <CardAction>
          <Button onClick={onCreate} disabled={isLoading || isCreating}>
            <Plus />
            {isCreating ? "Creating..." : "Create role"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
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

        <div className="overflow-hidden rounded-lg border">
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
