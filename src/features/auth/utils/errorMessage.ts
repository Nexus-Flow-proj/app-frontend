export function formatErrorMessageToArr(
  message: string | string[] | undefined,
): string[] {
  if (!message) return [];
  if (Array.isArray(message)) {
    return message;
  }
  return [message];
}
