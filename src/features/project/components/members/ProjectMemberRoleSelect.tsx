import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectRole } from "@/types";
import { PROJECT_ROLE_OPTIONS } from "../../constants";

interface ProjectMemberRoleSelectProps {
  value: ProjectRole;
  disabled?: boolean;
  onChange: (role: ProjectRole) => void;
}

export function ProjectMemberRoleSelect({
  value,
  disabled = false,
  onChange,
}: ProjectMemberRoleSelectProps) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(role) => onChange(role as ProjectRole)}
    >
      <SelectTrigger className="w-36 bg-background text-xs font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PROJECT_ROLE_OPTIONS.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
