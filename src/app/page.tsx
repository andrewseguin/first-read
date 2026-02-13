
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_LETTERS, getLetterInfo } from "@/lib/letters";
import { WORDS } from "@/lib/words";
import { LetterSelector } from "@/components/letter-selector";
import { LetterDisplay } from "@/components/letter-display";
import { FullscreenToggle } from "@/components/fullscreen-toggle";
import { AppSettings } from "@/components/app-settings";
import { SessionStats } from "@/components/session-stats";

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

type DisplayContent = {
  key: string;
  type: "letter" | "message" | "word";
  value: string;
  color?: string;
  textColor?: string;
  verticalOffset?: number;
};

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [selectedLetters, setSelectedLetters] = useLocalStorage<string[]>(
    "peek-a-letter-selection",
    []
  );

  const [gameMode, setGameMode] = useLocalStorage<string>(
    "peek-a-letter-gamemode",
    "letters"
  );

  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>(
    "peek-a-letter-show-count",
    true
  );
  const [showTimer, setShowTimer] = useLocalStorage<boolean>(
    "peek-a-letter-show-timer",
    true
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lettersInCycle, setLettersInCycle] = useLocalStorage<string[]>(
    "peek-a-letter-cycle",
    []
  );
  const lastChangeTimeRef = useRef(0);
  const isMenuOpenRef = useRef(false);

  const [cardCount, setCardCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

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
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

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

  const [displayContent, setDisplayContent] = useLocalStorage<DisplayContent>(
    "peek-a-letter-display-content",
    getInitialLetter()
  );
  const displayContentRef = useRef(displayContent);
  displayContentRef.current = displayContent;
  
  useEffect(() => {
    setLettersInCycle([]);
  }, [availableLetters, setLettersInCycle]);

  const showNextContent = useCallback((force = false) => {
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
      const possibleWords = WORDS.filter((word) => {
        const wordLetters = word.split("");
        return wordLetters.every((letter) => availableLetters.includes(letter));
      });

      if (possibleWords.length === 0) {
        setDisplayContent({
          key: "no-words-msg",
          type: "message",
          value: "No words can be formed with these letters.",
        });
        return;
      }
      setCardCount((prev) => prev + 1);
      const newWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
      const firstLetter = newWord[0];
      const letterData = getLetterInfo(firstLetter);
      setDisplayContent({
        key: Date.now().toString(),
        type: "word",
        value: newWord,
        color: letterData?.color,
        textColor: letterData?.textColor,
      });
      return;
    }

    setCardCount((prev) => prev + 1);
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

    setDisplayContent({
      key: Date.now().toString(),
      type: "letter",
      value: newLetter,
      color: letterData?.color,
      textColor: letterData?.textColor,
      verticalOffset: letterData?.verticalOffset,
    });
  }, [availableLetters, lettersInCycle, setLettersInCycle, gameMode, setDisplayContent]);

  const prevSelectedLettersRef = useRef<string[]>(selectedLetters);

  useEffect(() => {
    if (gameMode === 'words') {
      showNextContent(true); // `true` to force it even if menu is open
      prevSelectedLettersRef.current = selectedLetters;
      return; // End of effect for word mode
    }

    // --- The rest of the logic is for 'letters' mode ---

    // 1. If selectedLetters is empty, always show the message.
    if (selectedLetters.length === 0) {
      setDisplayContent({
        key: "no-letters",
        type: "message",
        value: "Choose some letters in the menu!",
      });
      prevSelectedLettersRef.current = selectedLetters;
      return;
    }

    // 2. A brand new first letter was added (or hydrating from empty). Show it immediately.
    if (prevSelectedLettersRef.current.length === 0 && selectedLetters.length > 0) {
      const newLetter = selectedLetters[0];
      const data = getLetterInfo(newLetter);
      setDisplayContent({
        key: "new-letter-added",
        type: "letter",
        value: newLetter,
        color: data?.color,
        textColor: data?.textColor,
        verticalOffset: data?.verticalOffset,
      });
      prevSelectedLettersRef.current = selectedLetters;
      return;
    }

    // Handle state corrections using a functional update to avoid race conditions.
    setDisplayContent(prev => {
      // 3. Hydration fix: Display is a message, but we have letters now.
      if (prev.type === 'message') {
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

      // 4. Deselection fix: Displayed letter is no longer in the set.
      if (prev.type === 'letter' && !selectedLetters.includes(prev.value)) {
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

      // 5. All other cases: The display is a letter that's still valid. Do nothing.
      return prev;
    });

    prevSelectedLettersRef.current = selectedLetters;
  }, [selectedLetters, setDisplayContent, gameMode, showNextContent]);
  
  const prevGameModeRef = useRef(gameMode);
  useEffect(() => {
    if(prevGameModeRef.current !== gameMode) {
      showNextContent(true);
      prevGameModeRef.current = gameMode;
    }
  }, [gameMode, showNextContent]);

  const handleInteraction = () => {
    showNextContent();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code === "Space" ||
        event.code === "ArrowDown" ||
        event.code === "ArrowRight"
      ) {
        event.preventDefault();
        handleInteraction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNextContent]);

  if (!hydrated) {
    return null;
  }

  return (
    <main
      className="flex h-svh w-screen cursor-pointer items-center justify-center bg-background overflow-hidden relative focus:outline-none"
      onPointerDown={handleInteraction}
      tabIndex={-1}
    >
      <LetterDisplay content={displayContent} />
      <div className="absolute top-4 right-4 flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
        <FullscreenToggle />
        <LetterSelector
          selectedLetters={selectedLetters}
          setSelectedLetters={setSelectedLetters}
          onOpenChange={setIsMenuOpen}
          gameMode={gameMode}
          onGameModeChange={setGameMode}
        />
        <AppSettings
          showCardCount={showCardCount}
          onShowCardCountChange={setShowCardCount}
          showTimer={showTimer}
          onShowTimerChange={setShowTimer}
        />
      </div>
      {(showCardCount || showTimer) && (
        <SessionStats
          cardCount={cardCount}
          timeElapsed={timeElapsed}
          showCardCount={showCardCount}
          showTimer={showTimer}
        />
      )}
    </main>
  );
}
