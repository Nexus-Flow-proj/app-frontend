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

## Current System Map

There are currently two role systems in the frontend:

```txt
1. Existing live member role system
   - src/types/enums.ts exposes ProjectRole = OWNER | EDITOR | VIEWER
   - project members store roleLabel and optional isAdmin
   - invites and member role updates still use roleLabel
   - AdminGuard currently checks isProjectOwner(member)

2. New custom project role prototype
   - src/features/project/types/roles.ts defines ProjectRoleDefinition
   - roles have name, hierarchy level, permissions, isSystemRole, memberCount
   - roles UI uses local state and preset-derived mock roles
   - this system is not yet wired to backend authorization or member assignment
```

The new system should eventually replace or sit underneath the old
`OWNER | EDITOR | VIEWER` model. Until backend member responses include the new
role identity, route guards and member assignment will still be driven by
`roleLabel`.

Important integration rule:

```txt
permissions = what action can the actor perform?
hierarchy = whose content can the actor perform it on?
```

Example:

```ts
role.permissions.tasks.update === true
targetOwnerRole.level < actorRole.level
```

A Team Lead at level `60` with `tasks.update: true` can update content owned by
Member `40` or Viewer `20`, but cannot update another Team Lead's content
unless that content is their own.

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
│   └── useDeleteProjectRole.ts
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
```

Do not add `ApplyRolePresetDto` unless backend later adds an apply-preset
endpoint.

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
level must be between 1 and 99 for custom roles
permissions object is required
system roles cannot be deleted
at least one admin/owner role must remain
admin should not be able to remove their own ability to manage roles unless another admin still exists
```

If backend owns uniqueness/protected-role checks, frontend should still show friendly errors.

Backend contract note:

```txt
100 is reserved for Admin/Owner system authority.
Custom role create/update UI should not allow creating a level 100 role.
```

## Services

Add role methods to `src/features/project/services/index.ts`.

Suggested API client shape:

```ts
projectService.getProjectRoles(projectId)
projectService.createProjectRole(projectId, dto)
projectService.updateProjectRole(projectId, roleId, dto)
projectService.deleteProjectRole(projectId, roleId)
```

Do not call axios directly from components or hooks.

Backend endpoint contract confirmed from Postman collection `NexusFlow`
(`55874295-e90bebbb-94d8-4aba-aca9-837d068ba145`):

```txt
GET    {{projectsBaseUrl}}/projects/{{projectId}}/roles
POST   {{projectsBaseUrl}}/projects/{{projectId}}/roles
PATCH  {{projectsBaseUrl}}/projects/{{projectId}}/roles/{{roleId}}
DELETE {{projectsBaseUrl}}/projects/{{projectId}}/roles/{{roleId}}
```

There is currently no documented `apply-preset` endpoint. Preset duplication
should create a role by sending the preset's `name`, `description`, `level`, and
`permissions` through `POST /projects/:projectId/roles`.

### Confirmed Postman Role Endpoints

Collection:

```txt
Name: NexusFlow
Collection ID: 55874295-e90bebbb-94d8-4aba-aca9-837d068ba145
Workspace: NexusFlow's Workspace
```

List project roles:

```txt
Request: List project roles
Method: GET
URL: {{projectsBaseUrl}}/projects/{{projectId}}/roles
Postman request ID: 55874295-9066fcdf-9a7d-4259-aeac-2c8d62e1d550
Web URL: https://go.postman.co/request/55874295-9066fcdf-9a7d-4259-aeac-2c8d62e1d550
```

Behavior:

```txt
Retrieves all roles defined for the given project.
Backend orders roles from highest level to lowest level.
Authentication: JWT access token cookie.
Authorization: user must be a project member with project.read permission.
```

Create project role:

