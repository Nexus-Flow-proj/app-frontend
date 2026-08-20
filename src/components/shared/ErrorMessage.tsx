import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}
function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex gap-2 rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export default ErrorMessage;
