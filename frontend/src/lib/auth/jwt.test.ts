import { describe, expect, it } from "vitest";
import { getJwtExpiry, isJwtExpiringSoon } from "./jwt";

function base64UrlEncode(value: unknown): string {
  const base64 = btoa(JSON.stringify(value));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const body = base64UrlEncode(payload);
  return `${header}.${body}.fake-signature`;
}

describe("getJwtExpiry", () => {
  it("reads the exp claim and converts it to epoch-ms", () => {
    const expSeconds = 1_800_000_000;
    const token = makeToken({ exp: expSeconds });
    expect(getJwtExpiry(token)).toBe(expSeconds * 1000);
  });

  it("returns null when the token has no payload segment", () => {
    expect(getJwtExpiry("not-a-jwt")).toBeNull();
  });

  it("returns null when the payload isn't valid base64/JSON", () => {
    expect(getJwtExpiry("header.%%%not-base64%%%.signature")).toBeNull();
  });

  it("returns null when the payload has no exp claim", () => {
    const token = makeToken({ sub: "user-1" });
    expect(getJwtExpiry(token)).toBeNull();
  });
});

describe("isJwtExpiringSoon", () => {
  it("is false for a token that expires well in the future", () => {
    const futureSeconds = Math.floor(Date.now() / 1000) + 3600; // +1h
    const token = makeToken({ exp: futureSeconds });
    expect(isJwtExpiringSoon(token)).toBe(false);
  });

  it("is true for a token already expired", () => {
    const pastSeconds = Math.floor(Date.now() / 1000) - 60;
    const token = makeToken({ exp: pastSeconds });
    expect(isJwtExpiringSoon(token)).toBe(true);
  });

  it("is true for a token expiring within the buffer window", () => {
    const soonSeconds = Math.floor(Date.now() / 1000) + 5; // +5s
    const token = makeToken({ exp: soonSeconds });
    expect(isJwtExpiringSoon(token, 10_000)).toBe(true);
  });

  it("is true when the expiry can't be read at all (fail safe)", () => {
    expect(isJwtExpiringSoon("garbage")).toBe(true);
  });
});
