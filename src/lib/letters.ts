
export const LETTER_LEVELS = [
  { level: 1, name: "Level 1", letters: ["s", "a", "t", "p", "i", "n"], color: "#00A651", textColor: "#FFFFFF" },
  { level: 2, name: "Level 2", letters: ["c", "o", "d", "m", "k"], color: "#008DC9", textColor: "#FFFFFF" },
  { level: 3, name: "Level 3", letters: ["e", "r", "g", "b", "h"], color: "#A77700", textColor: "#FFFFFF" },
  { level: 4, name: "Level 4", letters: ["w", "j", "l", "u", "f"], color: "#EF4136", textColor: "#FFFFFF" },
  { level: 5, name: "Level 5", letters: ["y", "v", "x", "q", "z"], color: "#A258D1", textColor: "#FFFFFF" },
];

export const ALL_LETTERS = LETTER_LEVELS.flatMap(level => level.letters).sort();

export const DEFAULT_LETTERS = LETTER_LEVELS[0].letters;

export const getLetterData = (letter: string) => {
  return LETTER_LEVELS.find(level => level.letters.includes(letter));
}
