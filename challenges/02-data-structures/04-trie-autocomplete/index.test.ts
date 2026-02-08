import { describe, it, expect, vi } from "vitest";
import { Trie } from "./index";

describe("Trie", () => {
  // ─── insert & search ─────────────────────────────────────────

  it("should insert and find a word", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.search("solana")).toBe(true);
  });

  it("should return false for a word that does not exist", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.search("ethereum")).toBe(false);
  });

  it("should not match a prefix as a complete word", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.search("sol")).toBe(false);
  });

  it("should handle inserting multiple words", () => {
    const trie = new Trie();
    trie.insert("sol");
    trie.insert("solana");
    trie.insert("sonic");

    expect(trie.search("sol")).toBe(true);
    expect(trie.search("solana")).toBe(true);
    expect(trie.search("sonic")).toBe(true);
    expect(trie.search("so")).toBe(false);
  });

  it("should store metadata with words", () => {
    const trie = new Trie<{ symbol: string }>();
    trie.insert("solana", { symbol: "SOL" });

    const results = trie.autocomplete("solana");
    expect(results[0].metadata).toEqual({ symbol: "SOL" });
  });

  it("should update metadata on re-insert", () => {
    const trie = new Trie<{ price: number }>();
    trie.insert("solana", { price: 100 });
    trie.insert("solana", { price: 200 });

    const results = trie.autocomplete("solana");
    expect(results[0].metadata).toEqual({ price: 200 });
  });

  // ─── startsWith ──────────────────────────────────────────────

  it("should return true for a valid prefix", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.startsWith("sol")).toBe(true);
    expect(trie.startsWith("s")).toBe(true);
    expect(trie.startsWith("solana")).toBe(true);
  });

  it("should return false for an invalid prefix", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.startsWith("eth")).toBe(false);
    expect(trie.startsWith("solanax")).toBe(false);
  });

  it("should return false for empty trie", () => {
    const trie = new Trie();
    expect(trie.startsWith("a")).toBe(false);
  });

  // ─── autocomplete ────────────────────────────────────────────

  it("should return all words matching a prefix", () => {
    const trie = new Trie();
    trie.insert("sol");
    trie.insert("solana");
    trie.insert("sonic");
    trie.insert("usdc");

    const results = trie.autocomplete("so");
    const words = results.map((r) => r.word);

    expect(words).toContain("sol");
    expect(words).toContain("solana");
    expect(words).toContain("sonic");
    expect(words).not.toContain("usdc");
  });

  it("should return results sorted by frequency (highest first)", () => {
    const trie = new Trie();
    trie.insert("solana");
    trie.insert("sonic");
    trie.insert("sol");

    trie.incrementFrequency("sonic");
    trie.incrementFrequency("sonic");
    trie.incrementFrequency("solana");

    const results = trie.autocomplete("so");
    expect(results[0].word).toBe("sonic");
    expect(results[0].frequency).toBe(2);
    expect(results[1].word).toBe("solana");
    expect(results[1].frequency).toBe(1);
    expect(results[2].word).toBe("sol");
    expect(results[2].frequency).toBe(0);
  });

  it("should respect the limit parameter", () => {
    const trie = new Trie();
    trie.insert("bonk");
    trie.insert("bonsol");
    trie.insert("book");
    trie.insert("bold");

    const results = trie.autocomplete("bo", 2);
    expect(results).toHaveLength(2);
  });

  it("should return an empty array for no matches", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.autocomplete("xyz")).toEqual([]);
  });

  it("should return exact match when prefix is a full word", () => {
    const trie = new Trie();
    trie.insert("jup");
    trie.insert("jupiter");

    const results = trie.autocomplete("jup");
    const words = results.map((r) => r.word);
    expect(words).toContain("jup");
    expect(words).toContain("jupiter");
  });

  // ─── incrementFrequency ──────────────────────────────────────

  it("should increment frequency of an existing word", () => {
    const trie = new Trie();
    trie.insert("solana");

    expect(trie.incrementFrequency("solana")).toBe(true);
    expect(trie.incrementFrequency("solana")).toBe(true);

    const results = trie.autocomplete("solana");
    expect(results[0].frequency).toBe(2);
  });

  it("should return false when incrementing a non-existent word", () => {
    const trie = new Trie();
    expect(trie.incrementFrequency("nonexistent")).toBe(false);
  });

  it("should not increment frequency for a prefix that is not a word", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.incrementFrequency("sol")).toBe(false);
  });

  // ─── delete ───────────────────────────────────────────────────

  it("should delete an existing word", () => {
    const trie = new Trie();
    trie.insert("solana");
    expect(trie.delete("solana")).toBe(true);
    expect(trie.search("solana")).toBe(false);
  });

  it("should return false when deleting a non-existent word", () => {
    const trie = new Trie();
    expect(trie.delete("nothing")).toBe(false);
  });

  it("should not affect other words when deleting", () => {
    const trie = new Trie();
    trie.insert("sol");
    trie.insert("solana");

    trie.delete("solana");

    expect(trie.search("sol")).toBe(true);
    expect(trie.search("solana")).toBe(false);
  });

  it("should not break prefix search after deleting a word", () => {
    const trie = new Trie();
    trie.insert("sol");
    trie.insert("solana");

    trie.delete("sol");

    expect(trie.startsWith("sol")).toBe(true); // "solana" still has this prefix
    expect(trie.search("sol")).toBe(false);
    expect(trie.search("solana")).toBe(true);
  });

  // ─── getAllWords ──────────────────────────────────────────────

  it("should return all inserted words", () => {
    const trie = new Trie();
    const tokens = ["sol", "usdc", "usdt", "bonk", "jup", "ray"];
    for (const token of tokens) {
      trie.insert(token);
    }

    const allWords = trie.getAllWords();
    expect(allWords.sort()).toEqual(tokens.sort());
  });

  it("should return an empty array for an empty trie", () => {
    const trie = new Trie();
    expect(trie.getAllWords()).toEqual([]);
  });

  it("should reflect deletions in getAllWords", () => {
    const trie = new Trie();
    trie.insert("solana");
    trie.insert("sonic");
    trie.delete("solana");

    expect(trie.getAllWords()).toEqual(["sonic"]);
  });

  // ─── Edge cases ───────────────────────────────────────────────

  it("should handle empty string insertion", () => {
    const trie = new Trie();
    trie.insert("");
    expect(trie.search("")).toBe(true);
  });

  it("should handle case-sensitive searches", () => {
    const trie = new Trie();
    trie.insert("SOL");
    trie.insert("sol");

    expect(trie.search("SOL")).toBe(true);
    expect(trie.search("sol")).toBe(true);
    expect(trie.search("Sol")).toBe(false);
  });
});
