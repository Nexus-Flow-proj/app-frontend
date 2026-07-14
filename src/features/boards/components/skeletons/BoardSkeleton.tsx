import ColumnSkeleton from "./ColumnSkeleton";

function BoardSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <ColumnSkeleton />
      <ColumnSkeleton />
      <ColumnSkeleton />
    </div>
  );
}

export default BoardSkeleton;
