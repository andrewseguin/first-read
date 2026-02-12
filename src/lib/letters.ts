
export type LetterInfo = {
  char: string;
  verticalOffset?: number; // in rem
};

export const LETTER_LEVELS = [
  { level: 1, name: "Level 1", letters: [
      { char: "s", verticalOffset: -1 },
      { char: "a", verticalOffset: -1 },
      { char: "t" },
      { char: "p", verticalOffset: -2.5 },
      { char: "i", verticalOffset: -1 },
      { char: "n", verticalOffset: -1 },
    ], color: "#00A651", textColor: "#FFFFFF" },
  { level: 2, name: "Level 2", letters: [
      { char: "c", verticalOffset: -1 },
      { char: "o", verticalOffset: -1 },
      { char: "d" },
      { char: "m", verticalOffset: -1 },
      { char: "k" },
    ], color: "#008DC9", textColor: "#FFFFFF" },
  { level: 3, name: "Level 3", letters: [
      { char: "e", verticalOffset: -1 },
      { char: "r", verticalOffset: -1 },
      { char: "g", verticalOffset: -2.5 },
      { char: "b" },
      { char: "h" },
    ], color: "#A77700", textColor: "#FFFFFF" },
  { level: 4, name: "Level 4", letters: [
      { char: "w", verticalOffset: -1 },
      { char: "j", verticalOffset: -2.5 },
      { char: "l" },
      { char: "u", verticalOffset: -1 },
      { char: "f" },
    ], color: "#EF4136", textColor: "#FFFFFF" },
  { level: 5, name: "Level 5", letters: [
      { char: "y", verticalOffset: -2.5 },
      { char: "v", verticalOffset: -1 },
      { char: "x", verticalOffset: -1 },
      { char: "q", verticalOffset: -2.5 },
      { char: "z", verticalOffset: -1 },
    ], color: "#A258D1", textColor: "#FFFFFF" },
];

export const ALL_LETTERS = LETTER_LEVELS.flatMap(level => level.letters.map(l => l.char)).sort();

export const DEFAULT_LETTERS = LETTER_LEVELS[0].letters.map(l => l.char);

export const getLetterInfo = (letter: string) => {
    for (const level of LETTER_LEVELS) {
        const letterInfo = level.letters.find(l => l.char === letter);
        if (letterInfo) {
            return { ...letterInfo, color: level.color, textColor: level.textColor };
        }
    }
    return undefined;
}
