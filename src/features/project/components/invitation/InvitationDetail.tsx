import type { ReactNode } from "react";

interface InvitationDetailProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

export function InvitationDetail({ label, value, icon }: InvitationDetailProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="min-w-0 truncate font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}
