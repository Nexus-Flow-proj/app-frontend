import { beforeEach, describe, expect, it } from "vitest";
import { clearCsrfToken, getCsrfToken, setCsrfToken } from "./csrf";

describe("CSRF token storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCsrfToken();
  });

  it("restores a token saved by an earlier page load", () => {
    window.localStorage.setItem("nexus-flow.csrf-token", "csrf-token");
    expect(getCsrfToken()).toBe("csrf-token");
  });

  it("removes the persisted token when a session ends", () => {
    setCsrfToken("csrf-token");
    clearCsrfToken();

    expect(window.localStorage.getItem("nexus-flow.csrf-token")).toBeNull();
  });
});
