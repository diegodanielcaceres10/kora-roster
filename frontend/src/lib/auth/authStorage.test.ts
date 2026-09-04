import { beforeEach, describe, expect, it } from "vitest";
import { authStorage } from "./authStorage";

describe("authStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null for both tokens when nothing is stored", () => {
    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
  });

  it("persists both tokens and reads them back", () => {
    authStorage.setTokens("access-1", "refresh-1");

    expect(authStorage.getAccessToken()).toBe("access-1");
    expect(authStorage.getRefreshToken()).toBe("refresh-1");
  });

  it("overwrites previously stored tokens", () => {
    authStorage.setTokens("access-1", "refresh-1");
    authStorage.setTokens("access-2", "refresh-2");

    expect(authStorage.getAccessToken()).toBe("access-2");
    expect(authStorage.getRefreshToken()).toBe("refresh-2");
  });

  it("clears both tokens", () => {
    authStorage.setTokens("access-1", "refresh-1");
    authStorage.clearTokens();

    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
  });
});
