import type { ReactNode } from "react";

interface InvitationMessageProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function InvitationMessage({
  icon,
  title,
  description,
}: InvitationMessageProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
