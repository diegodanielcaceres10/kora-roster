function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

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

export function isJwtExpiringSoon(token: string, bufferMs = 10_000): boolean {
  const expiresAt = getJwtExpiry(token);
  if (expiresAt === null) return true;
  return Date.now() >= expiresAt - bufferMs;
}
