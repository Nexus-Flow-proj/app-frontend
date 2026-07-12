import { formatInitials } from "@/lib/format/text";

interface InvitationProjectSummaryProps {
  name: string;
  color: string;
  description?: string | null;
}

export function InvitationProjectSummary({
  name,
  color,
  description,
}: InvitationProjectSummaryProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {formatInitials(name)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{name}</p>
        {description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
