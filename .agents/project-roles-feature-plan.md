# Project Roles & Permissions Feature Plan

This file is an implementation brief for an agent working on the Nexus-Flow frontend. Read `AGENT.md` first and follow the repo rules there. This feature belongs inside `src/features/project/`; do not create a new top-level feature.

## Goal

Add a project-scoped roles and permissions system.

Admins should be able to:

- use premade role presets
- create custom project roles
- name roles
- set role hierarchy level
- choose role permissions
- assign roles to project members later

The system should support a hierarchy where higher authority roles can control lower authority content, while lower roles can still read higher-level content according to the product rule below.

## Core Product Rule

Use the term `hierarchy` in code, not `pyramid`.

Recommended hierarchy model:

```txt
higher level number = more authority

100 = Owner/Admin
80  = Project Manager
60  = Team Lead
40  = Member
20  = Viewer
```

Access rules:

```txt
Read:
- user can read content owned by their own role level and higher role levels

Edit:
- user can edit their own content
- user can edit content owned by lower role levels

Delete:
- user can delete their own content
- user can delete content owned by lower role levels
```

Recommended same-level behavior:

```txt
same-level read: yes
same-level edit/delete: only own content
```

This avoids allowing one Team Lead to delete another Team Lead's work.

## Important Architecture Decision

Do not make hierarchy the only permission system.

Use two separate concepts:

```txt
permissions = what actions can this role perform?
hierarchy = whose content can this role act on?
```

Every protected action should eventually answer both:

```txt
1. Does the role have permission for this action?
2. Is the target content inside the role's hierarchy scope?
```

## Proposed Folder Structure

Add roles as a sub-area of the existing `project` feature:

```txt
src/features/project/
├── components/
│   └── roles/
│       ├── RoleHierarchyPanel.tsx
│       ├── RolePresetSelector.tsx
│       ├── RoleForm.tsx
│       ├── RoleList.tsx
│       ├── RoleRow.tsx
│       ├── RolePermissionMatrix.tsx
│       └── RolePreviewCard.tsx
│
├── hooks/
│   ├── useProjectRoles.ts
│   ├── useCreateProjectRole.ts
│   ├── useUpdateProjectRole.ts
│   ├── useDeleteProjectRole.ts
│   └── useApplyRolePreset.ts
│
├── services/
│   └── index.ts
│
├── types/
│   ├── roles.ts
│   └── project-dto.ts
│
├── validation/
│   ├── role.schema.ts
│   └── role-preset.schema.ts
│
├── constants/
│   └── rolePresets.ts
│
└── utils/
    ├── roleHierarchy.ts
    └── rolePermissions.ts
```

Keep components modular. Do not put the full roles UI in one page file.

## Types

Create `src/features/project/types/roles.ts`.

Suggested core types:

```ts
export interface ProjectRole {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  level: number;
  permissions: RolePermissions;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissions {
  project: {
    read: boolean;
    updateSettings: boolean;
    deleteProject: boolean;
  };
  members: {
    invite: boolean;
    remove: boolean;
    changeRoles: boolean;
  };
  tasks: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    assign: boolean;
  };
  workshop: {
    read: boolean;
    createNodes: boolean;
    updateNodes: boolean;
    deleteNodes: boolean;
    generateWithAi: boolean;
  };
  board: {
    read: boolean;
    moveTasks: boolean;
    manageColumns: boolean;
  };
}

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: RolePermissions;
}
```

Suggested DTOs:

```ts
export interface CreateProjectRoleDto {
  name: string;
  description?: string;
  level: number;
  permissions: RolePermissions;
}

export interface UpdateProjectRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissions?: RolePermissions;
}

export interface ApplyRolePresetDto {
  presetId: string;
  name?: string;
}
```

## Presets

Create `src/features/project/constants/rolePresets.ts`.

Recommended presets:

```txt
Owner/Admin
- level 100
- full permissions
- system role

Project Manager
- level 80
- manage members, tasks, board, workshop

Team Lead
- level 60
- manage tasks and lower-level work

Member
- level 40
- create/update own tasks and use assigned workspace

Viewer
- level 20
- read-only
```

Admins should be able to:

- apply a preset
- duplicate a preset
- rename the duplicated role
- adjust level
- toggle permissions
- save it as a custom project role

Protected/system roles like Owner/Admin should not be deletable.

## Validation

Create `src/features/project/validation/role.schema.ts`.

Validation rules:

