# Nexus-Flow Mini Workshop Guide

## 1. What the Mini Workshop is

The **Mini Workshop** is a private, infinite visual workspace for one project member. It is deliberately different from the Main Workshop:

| Area | Main Workshop | Mini Workshop |
| --- | --- | --- |
| Purpose | Admin onboarding and project-plan creation | Personal visual thinking, planning, and notes |
| Route | Onboarding Workshop route | `/projects/:projectId/my-workspace` |
| Collaboration | Main project planning flow | Private to the current member |
| Team Board impact | Can create the project plan | Board task references are read-only and never mutate Board tasks |
| Persistence | Main Workshop contract | Version-2 Mini Workshop document, manually saved |

Use it to make mind maps, process diagrams, personal notes, planning boards, and visual task references without changing the shared Team Board.

## 2. User experience

### Header

The header contains:

- Back navigation.
- Project name.
- `Saved` or `Unsaved` state. Viewport movement does **not** make the document unsaved; content changes do.
- Theme selector for **Light**, **Dark**, and **System** mode.
- Export menu.
- Manual Save button.

When a user tries to leave with unsaved content changes, the page shows a confirmation dialog. Browser/tab close also warns when unsaved content exists.

### Canvas

The canvas is infinite, pan/zoomable, and uses the Nexus-Flow dot-grid design:

- Light mode: soft off-white surface with violet ambient detail.
- Dark mode: dark violet surface with low-contrast violet grid detail.
- Major grid lines appear every four small grid cells.
- The background is rendered within Konva, so it is included in PNG exports.

The lower-left status pill reports the current object count, connection count, and zoom percentage.

## 3. Canvas tools

The floating toolbar is at the bottom of the canvas.

| Tool | What it does | Shortcut |
| --- | --- | --- |
| Select | Select, move, transform, and multi-select objects | `V` |
| Pan | Drag the canvas viewport | `H` |
| Freehand | Draw a freehand stroke | `P` |
| Erase stroke | Removes complete freehand strokes | `E` |
| Shapes | Adds a rectangle, rounded rectangle, ellipse, diamond, or triangle | `S` |
| Connector | Connects two objects | `C` |
| Text | Adds editable text | `T` |
| Sticky note | Adds an editable sticky note | `N` |
| Frame | Adds a planning-area frame | `F` |
| Task | Opens the task placement flow at the clicked canvas position | `K` |
| Image | Uploads and inserts a compressed image | `I` |
| Templates | Opens the ready-template gallery | — |
| Search canvas | Finds an object and centers it in view | `Ctrl/Cmd + K` |
| Undo / Redo | Reverses or restores content changes | `Ctrl/Cmd + Z`, `Ctrl/Cmd + Shift + Z` |

Object creation tools return to Select after placing one object. Freehand and Connector remain active until the user presses `Escape` or chooses another tool.

### Pan and zoom

- Use the **Pan** tool to drag the viewport.
- Use the mouse wheel or trackpad to zoom around the pointer.
- Zoom is constrained to `18%`–`300%`.
- Viewport position and zoom are stored on Save but do not set the `Unsaved` content state.

## 4. Objects and editing

The Mini Workshop supports eight persisted object types.

| Type | User-facing purpose | Important data |
| --- | --- | --- |
| `SHAPE` | Diagram and flowchart geometry | Shape kind and optional text |
| `TEXT` | Free text label | Text content |
| `STICKY_NOTE` | Personal idea or note | Text content |
| `IMAGE` | Uploaded visual reference | Asset ID and alt text |
| `FRAME` | Visual planning area or grouping region | Title and optional description |
| `FREEHAND` | Pen stroke | Local point/pressure tuples |
| `PERSONAL_TASK` | Personal canvas-only task | Title, description, completed state |
| `BOARD_TASK_REFERENCE` | Read-only reference to an existing Board task | Source task ID plus display snapshot |

### Selecting and transforming

- Click an object to select it.
- `Shift + click` adds or removes an object from the selection.
- Drag across empty canvas space with Select active to marquee-select objects.
- Drag selected objects to move them. Smart guides and grid snapping help align them.
- Use the transformer handles to resize or rotate eligible objects.
- Dragging/resizing an object updates any attached connectors.
- Locked objects cannot be moved, changed, or deleted until unlocked.

### Selection toolbar

The contextual Selection Toolbar appears at the top when one or more objects are selected.

- **Fill** shows the selected fill color. Click it to choose a new fill.
- **Stroke** shows the selected stroke color. Click it to choose a new border color.
- If the selection has different values, the control says `Mixed`.
- **Text formatting** shows the active text size and bold state. It contains text size, weight, and alignment options.
- **Border style** shows `Solid`, `Dashed`, or `Mixed`.
- **Connector routing** shows `Straight`, `Curved`, `Elbow`, or `Mixed`.
- It also provides duplicate, group, ungroup, horizontal/vertical alignment, layer order, lock/unlock, and delete actions.

