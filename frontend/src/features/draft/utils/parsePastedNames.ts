const BULLET_OR_NUMBERING_REGEX = /^\s*(?:\d+[.)]|[-•*])\s*/;

export function parsePastedNames(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).flatMap((line) => line.split(/[,;]/));

  const cleaned = lines.map((line) => line.replace(BULLET_OR_NUMBERING_REGEX, "").trim()).filter((name) => name.length > 0);

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const name of cleaned) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(name);
    }
  }

  return unique;
}
