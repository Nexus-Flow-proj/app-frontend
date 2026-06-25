import type { ApiError } from "@/types";
import type { AxiosError } from "axios";
import { toApiMessageText } from "./Messages";

export function getErrorMessage(
  error: AxiosError<ApiError>,
): ApiError["message"] {
  const statusCode = error.response?.status ?? error.response?.data?.statusCode;
  const bodyMessage = error.response?.data?.message;

  if (Array.isArray(bodyMessage)) {
    return bodyMessage.length > 0 ? bodyMessage : "Something went wrong";
  }

  const messageText = toApiMessageText(bodyMessage);

  if (messageText) {
    return messageText;
  }

  const errorText = toApiMessageText(error.response?.data?.error);

  if (errorText) {
    return errorText;
  }

  if (statusCode === 409) {
    return "This email is already in use.";
  }

  if (statusCode === 429) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }

  if (statusCode === 403) {
    return "Your session token expired. Please retry the action.";
  }

  return error.message || "Something went wrong";
}

export function normalizeApiError(error: AxiosError<ApiError>): ApiError {
  console.log("normalizeApiError", error);
  return {
    message: getErrorMessage(error),
    error: toApiMessageText(error.response?.data?.error),
    statusCode:
      error.response?.status ?? error.response?.data?.statusCode ?? 500,
  };
}