```txt
name is required
name must be unique inside the project
level is required
level must be between 1 and 100
permissions object is required
system roles cannot be deleted
at least one admin/owner role must remain
admin should not be able to remove their own ability to manage roles unless another admin still exists
```

If backend owns uniqueness/protected-role checks, frontend should still show friendly errors.

## Services

Add role methods to `src/features/project/services/index.ts`.

Suggested API client shape:

```ts
projectService.getProjectRoles(projectId)
projectService.createProjectRole(projectId, dto)
projectService.updateProjectRole(projectId, roleId, dto)
projectService.deleteProjectRole(projectId, roleId)
projectService.applyRolePreset(projectId, dto)
```

Do not call axios directly from components or hooks.

Endpoint names must match backend once available. A reasonable default contract:

```txt
GET    /projects/:projectId/roles
POST   /projects/:projectId/roles
PATCH  /projects/:projectId/roles/:roleId
DELETE /projects/:projectId/roles/:roleId
POST   /projects/:projectId/roles/apply-preset
```

## Query Keys

Add this to `src/constants/queryKeys.ts`:

```ts
roles: (projectId: string) =>
  [...QUERY_KEYS.projects.all, "roles", projectId] as const,
```

Use React Query for all server role data.

## Hooks

Create hooks in `src/features/project/hooks/`:

```txt
useProjectRoles(projectId)
useCreateProjectRole(projectId)
useUpdateProjectRole(projectId)
useDeleteProjectRole(projectId)
useApplyRolePreset(projectId)
```

Rules:

- query hooks use `useApiQuery`
- mutation hooks use `useApiMutation`
- pass `enabled: !!projectId` for project-dependent queries
- invalidate `QUERY_KEYS.projects.roles(projectId)` after mutations
- surface backend success/error messages through existing wrappers

## Utilities

Create `src/features/project/utils/roleHierarchy.ts`.

Suggested functions:

```ts
sortRolesByLevel(roles)
canReadRoleContent(actorRole, targetRole)
canEditRoleContent(actorRole, targetRole, isOwner)
canDeleteRoleContent(actorRole, targetRole, isOwner)
isProtectedRole(role)
getRolesBelow(actorRole, roles)
getRolesAbove(actorRole, roles)
```

Expected logic:

```ts
canReadRoleContent(actorRole, targetRole) {
  return targetRole.level >= actorRole.level;
}

canEditRoleContent(actorRole, targetRole, isOwner) {
  return isOwner || targetRole.level < actorRole.level;
}

canDeleteRoleContent(actorRole, targetRole, isOwner) {
  return isOwner || targetRole.level < actorRole.level;
}
```

Create `src/features/project/utils/rolePermissions.ts`.

Suggested functions:

```ts
hasPermission(role, permissionPath)
canManageMembers(role)
canManageProjectSettings(role)
canManageRoles(role)
canUseAiPlanning(role)
canManageBoard(role)
```

Keep utilities pure and unit-testable.

## UI Placement

Roles should live inside project settings, likely as a tab/section:

```txt
Project Settings
├── General
├── Members
├── Invites
├── Roles & Permissions
└── Danger Zone
```

Do not build roles on the project overview page.

## UI Components

Suggested component responsibilities:

```txt
RoleHierarchyPanel
- shows roles sorted from highest level to lowest
- can be a simple vertical list first
- drag/reorder can come later

RolePresetSelector
- lists presets
- lets admin apply or duplicate preset

RoleForm
- name
- description
- level
- permission toggles
- save/cancel actions

RoleList
- renders role rows
- owns loading/empty/error states

RoleRow
- role name
- level
- quick permission summary
- edit/delete menu

RolePermissionMatrix
- shows permission groups and toggles
- use shadcn controls for all interactive inputs

RolePreviewCard
- plain-language summary of what the selected role can read/edit/delete
```

Use shadcn components for all interactive elements:

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `DropdownMenu`
- `Card`
- `Badge`
- `Tooltip`
- `Skeleton`

Avoid raw native buttons/inputs/selects for interactive UI.

## State Ownership

Use React Query for:

```txt
project roles
role create/update/delete results
role preset application
```

Use props for:

```txt
passing roles into child components
selected role passed from parent to form/preview
```

Use local component state for:

```txt
currently selected role
currently selected preset
open/closed form drawer or dialog
permission draft before submit
```

Use Zustand only later if roles/permissions need to be globally available for guards or distant UI. Do not duplicate React Query server data into Zustand by default.

