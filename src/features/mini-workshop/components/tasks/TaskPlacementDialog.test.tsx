import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskPlacementDialog } from "./TaskPlacementDialog";

describe("TaskPlacementDialog", () => {
  it("offers personal and repeatable project task flows", async () => {
    const user = userEvent.setup(); const personal = vi.fn(); const existing = vi.fn();
    render(<TaskPlacementDialog open onOpenChange={vi.fn()} onCreatePersonal={personal} onChooseExisting={existing} />);
    expect(screen.getByRole("heading", { name: "Add a task here" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Personal task/i }));
    await user.click(screen.getByRole("button", { name: /Project tasks/i }));
    expect(personal).toHaveBeenCalledOnce(); expect(existing).toHaveBeenCalledOnce();
  });
});
