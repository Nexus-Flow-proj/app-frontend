import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./Card";
import type { ColumnProps } from "../types";

export const Column = ({ column, tasks }: ColumnProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "Column", column } });

  // Style for the column while dragging DO NOT OVERWRITE THIS STYLE IT IS CRUCIAL FOR THE DRAGGING ANIMATION TO WORK PROPERLY YA AHMED YA EZZAT
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskIds = tasks.map((t) => t.id);

  return (
    /* THE WHOLE CONTAINER OF THE COLUMN */
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-80 bg-slate-900/50 p-4 rounded-lg min-h-[500px]"
    >
      {/* Column Handle bar , we put the listeners here so that the user can only move the column from the header not from the body and tasks 
      notice that the setNodeRef is on the parent div that contains the whole column but the handle that moves it is only the header*/}
      <div
        {...attributes}
        {...listeners}
        className="font-bold pb-2 cursor-move"
      >
        {column.name}
      </div>

      {/* Sorting Context wrapper for Vertical Cards */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-[150px]">
          {tasks.map((task) => (
            <Card key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