## Implementation Order

Recommended PR breakdown:

```txt
PR 1: Contracts and pure logic
- types/roles.ts
- constants/rolePresets.ts
- validation/role.schema.ts
- utils/roleHierarchy.ts
- utils/rolePermissions.ts
- query key addition

PR 2: Data layer
- service methods
- React Query hooks
- cache invalidation

PR 3: Settings UI skeleton
- Roles & Permissions section
- RoleList
- RoleRow
- loading/empty/error states

PR 4: Create/edit role
- RoleForm
- RolePermissionMatrix
- create/update mutations

PR 5: Presets
- RolePresetSelector
- apply/duplicate preset flow

PR 6: Safety and polish
- protected role deletion guard
- self-lockout prevention messaging
- final responsive polish
```

## Acceptance Criteria

The first complete version should satisfy:

```txt
admin can view project roles
admin can create a custom role
admin can update role name/level/permissions
admin can delete non-system custom roles
admin can apply/duplicate preset roles
system Owner/Admin role cannot be deleted
role hierarchy is visibly sorted highest to lowest
permission settings are grouped clearly
React Query cache updates correctly after mutations
build and lint pass
```

## Open Backend Questions

Confirm before implementing final service URLs:

```txt
What are the exact role endpoints?
Does backend expose presets or should frontend own preset constants?
Does backend enforce system role protection?
Does backend enforce self-lockout prevention?
Are role levels unique per project?
Can two roles share the same level?
What is the exact permissions JSON shape expected by backend?
How are roles assigned to members?
Does existing member response include role id, or only roleLabel/isAdmin?
```

## Notes For The Implementing Agent

- Keep the feature inside `src/features/project/`.
- Do not modify `src/components/ui/` by hand.
- Prefer small components and feature-local utilities.
- Do not copy role server data into Zustand unless a later route-guard task requires it.
- Run `npm run build` and `npm run lint` before finishing.

## Current Implementation Status

Status: UI prototype implemented inside the real project structure.

This implementation is intentionally UI-first. It provides an interactive roles
management surface with local in-memory state and DTO logging, but it does not
yet persist data to the backend.

### Implemented Files

New shadcn-style UI primitives were added because the project did not already
have these generated components:

```txt
src/components/ui/table.tsx
src/components/ui/tabs.tsx
src/components/ui/slider.tsx
```

Project role domain files:

```txt
src/features/project/types/roles.ts
src/features/project/constants/rolePresets.ts
src/features/project/utils/roleHierarchy.ts
src/features/project/utils/rolePermissions.ts
```

Project role page and components:

```txt
src/features/project/pages/ProjectRolesPage.tsx

src/features/project/components/roles/
├── ProjectRolesHeader.tsx
├── ProjectRolesPanel.tsx
├── RoleEditorSheet.tsx
├── RoleForm.tsx
├── RoleList.tsx
├── RolePermissionMatrix.tsx
├── RolePresetSelector.tsx
├── RolePreviewCard.tsx
├── RoleRow.tsx
└── index.ts
```

Project settings integration:

```txt
src/features/project/components/settings/ProjectRolesSettingsCard.tsx
src/features/project/components/settings/index.ts
src/features/project/pages/ProjectSettingsPage.tsx
```

Routing and navigation integration:

```txt
src/router/index.tsx
src/features/dashboard/constants/navItems.ts
```

Type exports updated:

```txt
src/features/project/types/index.ts
```

### Route Added

The roles UI is available at:

```txt
/projects/:id/roles
```

It is registered under the existing admin-only project route group beside:

```txt
/projects/:id/settings
/projects/:id/members
/projects/:id/workshop
```

### Settings Integration

`ProjectSettingsPage` now includes a `Roles & permissions` card below the
project details card.

The card links to:

```txt
/projects/:id/roles
```

This keeps roles discoverable from project settings while leaving the detailed
role management experience on its own route.

### UI Implemented

The current UI includes:

- Project roles page header matching the existing project header style.
- Roles table sorted from highest hierarchy level to lowest.
- Role rows with:
  - name
  - description
  - system badge
  - hierarchy level badge
  - permission summary
  - member count
  - actions dropdown
- Presets tab.
- Preset cards for:
  - Owner/Admin
  - Project Manager
  - Team Lead
  - Member
  - Viewer
- Create role action.
- Duplicate preset action.
- Edit role action.
- Delete role action for non-system roles.
- Create/edit sheet.
- Role form with:
  - name
  - description
  - hierarchy select
  - hierarchy slider
  - permission groups
  - role effect preview
