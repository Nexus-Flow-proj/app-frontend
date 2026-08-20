# Frontend Contract & Integration Guide: Onboarding AI Generation & Workshop Sync

## Table of Contents

1. [Overview & Root Cause Diagnosis](#1-overview--root-cause-diagnosis)
2. [Lifecycle & State Machine Diagram](#2-lifecycle--state-machine-diagram)
3. [REST API Endpoint Specifications](#3-rest-api-endpoint-specifications)
   - [3.1. Initiate AI Generation](#31-initiate-ai-generation)
   - [3.2. Poll Generation Job Status](#32-poll-generation-job-status)
   - [3.3. Fetch Workshop Canvas Snapshot (Required)](#33-fetch-workshop-canvas-snapshot-required)
   - [3.4. Fetch Chat Messages](#34-fetch-chat-messages)
   - [3.5. Update Workshop Canvas](#35-update-workshop-canvas)
4. [WebSocket Realtime Event Specifications](#4-websocket-realtime-event-specifications)
5. [Frontend Implementation Example (TypeScript)](#5-frontend-implementation-example-typescript)
6. [Frontend Bug Checklist](#6-frontend-bug-checklist)

---

## 1. Overview & Root Cause Diagnosis

### Backend Execution Flow

When the user triggers AI plan generation:

1. The backend launches an asynchronous background job (`AIGenerationJob`).
2. Gemini decomposes the project idea into Features and Tasks.
3. The backend stores the chat messages in `ai_chat_messages` (`role: 'user'` and `role: 'assistant'`).
4. **The backend automatically converts the AI plan into positioned canvas elements** (`SECTION_FRAME` and `TASK_CARD` objects with `x`, `y`, `width`, `height`, `zIndex`, `data`) and persists them to the `workshops` and `workshop_objects` database tables.
5. The job status in `ai_generation_jobs` transitions to `COMPLETED`.

### Why the Frontend Infinite Spinner Occurred

1. **Missing Canvas Fetch**: When polling reached `COMPLETED`, the frontend fetched `/messages` but **never fetched the workshop canvas** (`GET /api/projects/onboarding/draft/:draftId/workshop`). The canvas remained empty (`0 items`), and the UI overlay (_"AI is arranging your plan — Editing resumes when the saved snapshot arrives"_) was never cleared because it was waiting for the workshop canvas state.
2. **Unreset Chat State**: The AI partner drawer preserved the intermediate streaming message from `ai.generation.progress` with `isGenerating = true` instead of dismissing the loader and setting the final message state.

---

## 2. Lifecycle & State Machine Diagram

```
 [User submits prompt]
          │
          ▼
   POST /ai/generate ───────────────► Returns { generationId, status: "PENDING" }
          │
          ├────────────────────────────────────────────────┐
          ▼                                                ▼
┌───────────────────────────────┐               ┌──────────────────────────────┐
│ Realtime (WebSockets)         │               │ HTTP Polling Fallback        │
│ Listen to:                    │               │ GET /ai/generations/:id      │
│ • ai.generation.started       │               │ Poll every 2-3 seconds until │
│ • ai.generation.progress      │               │ status === "COMPLETED"       │
│ • ai.generation.completed     │               └──────────────┬───────────────┘
└──────────────┬────────────────┘                              │
               │                                               │
               └───────────────────────┬───────────────────────┘
                                       │
                         [Generation Job is COMPLETED]
                                       │
                                       ▼
             ┌──────────────────────────────────────────────────┐
             │ 1. Hydrate Canvas:                               │
             │    GET /projects/onboarding/draft/:id/workshop   │
             │    (or consume `data.workshop` from socket event)│
             │                                                  │
             │ 2. Refresh Chat:                                 │
             │    GET /projects/onboarding/ai/drafts/:id/messages│
             │                                                  │
             │ 3. Reset Loading Flags:                          │
             │    isGenerating = false                          │
             │    isArrangingPlan = false                       │
             │    progressMessage = ''                          │
             └──────────────────────────────────────────────────┘
```

---

## 3. REST API Endpoint Specifications

Base URL: `/api` (or environment-configured API prefix)  
Auth: Cookie-based session (`access_token`, `refresh_token`, `csrf_token`). State-changing requests (`POST`, `PATCH`, `DELETE`) require header `x-csrf-token: <csrfToken>`.

---

### 3.1. Initiate AI Generation

Initiates asynchronous AI generation for the specified onboarding draft.

- **Method**: `POST`
- **Path**: `/api/projects/onboarding/ai/generate`
- **Status**: `202 Accepted`

#### Request Body

```json
{
  "draftId": "166f9237-ea27-4c41-ba10-67b3e314cc1d",
  "prompt": "Create a comprehensive launch and marketing plan for an Egyptian burger restaurant in Ismailia."
}
```

#### Success Response (`202 Accepted`)

```json
{
  "message": "Onboarding AI plan generation initiated successfully.",
  "data": {
    "generationId": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
    "status": "PENDING"
  }
}
```

---

### 3.2. Poll Generation Job Status

Checks the current execution status of an ongoing generation job.

- **Method**: `GET`
- **Path**: `/api/projects/onboarding/ai/generations/:generationId`
- **Status**: `200 OK`

#### Success Response (`200 OK`)

```json
{
  "message": "Onboarding AI generation status retrieved successfully.",
  "data": {
    "id": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
    "requestedBy": "ad235184-d2e7-4ba6-87c6-3dc2b5326cdc",
    "prompt": "Create a comprehensive launch and marketing plan...",
    "status": "COMPLETED",
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "inputSnapshot": {
      "draftId": "166f9237-ea27-4c41-ba10-67b3e314cc1d",
      "projectInfo": {
        "name": "Khaled Burger Shop",
        "description": "Marketing Plan for an egyptian burger shop located in ismailia",
        "color": "#d97706",
        "estimatedTime": "3 months"
      }
    },
    "outputSnapshot": {
      "features": [
        {
          "feature_name": "Brand Identity & Launch Preparation",
          "feature_description": "Establishing brand presence and initial launch assets",
          "tasks": [
            {
              "task_name": "Design Menu & Signage",
              "task_description": "Create physical and digital menu designs with local branding.",
              "priority": "HIGH",
              "dependencies": []
            }
          ]
        }
      ]
    },
    "errorMessage": null,
    "projectId": null,
    "createdAt": "2026-08-18T23:52:00.123Z",
    "completedAt": "2026-08-18T23:52:26.456Z"
  }
}
```

> **Possible `status` values**: `'PENDING'` | `'PROCESSING'` | `'COMPLETED'` | `'FAILED'`

---

### 3.3. Fetch Workshop Canvas Snapshot (Required)

Fetches the active workshop layout, including section frames, task cards, coordinates, and connections.

- **Method**: `GET`
- **Path**: `/api/projects/onboarding/draft/:draftId/workshop`
- **Status**: `200 OK`

#### Success Response (`200 OK`)

```json
{
  "message": "Workshop loaded successfully.",
  "data": {
    "id": "f80b9871-38e2-45e0-b6a3-255d496a7981",
    "draftId": "166f9237-ea27-4c41-ba10-67b3e314cc1d",
    "objects": [
      {
        "id": "2e0a2936-e075-47db-a2d9-1fa327c8e9b0",
        "type": "SECTION_FRAME",
        "x": 60,
        "y": 80,
        "width": 520,
        "height": 380,
        "rotation": 0,
        "zIndex": 1,
        "data": {
          "kind": "Feature",
          "title": "Brand Identity & Launch Preparation",
          "description": "Establishing brand presence and initial launch assets",
          "backgroundColor": "#eff6ff",
          "borderColor": "#3b82f6"
        }
      },
      {
        "id": "90e0bcfb-4a58-45f8-b3d1-7c9861612df2",
        "type": "TASK_CARD",
        "x": 84,
        "y": 176,
        "width": 472,
        "height": 110,
        "rotation": 0,
        "zIndex": 100,
        "data": {
          "kind": "Task",
          "featureId": "2e0a2936-e075-47db-a2d9-1fa327c8e9b0",
          "title": "Design Menu & Signage",
          "description": "Create physical and digital menu designs with local branding.",
          "priority": "HIGH",
          "dependencies": []
        }
      }
    ],
    "connections": [],
    "viewport": {
      "x": 24,
      "y": 24,
      "scale": 0.82
    },
    "createdAt": "2026-08-18T23:51:30.000Z",
    "updatedAt": "2026-08-18T23:52:26.500Z"
  }
}
```

---

### 3.4. Fetch Chat Messages

Retrieves the persistent conversation history for this draft.

- **Method**: `GET`
- **Path**: `/api/projects/onboarding/ai/drafts/:draftId/messages`
- **Status**: `200 OK`

#### Success Response (`200 OK`)

```json
{
  "message": "Draft AI chat messages retrieved successfully.",
  "data": [
    {
      "id": "84c8fb27-6fca-44b2-a42e-1311029c011e",
      "draftId": "166f9237-ea27-4c41-ba10-67b3e314cc1d",
      "projectId": null,
      "role": "user",
      "content": "Create a comprehensive launch and marketing plan...",
      "generationJobId": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
      "createdAt": "2026-08-18T23:52:00.200Z"
    },
    {
      "id": "a90df214-411a-4712-88eb-11c57daef721",
      "draftId": "166f9237-ea27-4c41-ba10-67b3e314cc1d",
      "projectId": null,
      "role": "assistant",
      "content": "{\"features\":[{\"feature_name\":\"Brand Identity & Launch Preparation\",\"tasks\":[...]}]}",
      "generationJobId": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
      "createdAt": "2026-08-18T23:52:26.550Z"
    }
  ]
}
```

---

### 3.5. Update Workshop Canvas

Used when the user manually moves, creates, or edits objects on the canvas.

- **Method**: `PATCH`
- **Path**: `/api/projects/onboarding/draft/:draftId/workshop`
- **Status**: `200 OK`

#### Request Body

```json
{
  "objects": [
    {
      "id": "2e0a2936-e075-47db-a2d9-1fa327c8e9b0",
      "type": "SECTION_FRAME",
      "x": 100,
      "y": 120,
      "width": 520,
      "height": 380,
      "rotation": 0,
      "zIndex": 1,
      "data": {
        "kind": "Feature",
        "title": "Brand Identity & Launch Preparation",
        "description": "Establishing brand presence and initial launch assets",
        "backgroundColor": "#eff6ff",
        "borderColor": "#3b82f6"
      }
    }
  ],
  "connections": [],
  "viewport": {
    "x": 24,
    "y": 24,
    "scale": 0.82
  }
}
```

---

## 4. WebSocket Realtime Event Specifications

Authenticated WebSocket connections join the user room `user:<userId>` automatically upon connecting.

### 4.1. `ai.generation.started`

Emitted immediately when background processing begins.

```json
{
  "generationId": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
  "status": "PROCESSING"
}
```

### 4.2. `ai.generation.progress`

Emitted incrementally as Gemini streams task and feature tokens.

```json
{
  "generationId": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
  "stage": "generating",
  "progressMessage": "Planning feature: Project Setup & Core Structure... Generating tasks... (1 planned so far)",
  "progressPercent": 40
}
```

### 4.3. `ai.generation.completed`

Emitted when generation and canvas layout are fully persisted.

```json
{
  "generationId": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
  "status": "COMPLETED",
  "output": {
    "features": [
      /* Normalized AI plan */
    ]
  },
  "workshop": {
    /* Full WorkshopCanvasResponseDto with all pre-positioned objects */
  }
}
```

### 4.4. `ai.generation.failed`

Emitted if generation encounters an error.

```json
{
  "generationId": "ba71bff0-6de2-4a4a-ab7c-5d86e9de1744",
  "status": "FAILED",
  "error": "Error message description"
}
```

---

## 5. Frontend Implementation Example (TypeScript)

```typescript
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

interface WorkshopState {
  objects: any[];
  connections: any[];
  viewport: { x: number; y: number; scale: number };
}

export function useOnboardingAI(draftId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isArrangingPlan, setIsArrangingPlan] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [workshop, setWorkshop] = useState<WorkshopState | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // 1. Finalize Completion Handler
  const handleGenerationCompleted = async (
    completedGenId: string,
    socketWorkshopSnapshot?: WorkshopState,
  ) => {
    try {
      // 1.1 Hydrate Workshop Canvas
      if (socketWorkshopSnapshot) {
        setWorkshop(socketWorkshopSnapshot);
      } else {
        const workshopRes = await axios.get(
          `/api/projects/onboarding/draft/${draftId}/workshop`,
          { withCredentials: true },
        );
        setWorkshop(workshopRes.data.data);
      }

      // 1.2 Refresh Chat Messages
      const msgRes = await axios.get(
        `/api/projects/onboarding/ai/drafts/${draftId}/messages`,
        { withCredentials: true },
      );
      setMessages(msgRes.data.data);
    } catch (err) {
      console.error("Error fetching workshop snapshot after generation", err);
    } finally {
      // 1.3 Clear all loading/overlay states
      setIsGenerating(false);
      setIsArrangingPlan(false);
      setProgressMessage("");
    }
  };

  // 2. Polling Fallback Function
  const pollGeneration = (generationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await axios.get(
          `/api/projects/onboarding/ai/generations/${generationId}`,
          {
            withCredentials: true,
            headers: { "Cache-Control": "no-cache" },
          },
        );
        const job = res.data.data;

        if (job.status === "COMPLETED") {
          clearInterval(pollInterval);
          await handleGenerationCompleted(generationId);
        } else if (job.status === "FAILED") {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setIsArrangingPlan(false);
          alert(job.errorMessage || "AI plan generation failed");
        }
      } catch (e) {
        clearInterval(pollInterval);
        setIsGenerating(false);
        setIsArrangingPlan(false);
      }
    }, 2500);
  };

  // 3. Initiate Generation Action
  const triggerGeneratePlan = async (prompt: string) => {
    setIsGenerating(true);
    setIsArrangingPlan(true);
    setProgressMessage("Starting plan generation...");

    try {
      const res = await axios.post(
        "/api/projects/onboarding/ai/generate",
        { draftId, prompt },
        { withCredentials: true },
      );
      const { generationId } = res.data.data;

      // Start polling if socket connection is unavailable
      if (!socketRef.current?.connected) {
        pollGeneration(generationId);
      }
    } catch (err) {
      setIsGenerating(false);
      setIsArrangingPlan(false);
      console.error("Failed to initiate generation", err);
    }
  };

  // 4. WebSocket Listeners Setup
  useEffect(() => {
    const socket = io("/", { withCredentials: true });
    socketRef.current = socket;

    socket.on("ai.generation.progress", (data) => {
      setProgressMessage(data.progressMessage);
    });

    socket.on("ai.generation.completed", (data) => {
      handleGenerationCompleted(data.generationId, data.workshop);
    });

    socket.on("ai.generation.failed", (data) => {
      setIsGenerating(false);
      setIsArrangingPlan(false);
      alert(data.error || "Generation failed");
    });

    return () => {
      socket.disconnect();
    };
  }, [draftId]);

  return {
    isGenerating,
    isArrangingPlan,
    progressMessage,
    messages,
    workshop,
    triggerGeneratePlan,
  };
}
```

---

## 6. Frontend Bug Checklist

| #   | Item to Check                           | Solution                                                                                                                                                           |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Canvas remains empty & loading**      | Call `GET /api/projects/onboarding/draft/:draftId/workshop` after generation completes, or use `data.workshop` from the `ai.generation.completed` socket event.    |
| 2   | **Canvas overlay does not dismiss**     | Set `isArrangingPlan = false` once the workshop snapshot is applied to state.                                                                                      |
| 3   | **Chat message shows infinite spinner** | Set `isGenerating = false` and clear `progressMessage` when status is `COMPLETED`.                                                                                 |
| 4   | **Assistant message rendering**         | Note that assistant messages stored in DB contain a JSON stringified plan (`{"features":[...]}`). Parse or format this content when displaying in the chat drawer. |
| 5   | **304 HTTP responses during polling**   | Add `'Cache-Control': 'no-cache'` to headers during status polling to avoid stale 304 caching.                                                                     |
