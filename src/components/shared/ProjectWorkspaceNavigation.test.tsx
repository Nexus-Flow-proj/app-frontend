import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProjectWorkspaceNavigation } from "./ProjectWorkspaceNavigation";

describe("ProjectWorkspaceNavigation", () => {
  it("links project workspaces and marks the active one", () => {
    render(
      <MemoryRouter>
        <ProjectWorkspaceNavigation
          projectId="project-1"
          draftId="draft-1"
          current="board"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Board" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Workshop" })).toHaveAttribute(
      "href",
      "/drafts/draft-1/workshop",
    );
    expect(screen.getByRole("link", { name: "Mini Workshop" })).toHaveAttribute(
      "href",
      "/projects/project-1/my-workshop",
    );
  });

  it("does not render a dead navigation control when no project exists", () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectWorkspaceNavigation draftId="draft-1" current="workshop" />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
