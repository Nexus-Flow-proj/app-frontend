# Workshop Canvas and Team Board Backend Integration

Status: frontend implementation complete; canvas backend contract pending  
Audience: backend developers, frontend developers, and AI agents  
Last updated: 2026-07-14

## Purpose

This document defines how the Main Workshop canvas integrates with the backend
and how a Workshop plan becomes a working Team Board.

The Main Workshop is not another Kanban implementation. It is the project's
visual planning document. It stores the spatial layout and a lightweight
planning representation of features and tasks.

The Team Board remains the operational task-management system. It owns all
workflow fields and is the reference for day-to-day project work.

The minimum backend work required by the current frontend is:

```txt
GET   /projects/:projectId/canvas
PATCH /projects/:projectId/canvas
```

The existing Board and Task endpoints are already used by the frontend to
publish Workshop features and tasks.

### Temporary frontend mock mode

Until the canvas backend is available, the Workshop runs with:

```env
VITE_WORKSHOP_MOCK_MODE=true
```

Mock mode is currently the default when the variable is omitted. It loads a
realistic project canvas and persists edits in browser `localStorage`. It also
bypasses Board mutation requests during Workshop Save so the complete Workshop
experience can be tested without backend availability.

To enable the real canvas and Board integration:

```env
VITE_WORKSHOP_MOCK_MODE=false
```

No component or state-management changes are required when switching.

For production reliability, a transactional publish endpoint is recommended
later in this document.

---

## Product Model in Plain Language

```txt
Main Workshop
├── Feature frames
│   └── Task cards physically contained by the feature
├── Feature-to-feature connections
├── Canvas-only sticky notes
└── Viewport and spatial layout

Team Board
├── Feature becomes a board column
├── Task becomes a board task card
├── Feature connection order becomes board column order
└── Sticky notes are never sent to the Board
```

The workflow is:

1. The AI agent or admin creates the project plan in the Workshop.
2. The admin enters edit mode.
3. All edits remain a local draft until Save is clicked.
4. Save creates or updates Board columns and tasks.
5. Save stores the complete spatial canvas document.
6. The Board then manages status, priority, assignee, comments, subtasks,
   attachments, labels, time logs, and normal Kanban movement.

Revert does not call the backend. It restores the locally cached published
canvas snapshot.

---

## Data Ownership

The most important backend rule is to keep spatial data separate from
operational Board data.

| Data                            | Owner  | Notes                                                         |
| ------------------------------- | ------ | ------------------------------------------------------------- |
| Object x/y/width/height         | Canvas | Never belongs in Board tables                                 |
| Object rotation/z-index         | Canvas | Canvas rendering only                                         |
| Viewport x/y/scale              | Canvas | Restores the user's saved camera                              |
| Sticky note content/color       | Canvas | Never creates a Board record                                  |
| Feature connections             | Canvas | Used to calculate feature/column order                        |
| Feature title/color             | Shared | Canvas before first publish; Board is canonical after linking |
| Task title/description/due date | Shared | Canvas before first publish; Board is canonical after linking |
| Task status/priority/type       | Board  | Not editable from the Workshop                                |
| Task assignee                   | Board  | Not editable from the Workshop                                |
| Comments/subtasks/attachments   | Board  | Never stored in the canvas document                           |
| Labels/time logs/activity       | Board  | Never stored in the canvas document                           |

### Canonical-data rule after publishing

Before the first publish, the Workshop is the source of the feature and task
planning fields.

After a feature has a `boardColumnId`, the Board column is canonical for its
business fields. After a task has a `taskId`, the Board task is canonical for
its business fields.

The canvas still keeps a lightweight copy of these fields so it is immediately
renderable. The backend should reconcile linked objects with current Board data
when returning the canvas, as described in the reconciliation section.

---

## Current Frontend Integration

The current frontend is implemented around these methods:

```ts
workshopService.getCanvas(projectId);
workshopService.saveCanvas(projectId, payload);
workshopService.publishPlanToBoard(projectId, payload);
```

Relevant files:

```txt
src/features/workshop/services/index.ts
src/features/workshop/hooks/useWorkshopCanvasSource.ts
src/features/workshop/hooks/usePublishWorkshopPlan.ts
src/features/workshop/store/workshopStore.ts
src/features/workshop/types/index.ts
src/features/workshop/types/canvasObjectData.ts
src/features/workshop/utils/featureContainment.ts
src/features/workshop/utils/workshopPlan.ts
```

