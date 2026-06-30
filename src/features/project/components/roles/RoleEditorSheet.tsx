import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ProjectRoleDefinition } from "../../types";
import { RoleForm } from "./RoleForm";

interface RoleEditorSheetProps {
  open: boolean;
  role: ProjectRoleDefinition | null;
  onOpenChange: (open: boolean) => void;
  onChange: (role: ProjectRoleDefinition) => void;
  onSave: () => void;
}

export function RoleEditorSheet({
  open,
  role,
  onOpenChange,
  onChange,
  onSave,
}: RoleEditorSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl lg:max-w-5xl">
        <SheetHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <SheetTitle>
            {role?.id.startsWith("new-") ? "Create role" : "Edit role"}
          </SheetTitle>
          <SheetDescription>
            Configure what this role can do and whose content it can control.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 gap-6 px-5 pb-5 sm:px-6 sm:pb-6">
          {role && <RoleForm role={role} onChange={onChange} />}
        </div>

        <SheetFooter className="border-t bg-background p-5 sm:p-6">
          <Button onClick={onSave} disabled={!role?.name.trim()}>
            <Save />
            Save role
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
