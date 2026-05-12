import Spinner from "./Spinner";

interface LoadingProps {
  fullPage?: boolean;
  text?: string;
}

const Loading = ({ fullPage = false, text = "Loading..." }: LoadingProps) => {
  const containerClasses = fullPage
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm"
    : "relative";

  return (
    <div
      className={`${containerClasses} flex min-h-50 items-center justify-center`}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        {text && (
          <p className="animate-pulse text-sm font-medium text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