React Query owns the canvas response from the backend:

```ts
QUERY_KEYS.canvas.main(projectId);
```

Zustand holds only the local editable canvas copy, selection state, draft
snapshot, undo/redo state, and viewport.

---

## Frontend Changes Already Completed

The following behavior is implemented in the frontend and should be treated as
the current integration baseline.

### Canvas data source

- Workshop hydration no longer projects the canvas from Board queries.
- The Workshop loads its published spatial document from the canvas endpoint.
- The Board remains the publish target for features and tasks.
- Canvas React Query data is copied into Zustand only as the local interactive
  working document.

### Read-only and draft modes

- The Workshop opens in read-only mode.
- Edit mode clones the current objects, connections, and viewport as the
  published baseline.
- Object creation, object movement, content mutation, connections, undo, redo,
  and deletion require edit mode.
- Save publishes the plan and persists the canvas.
- Revert restores the pre-edit objects, connections, and viewport without an
  API call.
- There is no debounce autosave for drafts.

### Features and tasks

- The Main Workshop supports feature frames and tasks instead of the previous
  Milestone, Decision, and Risk object types.
- A task cannot be created without a containing feature.
- Task `featureId` is assigned automatically from canvas containment.
- Task drag movement is clamped to its feature.
- Moving a feature moves all of its tasks live by the same coordinate delta.
- Deleting a feature removes its contained canvas tasks in the draft.
- The task detail drawer no longer offers manual feature assignment.
- Feature connections are the only Board-order connections.

### Sticky notes

- Sticky notes were restored as a Main Workshop tool.
- Sticky notes support content, color, size, rotation, and position.
- Sticky notes render on the stage and appear in a separate sidebar section.
- Sticky notes are saved only in the canvas document.
- Sticky notes are ignored by all Board synchronization logic.

### Canvas presentation

- Feature frames have a dedicated header and task containment area.
- Task cards have an improved visual hierarchy and due-date treatment.
- Sticky notes have a folded-note visual treatment.
- The stage, grid, shadows, selection states, and toolbar were refined.
- Connection arrows render between the nearest edge centers of two features.
- The sidebar presents each feature with its directly nested tasks.

### Persistence details

- The save payload contains all objects, connections, and viewport data.
- Published and reverted state includes the viewport.
- Returned `boardColumnId` and `taskId` values are written back into canvas
  objects before canvas persistence.
- Canvas, Board-column, and task queries are invalidated after publication.

---

## Required Canvas Endpoints

### 1. Get the Main Workshop canvas

```http
GET /projects/:projectId/canvas
```

Expected behavior:

- authenticate the user;
- verify project membership and Workshop read permission;
- return the project's Main Workshop canvas;
- return a valid empty canvas for a new project;
- reconcile linked feature/task display fields with current Board data;
- never return another project's canvas;
- return sticky notes unchanged.

For a new project, return an empty document instead of `404`. The current
frontend treats a query error as unavailable and disables edit mode.

Recommended new-project response:

```json
{
  "success": true,
  "message": "Canvas loaded",
  "statusCode": 200,
  "data": {
    "id": "canvas_project_123",
    "projectId": "project_123",
    "owner": {
      "id": "user_1",
      "firstName": "Project",
      "lastName": "Admin",
      "name": "Project Admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2026-07-14T10:00:00.000Z",
      "updatedAt": "2026-07-14T10:00:00.000Z"
    },
    "type": "PROJECT",
    "objects": [],
    "connections": [],
    "viewport": {
      "x": 24,
      "y": 24,
      "scale": 0.82
    },
    "createdAt": "2026-07-14T10:00:00.000Z",
    "updatedAt": "2026-07-14T10:00:00.000Z"
  }
}
```

### 2. Save the complete Main Workshop canvas

```http
PATCH /projects/:projectId/canvas
Content-Type: application/json
x-csrf-token: <token>
```

Although this is a `PATCH`, the current frontend sends all three persisted
canvas sections on every save:

```ts
interface SaveCanvasPayload {
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
}
```

The backend should treat these fields as the complete replacement for the
published canvas document.

Expected behavior:

- authenticate and authorize the actor;
- validate the entire document;
- upsert the canvas if it does not exist;
- preserve all stable canvas object IDs;
- persist objects, connections, and viewport atomically;
- return the complete canonical Canvas object;
- update `updatedAt`;
- never store the temporary frontend draft snapshot.

