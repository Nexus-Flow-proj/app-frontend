# Mini Workshop Backend Integration Guide — Schema Version 2

This document is the complete frontend/backend contract for the Nexus-Flow Mini Workshop. The Mini Workshop is a private, manually saved Konva canvas owned by one authenticated project member. It is not collaborative and requires no per-object, connector, template, asset, or personal-task endpoints.

## 1. Endpoints

Both endpoints require the normal Nexus-Flow authentication and CSRF handling.

### Load the current member's document

```http
GET /projects/:projectId/mini-workshop
```

- Scope the result by both `projectId` and the authenticated user ID.
- The client does not send an owner ID and must never be allowed to load another member's document.
- If the member has no document, create and return an empty schema-v2 document. The frontend now uses the backend document exclusively.

### Replace the complete scene

```http
PATCH /projects/:projectId/mini-workshop
Content-Type: application/json
x-csrf-token: <token>
```

```json
{
  "schemaVersion": 2,
  "revision": 4,
  "scene": {
    "viewport": { "x": 40, "y": 40, "scale": 0.82 },
    "objects": [],
    "connections": [],
    "assets": {}
  }
}
```

PATCH is an atomic full replacement. Objects, connections, and assets omitted from the request are deleted. The response must contain the saved document and an incremented revision.

## 2. API envelope and status codes

Successful responses use the existing Nexus-Flow envelope:

```json
{
  "success": true,
  "message": "Mini Workshop loaded successfully.",
  "statusCode": 200,
  "data": { "...": "MiniWorkshopDocument" }
}
```

Expected statuses:

| Status | Meaning |
| --- | --- |
| `200` | Loaded or saved successfully |
| `400` | Invalid schema, malformed object, duplicate ID, or invalid reference |
| `401` | Not authenticated |
| `403` | User is not a project member or cannot access this project |
| `404` | Project does not exist; optionally, no document exists if not creating one on GET |
| `409` | Submitted revision is stale |
| `413` | Request or decoded image assets exceed configured limits |
| `422` | Structurally valid scene violates a semantic rule |

Recommended revision-conflict response:

```json
{
  "success": false,
  "message": "The Mini Workshop was updated from another session. Reload before saving again.",
  "error": "Conflict",
  "statusCode": 409,
  "data": { "currentRevision": 5 }
}
```

## 3. Document and save DTO

```ts
interface MiniWorkshopDocument {
  id: string | null;
  projectId: string;
  ownerId: string | null;
  schemaVersion: 2;
  revision: number;
  scene: MiniWorkshopScene;
  createdAt: string | null;
  updatedAt: string | null;
}

interface SaveMiniWorkshopDto {
  schemaVersion: 2;
  revision: number;
  scene: MiniWorkshopScene;
}

interface MiniWorkshopScene {
  viewport: { x: number; y: number; scale: number };
  objects: MiniCanvasObject[];
  connections: MiniConnection[];
  assets: Record<string, MiniImageAsset>;
}
```

The backend owns `id`, `projectId`, `ownerId`, timestamps, and the next `revision`. Ignore or reject those fields if a client attempts to include them in the PATCH body.

## 4. Canvas objects

Every object contains these common fields:

```ts
interface BaseMiniCanvasObject {
  id: string;
  type: MiniObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  groupId: string | null;
  locked: boolean;
  style: MiniObjectStyle;
}

interface MiniObjectStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  dash?: number[];
  fontFamily?: "Geist Variable";
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700;
  textAlign?: "left" | "center" | "right";
  textColor?: string;
}
```

The discriminated object union is:

```ts
type MiniCanvasObject =
  | (BaseMiniCanvasObject & {
      type: "SHAPE";
      data: {
        shape: "rectangle" | "rounded-rectangle" | "ellipse" | "diamond" | "triangle";
        text?: string;
      };
    })
  | (BaseMiniCanvasObject & { type: "TEXT"; data: { text: string } })
  | (BaseMiniCanvasObject & { type: "STICKY_NOTE"; data: { text: string } })
  | (BaseMiniCanvasObject & { type: "IMAGE"; data: { assetId: string; alt: string } })
  | (BaseMiniCanvasObject & {
      type: "FRAME";
      data: { title: string; description?: string };
    })
  | (BaseMiniCanvasObject & {
      type: "FREEHAND";
      data: { points: number[][] };
    })
  | (BaseMiniCanvasObject & {
      type: "PERSONAL_TASK";
      data: { title: string; description: string; completed: boolean };
    })
  | (BaseMiniCanvasObject & {
      type: "BOARD_TASK_REFERENCE";
      data: {
        sourceTaskId: string;
        title: string;
        description: string;
        priority: string;
        status: string;
        assigneeName?: string;
        dueDate?: string;
        unavailable?: boolean;
      };
    });
```

`FREEHAND.data.points` contains local `[x, y, pressure]` tuples. Require at least two tuples. `groupId` is a client-side grouping identifier and does not reference another database entity.

## 5. Board task references

