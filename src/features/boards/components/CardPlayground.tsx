/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  DndContext,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Column } from "./Column";
import type { KanbanBoardState, TaskCard } from "../types";
const INITIAL_MOCK_BOARD: KanbanBoardState = {
  columns: {
    "col-backlog": {
      id: "col-backlog",
      projectId: "p1",
      name: " Backlog",
      sortOrder: 1000,
      isProtected: false,
      createdAt: "",
    },
    "col-progress": {
      id: "col-progress",
      projectId: "p1",
      name: " In Progress",
      sortOrder: 2000,
      isProtected: false,
      createdAt: "",
    },
    "col-review": {
      id: "col-review",
      projectId: "p1",
      name: " In Review",
      sortOrder: 3000,
      isProtected: false,
      createdAt: "",
    },
    "col-done": {
      id: "col-done",
      projectId: "p1",
      name: " Done",
      sortOrder: 4000,
      isProtected: false,
      createdAt: "",
    },
  },
  tasks: {
    "col-backlog": [
      {
        id: "t1",
        projectId: "p1",
        createdBy: "u1",
        title: "Setup Tailwind neutral dark scales",
        status: "BACKLOG",
        priority: "LOW",
        columnOrder: 1000,
        source: "MANUAL",
        createdAt: "",
      },
      {
        id: "t2",
        projectId: "p1",
        createdBy: "u1",
        title: "Initialize Socket.io connection client",
        status: "BACKLOG",
        priority: "MEDIUM",
        columnOrder: 2000,
        source: "MANUAL",
        createdAt: "",
      },
    ],
    "col-progress": [
      {
        id: "t3",
        projectId: "p1",
        createdBy: "u1",
        title: "Build unstyled HTML structures",
        status: "IN_PROGRESS",
        priority: "HIGH",
        columnOrder: 1000,
        source: "MANUAL",
        createdAt: "",
      },
    ],
    "col-review": [
      {
        id: "t4",
        projectId: "p1",
        createdBy: "u1",
        title: "Meet with backend to lock move endpoints",
        status: "IN_REVIEW",
        priority: "MEDIUM",
        columnOrder: 1000,
        source: "MANUAL",
        createdAt: "",
      },
    ],
    "col-done": [],
  },
};

