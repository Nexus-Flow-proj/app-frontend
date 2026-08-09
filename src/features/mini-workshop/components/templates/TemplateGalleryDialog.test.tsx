import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TemplateGalleryDialog } from "./TemplateGalleryDialog";

describe("TemplateGalleryDialog", () => {
  it("keeps the template gallery inside a bounded, scrollable dialog", () => {
    render(
      <TemplateGalleryDialog
        open
        onOpenChange={vi.fn()}
        onInsert={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("overflow-hidden");
    expect(dialog).toHaveClass("h-[min(760px,calc(100dvh-2rem))]");
    expect(screen.getAllByRole("button", { name: "Insert template" })).toHaveLength(8);
  });
});
