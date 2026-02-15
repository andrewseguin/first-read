
export type LetterInfo = {
  char: string;
  verticalOffset?: number; // in em
};

export const LETTER_LEVELS = [
  {
    level: 1, name: "Level 1", letters: [
      { char: "s", verticalOffset: -0.075 },
      { char: "a", verticalOffset: -0.075 },
      { char: "t", verticalOffset: -0.035 },
      { char: "p", verticalOffset: -0.15 },
      { char: "i", verticalOffset: -0.05 },
      { char: "n", verticalOffset: -0.075 },
    ], color: "#00A651", textColor: "#FFFFFF"
  },
  {
    level: 2, name: "Level 2", letters: [
      { char: "c", verticalOffset: -0.075 },
      { char: "o", verticalOffset: -0.075 },
      { char: "d", verticalOffset: -0.035 },
      { char: "m", verticalOffset: -0.075 },
      { char: "k", verticalOffset: -0.035 },
    ], color: "#008DC9", textColor: "#FFFFFF"
  },
  {
    level: 3, name: "Level 3", letters: [
      { char: "e", verticalOffset: -0.075 },
      { char: "r", verticalOffset: -0.075 },
      { char: "g", verticalOffset: -0.15 },
      { char: "b", verticalOffset: -0.035 },
      { char: "h", verticalOffset: -0.035 },
    ], color: "#A77700", textColor: "#FFFFFF"
  },
  {
    level: 4, name: "Level 4", letters: [
      { char: "w", verticalOffset: -0.075 },
      { char: "j", verticalOffset: -0.15 },
      { char: "l", verticalOffset: -0.035 },
      { char: "u", verticalOffset: -0.075 },
      { char: "f", verticalOffset: -0.035 },
    ], color: "#EF4136", textColor: "#FFFFFF"
  },
  {
    level: 5, name: "Level 5", letters: [
      { char: "y", verticalOffset: -0.15 },
      { char: "v", verticalOffset: -0.075 },
      { char: "x", verticalOffset: -0.075 },
      { char: "q", verticalOffset: -0.15 },
      { char: "z", verticalOffset: -0.075 },
    ], color: "#A258D1", textColor: "#FFFFFF"
  },
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