```txt
Request: Create project role
Method: POST
URL: {{projectsBaseUrl}}/projects/{{projectId}}/roles
Postman request ID: 55874295-8536727b-acbf-4ab2-b777-97d7596ca891
Web URL: https://go.postman.co/request/55874295-8536727b-acbf-4ab2-b777-97d7596ca891
```

Behavior:

```txt
Creates a custom role for the project.
Authentication: JWT access token cookie.
CSRF: requires x-csrf-token header.
Authorization: requires project.updateSettings permission.
Actor cannot create a role at or above their own level.
Level must be between 1 and 99.
Level 100 is reserved for Admin.
Required payload: name, level, permissions.
Optional payload: description.
```

Update project role:

```txt
Request: Update project role
Method: PATCH
URL: {{projectsBaseUrl}}/projects/{{projectId}}/roles/{{roleId}}
Postman request ID: 55874295-9123ae67-b20c-4720-813f-74a79660d8de
Web URL: https://go.postman.co/request/55874295-9123ae67-b20c-4720-813f-74a79660d8de
```

Behavior:

```txt
Updates a custom non-system role's name, description, level, or permissions.
Authentication: JWT access token cookie.
CSRF: requires x-csrf-token header.
Authorization: requires project.updateSettings permission.
Cannot modify system roles.
Cannot modify roles at or above actor's level.
All fields are optional.
```

Delete project role:

```txt
Request: Delete project role
Method: DELETE
URL: {{projectsBaseUrl}}/projects/{{projectId}}/roles/{{roleId}}
Postman request ID: 55874295-e929b384-ea25-4f7e-aae2-718aa27d28a0
Web URL: https://go.postman.co/request/55874295-e929b384-ea25-4f7e-aae2-718aa27d28a0
```

Behavior:

```txt
Deletes a custom non-system role from the project.
Authentication: JWT access token cookie.
CSRF: requires x-csrf-token header.
Authorization: requires project.updateSettings permission.
Cannot delete system roles.
Cannot delete roles at or above actor's level.
Blocked if role is assigned to any member.
Blocked if role is referenced by a pending invite.
```

Related member role endpoint:

```txt
Request: Update member role
Method: PATCH
URL: {{projectsBaseUrl}}/projects/{{projectId}}/members/{{memberId}}
Postman request ID: 55874295-16ca7e9d-f0ef-4d18-aeb3-907d9e708be0
Web URL: https://go.postman.co/request/55874295-16ca7e9d-f0ef-4d18-aeb3-907d9e708be0
```

Open contract detail:

```txt
Postman search exposed the endpoint but not its body details.
Frontend currently sends roleLabel: OWNER | EDITOR | VIEWER.
Need backend confirmation whether new assignment expects roleId, roleLabel, or both.
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
```

Do not create `useApplyRolePreset` unless backend later adds an apply-preset
endpoint. Current preset behavior should duplicate a preset into a create-role
draft, then call `useCreateProjectRole`.

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
- remove DTO console logging from ProjectRolesPanel

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
- duplicate preset into create-role flow
- no backend apply-preset call unless endpoint is added

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
admin can duplicate preset roles into custom role drafts
system Owner/Admin role cannot be deleted
role hierarchy is visibly sorted highest to lowest
permission settings are grouped clearly
React Query cache updates correctly after mutations
build and lint pass
```

## Open Backend Questions

Confirm before implementing final service URLs:

```txt
Does backend expose presets or should frontend own preset constants?
Does backend enforce system role protection?
Does backend enforce self-lockout prevention?
Are role levels unique per project?
Can two roles share the same level?
What is the exact permissions JSON shape expected by backend?
How are roles assigned to members?
Does existing member response include role id, or only roleLabel/isAdmin?
```

Resolved backend questions:

```txt
Exact role CRUD endpoints are documented above from Postman.
No apply-preset endpoint is currently documented.
Custom role creation level range is 1..99.
Level 100 is reserved for Admin.
Backend blocks delete when a role is assigned to members or pending invites.
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

### Current Role Domain Model

