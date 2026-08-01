# Frontend Integration Guide: Onboarding, AI Planner & Workshop Canvas

This document provides a comprehensive integration guide for the **Onboarding, AI Planning, and Interactive Workshop Canvas** features in NexusFlow.

---

## Table of Contents
1. [Architectural Overview & Core Philosophy](#1-architectural-overview--core-philosophy)
2. [Data Models & Types](#2-data-models--types)
3. [WebSocket Real-Time Event System](#3-websocket-real-time-event-system)
4. [Step-by-Step Onboarding Flow](#4-step-by-step-onboarding-flow)
    - [Step 1: Draft Management](#step-1-draft-management)
    - [Step 2: AI Plan Generation](#step-2-ai-plan-generation)
    - [Step 3: Interactive Workshop Canvas Interaction](#step-3-interactive-workshop-canvas-interaction)
    - [Step 4: Submitting the Draft into a Live Board](#step-4-submitting-the-draft-into-a-live-board)
5. [Summary of Latest API Changes & Best Practices](#5-summary-of-latest-api-changes--best-practices)

---

## 1. Architectural Overview & Core Philosophy

### Single Source of Truth (Backend-Driven State)
The backend DB acts as the **single source of truth** for project details and workshop canvas state:
- **Project Metadata**: Once created/updated in the draft (`POST/PATCH /projects/onboarding/draft`), project info (`name`, `description`, `color`, `constraints`) is saved in the database. Subsequent requests (like generating AI plans or submitting) only pass the `draftId`.
- **Canvas Persistence**: The backend automatically parses AI generation responses, applies an auto-layout spatial grid, and persists canvas objects (`SECTION_FRAME`, `TASK_CARD`, `STICKY_NOTE`) directly into the `workshops` and `workshop_objects` database tables.
- **No Coordinate Calculations on FE**: The frontend **does not** compute coordinates or post initial generated items back to the backend. The frontend simply fetches/receives the pre-positioned workshop snapshot from the backend and renders it on canvas.

---

## 2. Data Models & Types

### Workshop Canvas Object Standard
All items rendered on the workshop canvas follow this structure:

```typescript
export enum WorkshopObjectType {
  SECTION_FRAME = 'SECTION_FRAME',
  TASK_CARD = 'TASK_CARD',
  STICKY_NOTE = 'STICKY_NOTE',
  TEXT_BOX = 'TEXT_BOX',
}

export interface WorkshopObjectData {
  // Common properties
  title?: string;
  description?: string;
  color?: string;
  
  // Section Frame Specific
  featureName?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Task Card Specific
  taskName?: string;
  taskDescription?: string;
  acceptanceCriteria?: string[];
  estimatedComplexity?: 'S' | 'M' | 'L' | 'XL';
  type?: 'FEATURE' | 'BUG' | 'CHORE';
  assignedTo?: string | null;
  
  // Sticky Note / Text Box Specific
  content?: string;
}

export interface WorkshopObject {
  id: string;
  workshopId: string;
  parentFrameId: string | null; // Set for TASK_CARDs inside a SECTION_FRAME
  type: WorkshopObjectType;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  data: WorkshopObjectData;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopConnection {
  id: string;
  workshopId: string;
  fromObjectId: string;
  toObjectId: string;
  label?: string | null;
  type?: string | null;
}

export interface WorkshopSnapshot {
  id: string;
  draftId: string;
  viewportX: number;
  viewportY: number;
  zoomLevel: number;
  objects: WorkshopObject[];
  connections: WorkshopConnection[];
}
```

---

## 3. WebSocket Real-Time Event System

AI plan generation is non-blocking (asynchronous). The client initiates generation over HTTP and listens for real-time state updates over WebSocket.

### Gateway Connection
- **URL**: `ws://<backend-host>/socket.io` (or standard Socket.io client initialization)
- **Authentication**: Cookie-based or query parameter auth.

### Handled Events

| Event Name | Payloads | Description |
|---|---|---|
| `ai.generation.created` | `{ generationId: string, status: "PENDING" }` | Triggered when the job is accepted by backend. |
| `ai.generation.started` | `{ generationId: string, status: "PROCESSING" }` | Emitted when Gemini streaming starts processing. |
| `ai.generation.progress` | `{ generationId: string, stage: "generating", chunk: string }` | Emitted on every streaming raw chunk from AI (for typing indicator/live preview). |
| `ai.generation.completed` | `{ generationId: string, status: "COMPLETED", output: object, workshop: WorkshopSnapshot }` | Emitted when AI plan is fully normalized and saved in DB. Contains the complete pre-layout `workshop` snapshot. |
| `ai.generation.failed` | `{ generationId: string, status: "FAILED", error: string }` | Emitted if AI model or normalization fails. |

---

## 4. Step-by-Step Onboarding Flow

```
+-------------------+       +-----------------------+       +-------------------------+       +--------------------+
| 1. Create/Update  | ----> |  2. Generate AI Plan  | ----> |  3. Render & Edit       | ----> | 4. Submit Draft to |
|    Draft (HTTP)   |       |  (HTTP + WebSocket)   |       |     Workshop Canvas     |       |    Board (HTTP)    |
+-------------------+       +-----------------------+       +-------------------------+       +--------------------+
```

---

### Step 1: Draft Management

When a user begins onboarding, create a draft to store project context.

#### 1.1 Create Draft
- **Endpoint**: `POST /api/projects/onboarding/draft`
- **Headers**: `x-csrf-token: <csrfToken>`, Cookie auth

```json
// Request Payload
{
  "projectInfo": {
    "name": "Nexus E-Commerce App",
    "description": "A modern boutique e-commerce web platform.",
    "color": "#d97706",
    "estimatedTime": "3 months",
    "constraints": {
      "category": "programming",
      "targetStack": ["NestJS", "React", "PostgreSQL"],
      "preferredLanguage": "TypeScript"
    }
  }
}
```

- **Response**: `{ "id": "draft-uuid-123", "status": "DRAFT", "projectInfo": { ... } }`
- *Save `id` as `draftId` in your frontend state/router.*

#### 1.2 (Optional) Update Draft Info
- **Endpoint**: `PATCH /api/projects/onboarding/draft/:draftId`
- **Request Payload**: Pass any updated `projectInfo` attributes.

---

### Step 2: AI Plan Generation

Trigger AI generation to build the initial visual workshop layout.

#### 2.1 Trigger Generation over HTTP
- **Endpoint**: `POST /api/projects/onboarding/ai/generate`
- **Payload**:
```json
{
  "draftId": "draft-uuid-123",
  "prompt": "Decompose an e-commerce platform with auth, product catalog, cart, and payment checkout."
}
```
*Note: Do NOT pass `projectInfo` here. The backend automatically pulls project context from the draft in DB.*

#### 2.2 Handling WebSockets in Frontend
```typescript
// Example Socket.io Listener Setup
socket.on('ai.generation.progress', (data) => {
  showTypingIndicator(data.chunk);
});

socket.on('ai.generation.completed', (data) => {
  // data.workshop contains pre-calculated x, y, width, height, zIndex for frames & cards
  renderWorkshopCanvas(data.workshop);
  hideLoadingState();
});
```

---

### Step 3: Interactive Workshop Canvas Interaction

The user can view, drag, resize, add, or delete items on the canvas.

#### 3.1 Fetch Current Workshop State
- **Endpoint**: `GET /api/projects/onboarding/drafts/:draftId/workshop`
- **Response**:
```json
{
  "id": "workshop-uuid-999",
  "draftId": "draft-uuid-123",
  "viewportX": 0,
  "viewportY": 0,
  "zoomLevel": 1,
  "objects": [
    {
      "id": "obj-frame-1",
      "type": "SECTION_FRAME",
      "positionX": 100,
      "positionY": 100,
      "width": 800,
      "height": 600,
      "zIndex": 1,
      "data": { "featureName": "Auth & User Management", "priority": "HIGH" }
    },
    {
      "id": "obj-card-1",
      "parentFrameId": "obj-frame-1",
      "type": "TASK_CARD",
      "positionX": 140,
      "positionY": 180,
      "width": 320,
      "height": 180,
      "zIndex": 2,
      "data": { "taskName": "Implement JWT Auth Flow", "estimatedComplexity": "M" }
    }
  ],
  "connections": []
}
```

#### 3.2 Persisting User Edits (Full-Replace Save)
When the user rearranges, resizes, or adds cards on the frontend, save the batch canvas state:
- **Endpoint**: `PUT /api/projects/onboarding/drafts/:draftId/workshop`
- **Request Payload**:
```json
{
  "viewportX": 0,
  "viewportY": 0,
  "zoomLevel": 1,
  "objects": [
    {
      "id": "obj-frame-1",
      "type": "SECTION_FRAME",
      "positionX": 100,
      "positionY": 100,
      "width": 800,
      "height": 600,
      "zIndex": 1,
      "data": { "featureName": "Auth & User Management", "priority": "HIGH" }
    }
    // ... all objects currently on canvas
  ],
  "connections": []
}
```

---

### Step 4: Submitting the Draft into a Live Board

When the user finishes customizing their workshop canvas, click **"Submit / Create Project"**.

- **Endpoint**: `POST /api/projects/onboarding/submit`
- **Request Payload**:
```json
{
  "draftId": "draft-uuid-123"
}
```
*Note: Do NOT pass `projectInfo` or `features[]`. The backend reads draft project details and parses DB workshop frames/cards into project columns and tasks atomically in a single database transaction.*

- **Response**:
```json
{
  "message": "Onboarding project submitted and created successfully.",
  "data": {
    "projectId": "project-uuid-777",
    "projectName": "Nexus E-Commerce App",
    "boardColumns": [
      {
        "columnId": "col-uuid-1",
        "name": "Auth & User Management",
        "taskCount": 4
      }
    ],
    "taskCount": 12
  }
}
```
- *Action*: Redirect user to `/projects/project-uuid-777`.

---

## 5. Summary of Latest API Changes & Best Practices

1. **Single Source of Truth**:
   - `POST /onboarding/ai/generate` requires only `{ draftId, prompt }`.
   - `POST /onboarding/submit` requires only `{ draftId }`.
   - Never send redundant project info objects in these calls.
2. **WebSocket Event Reliance**: Rely on `ai.generation.completed` payload which directly provides the updated `workshop` state. No extra GET request is needed right after generation completes.
3. **Draft-Scoped Routing**: Use `:draftId` for draft-related canvas endpoints (`/drafts/:draftId/workshop`).
