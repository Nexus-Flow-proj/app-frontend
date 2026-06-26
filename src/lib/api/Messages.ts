import type { ApiError, ApiResponse } from "@/types";

export function getApiMessage(
  message: ApiResponse<unknown>["message"],
): string {
  return message || "Success";
}

export function getApiErrorMessages(error: ApiError): string[] {
  if (Array.isArray(error.message)) {
    return error.message.length > 0
      ? error.message
      : [error.error ?? "Something went wrong"];
  }

  return [error.message ?? error.error ?? "Something went wrong"];
}
