import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ROLE_LEVELS } from "../../constants/rolePresets";
import type { ProjectRoleDefinition } from "../../types";
import { getRoleLevelLabel } from "../../utils/roleHierarchy";
import { RolePermissionMatrix } from "./RolePermissionMatrix";
import { RolePreviewCard } from "./RolePreviewCard";

interface RoleFormProps {
  role: ProjectRoleDefinition;
  onChange: (role: ProjectRoleDefinition) => void;
}

export function RoleForm({ role, onChange }: RoleFormProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="role-name">Role name</Label>
        <Input
          id="role-name"
          value={role.name}
          onChange={(event) => onChange({ ...role, name: event.target.value })}
          placeholder="Team Lead"
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="role-description">Description</Label>
        <Textarea
          id="role-description"
          value={role.description ?? ""}
          onChange={(event) =>
            onChange({ ...role, description: event.target.value })
          }
          placeholder="Describe when this role should be assigned."
        />
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="role-level">Hierarchy level</Label>
          <span className="text-xs font-medium text-muted-foreground">
            {role.level} - {getRoleLevelLabel(role.level)}
          </span>
        </div>
        <Select
          value={String(role.level)}
          onValueChange={(value) =>
            onChange({ ...role, level: Number(value) })
          }
        >
          <SelectTrigger id="role-level" className="w-full bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_LEVELS.map((level) => (
              <SelectItem key={level.value} value={String(level.value)}>
                {level.label} - {level.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Slider
          value={[role.level]}
          min={20}
          max={100}
          step={20}
          onValueChange={([value]) => onChange({ ...role, level: value })}
          aria-label="Hierarchy level"
        />
      </div>

      <RolePreviewCard role={role} />
      <RolePermissionMatrix
        role={role}
        onChange={(permissions) => onChange({ ...role, permissions })}
      />
    </div>
  );
}
