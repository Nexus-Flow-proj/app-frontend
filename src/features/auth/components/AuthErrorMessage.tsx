import { AlertCircle } from "lucide-react";
import type { ApiError } from "@/types";
import { getApiErrorMessages } from "@/lib/api/Messages";
import { cn } from "@/lib/utils";

interface AuthErrorMessageProps {
  error?: ApiError | null;
  excludeStatusCodes?: number[];
  className?: string;
}

function AuthErrorMessage({
  error,
  excludeStatusCodes = [],
  className,
}: AuthErrorMessageProps) {
  if (!error || excludeStatusCodes.includes(error.statusCode ?? 0)) {
    return null;
  }

  const messages = getApiErrorMessages(error);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2 rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <div className="space-y-1">
        {messages.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </div>
    </div>
  );
}

export default AuthErrorMessage;