`src/features/project/types/roles.ts` currently defines:

```txt
ProjectRoleDefinition
- id: string
- projectId?: string
- name: string
- description?: string
- level: number
- permissions: RolePermissions
- isSystemRole: boolean
- memberCount?: number

RolePermissions
- project: read, updateSettings, deleteProject
- members: invite, remove, changeRoles
- tasks: create, read, update, delete, assign
- workshop: read, createNodes, updateNodes, deleteNodes, generateWithAi
- board: read, moveTasks, manageColumns

RolePreset
- id
- name
- description
- level
- permissions

CreateProjectRoleDto
- name
- description?
- level
- permissions

UpdateProjectRoleDto
- name?
- description?
- level?
- permissions?

PermissionGroupKey
- keyof RolePermissions

PermissionKey<TGroup>
- keyof RolePermissions[TGroup]
```

Note: the original plan suggested `ProjectRole`, but the current implemented
frontend type is named `ProjectRoleDefinition` to avoid collision with the
existing global `ProjectRole = OWNER | EDITOR | VIEWER` enum-like object.

### Current Role Constants

`src/features/project/constants/rolePresets.ts` currently defines:

```txt
ROLE_LEVELS
- 20 Viewer
- 40 Member
- 60 Team Lead
- 80 Project Manager
- 100 Owner/Admin

EMPTY_ROLE_PERMISSIONS
- read-oriented baseline
- allows project/tasks/workshop/board read
- disables all mutation/admin actions

FULL_PERMISSIONS
- private constant
- enables every permission

ROLE_PERMISSION_GROUPS
- metadata used by permission UI and summaries
- includes label, description, permission label, permission description
- marks high-risk permissions with dangerous: true

ROLE_PRESETS
- Owner/Admin
- Project Manager
- Team Lead
- Member
- Viewer

DEFAULT_PROJECT_ROLES
- local mock data derived from ROLE_PRESETS
- only first role is marked isSystemRole
- memberCount values are mock display data
```

If a permission is added to `RolePermissions`, add matching metadata to
`ROLE_PERMISSION_GROUPS` or the permission matrix/summaries will not know how to
render it.

### Current Hierarchy Utilities

`src/features/project/utils/roleHierarchy.ts` currently has display helpers:

```txt
getRoleLevelLabel(level)
- exact level returns its label
- custom level above a known level returns "Above <label>"
- custom level below all known levels returns "Custom"

getReadableHierarchyScope(level)
- lists levels >= actor level
- matches product rule: read own level and higher authority content

getEditableHierarchyScope(level)
- lists levels < actor level
- matches product rule: edit/delete lower-level content
- same-level teammate content remains protected
```

Still needed in this file:

```txt
sortRolesByLevel(roles)
canReadRoleContent(actorRole, targetRole)
canEditRoleContent(actorRole, targetRole, isOwner)
canDeleteRoleContent(actorRole, targetRole, isOwner)
isProtectedRole(role)
getRolesBelow(actorRole, roles)
getRolesAbove(actorRole, roles)
```

### Current Permission Utilities

`src/features/project/utils/rolePermissions.ts` currently has UI summary helpers:

```txt
countEnabledPermissions(permissions)
- counts true permission flags by walking ROLE_PERMISSION_GROUPS

countTotalPermissions()
- counts all permission entries declared in ROLE_PERMISSION_GROUPS

summarizePermissions(permissions)
- "No enabled permissions" if none are enabled
- "All areas" if every group has at least one enabled permission
- otherwise returns enabled group labels joined by comma
```

Still needed in this file:

```txt
hasPermission(role, permissionPath)
canManageMembers(role)
canManageProjectSettings(role)
canManageRoles(role)
canUseAiPlanning(role)
canManageBoard(role)
```

### Existing Live Role Helpers

`src/features/project/utils/roles.ts` belongs to the old/current live member
role system:

