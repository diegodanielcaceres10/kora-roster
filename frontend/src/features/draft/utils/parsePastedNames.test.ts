import { describe, expect, it } from "vitest";
import { parsePastedNames } from "./parsePastedNames";

describe("parsePastedNames", () => {
  it("returns an empty array for empty or blank input", () => {
    expect(parsePastedNames("")).toEqual([]);
    expect(parsePastedNames("   \n  \n")).toEqual([]);
  });

  it("splits by newline, comma and semicolon", () => {
    const result = parsePastedNames("Juan\nPedro, Ana; Luis");
    expect(result.map((p) => p.name)).toEqual(["Juan", "Pedro", "Ana", "Luis"]);
  });

  it("strips bullets and numbering prefixes", () => {
    const result = parsePastedNames("1. Juan\n2) Pedro\n- Ana\n* Luis\n• Marta");
    expect(result.map((p) => p.name)).toEqual(["Juan", "Pedro", "Ana", "Luis", "Marta"]);
  });

  it("collapses extra whitespace inside a name", () => {
    const result = parsePastedNames("Juan    Perez");
    expect(result[0].name).toBe("Juan Perez");
  });

  it("detects a goalkeeper marker in several languages and strips it from the name", () => {
    const cases = ["Juan (arquero)", "Pedro (portero)", "Ana (goleira)", "Luis (goalkeeper)", "Marta (GK)"];
    const result = parsePastedNames(cases.join("\n"));
    expect(result.every((p) => p.isGoalkeeper)).toBe(true);
    expect(result.map((p) => p.name)).toEqual(["Juan", "Pedro", "Ana", "Luis", "Marta"]);
  });

  it("does not mark a player as goalkeeper when there is no marker", () => {
    const result = parsePastedNames("Juan");
    expect(result[0].isGoalkeeper).toBe(false);
  });

  it("removes duplicate names case-insensitively, keeping the first occurrence", () => {
    const result = parsePastedNames("Juan\njuan\nJUAN (arquero)\nPedro");
    expect(result.map((p) => p.name)).toEqual(["Juan", "Pedro"]);
    // first occurrence wins, so the goalkeeper marker on the later duplicate is ignored
    expect(result[0].isGoalkeeper).toBe(false);
  });

  it("ignores lines that end up empty after cleanup", () => {
    const result = parsePastedNames("Juan\n\n   \n-\nPedro");
    expect(result.map((p) => p.name)).toEqual(["Juan", "Pedro"]);
  });
});