- `sourceTaskId` references an existing Team Board task in the same project.
- The remaining fields are a read-only display snapshot so the canvas remains renderable while Board data is loading.
- Multiple canvas objects may contain the same `sourceTaskId`; duplicate Board references are intentional.
- Saving, moving, duplicating, or deleting a reference must never mutate or delete its Team Board task.
- Do not require the referenced task to be assigned to the Mini Workshop owner.
- If a Board task is later deleted or inaccessible, retain the canvas object and allow the frontend to show it as unavailable. Do not fail GET because of a stale source task.

`PERSONAL_TASK` is canvas-only content. It does not create a Team Board task and needs no separate database table or endpoint.

## 6. Connections

```ts
interface MiniConnection {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  sourceAnchor: "auto" | "top" | "right" | "bottom" | "left";
  targetAnchor: "auto" | "top" | "right" | "bottom" | "left";
  routing: "straight" | "curved" | "elbow";
  label: string;
  stroke: string;
  strokeWidth: number;
  dash?: number[];
}
```

Both referenced object IDs must exist in the same submitted scene. Connection IDs must be unique. Connections are visual only and do not represent task dependencies in the Team Board.

## 7. Image assets

```ts
interface MiniImageAsset {
  id: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}
```

- The record key must equal the asset's `id`.
- `IMAGE.data.assetId` must match an entry in `scene.assets`.
- Multiple image objects may reuse one asset.
- The frontend downsizes images to a maximum side of 2048 pixels and encodes PNG as PNG and other accepted images as WebP at quality `0.86`.
- Accept `image/png` and `image/webp` on the wire, verify the data-URL MIME matches `mimeType`, decode the content, and validate its actual format and dimensions. Do not trust the extension or declared MIME type.
- Configure explicit per-asset, total decoded-asset, and total request limits. Return `413` when exceeded.
- Orphaned assets can be discarded during full replacement.

## 8. Validation rules

Validate the complete DTO before writing:

- `schemaVersion` must equal `2`; version-1 Excalidraw scenes are intentionally not migrated.
- `revision` must be a non-negative integer.
- Coordinate, rotation, and z-index values must be finite numbers.
- Width, height, viewport scale, font size, and connection stroke width must be positive.
- Object stroke width must be non-negative; opacity must be between `0` and `1`.
- All object, connection, and asset IDs must be non-empty and unique within their namespace.
- Reject unknown object types, data properties, enum values, and unsupported style values.
- Validate colors as supported CSS color strings or restrict them to your chosen color format.
- Dash arrays must contain finite, non-negative numbers and should have a bounded length.
- Text, labels, filenames, and arrays require configured maximum lengths/counts.
- Every image and connection reference must resolve inside the submitted scene.
- Permit negative canvas coordinates; this is an infinite canvas.
- Do not validate whether objects visually overlap, sit inside frames, or intersect connections.

Recommended abuse-protection limits should be aligned with product requirements and documented in backend constants. At minimum, bound total objects, connections, assets, freehand points, string lengths, JSON body size, and decoded image bytes.

## 9. Authorization, persistence, and concurrency

- Enforce project membership before both operations.
- Use a unique database constraint on `(projectId, ownerId)`.
- Derive `ownerId` from the authenticated user, never from the request body.
- Store the scene as JSON/JSONB or normalized tables; the wire contract remains a single document either way.
- PATCH must validate and replace the scene, compare and increment the revision, and update the timestamp in one transaction.
- Compare revisions atomically (for example, `UPDATE ... WHERE revision = :submittedRevision`). If no row is updated because the revision changed, return `409`.
- Saving viewport-only changes is valid. Viewport changes are persisted but the frontend does not mark them as unsaved content.
- Do not broadcast WebSocket events; the Mini Workshop is currently private and non-collaborative.
- Do not compile Mini Workshop objects into the Main Workshop or Team Board.

## 10. Empty document example

```json
{
  "id": "8ee9af83-9a4c-4cbf-9bd4-e6f8d7cf1110",
  "projectId": "48b4a92c-bdaa-4fcb-b0b0-cbc5633c2c08",
  "ownerId": "f8babbc7-6978-4e20-b970-5b9d146dd44b",
  "schemaVersion": 2,
  "revision": 0,
  "scene": {
    "viewport": { "x": 40, "y": 40, "scale": 0.82 },
    "objects": [],
    "connections": [],
    "assets": {}
  },
  "createdAt": "2026-08-09T10:00:00.000Z",
  "updatedAt": "2026-08-09T10:00:00.000Z"
}
```

## 11. Backend acceptance checklist

- Two authenticated endpoints use the paths in section 1.
- Documents are isolated per project member.
- GET returns a schema-v2 document in the standard envelope.
- PATCH performs an atomic full replacement and returns the incremented revision.
- Concurrent stale saves return `409` with the current revision.
- All eight object types round-trip without property stripping.
- Duplicate references to the same Board task are accepted.
- Personal tasks and Board references never mutate Team Board records.
- Connections and image references are checked for referential integrity.
- Negative coordinates and large finite canvas positions are accepted.
- Request, collection, text, freehand, and decoded-image limits are enforced.
- No extra Mini Workshop endpoints or WebSocket events are required.
