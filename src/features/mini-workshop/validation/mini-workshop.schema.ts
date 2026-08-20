import { z } from "zod";

const styleSchema = z.object({
  fill: z.string(), stroke: z.string(), strokeWidth: z.number().nonnegative(), opacity: z.number().min(0).max(1),
  dash: z.array(z.number()).optional(), fontFamily: z.literal("Geist Variable").optional(), fontSize: z.number().positive().optional(),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700)]).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(), textColor: z.string().optional(),
});

const base = {
  id: z.string().min(1), x: z.number().finite(), y: z.number().finite(), width: z.number().positive(), height: z.number().positive(),
  rotation: z.number().finite(), zIndex: z.number().finite(), groupId: z.string().nullable().optional(), locked: z.boolean(), style: styleSchema,
};

export const miniCanvasObjectSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("SHAPE"), data: z.object({ shape: z.enum(["rectangle", "rounded-rectangle", "ellipse", "diamond", "triangle"]), text: z.string().optional() }) }),
  z.object({ ...base, type: z.literal("TEXT"), data: z.object({ text: z.string() }) }),
  z.object({ ...base, type: z.literal("STICKY_NOTE"), data: z.object({ text: z.string() }) }),
  z.object({ ...base, type: z.literal("IMAGE"), data: z.object({ assetId: z.string(), alt: z.string() }) }),
  z.object({ ...base, type: z.literal("FRAME"), data: z.object({ title: z.string(), description: z.string().optional() }) }),
  z.object({ ...base, type: z.literal("FREEHAND"), data: z.object({ points: z.array(z.array(z.number())).min(2) }) }),
  z.object({ ...base, type: z.literal("PERSONAL_TASK"), data: z.object({ title: z.string(), description: z.string(), completed: z.boolean() }) }),
  z.object({ ...base, type: z.literal("BOARD_TASK_REFERENCE"), data: z.object({ sourceTaskId: z.string(), title: z.string(), description: z.string(), priority: z.string(), status: z.string(), assigneeName: z.string().optional(), dueDate: z.string().optional(), unavailable: z.boolean().optional() }) }),
]);

const connectionSchema = z.object({
  id: z.string(), sourceObjectId: z.string(), targetObjectId: z.string(), sourceAnchor: z.enum(["auto", "top", "right", "bottom", "left"]),
  targetAnchor: z.enum(["auto", "top", "right", "bottom", "left"]), routing: z.enum(["straight", "curved", "elbow"]), label: z.string(),
  stroke: z.string(), strokeWidth: z.number().positive(), dash: z.array(z.number()).optional(),
});

const assetSchema = z.object({ id: z.string(), mimeType: z.string(), dataUrl: z.string(), width: z.number().positive(), height: z.number().positive(), name: z.string() });

export const miniWorkshopSceneSchema = z.object({
  viewport: z.object({ x: z.number().finite(), y: z.number().finite(), scale: z.number().positive() }),
  objects: z.array(miniCanvasObjectSchema), connections: z.array(connectionSchema), assets: z.record(z.string(), assetSchema),
});

export const miniWorkshopDocumentSchema = z.object({
  id: z.string().nullable(), projectId: z.string(), ownerId: z.string().nullable(), schemaVersion: z.literal(2), revision: z.number().int().nonnegative(),
  scene: miniWorkshopSceneSchema, createdAt: z.string().nullable(), updatedAt: z.string().nullable(),
});