Distribution actions are intentionally not exposed in the toolbar.

### Editing object content

Double-click an editable object to open its editor:

- Shapes: edit their label.
- Text and sticky notes: edit text.
- Frames: edit title and description.
- Personal tasks: edit title and description.
- Images: edit alt text.
- Board task references are read-only because they mirror Team Board data.

## 5. Tasks

Click **Task**, then click a canvas location. The placement dialog offers two paths.

### Personal task

A personal task exists only inside the Mini Workshop.

- It has a title, description, color, and persisted completion field.
- It does not create a Team Board task.
- It can be duplicated like any other canvas object.

### Existing project task

The picker lists project Board tasks and supports:

- Text search.
- Priority filter.
- Assignee filter.
- Due-date filter.
- My Tasks filter.
- Multi-select.

Selected tasks are inserted around the clicked position. The same Board task may be referenced more than once. Changing, moving, duplicating, or deleting a reference never changes its Team Board source task.

If a source Board task is later unavailable, its canvas reference is retained and rendered as unavailable rather than deleting the user’s visual work.

## 6. Connectors

The Connector tool creates visual connections only; they are not Team Board dependencies.

1. Activate **Connector**.
2. Click a source object.
3. Click a different target object.

Each connection stores source/target object IDs, anchors, routing style, optional label, stroke, width, and optional dash pattern.

Available routing styles:

- **Straight**: direct source-to-target line.
- **Curved**: curved visual route.
- **Elbow**: orthogonal route through a middle bend.

Connectors recalculate when their source or target is moved, resized, rotated, grouped, or duplicated.

## 7. Freehand drawing and images

### Freehand

Freehand drawing stores pressure-aware local point tuples but uses clean `x/y` pairs for the live preview. This prevents preview artifacts while drawing. The eraser removes a complete freehand stroke in one action.

### Images

Images are added through the Image button:

- The frontend reads the selected file, downsizes it to a maximum side of `2048px`, and encodes PNG as PNG or other accepted images as WebP at quality `0.86`.
- The binary data is stored once in `scene.assets` as a data URL.
- Image objects store only their asset ID and alt text, allowing multiple image objects to reuse an asset.

## 8. Templates

The **Start with a template** dialog contains eight native Nexus-Flow templates:

1. Mind map
2. Flowchart
3. Brainstorm
4. Visual Kanban
5. Retrospective
6. User-story map
7. Customer journey
8. SWOT analysis

Templates insert at the current viewport center. Every insertion receives fresh object, group, and connection IDs, so template objects are fully editable and never collide with existing work.

The gallery has search and uses an internal scroll area to remain inside the dialog at every viewport height.

## 9. Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Select tool | `V` |
| Pan tool | `H` |
| Freehand tool | `P` |
| Eraser tool | `E` |
| Shape tool | `S` |
| Connector tool | `C` |
| Text tool | `T` |
| Sticky note tool | `N` |
| Frame tool | `F` |
| Task tool | `K` |
| Search canvas | `Ctrl/Cmd + K` |
| Undo | `Ctrl/Cmd + Z` |
| Redo | `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` |
| Duplicate | `Ctrl/Cmd + D` |
| Select all | `Ctrl/Cmd + A` |
| Group | `Ctrl/Cmd + G` |
| Ungroup | `Ctrl/Cmd + Shift + G` |
| Copy | `Ctrl/Cmd + C` |
| Cut | `Ctrl/Cmd + X` |
| Paste | `Ctrl/Cmd + V` |
| Delete selected | `Delete` or `Backspace` |
| Nudge selection | Arrow keys |
| Nudge by 10px | `Shift + Arrow keys` |
| Cancel active tool / clear selection | `Escape` |

## 10. Export

The header Export menu provides:

- **PNG image**: renders the current native Konva scene at 2× pixel ratio, including the canvas background.
- **Editable JSON**: downloads the schema-v2 scene for backup or inspection.

SVG and PDF export are intentionally outside the current Mini Workshop scope.

## 11. Persistence and API

The Mini Workshop is persisted manually through the backend. There is no auto-save and no WebSocket collaboration.

### Load

```http
GET /projects/:projectId/mini-workshop
Accept: application/json
```

### Save

```http
PATCH /projects/:projectId/mini-workshop
Accept: application/json
Content-Type: application/json
x-csrf-token: <token>
```

The request body is a full replacement:

