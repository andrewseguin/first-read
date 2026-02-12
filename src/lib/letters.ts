export const LETTER_LEVELS = [
  { level: 1, name: "Level 1", description: "Letters: s, a, t, p, i, n", letters: ["s", "a", "t", "p", "i", "n"], color: "bg-level-1" },
  { level: 2, name: "Level 2", description: "Letters: c, o, d, m, k", letters: ["c", "o", "d", "m", "k"], color: "bg-level-2" },
  { level: 3, name: "Level 3", description: "Letters: e, r, g, b, h", letters: ["e", "r", "g", "b", "h"], color: "bg-level-3" },
  { level: 4, name: "Level 4", description: "Letters: w, j, l, u, f", letters: ["w", "j", "l", "u", "f"], color: "bg-level-4" },
  { level: 5, name: "Level 5", description: "Letters: y, v, x, q, z", letters: ["y", "v", "x", "q", "z"], color: "bg-level-5" },
];

export const ALL_LETTERS = LETTER_LEVELS.flatMap(level => level.letters).sort();

export const DEFAULT_LETTERS = LETTER_LEVELS[0].letters;

export const getLetterData = (letter: string) => {
  return LETTER_LEVELS.find(level => level.letters.includes(letter));
}
