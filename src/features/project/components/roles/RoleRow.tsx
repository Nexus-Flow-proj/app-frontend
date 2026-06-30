import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ProjectRoleDefinition } from "../../types";
import { getRoleLevelLabel } from "../../utils/roleHierarchy";
import {
  countEnabledPermissions,
  countTotalPermissions,
  summarizePermissions,
} from "../../utils/rolePermissions";

interface RoleRowProps {
  role: ProjectRoleDefinition;
  onEdit: (role: ProjectRoleDefinition) => void;
  onDelete: (roleId: string) => void;
}

export function RoleRow({ role, onEdit, onDelete }: RoleRowProps) {
  return (
    <TableRow>
      <TableCell className="min-w-56">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{role.name}</span>
            {role.isSystemRole && (
              <Badge variant="secondary" size="sm">
                System
              </Badge>
            )}
          </div>
          {role.description && (
            <p className="max-w-96 text-xs leading-5 text-muted-foreground">
              {role.description}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" size="sm">
            {role.level}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {getRoleLevelLabel(role.level)}
          </span>
        </div>
      </TableCell>
      <TableCell className="min-w-56">
        <div className="grid gap-1">
          <span>{summarizePermissions(role.permissions)}</span>
          <span className="text-xs text-muted-foreground">
            {countEnabledPermissions(role.permissions)} of{" "}
            {countTotalPermissions()} permissions enabled
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {role.memberCount ?? 0}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Open role menu">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" align="end">
            <DropdownMenuLabel>Role actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(role)}>
              <Pencil />
              Edit role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={role.isSystemRole}
              onClick={() => onDelete(role.id)}
            >
              <Trash2 />
              Delete role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
