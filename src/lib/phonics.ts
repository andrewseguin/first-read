/**
 * Splits a word into phonics segments, grouping certain letter combinations.
 * Currently supports:
 * - "ll", "tt", "ss", "ff", "zz", "ck"
 * - Digraphs: "sh", "ch", "th", "wh", "oo", "ee", "ea", "oa", "ai", "ay"
 * - R-controlled: "ar", "er", "ir", "or", "ur"
 */
export function splitIntoPhonicsSegments(word: string): string[] {
    const segments: string[] = [];
    let i = 0;

    while (i < word.length) {
        const currentChar = word[i].toLowerCase();
        const nextChar = word[i + 1]?.toLowerCase();
        const currentPair = currentChar + nextChar;

        const combined = (currentPair === "ll" ||
            currentPair === "tt" ||
            currentPair === "ck" ||
            currentPair === "ss" ||
            currentPair === "ff" ||
            currentPair === "zz" ||
            currentPair === "sh" ||
            currentPair === "ch" ||
            currentPair === "th" ||
            currentPair === "wh" ||
            currentPair === "oo" ||
            currentPair === "ee" ||
            currentPair === "ea" ||
            currentPair === "oa" ||
            currentPair === "ai" ||
            currentPair === "ay" ||
            currentPair === "ar" ||
            currentPair === "er" ||
            currentPair === "ir" ||
            currentPair === "or" ||
            currentPair === "ur");

        if (combined) {
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

    // For others, we might have audio files or we'll use speech synthesis fallback
    return lowerSegment;
}