- Permission groups:
  - Project
  - Members
  - Tasks
  - Workshop
  - Board
- Sensitive labels on higher-risk permissions.

### Sheet Sizing Update

The create/edit role sheet was widened after review.

Current width:

```txt
sm:max-w-2xl
lg:max-w-3xl
```

Header, body, and footer padding were also increased to make the permission
matrix feel less cramped.

### Current State Management

The current implementation uses local component state only.

`ProjectRolesPanel` owns:

```txt
roles
editingRole
isEditorOpen
```

Current local interactions:

- create a role
- edit a role
- duplicate a preset into a role draft
- delete a role
- save role changes locally

These changes are not persisted. Refreshing the page resets the roles to the
default local preset-derived data.

### React Query Status

React Query has not been wired yet for this feature.

Still needed:

```txt
useProjectRoles(projectId)
useCreateProjectRole(projectId)
useUpdateProjectRole(projectId)
useDeleteProjectRole(projectId)
useApplyRolePreset(projectId)
```

Roles are backend-owned project data, so the eventual source of truth should be
React Query, not Zustand.

### Zustand Status

Zustand is not used for this feature yet.

Recommended future Zustand usage, only if needed:

```txt
selectedRoleId
isRoleEditorOpen
activeRoleTab
global permission context for distant UI
```

Do not store the project roles list in Zustand by default. Role data should stay
in React Query once backend integration exists.

### DTO Simulation

The save action currently logs the simulated backend request to the browser
console.

Create flow logs:

```txt
[roles:dto] CreateProjectRoleDto
method POST
endpoint /projects/:projectId/roles
body {
  name,
  description,
  level,
  permissions
}
```

Update flow logs:

```txt
[roles:dto] UpdateProjectRoleDto
method PATCH
endpoint /projects/:projectId/roles/:roleId
body {
  name,
  description,
  level,
  permissions
}
```

The DTO types currently live in:

```txt
src/features/project/types/roles.ts
```

Implemented DTO types:

```ts
export interface CreateProjectRoleDto {
  name: string;
  description?: string;
  level: number;
  permissions: RolePermissions;
}

export interface UpdateProjectRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissions?: RolePermissions;
}
```

### Backend/Data Layer Not Implemented Yet

The following pieces are still pending:

- role service methods in `src/features/project/services/index.ts`
- role React Query hooks
- query key for project roles
- API-backed loading state
- API-backed error state
- optimistic or post-mutation cache updates
- backend validation handling
- real role deletion confirmation
- real protected-role/self-lockout errors
- member role assignment using role ids
- enforcement of new permissions in frontend workflows

### Validation Not Implemented Yet

No Zod role schema has been added yet.

Still needed:

```txt
src/features/project/validation/role.schema.ts
src/features/project/validation/role-preset.schema.ts
```

Validation should cover:

- required name
- description length
- hierarchy level range
- permissions object shape
- system role deletion protection
- backend-friendly error messages

### Playwright Status

Playwright inspection was attempted.

First blocker:

```txt
Vite returned 504 Outdated Optimize Dep.
```

This was fixed after restarting the dev server with force optimization.

Second blocker:

```txt
/projects/:id/roles is behind AuthGuard and AdminGuard.
```

The route required login. Credentials were provided later, but the Playwright
test pass was interrupted before completing login and full interaction testing.

Therefore:

```txt
Build: passed
Lint: passed
Full Playwright interaction test: not completed
```

### Verification Completed

The following commands passed after implementation:

```bash
npm run lint
npm run build
```

These were run after:

- initial UI implementation
- sheet width/padding update
- DTO console simulation update

### Known Limitations

- UI data is local only.
- Save does not call the backend.
- Delete does not call the backend.
- Preset duplication only creates a local draft.
- Member counts are mock values.
- Role assignment in project members still uses the older hardcoded role labels.
- Permission checks are not enforced in boards, workshop, settings, or members.
- No role API loading/empty/error states are implemented yet.
- No final Playwright visual pass has been completed.

### Recommended Next Implementation Step

The next practical step is the data layer:

```txt
1. Add project role query key.
2. Add projectService role methods.
3. Add useProjectRoles.
4. Add create/update/delete role hooks.
5. Replace local roles state in ProjectRolesPanel with React Query data.
6. Keep only editor draft/open state local.
7. Replace console DTO simulation with real mutations.
```
