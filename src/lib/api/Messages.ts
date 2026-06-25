import type { ApiError, ApiResponse } from "@/types";

function isMessageText(value: string | undefined): value is string {
  return Boolean(value);
}

export function toApiMessageText(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toApiMessageText).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    const message = "message" in value ? value.message : undefined;

    if (typeof message === "string") {
      return message;
    }

    const error = "error" in value ? value.error : undefined;

    if (typeof error === "string") {
      return error;
    }
  }

  return undefined;
}

export function getApiMessage(
  message: ApiResponse<unknown>["message"],
): string {
  return toApiMessageText(message) ?? "Success";
}

export function getApiErrorMessages(error: ApiError): string[] {
  if (Array.isArray(error.message)) {
    const messages = error.message.map(toApiMessageText).filter(isMessageText);

    return messages.length > 0
      ? messages
      : [toApiMessageText(error.error) ?? "Something went wrong"];
  }

  return [
    toApiMessageText(error.message) ??
      toApiMessageText(error.error) ??
      "Something went wrong",
  ];
}
