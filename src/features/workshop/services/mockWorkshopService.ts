import {
  CanvasObjectType,
  CanvasType,
  UserRole,
} from "@/types/enums";
import type { ApiResponse } from "@/types";
import type {
  Canvas,
  CanvasConnection,
  CanvasObject,
  CanvasViewport,
} from "../types";

interface MockCanvasPayload {
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
}

const STORAGE_PREFIX = "nexus-flow:workshop:mock:v1";
const memoryCanvases = new Map<string, Canvas>();

function storageKey(projectId: string): string {
  return `${STORAGE_PREFIX}:${projectId}`;
}

function cloneCanvas(canvas: Canvas): Canvas {
  return structuredClone(canvas);
}

function createMockCanvas(projectId: string): Canvas {
  const timestamp = "2026-07-14T09:00:00.000Z";

  return {
    id: `mock-canvas-${projectId}`,
    projectId,
    owner: {
      id: "mock-admin",
      firstName: "Nexus",
      lastName: "Admin",
      name: "Nexus Admin",
      email: "admin@nexus-flow.local",
      role: UserRole.ADMIN,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    type: CanvasType.MAIN,
    objects: [
      {
        id: "feature-discovery",
        type: CanvasObjectType.SECTION_FRAME,
        x: 80,
        y: 120,
        width: 560,
        height: 420,
        rotation: 0,
        zIndex: 0,
        data: {
          kind: "Feature",
          title: "Product discovery",
          description: "Align the team on users, scope, and success criteria.",
          backgroundColor: "#F5F3FF",
          borderColor: "#A78BFA",
          boardColumnId: "mock-column-discovery",
        },
      },
      {
        id: "task-personas",
        type: CanvasObjectType.TASK_CARD,
        x: 104,
        y: 216,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Define user personas",
          description: "Document the primary users and their core needs.",
          dueDate: "2026-07-18",
          featureId: "feature-discovery",
          taskId: "mock-task-personas",
        },
      },
      {
        id: "task-success-metrics",
        type: CanvasObjectType.TASK_CARD,
        x: 340,
        y: 216,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Set success metrics",
          description: "Agree on measurable product and delivery outcomes.",
          dueDate: "2026-07-20",
          featureId: "feature-discovery",
          taskId: "mock-task-success-metrics",
        },
      },
      {
        id: "task-scope",
        type: CanvasObjectType.TASK_CARD,
        x: 104,
        y: 356,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Confirm MVP scope",
          description: "Separate first-release work from later improvements.",
          dueDate: "2026-07-22",
          featureId: "feature-discovery",
          taskId: "mock-task-scope",
        },
      },
      {
        id: "feature-experience",
        type: CanvasObjectType.SECTION_FRAME,
        x: 740,
        y: 120,
        width: 560,
        height: 420,
        rotation: 0,
        zIndex: 0,
        data: {
          kind: "Feature",
          title: "Core experience",
          description: "Design and build the primary project workflow.",
          backgroundColor: "#EFF6FF",
          borderColor: "#60A5FA",
          boardColumnId: "mock-column-experience",
        },
      },
      {
        id: "task-workshop-flow",
        type: CanvasObjectType.TASK_CARD,
        x: 764,
        y: 216,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Build Workshop flow",
          description: "Create the planning canvas and protected draft mode.",
          dueDate: "2026-07-25",
          featureId: "feature-experience",
          taskId: "mock-task-workshop-flow",
        },
      },
      {
        id: "task-board-sync",
        type: CanvasObjectType.TASK_CARD,
        x: 1000,
        y: 216,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Connect the Team Board",
          description: "Publish features as columns and tasks as cards.",
          dueDate: "2026-07-27",
          featureId: "feature-experience",
          taskId: "mock-task-board-sync",
        },
      },
      {
        id: "task-responsive-pass",
        type: CanvasObjectType.TASK_CARD,
        x: 764,
        y: 356,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Complete responsive pass",
          description: "Polish the canvas hierarchy across desktop sizes.",
          dueDate: "2026-07-29",
          featureId: "feature-experience",
          taskId: "mock-task-responsive-pass",
        },
      },
      {
        id: "feature-launch",
        type: CanvasObjectType.SECTION_FRAME,
        x: 1400,
        y: 120,
        width: 560,
        height: 420,
        rotation: 0,
        zIndex: 0,
        data: {
          kind: "Feature",
          title: "Launch readiness",
          description: "Validate quality, documentation, and release readiness.",
          backgroundColor: "#ECFDF5",
          borderColor: "#34D399",
          boardColumnId: "mock-column-launch",
        },
      },
      {
        id: "task-acceptance",
        type: CanvasObjectType.TASK_CARD,
        x: 1424,
        y: 216,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Run acceptance testing",
          description: "Verify the complete Workshop-to-Board project flow.",
          dueDate: "2026-08-02",
          featureId: "feature-launch",
          taskId: "mock-task-acceptance",
        },
      },
      {
        id: "task-handoff",
        type: CanvasObjectType.TASK_CARD,
        x: 1660,
        y: 216,
        width: 220,
        height: 124,
        rotation: 0,
        zIndex: 2,
        data: {
          kind: "Task",
          title: "Prepare team handoff",
          description: "Document ownership, operations, and support steps.",
          dueDate: "2026-08-04",
          featureId: "feature-launch",
          taskId: "mock-task-handoff",
        },
      },
      {
        id: "note-backend-contract",
        type: CanvasObjectType.STICKY_NOTE,
        x: 665,
        y: 565,
        width: 188,
        height: 176,
        rotation: -2,
        zIndex: 3,
        data: {
          kind: "Note",
          content:
            "Backend handoff: preserve canvas object IDs and return the complete saved document.",
          color: "#FEF3C7",
          fontSize: 13,
        },
      },
      {
        id: "note-launch-question",
        type: CanvasObjectType.STICKY_NOTE,
        x: 1335,
        y: 565,
        width: 188,
        height: 176,
        rotation: 1,
        zIndex: 3,
        data: {
          kind: "Note",
          content:
            "Confirm whether Board column order changes only when feature connections change.",
          color: "#DBEAFE",
          fontSize: 13,
        },
      },
    ],
    connections: [
      {
        id: "connection-discovery-experience",
        fromObjectId: "feature-discovery",
        toObjectId: "feature-experience",
        style: {
          color: "#8B5CF6",
          strokeWidth: 2,
          type: "ARROW",
        },
      },
      {
        id: "connection-experience-launch",
        fromObjectId: "feature-experience",
        toObjectId: "feature-launch",
        style: {
          color: "#8B5CF6",
          strokeWidth: 2,
          type: "ARROW",
        },
      },
    ],
    viewport: {
      x: 36,
      y: 38,
      scale: 0.7,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function readCanvas(projectId: string): Canvas {
  try {
    const stored = window.localStorage.getItem(storageKey(projectId));
    if (stored) return JSON.parse(stored) as Canvas;
  } catch {
    // localStorage can be unavailable in restricted/private environments.
  }

  const memoryCanvas = memoryCanvases.get(projectId);
  if (memoryCanvas) return cloneCanvas(memoryCanvas);

  const canvas = createMockCanvas(projectId);
  memoryCanvases.set(projectId, cloneCanvas(canvas));
  return canvas;
}

function persistCanvas(canvas: Canvas): void {
  memoryCanvases.set(canvas.projectId, cloneCanvas(canvas));
  try {
    window.localStorage.setItem(
      storageKey(canvas.projectId),
      JSON.stringify(canvas),
    );
  } catch {
    // The in-memory copy keeps mock mode functional when storage is blocked.
  }
}

export const mockWorkshopService = {
  getCanvas: async (projectId: string): Promise<ApiResponse<Canvas>> => {
    const canvas = readCanvas(projectId);
    return {
      success: true,
      message: "Mock Workshop canvas loaded",
      statusCode: 200,
      data: cloneCanvas(canvas),
    };
  },

  saveCanvas: async (
    projectId: string,
    payload: MockCanvasPayload,
  ): Promise<ApiResponse<Canvas>> => {
    const current = readCanvas(projectId);
    const updatedAt = new Date().toISOString();
    const canvas: Canvas = {
      ...current,
      projectId,
      objects: structuredClone(payload.objects),
      connections: structuredClone(payload.connections),
      viewport: structuredClone(payload.viewport),
      updatedAt,
      owner: {
        ...current.owner,
        updatedAt,
      },
    };
    persistCanvas(canvas);

    return {
      success: true,
      message: "Mock Workshop canvas saved locally",
      statusCode: 200,
      data: cloneCanvas(canvas),
    };
  },
};
