import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanBadge } from "./PlanBadge";

describe("PlanBadge", () => {
  it("renders Free badge correctly", () => {
    render(<PlanBadge tier="FREE" />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders Pro badge correctly", () => {
    render(<PlanBadge tier="PRO" />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("renders Business badge correctly", () => {
    render(<PlanBadge tier="BUSINESS" />);
    expect(screen.getByText("Business")).toBeInTheDocument();
  });
});
