import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ROLE_PERMISSION_GROUPS } from "../../constants/rolePresets";
import type {
  PermissionGroupKey,
  ProjectRoleDefinition,
  RolePermissions,
} from "../../types";

interface RolePermissionMatrixProps {
  role: ProjectRoleDefinition;
  onChange: (permissions: RolePermissions) => void;
}

export function RolePermissionMatrix({
  role,
  onChange,
}: RolePermissionMatrixProps) {
  function handlePermissionChange(
    groupKey: PermissionGroupKey,
    permissionKey: string,
    checked: boolean,
  ) {
    onChange({
      ...role.permissions,
      [groupKey]: {
        ...role.permissions[groupKey],
        [permissionKey]: checked,
      },
    });
  }

  return (
    <div className="grid gap-4">
      {ROLE_PERMISSION_GROUPS.map((group) => (
        <section key={group.key} className="grid gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {group.label}
            </h3>
            <p className="text-xs text-muted-foreground">
              {group.description}
            </p>
          </div>
          <div className="grid gap-2">
            {group.permissions.map((permission) => {
              const checkboxId = `${role.id}-${group.key}-${permission.key}`;
              const checked = Boolean(
                role.permissions[group.key][
                  permission.key as keyof (typeof role.permissions)[typeof group.key]
                ],
              );

              return (
                <Label
                  key={permission.key}
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal hover:bg-accent/50 has-[[aria-checked=true]]:border-primary/40 has-[[aria-checked=true]]:bg-primary/5"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={checked}
                    onCheckedChange={(value) =>
                      handlePermissionChange(
                        group.key,
                        permission.key,
                        value === true,
                      )
                    }
                  />
                  <span className="grid min-w-0 gap-1.5">
                    <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium leading-5">
                      {permission.label}
                      {permission.dangerous && (
                        <span className="text-xs font-medium text-destructive">
                          Sensitive
                        </span>
                      )}
                    </span>
                    <span className="text-xs leading-5 text-muted-foreground">
                      {permission.description}
                    </span>
                  </span>
                </Label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
