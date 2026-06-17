import { Button } from "@/components/ui/button";
import { MyEmpty } from "@/components/shared/feedback/MyEmpty";
import { Columns3, Plus } from "lucide-react";

function EmptyBoard({ onAddColumn }: { onAddColumn?: () => void }) {
  return (
    <MyEmpty
      title="No columns yet"
      description="Add a column to start organizing tasks"
      icon={Columns3}
    >
      {onAddColumn && (
        <Button size="sm" onClick={onAddColumn} className="gap-1.5">
          <Plus className="size-3.5" />
          Add first column
        </Button>
      )}
    </MyEmpty>
  );
}

export default EmptyBoard;