export const CardPlayground = () => {
  const [boardData, setBoardData] =
    useState<KanbanBoardState>(INITIAL_MOCK_BOARD);

  // Configure sensors so clicking child elements (buttons, inputs) still works smoothly
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), // Require a small drag distance of 5 px to make sure user can click as well as drag without conflict
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }, // on touch screens user must press for 200ms and move at least 5 px for the system to know it is dragging
    }),
  );

  // --- ENGINE HANDLER 1: TRANSLATING CARDS BETWEEN LUCK-COLUMN TRACKS DURING FLIGHT ---
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString(); // id of the card / column being dragged
    const overId = over.id.toString(); // id of the card or column being hovered over

    const activeType = active.data.current?.type;
    if (activeType !== "Task") return; // if we are not dragging a card, we don't care about this event

    // Find the id of the column that the active card is originally in (source column)

    const activeColId = Object.keys(boardData.tasks).find((colId) =>
      boardData.tasks[colId].some((t) => t.id === activeId),
    );

    // Determine the destination column target
    // 1) Object.keys(boardData.tasks) => get the keys of the tasks dictionary and get them in an array
    // 2) .find(colId => ...) => loop through the array we got from step 1 and find the col that satisfy the condition
    // 3) The Condition : boardData.tasks[colId].some((t) => t.id === overId)  => check if the column we are currently checking has a task with the same id as the one we are hovering over
    let targetColId = Object.keys(boardData.tasks).find((colId) =>
      boardData.tasks[colId].some((t) => t.id === overId),
    );
    if (!targetColId && boardData.columns[overId]) {
      targetColId = overId; // The user hovered straight over an empty column block
    }

    if (!activeColId || !targetColId || activeColId === targetColId) return; // if we can't determine source or target column or if source and target are the same, do nothing

    setBoardData((prev) => {
      const sourceCards = [...prev.tasks[activeColId]];
      const targetCards = [...(prev.tasks[targetColId] || [])];

      const cardIndex = sourceCards.findIndex((t) => t.id === activeId);
      const [movedCard] = sourceCards.splice(cardIndex, 1);

      // Update card metadata fields to reflect its new home lane
      const updatedCard = { ...movedCard, boardColumnId: targetColId };

      // Find insertion index position inside target array
      const isOverACard = prev.tasks[targetColId]?.some((t) => t.id === overId);
      const overIndex = isOverACard
        ? targetCards.findIndex((t) => t.id === overId)
        : targetCards.length;

      targetCards.splice(overIndex, 0, updatedCard);

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [activeColId]: sourceCards,
          [targetColId]: targetCards,
        },
      };
    });
  };

  // --- ENGINE HANDLER 2: LOCKING PERSISTENCE WHEN DROPPED ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    const activeType = active.data.current?.type;

    // A. Persist Column Layout Positions
    if (activeType === "Column" && activeId !== overId) {
      setBoardData((prev) => {
        const colArray = Object.values(prev.columns).sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );
        const oldIndex = colArray.findIndex((c) => c.id === activeId);
        const newIndex = colArray.findIndex((c) => c.id === overId);
        const newOrderedArray = arrayMove(colArray, oldIndex, newIndex);

        // Calculate fractional floats for the system database state target
        let calculatedFloat = 2000;
        if (newIndex === 0) calculatedFloat = newOrderedArray[1].sortOrder / 2;
        else if (newIndex === newOrderedArray.length - 1)
          calculatedFloat =
            newOrderedArray[newOrderedArray.length - 2].sortOrder + 1000;
        else {
          calculatedFloat =
            (newOrderedArray[newIndex - 1].sortOrder +
              newOrderedArray[newIndex + 1].sortOrder) /
            2;
        }

        console.log(
          `📡 DAY 1 API CONTRACT CALL -> moveColumn("${activeId}", ${calculatedFloat})`,
        );

        // Re-save state arrays with mapped floating numbers
        const updatedColumns: Record<string, any> = {};
        newOrderedArray.forEach((col) => {
          updatedColumns[col.id] = {
            ...col,
            sortOrder: col.id === activeId ? calculatedFloat : col.sortOrder,
          };
        });

        return { ...prev, columns: updatedColumns };
      });
      return;
    }

    // B. Persist Card Sorting Positions within the same column
    if (activeType === "Task") {
      const currentContainingColId = Object.keys(boardData.tasks).find(
        (colId) => boardData.tasks[colId].some((t) => t.id === activeId),
      );

      if (!currentContainingColId) return;

      setBoardData((prev) => {
        const currentCards = [...prev.tasks[currentContainingColId]];
        const oldIndex = currentCards.findIndex((t) => t.id === activeId);
        const newIndex = currentCards.findIndex((t) => t.id === overId);

        //error handling ba7t
        if (newIndex === -1 || oldIndex === newIndex) return prev;

        const updatedCards = arrayMove(currentCards, oldIndex, newIndex);

        // Calculate fractional float for vertical task cards
        let calculatedFloat = 1000;
        if (newIndex === 0) calculatedFloat = updatedCards[1].columnOrder / 2;
        else if (newIndex === updatedCards.length - 1)
          calculatedFloat =
            updatedCards[updatedCards.length - 2].columnOrder + 1000;
        else {
          const prevCard = updatedCards[newIndex - 1];
          const nextCard = updatedCards[newIndex + 1];
          if (prevCard && nextCard) {
            calculatedFloat = (prevCard.columnOrder + nextCard.columnOrder) / 2;
          } else {
            calculatedFloat = 1000; // Safe fallback value if things look corrupt
          }
        }

        console.log(
          `📡 DAY 1 API CONTRACT CALL -> moveTask("${activeId}", "${currentContainingColId}", "${currentContainingColId}", ${calculatedFloat})`,
        );

        updatedCards[newIndex] = {
          ...updatedCards[newIndex],
          columnOrder: calculatedFloat,
        };

        return {
          ...prev,
          tasks: { ...prev.tasks, [currentContainingColId]: updatedCards },
        };
      });
    }
  };

  const columnIds = Object.values(boardData.columns)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => c.id);

  return (
    <div className="w-full min-h-screen bg-slate-950 p-8 text-slate-100">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white">
          ⚙️ Upgraded Dev 1 Physics Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cross-column sorting and state updates are now operational.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto items-start pb-4">
          <SortableContext
            items={columnIds}
            strategy={horizontalListSortingStrategy}
          >
            {columnIds.map((colId) => (
              <Column
                key={colId}
                column={boardData.columns[colId]}
                tasks={boardData.tasks[colId] || []}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};
