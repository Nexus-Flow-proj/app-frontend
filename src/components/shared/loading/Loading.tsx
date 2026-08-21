import { BridgeLoader } from "@/components/bridge";
import { cn } from "@/lib/utils";

interface LoadingProps {
  fullPage?: boolean;
  text?: string;
  className?: string;
}

const Loading = ({ fullPage = false, text, className }: LoadingProps) => {
  const containerClasses = fullPage
    ? "fixed inset-0 z-50 bg-background/90 backdrop-blur-sm"
    : "relative";

  return (
    <div
      className={cn(
        containerClasses,
        "flex min-h-50 items-center justify-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <BridgeLoader size={120} className=" text-violet-500" />
        {text && (
          <p className="animate-pulse text-xs font-medium tracking-wide text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
