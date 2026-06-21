import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface MySeparatorProps {
  className?: string;
  text?: string;
  isAlignStart?: boolean;
}

function MySeparator({ className, text, isAlignStart }: MySeparatorProps) {
  if (!text) {
    return <Separator className={className} />;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
        className,
      )}
    >
      {!isAlignStart && <Separator className="flex-1" />}
      <span>{text}</span>
      <Separator className="flex-1" />
    </div>
  );
}

export default MySeparator;