The frontend uses the returned `data.objects`, `data.connections`, and
`data.viewport` as the new published state. Returning only a message is not
sufficient.

---

## API Response Wrapper

All responses must use the repository's existing response shape:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  error?: string;
  statusCode: number;
  data: T;
}
```

Successful canvas save:

```json
{
  "success": true,
  "message": "Canvas saved",
  "statusCode": 200,
  "data": {
    "id": "canvas_project_123",
    "projectId": "project_123",
    "owner": {
      "id": "user_1",
      "firstName": "Project",
      "lastName": "Admin",
      "name": "Project Admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2026-07-14T10:00:00.000Z",
      "updatedAt": "2026-07-14T11:30:00.000Z"
    },
    "type": "PROJECT",
    "objects": [],
    "connections": [],
    "viewport": {
      "x": 24,
      "y": 24,
      "scale": 0.82
    },
    "createdAt": "2026-07-14T10:00:00.000Z",
    "updatedAt": "2026-07-14T11:30:00.000Z"
  }
}
```

---

## Canvas Document Contract

### Canvas

```ts
interface Canvas {
  id: string;
  projectId: string;
  owner: User;
  type: "PROJECT";
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
  createdAt: string;
  updatedAt: string;
}
```

### Viewport

```ts
interface CanvasViewport {
  x: number;
  y: number;
  scale: number;
}
```

Current frontend zoom bounds:

```txt
minimum scale: 0.15
maximum scale: 3
default scale: 0.82
```

### Base canvas object

```ts
interface CanvasObject {
  id: string;
  type: "SECTION_FRAME" | "TASK_CARD" | "STICKY_NOTE";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  data: FeatureData | TaskData | StickyNoteData;
}
```

Only these three object types are currently supported in the Main Workshop.
Other global canvas enum values belong to other or future canvas features.

---

## Feature Object

A feature is a visual frame and becomes a Board column.

```json
{
  "id": "feature_01",
  "type": "SECTION_FRAME",
  "x": 120,
  "y": 160,
  "width": 560,
  "height": 420,
  "rotation": 0,
  "zIndex": 0,
  "data": {
    "kind": "Feature",
    "title": "Authentication",
    "description": "Login, registration, recovery, and session management.",
    "backgroundColor": "#F5F3FF",
    "borderColor": "#C4B5FD",
    "boardColumnId": "board_column_81"
  }
}
```

Feature data:

```ts
interface SectionFrameData {
  boardColumnId?: string;
  kind: "Feature";
  title: string;
  description?: string;
  backgroundColor: string;
  borderColor: string;
}
```

`boardColumnId` is absent before the first successful Board publish. It must
be retained in future canvas responses.

Board mapping:

```txt
feature.data.title       -> board column name
feature.data.borderColor -> board column color
connection order         -> board column sortOrder
```

---

## Task Object

A task must belong to exactly one feature and must be physically contained
inside that feature's frame.

```json
{
  "id": "canvas_task_01",
  "type": "TASK_CARD",
  "x": 144,
  "y": 256,
  "width": 220,
  "height": 124,
  "rotation": 0,
  "zIndex": 2,
  "data": {
    "kind": "Task",
    "title": "Implement login endpoint",
    "description": "Validate credentials and create the authenticated session.",
    "dueDate": "2026-08-10",
    "featureId": "feature_01",
    "taskId": "task_302"
  }
}
```

Task data:

```ts
interface TaskCardData {
  taskId?: string;
  featureId: string;
  kind: "Task";
  title: string;
  description?: string;
  dueDate?: string;
}
```

`taskId` is absent before the first successful Board publish. `featureId`
must always reference a `SECTION_FRAME` object in the same canvas.

Dates currently use a date-only ISO string:

```txt
YYYY-MM-DD
```

Board mapping:

```txt
task.data.title       -> task title
task.data.description -> task description
task.data.dueDate     -> task deadline
feature.boardColumnId -> task boardColumnId
```

New Workshop tasks currently receive these Board defaults:

```txt
type     = FEATURE
status   = TODO
priority = MEDIUM
```

The Board owns those values after task creation.

---

## Sticky Note Object

A sticky note exists only in the canvas. It must never create, update, move, or
delete a Board record.

```json
{
  "id": "note_01",
  "type": "STICKY_NOTE",
  "x": 760,
  "y": 180,
  "width": 188,
  "height": 176,
  "rotation": -1,
  "zIndex": 3,
  "data": {
    "kind": "Note",
    "content": "Confirm the refresh-token expiry policy.",
    "color": "#FEF3C7",
    "fontSize": 13
  }
}
```

Sticky note data:

```ts
interface StickyNoteData {
  kind: "Note";
  content: string;
  color: string;
  fontSize: number;
}
```

---

## Feature Connections

Connections can link features only.

```json
{
  "id": "connection_01",
  "fromObjectId": "feature_01",
  "toObjectId": "feature_02",
  "label": "next",
  "style": {
    "color": "#8B5CF6",
    "strokeWidth": 2,
    "type": "ARROW"
  }
}
```

Connection contract:

```ts
interface CanvasConnection {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  label?: string;
  style: {
    color: string;
    strokeWidth: number;
    type: "ARROW" | "LINE" | "DASHED";
  };
}
```

Rules:

- both endpoints must reference existing `SECTION_FRAME` objects;
- a connection cannot point to itself;
- duplicate directed connections should be rejected;
- cycles must be rejected because the Board needs a deterministic column order;
- tasks and sticky notes cannot be connection endpoints.

The frontend calculates Board column order with a topological sort. When
multiple unconnected features are valid at the same point in the graph, their
visual x/y order is used as the fallback.

The arrow attachment points are calculated by the frontend at render time.
The backend stores object IDs, not arrow pixel coordinates.

---

## Object ID Policy

Canvas object IDs are client-generated stable identifiers.

Recommended backend behavior:

- accept the provided object and connection IDs;
- scope their uniqueness to a canvas or use globally unique IDs;
- never replace object IDs during an ordinary save;
- reject duplicates inside the same document.

This is important because IDs are referenced by:

```txt
task.data.featureId
connection.fromObjectId
connection.toObjectId
```

If the backend changes an object ID, it must rewrite every internal reference
in the same transaction and return the rewritten canonical document.

Board IDs are different:

```txt
feature.data.boardColumnId -> backend Board column ID
task.data.taskId           -> backend Task ID
```

These mapping IDs are added after Board records are created and then persisted
inside the canvas document.

---

## Task Containment

Task-to-feature assignment is automatic. There is no manual feature selector.

The frontend guarantees:

- a new task cannot be created without a feature;
- a task is positioned inside its feature;
- dragging a task is clamped to the feature's content area;
- moving a feature translates all of its tasks by the same x/y delta;
- loading an older invalid document attempts to repair task containment;
- deleting a feature deletes its contained canvas tasks from the draft.

Current feature content insets:

```txt
horizontal padding: 24px
content top:        96px
bottom padding:     24px
```

The backend should still validate:

1. every task has a valid `featureId`;
2. the referenced object is a feature;
3. the task rectangle is inside the referenced feature rectangle;
4. task and feature belong to the same canvas.

The backend does not need to implement grouped movement. It persists the final
absolute coordinates sent by the frontend.

---

## Current Save and Publish Sequence

The current frontend uses existing Board/Task endpoints and then saves the
canvas.

```txt
1. Validate the local draft
   - at least one feature
   - every task belongs to and sits inside a feature
   - connections link features only
   - connection graph has no cycle

