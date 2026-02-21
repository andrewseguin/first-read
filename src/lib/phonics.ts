/**
 * Splits a word into phonics segments, grouping certain letter combinations.
 * Currently supports:
 * - "ll" (double L)
 * - "tt" (double T)
 * - "ss" (double S)
 * - "ff" (double F)
 * - "zz" (double Z)
 * - "ck" (digraph)
 */
export function splitIntoPhonicsSegments(word: string): string[] {
    const segments: string[] = [];
    let i = 0;

    while (i < word.length) {
        const currentChar = word[i].toLowerCase();
        const nextChar = word[i + 1]?.toLowerCase();
        const currentPair = currentChar + nextChar;

        if (
            currentPair === "ll" ||
            currentPair === "tt" ||
            currentPair === "ck" ||
            currentPair === "ss" ||
            currentPair === "ff" ||
            currentPair === "zz"
        ) {
            segments.push(word.substring(i, i + 2));
            i += 2;
        } else {
            segments.push(word[i]);
            i++;
        }
    }

    return segments;
}

/**
 * Maps a phonics segment to the letter sound key used in audio files.
 */
export function getSoundKeyForSegment(segment: string): string {
    const lowerSegment = segment.toLowerCase();

    if (lowerSegment === "ll") return "l";
    if (lowerSegment === "tt") return "t";
    if (lowerSegment === "ck") return "k";
    if (lowerSegment === "ss") return "s";
    if (lowerSegment === "ff") return "f";
    if (lowerSegment === "zz") return "z";

    return lowerSegment;
}
