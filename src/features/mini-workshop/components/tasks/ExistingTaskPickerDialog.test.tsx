import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskPriority, TaskSource, TaskStatus } from "@/features/boards/types/enums";
import type { Task } from "@/features/boards/types";
import { ExistingTaskPickerDialog } from "./ExistingTaskPickerDialog";

const task: Task = {
  id: "task-1", title: "Define the brand", description: "Create the initial direction", projectId: "project-1",
  dependencyIds: [], columnOrder: 0, status: TaskStatus.BACKLOG, priority: TaskPriority.HIGH,
  createdBy: "user-1", createdAt: "2026-08-09T00:00:00.000Z", source: TaskSource.MANUAL,
};

describe("ExistingTaskPickerDialog", () => {
  it("keeps checkbox and row controls valid and inserts the selected task", async () => {
    const user = userEvent.setup(); const onAdd = vi.fn(); const onOpenChange = vi.fn();
    const { container } = render(<ExistingTaskPickerDialog open tasks={[task]} members={[]} currentUserId="user-1" isLoading={false} onOpenChange={onOpenChange} onAdd={onAdd} />);
    expect(container.querySelector("button button")).toBeNull();
    await user.click(screen.getByRole("checkbox", { name: "Select Define the brand" }));
    await user.click(screen.getByRole("button", { name: "Add 1 to canvas" }));
    expect(onAdd).toHaveBeenCalledWith([task]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