2. Fetch current Board data
   GET /projects/:projectId/boards
   GET /projects/:projectId/tasks

3. Diff the draft against the local published canvas snapshot

4. Delete removed linked tasks
   DELETE /tasks/:taskId

5. Create or update a Board column for every feature
   POST  /projects/:projectId/boards
   PATCH /boards/:boardColumnId

6. Store returned boardColumnId values in feature.data

7. Create or update a Board task for every canvas task
   POST  /projects/:projectId/tasks/:columnId
   PATCH /tasks/:taskId

8. Store returned taskId values in task.data

9. Delete removed linked feature columns
   DELETE /boards/:boardColumnId

10. Reorder Board columns
    PATCH /projects/:projectId/boards/reorder

11. Persist the complete canvas
    PATCH /projects/:projectId/canvas

12. Replace the local draft with the returned canonical canvas
```

Protected Board columns are not deleted.

Board columns that are not linked to Workshop features are retained and placed
after the Workshop-managed columns by the current frontend.

---

## Important Limitation of the Current Multi-Request Publish

The current sequence is not atomic.

Example failure:

1. two Board columns are created successfully;
2. three tasks are created successfully;
3. canvas persistence fails;
4. the Board now contains records whose IDs were not saved into the canvas.

The frontend keeps the local draft open after an error, but it cannot roll back
successful backend mutations reliably.

The two canvas endpoints are enough for initial integration, but a
transactional publish endpoint is strongly recommended before production.

---

## Recommended Transactional Publish Endpoint

Recommended route:

```http
POST /projects/:projectId/canvas/publish
Content-Type: application/json
x-csrf-token: <token>
```

Recommended request:

```json
{
  "canvasId": "canvas_project_123",
  "baseVersion": 7,
  "objects": [],
  "connections": [],
  "viewport": {
    "x": 24,
    "y": 24,
    "scale": 0.82
  }
}
```

The backend can diff this document against the currently persisted canvas. It
does not need the frontend's temporary `publishedSnapshot`.

Recommended transaction:

```txt
BEGIN