```txt
isProjectOwner(member)
- true when member.roleLabel === ProjectRole.OWNER
- true when member.isAdmin === true

findProjectMemberForUser(members, user)
- finds the member by userId or case-insensitive email
```

`AdminGuard` still uses these helpers, so the app currently protects admin-only
routes with owner/admin membership rather than the new `RolePermissions` model.

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
lg:max-w-5xl
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

### Consolidated Todo

Contracts and types:

```txt
- Decide whether backend role response uses ProjectRoleDefinition as-is or needs a separate ProjectRoleDto.
- Add createdAt/updatedAt to frontend role type if backend returns them.
- Confirm whether projectId is always returned on role responses.
- Enforce custom role level 1..99 in schemas and UI.
- Keep Owner/Admin level 100 as system/reserved only.
```

Backend data layer:

```txt
- Add QUERY_KEYS.projects.roles(projectId).
- Add projectService.getProjectRoles(projectId).
- Add projectService.createProjectRole(projectId, dto).
- Add projectService.updateProjectRole(projectId, roleId, dto).
- Add projectService.deleteProjectRole(projectId, roleId).
- Do not add applyRolePreset service unless backend adds endpoint.
- Ensure state-changing role calls include normal axios CSRF behavior.
```

React Query hooks:

```txt
- Create useProjectRoles(projectId) with enabled: !!projectId.
- Create useCreateProjectRole(projectId).
- Create useUpdateProjectRole(projectId).
- Create useDeleteProjectRole(projectId).
- Invalidate QUERY_KEYS.projects.roles(projectId) after mutations.
- Surface backend success/error messages through useApiMutation wrappers.
```

UI wiring:

```txt
- Replace DEFAULT_PROJECT_ROLES local source of truth with useProjectRoles.
- Keep local state only for editor draft/open tab/open sheet.
- Remove console DTO simulation from ProjectRolesPanel.
- Add loading, empty, and error states to RoleList/ProjectRolesPanel.
- Disable create/update/delete while mutations are pending.
- Add real delete confirmation before calling delete mutation.
- Show friendly backend errors for protected/system/assigned role failures.
```

Preset behavior:

```txt
- Keep ROLE_PRESETS frontend-owned unless backend adds presets.
- Duplicate preset into create-role draft.
- Save duplicated preset through POST /projects/:projectId/roles.
- Prevent custom role preset drafts from using level 100.
```

Validation:

```txt
- Add src/features/project/validation/role.schema.ts.
- Validate required name.
- Validate optional description length.
- Validate level 1..99 for custom roles.
- Validate full permissions object shape.
- Add frontend protection against deleting system roles.
- Show backend uniqueness and assigned-role delete errors nicely.
```

Member assignment integration:

```txt
- Confirm PATCH /projects/:projectId/members/:memberId payload.
- If backend expects roleId, update UpdateProjectMemberRoleDto.
- Update ProjectMemberSummary to include role id/details if backend returns it.
- Replace PROJECT_ROLE_OPTIONS with project roles fetched from backend.
- Update invite flow if invites should reference roleId instead of roleLabel.
- Keep compatibility with roleLabel only if backend still requires it.
```

Permission enforcement:

```txt
- Add pure permission helper functions in rolePermissions.ts.
- Add pure hierarchy guard functions in roleHierarchy.ts.
- Replace AdminGuard owner-only logic when backend exposes current member role permissions.
- Apply project.updateSettings to project settings.
- Apply members.invite/remove/changeRoles to member and invite actions.
- Apply tasks permissions to task create/update/delete/assign actions.
- Apply workshop permissions to canvas/workshop node actions and AI generation.
- Apply board permissions to board reads, moves, and column management.
```

Testing and verification:

```txt
- Unit test roleHierarchy pure logic.
- Unit test rolePermissions pure logic.
- Run npm run lint.
- Run npm run build.
- Complete Playwright pass after authenticated login.
- Verify project roles page on desktop and mobile widths.
```

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
