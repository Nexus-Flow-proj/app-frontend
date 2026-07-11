import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CUSTOM_ROLE_LEVEL_MAX,
  EMPTY_ROLE_PERMISSIONS,
} from "../../constants/rolePresets";
import {
  useCreateProjectRole,
  useDeleteProjectRole,
  useProjectRoles,
  useUpdateProjectRole,
} from "../../hooks";
import type {
  CreateProjectRoleDto,
  ProjectRoleDefinition,
  RolePreset,
  UpdateProjectRoleDto,
} from "../../types";
import {
  createProjectRoleSchema,
  updateProjectRoleSchema,
} from "../../validation";
import { sortRolesByLevel } from "../../utils/roleHierarchy";
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
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    isError: isRolesError,
  } = useProjectRoles(projectId);
  const { mutate: createRole, isPending: isCreatingRole } =
    useCreateProjectRole();
  const { mutate: updateRole, isPending: isUpdatingRole } =
    useUpdateProjectRole();
  const { mutate: deleteRole, isPending: isDeletingRole } =
    useDeleteProjectRole();
  const [editingRole, setEditingRole] = useState<ProjectRoleDefinition | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [rolePendingDelete, setRolePendingDelete] =
    useState<ProjectRoleDefinition | null>(null);

  const sortedRoles = useMemo(() => sortRolesByLevel(roles), [roles]);
  const isSavingRole = isCreatingRole || isUpdatingRole;

  function openEditor(role: ProjectRoleDefinition) {
    if (role.isSystemRole) {
      return;
    }

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
    if (preset.level > CUSTOM_ROLE_LEVEL_MAX) {
      toast.error("Reserved system roles cannot be duplicated.");
      return;
    }

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
    const validationResult = isCreate
      ? createProjectRoleSchema.safeParse(body)
      : updateProjectRoleSchema.safeParse(body);

    if (!validationResult.success) {
      validationResult.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      return;
    }

    if (isCreate) {
      createRole(
        { projectId, ...(body as CreateProjectRoleDto) },
        {
          onSuccess: () => {
            setIsEditorOpen(false);
            setEditingRole(null);
          },
        },
      );
      return;
    }

    updateRole(
      {
        projectId,
        roleId: editingRole.id,
        ...(body as UpdateProjectRoleDto),
      },
      {
        onSuccess: () => {
          setIsEditorOpen(false);
          setEditingRole(null);
        },
      },
    );
  }

  function handleDeleteRole(role: ProjectRoleDefinition) {
    if (role.isSystemRole) {
      return;
    }

    setRolePendingDelete(role);
  }

  function confirmDeleteRole() {
    if (!rolePendingDelete) {
      return;
    }

    deleteRole(
      {
        projectId,
        roleId: rolePendingDelete.id,
      },
      {
        onSuccess: () => setRolePendingDelete(null),
      },
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
            isLoading={isLoadingRoles}
            isError={isRolesError}
            isCreating={isCreatingRole}
            deletingRoleId={isDeletingRole ? rolePendingDelete?.id : null}
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
        isSaving={isSavingRole}
      />

      <AlertDialog
        open={!!rolePendingDelete}
        onOpenChange={(open) => {
          if (!open && !isDeletingRole) {
            setRolePendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {rolePendingDelete?.name}
              </span>
              . The backend will block deletion if the role is assigned to
              members or pending invites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRole}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeletingRole}
              onClick={(event) => {
                event.preventDefault();
                confirmDeleteRole();
              }}
            >
              {isDeletingRole ? "Deleting..." : "Delete role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
