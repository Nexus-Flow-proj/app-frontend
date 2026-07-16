# Projects and Invitations Feature

This document tracks what is currently implemented for the project feature and project invitation flow, plus the remaining work.

## Implemented

### Project Routes

- `/projects/new`
  - Auth-required route.
  - Renders the create project page.
  - Creates projects through `POST /projects`.

- `/projects/:id`
  - Auth-required route.
  - Renders the project overview page.
  - Loads project details through `GET /projects/:projectId`.
  - Loads project members through `GET /projects/:projectId/members`.

- `/projects/:id/settings`
  - Auth-required and project-owner-only route.
  - Protected by `AdminGuard`.
  - Contains project details editing.

- `/projects/:id/members`
  - Auth-required and project-owner-only route.
  - Protected by `AdminGuard`.
  - Contains project member management and invitation form.

- `/project/invitation/:token`
  - Public route.
  - No guest guard.
  - No auth guard.
  - Does not call `/auth/me`.
  - Can be opened by logged-in or logged-out users.

### Project Creation

Implemented files:

- `src/features/project/pages/CreateProjectPage.tsx`
- `src/features/project/components/CreateProjectForm.tsx`
- `src/features/project/hooks/useCreateProject.ts`
- `src/features/project/validation/create-project.schema.ts`

Behavior:

- User enters project name, optional description, and color.
- Form validates with `react-hook-form` and `zod`.
- On success:
  - active project is stored in project store
  - project list query is invalidated
  - project detail cache is seeded
  - user is redirected to `/projects/:id/workshop`

### Project Overview

Implemented files:

- `src/features/project/pages/ProjectOverviewPage.tsx`
- `src/features/project/components/overview/*`

Behavior:

- Shows project hero, stats, members, details, and activity placeholders.
- Uses project members to identify owners.
- Settings button is only shown to project owners.
- Non-owners do not see the settings button on the project overview page.

### Project Roles

Frontend role enum:

```ts
export const ProjectRole = {
  OWNER: "OWNER",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;
```

Implemented in:

- `src/types/enums.ts`

Role helpers:

- `src/features/project/utils/roles.ts`

Current helper behavior:

- `isProjectOwner(member)`
  - returns true when `member.roleLabel === ProjectRole.OWNER`
  - also supports old `member.isAdmin === true` as a fallback

- `findProjectMemberForUser(members, user)`
  - matches by `userId`
  - falls back to email match

### Project Owner Guard

Implemented file:

- `src/router/AdminGuard.tsx`

Behavior:

- Reads project id from the route.
- Reads the logged-in user from auth store.
- Fetches project members.
- Finds the current user inside the project member list.
- Allows access only if the current member is an owner.
- Redirects non-owners to `/projects/:id`.

Current protected routes:

- `/projects/:id/settings`
- `/projects/:id/members`
- `/projects/:id/workshop`

Note: `workshop` is currently under `AdminGuard` too.

### Invite Members Form

Implemented files:

- `src/features/project/components/InviteMembersForm.tsx`
- `src/features/project/hooks/useInviteMember.ts`
- `src/features/project/validation/invite.schema.ts`

Endpoint:

```txt
POST /projects/:projectId/invites
```

Request body:

```json
{
  "email": "member@example.com",
  "roleLabel": "EDITOR"
}
```

Supported roles:

- `OWNER`
- `EDITOR`
- `VIEWER`

Behavior:

- Project owner enters email and role.
- On success:
  - success toast is shown
  - project invites query is invalidated
  - project members query is invalidated
- Current location is `/projects/:id/members`.

### Project Settings

Implemented files:

- `src/features/project/pages/ProjectSettingsPage.tsx`
- `src/features/project/hooks/useUpdateProject.ts`

Endpoint:

```txt
PATCH /projects/:projectId
```

Behavior:

- Project owner can update project name, description, and color.
- Uses the same validation and color options as project creation.
- On success:
  - project details query is invalidated
  - project list query is invalidated

### Project Members Management

Implemented files:

- `src/features/project/pages/ProjectMembersPage.tsx`
- `src/features/project/hooks/useUpdateProjectMemberRole.ts`
- `src/features/project/hooks/useRemoveProjectMember.ts`

Endpoints:

```txt
GET    /projects/:projectId/members
PATCH  /projects/:projectId/members/:memberId
DELETE /projects/:projectId/members/:memberId
```

