import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BoardColumn } from "../types";

export function useSortableColumn(column: BoardColumn, disabled = false) {
  const sortable = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled,
  });

  return {
    ...sortable,
    style: {
      transform: CSS.Transform.toString(sortable.transform),
      transition: sortable.transition,
      opacity: sortable.isDragging ? 0.5 : 1,
    },
  };
}
