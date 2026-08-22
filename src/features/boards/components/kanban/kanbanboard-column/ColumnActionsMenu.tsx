import { MoreHorizontal, PencilIcon, Plus, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnActionsMenuProps {
  columnId: string;
  isProtected: boolean;
  canCreateTask?: boolean;
  canManageColumn?: boolean;
  onAddTask?: (columnId: string) => void;
  onRenameColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

function ColumnActionsMenu({
  columnId,
  isProtected,
  canCreateTask = true,
  canManageColumn = true,
  onAddTask,
  onRenameColumn,
  onDeleteColumn,
}: ColumnActionsMenuProps) {
  const showProtectedMessage = isProtected && !canCreateTask;
  const hasColumnActions = canCreateTask || (!isProtected && canManageColumn);

  if (!showProtectedMessage && !hasColumnActions) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max min-w-max">
        {!showProtectedMessage ? (
          <>
            {canCreateTask && (
              <DropdownMenuItem onClick={() => onAddTask?.(columnId)}>
                <Plus />
                Add task
              </DropdownMenuItem>
            )}
            {!isProtected && canManageColumn && (
              <>
                <DropdownMenuItem onClick={() => onRenameColumn?.(columnId)}>
                  <PencilIcon />
                  Rename column
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDeleteColumn?.(columnId)}
                >
                  <TrashIcon />
                  Delete column
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground">
            Protected column
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ColumnActionsMenu;
