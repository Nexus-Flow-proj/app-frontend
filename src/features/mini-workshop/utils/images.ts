import type { MiniImageAsset } from "../types";
import { createMiniId } from "./objectFactory";

const MAX_SIDE = 2048;

export async function compressMiniWorkshopImage(file: File): Promise<MiniImageAsset> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image compression is not supported in this browser.");
  context.drawImage(bitmap, 0, 0, width, height); bitmap.close();
  const mimeType = file.type === "image/png" ? "image/png" : "image/webp";
  return { id: createMiniId("asset"), mimeType, dataUrl: canvas.toDataURL(mimeType, 0.86), width, height, name: file.name };
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl; anchor.download = filename; anchor.click();
}

export function downloadJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  downloadDataUrl(url, filename); URL.revokeObjectURL(url);
}
