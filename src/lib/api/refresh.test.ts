import { describe, expect, it } from "vitest";
import { shouldAttemptRefresh } from "./refresh";

describe("refresh policy", () => {
  it("refreshes an expired auth session probe once", () => {
    expect(shouldAttemptRefresh({ url: "/auth/me" }, 401)).toBe(true);
    expect(
      shouldAttemptRefresh({ url: "/auth/me", _retry: true }, 401),
    ).toBe(false);
  });

  it("never refreshes a refresh request or public auth request", () => {
    expect(shouldAttemptRefresh({ url: "/auth/refresh" }, 401)).toBe(false);
    expect(shouldAttemptRefresh({ url: "/auth/login" }, 401)).toBe(false);
  });
});
