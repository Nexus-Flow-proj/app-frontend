import type { ApiResponse } from "@/types";
import { MINI_WORKSHOP_TEMPLATES } from "../constants/templates";
import type { MiniWorkshopDocument, SaveMiniWorkshopDto } from "../types";
import { miniWorkshopDocumentSchema } from "../validation/mini-workshop.schema";

const STORAGE_PREFIX = "nexus-flow:mini-workshop:mock:v2:";

function storageKey(projectId: string) {
  return `${STORAGE_PREFIX}${projectId}`;
}

function createSeedDocument(projectId: string): MiniWorkshopDocument {
  const now = new Date().toISOString();
  const welcome = MINI_WORKSHOP_TEMPLATES[0].build({ x: 120, y: 100 });
  return {
    id: `mock-${projectId}`,
    projectId,
    ownerId: "mock-user",
    schemaVersion: 2,
    revision: 0,
    scene: {
      viewport: { x: 40, y: 40, scale: 0.82 },
      objects: welcome.objects,
      connections: welcome.connections,
      assets: {},
    },
    createdAt: now,
    updatedAt: now,
  };
}

function readStoredDocument(projectId: string): MiniWorkshopDocument | null {
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    const parsed = miniWorkshopDocumentSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeStoredDocument(document: MiniWorkshopDocument) {
  window.localStorage.setItem(storageKey(document.projectId), JSON.stringify(document));
}

export function loadMockMiniWorkshop(projectId: string): ApiResponse<MiniWorkshopDocument> {
  const stored = readStoredDocument(projectId);
  const document = stored ?? createSeedDocument(projectId);
  if (!stored) writeStoredDocument(document);
  return { success: true, message: "Using a local Mini Workshop while the backend endpoint is unavailable.", statusCode: 200, data: document };
}

export function saveMockMiniWorkshop(projectId: string, dto: SaveMiniWorkshopDto): ApiResponse<MiniWorkshopDocument> {
  const existing = readStoredDocument(projectId) ?? createSeedDocument(projectId);
  const document: MiniWorkshopDocument = {
    ...existing,
    revision: existing.revision + 1,
    schemaVersion: 2,
    scene: dto.scene,
    updatedAt: new Date().toISOString(),
  };
  writeStoredDocument(document);
  return { success: true, message: "Mini Workshop saved locally.", statusCode: 200, data: document };
}
