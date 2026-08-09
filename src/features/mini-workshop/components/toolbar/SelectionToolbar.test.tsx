import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMiniWorkshopStore } from "../../store/miniWorkshopStore";
import type { MiniCanvasObject } from "../../types";
import { SelectionToolbar } from "./SelectionToolbar";

const shape: MiniCanvasObject = {
  id: "shape-1",
  type: "SHAPE",
  x: 0,
  y: 0,
  width: 220,
  height: 140,
  rotation: 0,
  zIndex: 1,
  groupId: null,
  locked: false,
  style: {
    fill: "#ede9fe",
    stroke: "#8b5cf6",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 18,
    fontWeight: 500,
    textAlign: "center",
  },
  data: { shape: "rounded-rectangle" },
};

describe("SelectionToolbar", () => {
  beforeEach(() => {
    useMiniWorkshopStore.getState().loadScene({
      viewport: { x: 0, y: 0, scale: 1 },
      objects: [shape],
      connections: [],
      assets: {},
    });
    useMiniWorkshopStore.getState().select([shape.id]);
  });

  it("shows the active choices and reveals color options only when requested", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <SelectionToolbar />
      </TooltipProvider>,
    );

    expect(screen.getByRole("button", { name: "Fill: #ede9fe" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Stroke: #8b5cf6" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Text formatting: 18 px" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Border style: Solid" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Connector routing: Curved" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Distribute selected objects" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitemradio", { name: "Fill #dbeafe" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fill: #ede9fe" }));
    expect(screen.getByRole("menuitemradio", { name: "Fill #dbeafe" })).toBeVisible();
    await user.click(screen.getByRole("menuitemradio", { name: "Fill #dbeafe" }));

    expect(screen.getByRole("button", { name: "Fill: #dbeafe" })).toBeVisible();
    expect(useMiniWorkshopStore.getState().objectsById[shape.id]?.style.fill).toBe("#dbeafe");
  });
});
