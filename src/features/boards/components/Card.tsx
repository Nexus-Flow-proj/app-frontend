import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardProps } from "../types";

export const Card = ({ task }: CardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border p-4 mb-2 bg-card rounded cursor-grab active:cursor-grabbing"
    >
      {/* Style B Dameer ya 3azoooooz*/}
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p className="text-xs text-muted-foreground">{task.priority}</p>
    </div>
  );
};
