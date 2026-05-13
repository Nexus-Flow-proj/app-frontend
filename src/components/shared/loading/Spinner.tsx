import { cn } from "@/lib/utils";

const Spinner = ({ className = "" }) => {
  return (
    <div
      className={cn(
        "size-14 animate-spin rounded-full border-[6px] border-gray-200 border-t-primary-500",
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
