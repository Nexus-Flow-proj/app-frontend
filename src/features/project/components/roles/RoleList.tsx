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
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectRoleDefinition } from "../../types";
import { RoleRow } from "./RoleRow";

interface RoleListProps {
  roles: ProjectRoleDefinition[];
  onCreate: () => void;
  onEdit: (role: ProjectRoleDefinition) => void;
  onDelete: (roleId: string) => void;
}

export function RoleList({ roles, onCreate, onEdit, onDelete }: RoleListProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Custom role model</CardTitle>
        <CardDescription>
          Manage the roles available for assignment to project members.
        </CardDescription>
        <CardAction>
          <Button onClick={onCreate}>
            <Plus />
            Create role
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
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
              {roles.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
