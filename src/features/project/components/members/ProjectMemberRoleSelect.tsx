import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectRoleDefinition } from "../../types";

interface ProjectMemberRoleSelectProps {
  value?: string;
  roles: ProjectRoleDefinition[];
  disabled?: boolean;
  onChange: (roleId: string) => void;
}

export function ProjectMemberRoleSelect({
  value,
  roles,
  disabled = false,
  onChange,
}: ProjectMemberRoleSelectProps) {
  return (
    <Select
      value={value}
      disabled={disabled || roles.length === 0}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-44 bg-background text-xs font-semibold">
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
