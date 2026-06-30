import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEFAULT_PROJECT_ROLES,
  EMPTY_ROLE_PERMISSIONS,
} from "../../constants/rolePresets";
import type {
  CreateProjectRoleDto,
  ProjectRoleDefinition,
  RolePreset,
  UpdateProjectRoleDto,
} from "../../types";
import { RoleEditorSheet } from "./RoleEditorSheet";
import { RoleList } from "./RoleList";
import { RolePresetSelector } from "./RolePresetSelector";

interface ProjectRolesPanelProps {
  projectId: string;
}

function buildCreateRoleDto(role: ProjectRoleDefinition): CreateProjectRoleDto {
  return {
    name: role.name.trim(),
    description: role.description?.trim() || undefined,
    level: role.level,
    permissions: role.permissions,
  };
}

function buildUpdateRoleDto(role: ProjectRoleDefinition): UpdateProjectRoleDto {
  return buildCreateRoleDto(role);
}

export function ProjectRolesPanel({ projectId }: ProjectRolesPanelProps) {
  const [roles, setRoles] = useState<ProjectRoleDefinition[]>(
    DEFAULT_PROJECT_ROLES,
  );
  const [editingRole, setEditingRole] = useState<ProjectRoleDefinition | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => b.level - a.level),
    [roles],
  );

  function openEditor(role: ProjectRoleDefinition) {
    setEditingRole({ ...role, permissions: structuredClone(role.permissions) });
    setIsEditorOpen(true);
  }

  function handleCreateRole() {
    openEditor({
      id: `new-${Date.now()}`,
      name: "Custom role",
      description: "Describe this role's project responsibilities.",
      level: 40,
      permissions: structuredClone(EMPTY_ROLE_PERMISSIONS),
      isSystemRole: false,
      memberCount: 0,
    });
  }

  function handleDuplicatePreset(preset: RolePreset) {
    openEditor({
      id: `new-${preset.id}-${Date.now()}`,
      name: `${preset.name} copy`,
      description: preset.description,
      level: preset.level,
      permissions: structuredClone(preset.permissions),
      isSystemRole: false,
      memberCount: 0,
    });
  }

  function handleSaveRole() {
    if (!editingRole) {
      return;
    }

    const isCreate = editingRole.id.startsWith("new-");
    const body = isCreate
      ? buildCreateRoleDto(editingRole)
      : buildUpdateRoleDto(editingRole);

    console.groupCollapsed(
      `[roles:dto] ${isCreate ? "CreateProjectRoleDto" : "UpdateProjectRoleDto"}`,
    );
    console.log("method", isCreate ? "POST" : "PATCH");
    console.log(
      "endpoint",
      isCreate
        ? `/projects/${projectId}/roles`
        : `/projects/${projectId}/roles/${editingRole.id}`,
    );
    console.log("body", body);
    console.groupEnd();

    setRoles((currentRoles) => {
      const existingRole = currentRoles.some((role) => role.id === editingRole.id);

      if (existingRole) {
        return currentRoles.map((role) =>
          role.id === editingRole.id ? editingRole : role,
        );
      }

      return [...currentRoles, editingRole];
    });
    setIsEditorOpen(false);
  }

  function handleDeleteRole(roleId: string) {
    setRoles((currentRoles) =>
      currentRoles.filter((role) => role.id !== roleId),
    );
  }

  return (
    <>
      <Tabs defaultValue="roles" className="gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            {roles.length} roles available
          </div>
        </div>

        <TabsContent value="roles">
          <RoleList
            roles={sortedRoles}
            onCreate={handleCreateRole}
            onEdit={openEditor}
            onDelete={handleDeleteRole}
          />
        </TabsContent>

        <TabsContent value="presets">
          <Card className="rounded-lg">
            <CardContent className="pt-0">
              <RolePresetSelector onDuplicatePreset={handleDuplicatePreset} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RoleEditorSheet
        open={isEditorOpen}
        role={editingRole}
        onOpenChange={setIsEditorOpen}
        onChange={setEditingRole}
        onSave={handleSaveRole}
      />
    </>
  );
}
