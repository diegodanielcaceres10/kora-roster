const BULLET_OR_NUMBERING_REGEX = /^\s*(?:\d+[.)]|[-•*])\s*/;

const GOALKEEPER_MARKER_REGEX = /\(\s*(arquero|portero|guardameta|goleiro|goleira|goalkeeper|goalkeper|goalie|gk)\s*\)/i;

export interface ParsedPlayerName {
  name: string;
  isGoalkeeper: boolean;
}

export function parsePastedNames(rawText: string): ParsedPlayerName[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).flatMap((line) => line.split(/[,;]/));

  const cleaned = lines
    .map((line) => {
      const withoutBullet = line.replace(BULLET_OR_NUMBERING_REGEX, "").trim();
      const isGoalkeeper = GOALKEEPER_MARKER_REGEX.test(withoutBullet);
      const name = withoutBullet
        .replace(GOALKEEPER_MARKER_REGEX, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      return { name, isGoalkeeper };
    })
    .filter((entry) => entry.name.length > 0);

  const seen = new Set<string>();
  const unique: ParsedPlayerName[] = [];

  for (const entry of cleaned) {
    const key = entry.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(entry);
    }
  }

  return unique;
}