1. Lock the project canvas row.
2. Check baseVersion.
3. Validate the complete canvas graph.
4. Load the previous persisted canvas.
5. Detect added, changed, and removed features/tasks.
6. Validate protected Board-column rules.
7. Create/update/delete linked Board columns.
8. Create/update/delete linked Board tasks.
9. Calculate and persist Board column order.
10. Write returned boardColumnId/taskId values into canvas objects.
11. Persist objects, connections, viewport, and incremented version.

COMMIT
```

Return the complete canonical canvas in the normal `ApiResponse<Canvas>`
wrapper.

When this endpoint exists, the frontend can replace the client-side orchestration
inside `publishPlanToBoard` with one mutation.

---

## Board-to-Canvas Reconciliation

The Board is the day-to-day reference after publication, so the backend must
define how Board changes appear when the Workshop is opened again.

Recommended GET reconciliation:

### Linked feature

When `feature.data.boardColumnId` exists:

- overlay the current Board column name onto `feature.data.title`;
- overlay the current Board color onto `feature.data.borderColor`;
- preserve canvas geometry, description, background color, and object ID.

### Linked task

When `task.data.taskId` exists:

- overlay current task title;
- overlay current task description;
- overlay current task deadline as `dueDate`;
- derive `featureId` from the task's current Board column by matching that
  column to a feature's `boardColumnId`;
- preserve canvas object ID, geometry, rotation, and z-index.

If a task was moved to another Board column, the updated `featureId` may make
its old coordinates invalid. The frontend normalizes and clamps the task into
the new feature when loading.

### Deleted Board records

Recommended policy:

- if a linked task was deleted from the Board, remove its linked canvas task
  from the returned document;
- if a linked feature column was deleted, remove or explicitly report the
  feature and its linked canvas tasks;
- never delete sticky notes because of Board changes.

Do not silently recreate a Board record merely because a stale linked canvas
object exists.

### Column-order decision

The current frontend reorders Board columns on every Workshop save based on
feature connections.

That means a later Board-only column reorder can be overwritten by the next
Workshop save.

Recommended production policy:

- only change Board column order when Workshop connections actually changed;
- add a `connectionsChanged` flag or compare the submitted graph against the
  persisted graph inside the transactional publish endpoint;
- otherwise preserve the current Board order.

This requires a small future frontend/backend agreement. The minimum two-endpoint
canvas integration can proceed before that decision.

---

## Suggested Persistence Model

The canvas is saved as a complete document, so JSON storage is a practical
first implementation.

Example table:

```txt
project_canvases
---------------
id              uuid/string primary key
project_id      uuid/string unique not null
owner_id        uuid/string not null
type            enum/string not null         // PROJECT
objects         json/jsonb not null
connections     json/jsonb not null
viewport        json/jsonb not null
version         integer not null default 1
created_at      timestamp not null
updated_at      timestamp not null
```

Recommended indexes:

```txt
unique(project_id, type)
index(owner_id)
```

JSONB is sufficient while the application saves and loads the whole document.
Normalize canvas objects into a separate table only if the backend later needs
object-level querying, permissions, or high-volume collaborative patches.

Board columns and tasks remain in their existing normalized Board tables.

---

## Concurrency and Real-Time Safety

The current frontend contract does not yet include a version field. Without
one, whole-document saves are last-write-wins.

Recommended addition:

```ts
interface Canvas {
  // existing fields
  version: number;
}
```

Save/publish should send the last loaded version:

```json
{
  "baseVersion": 7,
  "objects": [],
  "connections": [],
  "viewport": {
    "x": 24,
    "y": 24,
    "scale": 0.82
  }
}
```

If the stored version is no longer 7:

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "The canvas changed after you entered edit mode.",
  "error": "CANVAS_VERSION_CONFLICT",
  "statusCode": 409,
  "data": null
}
```

