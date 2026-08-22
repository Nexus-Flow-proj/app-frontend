import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

export function useSortableTask(task: Task, disabled = false) {
  const sortable = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled,
  });

  return {
    ...sortable,
    style: {
      transform: CSS.Transform.toString(sortable.transform),
      transition: sortable.transition,
      opacity: sortable.isDragging ? 0.3 : 1,
    },
  };
}
