import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProjectRoleDefinition } from "../../types";

interface ProjectMemberRoleSelectProps {
  value?: string;
  roles: ProjectRoleDefinition[];
  disabled?: boolean;
  className?: string;
  onChange: (roleId: string) => void;
}

export function ProjectMemberRoleSelect({
  value,
  roles,
  disabled = false,
  className,
  onChange,
}: ProjectMemberRoleSelectProps) {
  return (
    <Select
      value={value}
      disabled={disabled || roles.length === 0}
      onValueChange={onChange}
    >
      <SelectTrigger
        className={cn("w-44 bg-background text-xs font-semibold", className)}
      >
        <SelectValue placeholder="Choose role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            <p className="p-0.5">{role.name}</p>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
