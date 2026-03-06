
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_LETTERS, getLetterInfo, LETTER_LEVELS } from "@/lib/letters";
import { EASY_WORDS, HARD_WORDS } from "@/lib/words";
import { LetterSelector } from "@/components/letter-selector";
import { LetterDisplay } from "@/components/letter-display";
import { FullscreenToggle } from "@/components/fullscreen-toggle";
import { AppSettings } from "@/components/app-settings";
import { SessionStats } from "@/components/session-stats";
import { RecordingsModal } from "@/components/recordings-modal";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const shuffle = (array: string[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const getHighestLevelInfoForWord = (word: string) => {
  let highestLevel = -1;
  let color = "#000000"; // Default color
  let textColor = "#FFFFFF"; // Default text color

  for (const char of word) {
    const letterInfo = getLetterInfo(char);
    if (letterInfo) {
      const level = LETTER_LEVELS.findIndex(lvl => lvl.letters.some(l => l.char === char));
      if (level > highestLevel) {
        highestLevel = level;
        color = letterInfo.color || color;
        textColor = letterInfo.textColor || textColor;
      }
    }
  }
  return { color, textColor };
};

type DisplayContent = {
  key: string;
  type: "letter" | "message" | "word";
  value: string;
  color?: string;
  textColor?: string;
  verticalOffset?: number;
  isHardWord?: boolean; // New property to indicate if the word is hard
};

export default function Home() {
  const { toast } = useToast();
  const [hydrated, setHydrated] = useState(false);
  const [letterCase, setLetterCase] = useLocalStorage<"lower" | "upper" | "mixed">(
    "first-read-letter-case",
    "lower"
  );
  const [selectedLetters, setSelectedLetters] = useLocalStorage<string[]>(
    "first-read-selection",
    DEFAULT_LETTERS
  );

  const [gameMode, setGameMode] = useLocalStorage<string>(
    "first-read-gamemode",
    "letters"
  );

  const [wordDifficulty, setWordDifficulty] = useLocalStorage<string>(
    "first-read-word-difficulty",
    "easy"
  );

  const [selectedWordLengths, setSelectedWordLengths] = useLocalStorage<
    number[]
  >("first-read-word-lengths", [3, 4, 5]);

  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>(
    "first-read-show-count",
    true
  );
  const [showTimer, setShowTimer] = useLocalStorage<boolean>(
    "first-read-show-timer",
    true
  );
  const [enableRecordings, setEnableRecordings] = useLocalStorage<boolean>(
    "first-read-enable-recordings",
    true
  );
  const [enableUppercase, setEnableUppercase] = useLocalStorage<boolean>(
    "first-read-enable-uppercase",
    true
  );
  const [enableWords, setEnableWords] = useLocalStorage<boolean>(
    "first-read-enable-words",
    true
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState(false);
  const lastMenuCloseTimeRef = useRef(0);
  const [lettersInCycle, setLettersInCycle] = useLocalStorage<string[]>(
    "first-read-cycle",
    []
  );
  const [wordsInCycle, setWordsInCycle] = useLocalStorage<string[]>(
    "first-read-word-cycle",
    []
  );
  const lastChangeTimeRef = useRef(0);
  const isMenuOpenRef = useRef(false);

  const [cardCount, setCardCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLocked, setIsLocked] = useLocalStorage<boolean>("first-read-app-locked", false);
  const [enableTracing, setEnableTracing] = useLocalStorage<boolean>("first-read-enable-tracing", true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const unlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update ref when state changes
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen || isSettingsOpen || isRecordingsModalOpen;
  }, [isMenuOpen, isSettingsOpen, isRecordingsModalOpen]);

  useEffect(() => {
    if (!enableUppercase && (letterCase === 'upper' || letterCase === 'mixed')) {
      setLetterCase('lower');
    }
  }, [enableUppercase, letterCase, setLetterCase]);

  useEffect(() => {
    if (!enableWords && gameMode === 'words') {
      setGameMode('letters');
    }
  }, [enableWords, gameMode, setGameMode]);

  const availableLetters = useMemo(() => {
    return selectedLetters.length > 0 ? selectedLetters : [];
  }, [selectedLetters]);

  const getInitialLetter = () => {
    const letter = availableLetters.length > 0 ? availableLetters[0] : 'a';
    const data = getLetterInfo(letter);
    return {
      key: "initial",
      type: "letter" as const,
      value: letter,
      color: data?.color,
      textColor: data?.textColor,
      verticalOffset: data?.verticalOffset,
    }
  }

  const [history, setHistory] = useLocalStorage<DisplayContent[]>(
    "first-read-history",
    [getInitialLetter()]
  );
  const [historyIndex, setHistoryIndex] = useState(history.length - 1);
  const displayContent = history[historyIndex];
  const displayContentRef = useRef<DisplayContent>(getInitialLetter());

  useEffect(() => {
    displayContentRef.current = displayContent;
  }, [displayContent]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    setLettersInCycle([]);
  }, [availableLetters, setLettersInCycle]);

  useEffect(() => {
    setWordsInCycle([]);
  }, [availableLetters, wordDifficulty, setWordsInCycle]);

  const showNextContent = useCallback((force = false, isInteraction = false, resetHistory = false) => {
    if (isMenuOpenRef.current && !force) return;

    const now = Date.now();
    if (now - lastChangeTimeRef.current < 100) {
      return;
    }
    lastChangeTimeRef.current = now;



    if (availableLetters.length === 0) {
      return; // If no letters, do nothing on interaction. useEffect handles the message.
    }

    if (gameMode === "words") {
      const wordPool =
        wordDifficulty === "easy"
          ? EASY_WORDS
          : [...EASY_WORDS, ...HARD_WORDS];
      const possibleWords = wordPool.filter((word) => {
        const wordLetters = word.split("");
        if (!selectedWordLengths.includes(word.length)) {
          return false;
        }
        return wordLetters.every((letter) => availableLetters.includes(letter));
      });

      if (possibleWords.length === 0) {
        const newContent: DisplayContent = {
          key: "no-words-msg",
          type: "message",
          value: "No words can be formed with these letters.",
        };
        if (resetHistory) {
          setHistory([newContent]);
          setHistoryIndex(0);
        } else {
          const newHistory = history.slice(0, historyIndex + 1);
          setHistory([...newHistory, newContent]);
          setHistoryIndex(newHistory.length);
        }
        return;
      }
      if (isInteraction) {
        setCardCount((prev) => prev + 1);
      }

      let currentCycle = wordsInCycle.filter(w => selectedWordLengths.includes(w.length));

      // Filter out hard words if in easy mode
      if (wordDifficulty === 'easy') {
        currentCycle = currentCycle.filter(w => !HARD_WORDS.includes(w));
      }

      if (currentCycle.length === 0) {
        currentCycle = shuffle([...possibleWords]);
        if (
          possibleWords.length > 1 &&
          currentCycle[0] === displayContentRef.current.value
        ) {
          const randomIndex = 1 + Math.floor(Math.random() * (currentCycle.length - 1));
          [currentCycle[0], currentCycle[randomIndex]] = [
            currentCycle[randomIndex],
            currentCycle[0],
          ];
        }
      }

      const newWord = currentCycle[0];
      const newCycle = currentCycle.slice(1);
      setWordsInCycle(newCycle);

      const { color, textColor } = getHighestLevelInfoForWord(newWord);
      const isHard = HARD_WORDS.includes(newWord);

      const newContent = {
        key: Date.now().toString(),
        type: "word" as const,
        value: newWord,
        color: color,
        textColor: textColor,
        isHardWord: isHard,
      };
      if (resetHistory) {
        setHistory([newContent]);
        setHistoryIndex(0);
      } else {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newContent]);
        setHistoryIndex(newHistory.length);
      }
      return;
    }

    if (isInteraction) {
      setCardCount((prev) => prev + 1);
    }
    let currentCycle = lettersInCycle;
    if (currentCycle.length === 0) {
      currentCycle = shuffle([...availableLetters]);
      if (
        availableLetters.length > 1 &&
        currentCycle[0] === displayContentRef.current.value
      ) {
        const randomIndex = 1 + Math.floor(Math.random() * (currentCycle.length - 1));
        [currentCycle[0], currentCycle[randomIndex]] = [
          currentCycle[randomIndex],
          currentCycle[0],
        ];
      }
    }

    const newLetter = currentCycle[0];
    const newCycle = currentCycle.slice(1);
    setLettersInCycle(newCycle);

    const letterData = getLetterInfo(newLetter);

    const newContent = {
      key: Date.now().toString(),
      type: "letter" as const,
      value: newLetter,
      color: letterData?.color,
      textColor: letterData?.textColor,
      verticalOffset: letterData?.verticalOffset,
    };
    if (resetHistory) {
      setHistory([newContent]);
      setHistoryIndex(0);
    } else {
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newContent]);
      setHistoryIndex(newHistory.length);
    }
  }, [availableLetters, lettersInCycle, setLettersInCycle, gameMode, wordDifficulty, history, historyIndex, setHistory, setHistoryIndex, wordsInCycle, setWordsInCycle, selectedWordLengths]);

  const prevSelectedLettersRef = useRef<string[]>(selectedLetters);

  useEffect(() => {
    if (gameMode === 'words' && prevSelectedLettersRef.current.join() !== selectedLetters.join()) {
      showNextContent(true, false, true); // `true` to force it even if menu is open, `true` to reset history
      prevSelectedLettersRef.current = selectedLetters;
    }
  }, [gameMode, selectedLetters, showNextContent]);

  useEffect(() => {
    if (gameMode === 'letters') {
      // If selectedLetters is empty, always show the message.
      if (selectedLetters.length === 0) {
        // Check if we already have the message displayed to avoid infinite loop
        if (
          history.length === 1 &&
          history[0].type === "message" &&
          history[0].key === "no-letters"
        ) {
          prevSelectedLettersRef.current = selectedLetters;
          return;
        }

        const newContent: DisplayContent = {
          key: "no-letters",
          type: "message",
          value: "Choose some letters in the menu!",
        };
        setHistory([newContent]);
        setHistoryIndex(0);
        prevSelectedLettersRef.current = selectedLetters;
        return;
      }

      // A brand new first letter was added (or hydrating from empty). Show it immediately.
      if (prevSelectedLettersRef.current.length === 0 && selectedLetters.length > 0) {
        const newLetter = selectedLetters[0];
        const data = getLetterInfo(newLetter);
        const newContent: DisplayContent = {
          key: "new-letter-added",
          type: "letter",
          value: newLetter,
          color: data?.color,
          textColor: data?.textColor,
          verticalOffset: data?.verticalOffset,
        };
        setHistory([newContent]);
        setHistoryIndex(0);
        prevSelectedLettersRef.current = selectedLetters;
        return;
      }

      // Handle state corrections
      const newContent = (prevDisplayContent: DisplayContent): DisplayContent => {
        // Hydration fix: Display is a message, but we have letters now.
        if (prevDisplayContent.type === 'message') {
          const firstLetter = selectedLetters[0];
          const data = getLetterInfo(firstLetter);
          return {
            key: "hydration-fix",
            type: "letter",
            value: firstLetter,
            color: data?.color,
            textColor: data?.textColor,
            verticalOffset: data?.verticalOffset,
          };
        }

        // Deselection fix: Displayed letter is no longer in the set.
        if (prevDisplayContent.type === 'letter' && !selectedLetters.includes(prevDisplayContent.value)) {
          const firstLetter = selectedLetters[0];
          const data = getLetterInfo(firstLetter);
          return {
            key: "update-from-selection",
            type: "letter",
            value: firstLetter,
            color: data?.color,
            textColor: data?.textColor,
            verticalOffset: data?.verticalOffset,
          };
        }

        // All other cases: The display is a letter that's still valid. Do nothing.
        return prevDisplayContent;
      };

      // Only update history if the content actually changes
      const updatedContent = newContent(displayContent);
      const lettersChanged = prevSelectedLettersRef.current.length > 0 && prevSelectedLettersRef.current.join() !== selectedLetters.join();

      if (updatedContent !== displayContent || lettersChanged) {
        setHistory([updatedContent]);
        setHistoryIndex(0);
      }

      prevSelectedLettersRef.current = selectedLetters;
    }
  }, [gameMode, selectedLetters, history, historyIndex, displayContent]);

  const prevGameModeRef = useRef(gameMode);
  useEffect(() => {
    if (prevGameModeRef.current !== gameMode) {
      showNextContent(true, false, true);
      prevGameModeRef.current = gameMode;
    }
  }, [gameMode, showNextContent]);

  const prevWordSettingsRef = useRef({ length: selectedWordLengths.join(), diff: wordDifficulty });
  useEffect(() => {
    const prev = prevWordSettingsRef.current;
    const curr = { length: selectedWordLengths.join(), diff: wordDifficulty };
    if (prev.length !== curr.length || prev.diff !== curr.diff) {
      if (gameMode === 'words') {
        showNextContent(true, false, true);
      }
      prevWordSettingsRef.current = curr;
    }
  }, [selectedWordLengths, wordDifficulty, gameMode, showNextContent]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const startUnlock = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsUnlocking(true);
    unlockTimeoutRef.current = setTimeout(() => {
      unlockTimeoutRef.current = null; // Explicitly clear before unlocking
      setIsLocked(false);
      setIsUnlocking(false);
      toast({
        description: "App Unlocked. Settings restored.",
      });
    }, 2000);
  };

  const cancelUnlock = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (unlockTimeoutRef.current) {
      clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = null;
      setIsUnlocking(false);
      toast({
        description: "Hold down the lock button for 2 seconds to unlock.",
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // If a menu was just closed, ignore this interaction
    if (Date.now() - lastMenuCloseTimeRef.current < 300) return;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return;

    // If a menu was just closed, ignore this interaction
    if (Date.now() - lastMenuCloseTimeRef.current < 300) {
      touchStartRef.current = null;
      return;
    }

    // If a menu was just closed, ignore this interaction
    if (Date.now() - lastMenuCloseTimeRef.current < 300) {
      touchStartRef.current = null;
      return;
    }

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    touchStartRef.current = null;

    // Check if it's a tap (minimal movement)
    if (absDeltaX < 10 && absDeltaY < 10) {
      if (Date.now() - lastMenuCloseTimeRef.current < 300) return;
      showNextContent(false, true);
      return;
    }

    // Check if it's a swipe (significant horizontal movement, more than vertical)
    if (absDeltaX > 50 && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        // Swipe Right -> Previous (like ArrowLeft)
        if (historyIndex > 0) {
          setHistoryIndex((prev) => prev - 1);
        }
      } else {
        // Swipe Left -> Next (like ArrowRight)
        if (historyIndex < history.length - 1) {
          setHistoryIndex((prev) => prev + 1);
        } else {
          // If at the end of history, generate new content
          showNextContent(false, true);
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code === "Space" ||
        event.code === "ArrowDown"
      ) {
        event.preventDefault();
        showNextContent(false, true);
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        if (historyIndex > 0) {
          setHistoryIndex((prev) => prev - 1);
        }
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        if (historyIndex < history.length - 1) {
          setHistoryIndex((prev) => prev + 1);
        } else {
          // If at the end of history, generate new content
          showNextContent(false, true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNextContent, historyIndex, history.length, setHistoryIndex]);

  if (!hydrated) {
    return null;
  }

  const handleMenuOpenChange = (open: boolean) => {
    if (!open) {
      lastMenuCloseTimeRef.current = Date.now();
    }
    setIsMenuOpen(open);
  }

  const handleSettingsOpenChange = (open: boolean) => {
    if (!open) {
      lastMenuCloseTimeRef.current = Date.now();
    }
    setIsSettingsOpen(open);
  }

  return (
    <main
      className="flex h-svh w-screen cursor-pointer items-center justify-center bg-background overflow-hidden relative focus:outline-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      tabIndex={-1}
    >
      <LetterDisplay content={displayContent} enableRecordings={enableRecordings} enableTracing={enableTracing} letterCase={letterCase} />
      {!isFullscreen && !isLocked && (
        <div className="absolute top-4 right-4 flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
          <LetterSelector
            open={isMenuOpen}
            selectedLetters={selectedLetters}
            setSelectedLetters={setSelectedLetters}
            onOpenChange={handleMenuOpenChange}
            gameMode={gameMode}
            onGameModeChange={setGameMode}
            wordDifficulty={wordDifficulty}
            onWordDifficultyChange={setWordDifficulty}
            selectedWordLengths={selectedWordLengths}
            onSelectedWordLengthsChange={setSelectedWordLengths}
            letterCase={letterCase}
            onLetterCaseChange={setLetterCase}
            enableUppercase={enableUppercase}
            enableWords={enableWords}
          />
          <AppSettings
            showCardCount={showCardCount}
            onShowCardCountChange={setShowCardCount}
            showTimer={showTimer}
            onShowTimerChange={setShowTimer}
            enableRecordings={enableRecordings}
            onEnableRecordingsChange={setEnableRecordings}
            enableTracing={enableTracing}
            onEnableTracingChange={setEnableTracing}
            enableUppercase={enableUppercase}
            onEnableUppercaseChange={setEnableUppercase}
            enableWords={enableWords}
            onEnableWordsChange={setEnableWords}
            open={isSettingsOpen}
            onOpenChange={handleSettingsOpenChange}
            onOpenRecordings={() => setIsRecordingsModalOpen(true)}
            onLockApp={() => setIsLocked(true)}
          />
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
        </div>
      )}

      {!isFullscreen && isLocked && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-destructive/50 hover:bg-transparent transition-all ease-linear relative",
              isUnlocking ? "text-destructive scale-150 duration-[2000ms]" : "hover:text-destructive duration-200"
            )}
            onPointerDown={startUnlock}
            onPointerUp={cancelUnlock}
            onPointerLeave={cancelUnlock}
            onPointerCancel={cancelUnlock}
            aria-label="Unlock app"
          >
            <Lock className="h-6 w-6" />
          </Button>
        </div>
      )}
      {(showCardCount || showTimer) && (
        <SessionStats
          cardCount={cardCount}
          timeElapsed={timeElapsed}
          showCardCount={showCardCount}
          showTimer={showTimer}
        />
      )}
      <RecordingsModal
        open={isRecordingsModalOpen}
        onOpenChange={setIsRecordingsModalOpen}
      />
    </main>
  );
}
