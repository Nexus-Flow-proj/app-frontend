import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface MySeparatorProps {
  className?: string;
  text?: string;
}

function MySeparator({ className, text }: MySeparatorProps) {
  if (!text) {
    return <Separator className={className} />;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <Separator className="flex-1" />
      <span>{text}</span>
      <Separator className="flex-1" />
    </div>
  );
}

export default MySeparator;
