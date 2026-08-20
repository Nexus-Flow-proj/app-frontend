interface ProjectDetailRowProps {
  label: string;
  value: string;
}

export function ProjectDetailRow({ label, value }: ProjectDetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="max-w-48 break-all text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
