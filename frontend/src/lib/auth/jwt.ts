// Reads the `exp` claim from a JWT without verifying its signature. That's
// intentional: this isn't used to decide whether the token is valid (the
// backend still does that on every request), only to decide client-side
// whether it's worth refreshing before sending a request. A tampered token
// still gets rejected by the server.
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

/** Returns the token's expiry as epoch-ms, or null if it couldn't be read. */
export function getJwtExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const { exp } = JSON.parse(base64UrlDecode(payload)) as { exp?: number };
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * True if the token is already expired or will expire within `bufferMs`.
 * If the expiry can't be read, assume it's expiring soon (better to
 * over-refresh than to send a request that's bound to fail).
 */
export function isJwtExpiringSoon(token: string, bufferMs = 10_000): boolean {
  const expiresAt = getJwtExpiry(token);
  if (expiresAt === null) return true;
  return Date.now() >= expiresAt - bufferMs;
}