```json
{
  "schemaVersion": 2,
  "revision": 3,
  "scene": {
    "viewport": { "x": 40, "y": 40, "scale": 0.82 },
    "objects": [],
    "connections": [],
    "assets": {}
  }
}
```

The shared Axios client adds the CSRF token for PATCH requests. The backend returns the saved document with an incremented revision. A `409 Conflict` means another save used a newer revision; the frontend refreshes the document and informs the user.

For the full backend data contract, validation rules, ownership rules, asset requirements, and status codes, see [mini-workshop-backend-guide.md](mini-workshop-backend-guide.md).

## 12. Document model

```ts
interface MiniWorkshopDocument {
  id: string | null;
  projectId: string;
  ownerId: string | null;
  schemaVersion: 2;
  revision: number;
  scene: {
    viewport: { x: number; y: number; scale: number };
    objects: MiniCanvasObject[];
    connections: MiniConnection[];
    assets: Record<string, MiniImageAsset>;
  };
  createdAt: string | null;
  updatedAt: string | null;
}
```

Important rules:

- A Mini Workshop document belongs to one project member.
- PATCH replaces the entire scene. Omitted objects, connections, and assets are removed.
- Negative coordinates are valid because the canvas is infinite.
- Object, connection, and asset IDs must be unique in their respective namespaces.
- Image references and connector object references must resolve in the submitted scene.
- `schemaVersion` must be `2`.

## 13. Frontend architecture

```text
MiniWorkshopPage
├── React Query
│   ├── useMiniWorkshop        → GET document
│   └── useSaveMiniWorkshop    → PATCH full document
├── Zustand store
│   ├── normalized objectsById and objectOrder
│   ├── connections and assets
│   ├── viewport, selection, active tool, and connector state
│   └── undo/redo history (50 snapshots)
├── MiniWorkshopEditor
│   ├── Konva Stage and layers
│   ├── branded background/grid
│   ├── connections
│   ├── visible canvas objects
│   ├── guides, freehand preview, marquee, and transformer
│   ├── contextual Selection Toolbar
│   └── floating creation toolbar
└── Dialogs
    ├── object editor
    ├── task placement
    ├── personal task
    ├── Board task picker
    ├── templates
    └── canvas search
```

### Folder map

| Folder | Responsibility |
| --- | --- |
| `components/canvas` | Konva stage, objects, connections, search, editor dialogs, background |
| `components/toolbar` | Floating creation controls and contextual selection controls |
| `components/tasks` | Personal task and Board-task placement flow |
| `components/templates` | Template gallery |
| `hooks` | React Query data loading and save mutation |
| `services` | Only place Mini Workshop HTTP calls are made |
| `store` | Normalized local canvas/UI state and history |
| `types` | Schema-v2 TypeScript types |
| `utils` | Geometry, image compression/export, and object factories |
| `validation` | Zod schemas for persisted data and personal tasks |

## 14. Performance design

The implementation is designed to remain responsive with a large scene:

- Drag, transform, freehand preview, and live connector updates run through Konva refs until the interaction ends.
- A completed interaction commits one Zustand/history update, not one per pointer movement.
- Background, connections, objects, and selection visuals use separate Konva layers.
- Only objects intersecting the viewport plus overscan are rendered.
- The dot grid is one custom Konva shape rather than thousands of React elements.
- Freehand strokes and decoded images are cached by their nodes.
- Viewport and live connector redraw work is batched with `requestAnimationFrame`.
- Undo/redo stores up to 50 normalized scene snapshots; image assets are not duplicated into history.
- Object components are memoized and use object-level state where possible.

## 15. Testing and verification

The Mini Workshop test suite covers:

- Geometry, anchors, routing, snapping, and bounds.
- Store history, grouping, duplication, distribution math, and viewport behavior.
- Template ID remapping.
- Mock-free API GET/PATCH integration calls.
- Task picker behavior and valid interactive markup.
- Template gallery bounds.
- Selection Toolbar active-state behavior.
- Large-scene performance fixtures.

Before releasing changes, run:

```powershell
node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc -b --pretty false
node node_modules/eslint/bin/eslint.js src/features/mini-workshop --max-warnings=0
node --max-old-space-size=4096 node_modules/vite/bin/vite.js build
```

## 16. Current scope boundaries

Included:

- Private member canvas.
- Manual save.
- Native Nexus-Flow canvas controls and design.
- Shapes, notes, text, frames, images, freehand, tasks, and connectors.
- Templates, search, export, undo/redo, and theme support.

Not included:

- Real-time multiplayer collaboration or presence.
- Comments, voting, timers, presentation mode, or AI generation.
- SVG/PDF export.
- Per-object backend endpoints.
- Mini Workshop edits that mutate Team Board tasks.