The frontend type and mutation will need a small update when versioning is
added.

For the first admin-only implementation, last-write-wins is acceptable if the
team understands the limitation.

---

## Backend Validation

Validate the document even though the frontend validates it.

### Document validation

- `objects`, `connections`, and `viewport` are required arrays/object;
- all numbers are finite;
- width and height are positive;
- viewport scale is between 0.15 and 3;
- object IDs are unique;
- connection IDs are unique;
- object type matches the shape of `data`;
- strings have sensible maximum lengths;
- colors follow the accepted color format;
- reject unsupported Main Workshop object types.

### Feature validation

- kind is `Feature`;
- title is required;
- width and height are large enough to contain tasks;
- `boardColumnId`, when provided, belongs to the same project.

### Task validation

- kind is `Task`;
- title is required;
- `featureId` references a feature in the same document;
- task rectangle is inside the feature;
- `taskId`, when provided, belongs to the same project;
- due date is absent or a valid date-only ISO value.

### Sticky-note validation

- kind is `Note`;
- content is required;
- no Board IDs are accepted;
- font size and dimensions have safe limits.

### Connection validation

- source and target exist;
- source and target are features;
- source and target are different;
- no duplicate edge;
- no cycle when connections control Board ordering.

### Payload limits

Add server-side limits for:

- maximum canvas request size;
- maximum objects per canvas;
- maximum connections per canvas;
- maximum sticky-note content;
- maximum feature/task title and description.

Exact product limits should be agreed with the frontend before enforcement.

---

## Authorization and Security

Suggested rules:

### GET canvas

- authenticated;
- user is a project member;
- user has `workshop.read` or admin authority.

### PATCH canvas

- authenticated;
- CSRF protected;
- user can update Workshop nodes;
- object references belong to the route project;
- never trust project IDs or owner IDs supplied inside object data.

### Transactional publish

Require the combined authority to:

- update Workshop nodes;
- create/update/delete tasks;
- manage Board columns.

The current frontend edit button checks these permission groups, but backend
authorization remains mandatory.

---

## Recommended Error Responses

```txt
400 BAD_REQUEST
- malformed JSON or invalid primitive field

401 UNAUTHORIZED
- no active authenticated session

403 FORBIDDEN
- not a project member or insufficient permission

404 PROJECT_NOT_FOUND
- route project does not exist

409 CANVAS_VERSION_CONFLICT
- stale baseVersion

409 PROTECTED_BOARD_COLUMN
- draft tries to delete a protected linked column

409 BOARD_REFERENCE_CONFLICT
- taskId/boardColumnId belongs to another project or no longer exists

422 CANVAS_INVALID_REFERENCE
- task featureId or connection endpoint is invalid

422 CANVAS_CONNECTION_CYCLE
- connection graph cannot produce a Board order

413 PAYLOAD_TOO_LARGE
- canvas exceeds configured limits
```

Example validation error:

```json
{
  "success": false,
  "message": "Task 'Implement login endpoint' must be inside feature 'Authentication'.",
  "error": "CANVAS_INVALID_REFERENCE",
  "statusCode": 422,
  "data": null
}
```

---

## AI-Generated Plans

AI-created features, tasks, notes, connections, and positions use the same
canvas contract.

The backend does not need separate persistence rules for AI objects.

Recommended AI flow:

1. AI returns a structured Workshop draft.
2. Frontend validates and displays it in edit mode.
3. Admin reviews and adjusts it.
4. Normal Save/Publish performs Board synchronization.

If AI generation runs on the backend, it should return canvas objects without
`boardColumnId` or `taskId`. Those IDs are assigned only during publication.

---

## Minimum Backend Implementation Checklist

The frontend can integrate when all of these are true:

- [ ] `GET /projects/:projectId/canvas` exists.
- [ ] GET returns an empty canvas for a new project.
- [ ] `PATCH /projects/:projectId/canvas` exists.
- [ ] PATCH upserts and atomically saves objects/connections/viewport.
- [ ] PATCH returns the complete canonical Canvas.
- [ ] Canvas object IDs are preserved.
- [ ] Feature `boardColumnId` values are preserved.
- [ ] Task `taskId` and `featureId` values are preserved.
- [ ] Sticky notes are persisted without Board records.
- [ ] Linked feature/task display fields are reconciled from current Board data
      when the canvas is loaded.