Behavior:

- Project owner can view project members in a table.
- Table displays avatar, name, email, and role.
- Role select updates a member role immediately.
- Remove button opens a confirmation dialog before removing access.
- Current user is labeled as `You` and cannot remove themselves from the table.
- On member role update:
  - project members query is invalidated
- On member removal:
  - project members query is invalidated
  - project list query is invalidated

### Public Project Invitation Page

Implemented files:

- `src/features/project/pages/ProjectInvitationPage.tsx`
- `src/features/project/components/invitation/*`
- `src/features/project/hooks/useProjectInvitation.ts`
- `src/features/project/hooks/useAcceptProjectInvitation.ts`
- `src/features/project/hooks/useDeclineProjectInvitation.ts`
- `src/features/project/types/project-invite.ts`

Route:

```txt
/project/invitation/:token
```

Fetch endpoint:

```txt
GET /projects/invites/:inviteToken
```

Current backend response shape:

```json
{
  "id": "ba589317-021e-4cbb-a0de-569c6d38142f",
  "projectId": "a43bc155-81ca-402f-a7b5-d8cfde89b377",
  "email": "member@example.com",
  "projectName": "TEsting colors",
  "roleLabel": "EDITOR",
  "status": "PENDING",
  "createdAt": "2026-06-26T21:42:47.207Z",
  "expiresAt": "2026-07-03T21:42:47.135Z"
}
```

Accept endpoint:

```txt
POST /projects/invites/:inviteToken/accept
```

Decline endpoint:

```txt
POST /projects/invites/:inviteToken/decline
```

Behavior:

- The page is public.
- It does not call `/auth/me`.
- It only reads `user` from auth store if one already exists.
- It displays invitation details for logged-in and logged-out users.
- If the logged-in user's email matches the invited email:
  - Accept button is shown.
  - Decline button is shown.
- If no user is loaded:
  - Sign-in prompt is shown.
  - Sign-in button links to `/login?inviteToken=:token`.
  - The sign-in button is rendered with `Button asChild` so the underlying element is a React Router `Link`.
- If another account is logged in:
  - Wrong account message is shown.
- If the invite is accepted, expired, or revoked:
  - No accept/decline actions are shown.

### Login With Project Invitation Token

Implemented files:

- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/hooks/useLogin.ts`
- `src/hooks/useApiMutation.ts`
- `src/components/ui/button.tsx`

Route:

```txt
/login?inviteToken=:token
```

Behavior:

- `LoginForm` reads `inviteToken` from the URL query string.
- `useLogin` receives the optional invite token.
- After `POST /auth/login` succeeds:
  - logged-in user is stored in auth store
  - `QUERY_KEYS.auth.me` is seeded with the login response
  - if `inviteToken` exists, the frontend calls `POST /projects/invites/:inviteToken/accept`
  - project list and invitation queries are invalidated
  - project members query is invalidated when a project id is returned
- If the invitation accept call returns a project id:
  - user is redirected to `/projects/:id`
- If the invitation accept call succeeds without a project id:
  - user is redirected to `/dashboard`
- If the invitation accept call fails after login:
  - backend error messages are shown as toasts
  - user is redirected back to `/project/invitation/:token`
- If there is no invite token:
  - login keeps the normal behavior and redirects to `/dashboard`

Implementation notes:

- `useApiMutation` awaits async `onSuccess` handlers, so login remains pending while the invite accept request runs.
- `Button asChild` now passes the real child directly to Radix Slot when not loading, which preserves button styling for React Router links.

### Removed Legacy Auth Invite Flow

Removed route:

```txt
/invite/:token
```

Removed old auth invite frontend pieces:

- `src/features/auth/pages/InviteAcceptPage.tsx`
- `src/features/auth/components/InvitePreviewCard.tsx`
- `src/features/auth/hooks/useInvitePreview.ts`
- `src/features/auth/hooks/useInviteAccept.ts`

Removed old auth service calls:

- `GET /auth/invite/:token`
- `POST /auth/invite/:token/accept`

The only invitation flow now kept by the frontend is the project invitation flow.

## Current Backend Endpoints Used

Projects:

```txt
GET    /projects
POST   /projects
GET    /projects/:projectId
PATCH  /projects/:projectId
GET    /projects/:projectId/members
PATCH  /projects/:projectId/members/:memberId
DELETE /projects/:projectId/members/:memberId
```

Invitations:

```txt
POST   /projects/:projectId/invites
GET    /projects/invites/:inviteToken
POST   /projects/invites/:inviteToken/accept
POST   /projects/invites/:inviteToken/decline
```

## Known TODOs

### Invitation Signup Continuation

Not implemented yet:

- If invited user does not have an account:
  - redirect to signup with invite token
  - send invite token with signup request
  - backend should create user and enroll them into project

Current state:

- The page links logged-out users to `/login?inviteToken=:token`.
- Login consumes this token and accepts the project invite after successful login.
- Register does not yet consume this token.

### Pending Invites Management

Not implemented yet:

- Pending invites list.
- Pending invite row.
- Resend invite.
- Revoke invite.
- Filter invites by status.

Existing query key:

```ts
QUERY_KEYS.projects.invites(projectId)
```

### Member Management

Implemented:

- Change member role.
- Remove member.

Not implemented yet:

- Leave project.
- Display role-specific permissions in UI.

### Permission Cleanup

Current behavior:

- `AdminGuard` means project owner guard.
- `MemberGuard` is still permissive and should be implemented.
- `workshop` is currently owner-only because it is nested under `AdminGuard`.
- `boards` and `my-workspace` are behind `MemberGuard`, but that guard still needs real membership enforcement.

Needed:

- Rename `AdminGuard` or introduce a clearer `ProjectOwnerGuard`.
- Implement `MemberGuard`.
- Confirm whether `OWNER`, `EDITOR`, and `VIEWER` should have different access to workshop, board, and workspace routes.

### Sidebar Visibility

Current state:

- Project overview hides the Settings button for non-owners.
- Sidebar project menu may still need role-aware visibility cleanup.

Needed:

- Hide settings/workshop actions from sidebar for non-owners.
- Use the same project role helper logic.

### Data Shape Cleanup

Current issue:

- Some project models use `createdAt` / `updatedAt`.
- Some project feature API types use `created_at` / `updated_at`.
- Invitation data supports both a nested `project` object and flat `projectId` / `projectName`.

Needed:

- Decide on a frontend-normalized shape.
- Add API mappers if backend responses stay inconsistent.

### Tests

Not implemented yet:

- Unit tests for role helpers.
- Page tests for invitation states.
- Guard tests for owner-only route access.
- Mutation tests for accept/decline invite behavior.

## Important Files

Routes:

- `src/router/index.tsx`
- `src/router/AdminGuard.tsx`
- `src/router/MemberGuard.tsx`

Project services and hooks:

- `src/features/project/services/index.ts`
- `src/features/auth/hooks/useLogin.ts`
- `src/features/project/hooks/useInviteMember.ts`
- `src/features/project/hooks/useUpdateProject.ts`
- `src/features/project/hooks/useUpdateProjectMemberRole.ts`
- `src/features/project/hooks/useRemoveProjectMember.ts`
- `src/features/project/hooks/useProjectInvitation.ts`
- `src/features/project/hooks/useAcceptProjectInvitation.ts`
- `src/features/project/hooks/useDeclineProjectInvitation.ts`

Project pages:

- `src/features/project/pages/CreateProjectPage.tsx`
- `src/features/project/pages/ProjectOverviewPage.tsx`
- `src/features/project/pages/ProjectSettingsPage.tsx`
- `src/features/project/pages/ProjectMembersPage.tsx`
- `src/features/project/pages/ProjectInvitationPage.tsx`

Invitation components:

- `src/features/project/components/InviteMembersForm.tsx`
- `src/features/project/components/invitation/InvitationActions.tsx`
- `src/features/project/components/invitation/InvitationDetail.tsx`
- `src/features/project/components/invitation/InvitationLayout.tsx`
- `src/features/project/components/invitation/InvitationMessage.tsx`
- `src/features/project/components/invitation/InvitationProjectSummary.tsx`

Types and validation:

- `src/types/enums.ts`
- `src/features/project/types/project-invite.ts`
- `src/features/project/types/project-member.ts`
- `src/features/project/validation/invite.schema.ts`
- `src/features/project/validation/create-project.schema.ts`

Role utilities:

- `src/features/project/utils/roles.ts`
