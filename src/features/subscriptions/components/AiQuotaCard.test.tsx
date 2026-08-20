import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AiQuotaCard } from "./AiQuotaCard";

describe("AiQuotaCard", () => {
  it("renders Free quota card with usage numbers", () => {
    render(
      <MemoryRouter>
        <AiQuotaCard
          tier="FREE"
          usage={{
            aiOnboardingGenerationsUsed: 0,
            aiChatMessagesUsed: 0,
            aiTaskActionsUsed: 0,
            aiTotalRequestsUsed: 2,
            aiUsageResetAt: "2026-09-01T00:00:00.000Z",
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("AI Quota Usage")).toBeInTheDocument();
    expect(screen.getByText("2 of 3 used")).toBeInTheDocument();
  });

  it("renders Pro quota breakdowns", () => {
    render(
      <MemoryRouter>
        <AiQuotaCard
          tier="PRO"
          usage={{
            aiOnboardingGenerationsUsed: 3,
            aiChatMessagesUsed: 20,
            aiTaskActionsUsed: 10,
            aiTotalRequestsUsed: 33,
            aiUsageResetAt: "2026-09-01T00:00:00.000Z",
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("AI Quota Usage")).toBeInTheDocument();
    expect(screen.getByText("3 of 6 used")).toBeInTheDocument();
    expect(screen.getByText("20 of 40 used")).toBeInTheDocument();
    expect(screen.getByText("10 of 20 used")).toBeInTheDocument();
  });

  it("renders Business unlimited state", () => {
    render(
      <MemoryRouter>
        <AiQuotaCard tier="BUSINESS" />
      </MemoryRouter>,
    );
    expect(screen.getByText("AI Generations")).toBeInTheDocument();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
  });
});