- [ ] Board task movement is reflected in the linked canvas task's
      `featureId`.
- [ ] Project membership and Workshop permissions are enforced.
- [ ] Non-GET requests use the existing CSRF protection.
- [ ] Invalid cross-project Board IDs are rejected.
- [ ] API responses use the existing `ApiResponse<T>` wrapper.

---

## Recommended Production Checklist

- [ ] Add transactional `POST /projects/:projectId/canvas/publish`.
- [ ] Perform Board sync and canvas persistence in one database transaction.
- [ ] Add canvas versioning and return `409` for stale drafts.
- [ ] Define Board-delete behavior for linked canvas objects.
- [ ] Preserve Board column order unless Workshop connections changed.
- [ ] Add integration tests for partial-failure rollback.
- [ ] Add request-size and object-count limits.
- [ ] Add audit/activity events for Workshop publication.

---

## Integration Test Scenarios

Backend and frontend should test these together:

1. Open a new project and receive an empty editable canvas.
2. Create two features, connect them, add contained tasks, and save.
3. Verify two Board columns are created in connection order.
4. Verify each task is created in the correct column.
5. Verify returned Board IDs are persisted in the canvas.
6. Reload the Workshop and restore exact geometry and viewport.
7. Move a feature and confirm all task coordinates were saved with the delta.
8. Add a sticky note and confirm no Board record is created.
9. Change task status/assignee on the Board and confirm the canvas does not
   overwrite those Board-only fields.
10. Change task title/deadline on the Board and verify GET reconciliation.
11. Move a task to another Board column and verify its canvas `featureId`
    updates on the next load.
12. Delete a linked task on the Board and verify the agreed canvas behavior.
13. Attempt to publish a connection cycle and receive a validation error.
14. Attempt to reference another project's task/column ID and receive an error.
15. Simulate a save failure and verify transaction rollback when the publish
    endpoint is implemented.
16. Simulate two editors and verify the version-conflict response.

---

## Questions to Confirm With the Backend Developer

These decisions should be answered before final production integration:

1. Will the canvas route be exactly `/projects/:projectId/canvas`?
2. Will every project receive a canvas row during project creation, or will
   PATCH upsert it?
3. Will GET return an empty canvas or `404` before the first save?
4. Does the Canvas response return a full `owner`, owner summary, or
   `ownerId`?
5. Will the backend preserve client-generated object IDs?
6. Will objects/connections/viewport be stored as JSONB or normalized rows?
7. Will linked Board fields be reconciled during GET?
8. What should happen when a linked task or column is deleted from the Board?
9. Can a Workshop-managed feature link to a protected Board column?
10. Should Board column order change on every Workshop save or only when
    connections changed?
11. Can the backend implement the transactional publish endpoint now, or is
    the client-orchestrated flow acceptable for the first release?
12. Will canvas versioning be included in the first release?
13. What maximum canvas payload/object limits should be enforced?

---

## Short Explanation to Give the Backend Developer

You can send this paragraph directly:

> We need one Main Workshop canvas per project. The canvas endpoint must save
> the entire spatial document: feature frames, task cards, sticky notes,
> feature connections, every object's x/y/width/height/rotation/z-index, and
> the viewport. Features link to Board columns through `boardColumnId`, tasks
> link to Board tasks through `taskId`, and each canvas task links to its
> containing feature through `featureId`. Sticky notes are canvas-only. The
> current frontend already publishes features/tasks through the existing
> Board APIs, so the minimum backend work is GET and PATCH
> `/projects/:projectId/canvas`, with PATCH returning the complete saved
> canvas. For production, we should move the Board synchronization and canvas
> save into one transactional `/canvas/publish` endpoint to prevent partial
> updates.

---

## Final Architecture Summary

```txt
Canvas endpoint owns:
geometry + viewport + connections + sticky notes + Board ID mappings

Board endpoints own:
columns + operational tasks + workflow fields + collaboration data

Shared planning fields:
created in Workshop, canonical in Board after publication, reconciled on load

Current Save:
frontend orchestrates Board endpoints, then PATCHes canvas

Recommended Save:
one backend transaction publishes Board changes and persists canvas together
```
