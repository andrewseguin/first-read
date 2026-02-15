
"use client";

import { useState } from "react";
import { Star, Speaker, Volume2 } from "lucide-react"; // Import the Star and new Speaker icons
import { Button } from "@/components/ui/button"; // Import Button component
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import tooltip components

type DisplayContent = {
  key: string;
  type: "letter" | "message" | "word";
  value: string;
  color?: string;
  textColor?: string;
  verticalOffset?: number;
  isHardWord?: boolean; // New property to indicate if the word is hard
};

type LetterDisplayProps = {
  content: DisplayContent;
};

import { useAudio } from "@/components/AudioProvider";

export function LetterDisplay({ content }: LetterDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCache = useAudio();

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  function speakLetter(event: React.MouseEvent) {
    event.stopPropagation();
    if (audioCache && !isPlaying) {
      const audio = audioCache[content.value.toLowerCase()];
      if (audio) {
        setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
        };
        audio.play().catch(e => {
          console.error("Error playing audio:", e)
          setIsPlaying(false);
        });
      }
    } else if (isPlaying) {
      // Optional: logic to stop the sound if it's already playing
    }
  }

  function speakWord(event: React.MouseEvent) {
    event.stopPropagation();
    if (isPlaying) return;

    if (content.isHardWord) {
      // For hard words, just say the word
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(content.value);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // For easy words, sound it out
      if (!audioCache) return;

      const letters = content.value.split('');
      let currentIndex = 0;
      setIsPlaying(true);

      const playNextLetter = () => {
        if (currentIndex < letters.length) {
          setHighlightedIndex(currentIndex);
          const letter = letters[currentIndex];
          const audio = audioCache[letter];
          if (audio) {
            audio.onended = () => {
              currentIndex++;
              playNextLetter();
            };
            audio.currentTime = 0;
            audio.play().catch(e => {
              console.error("Error playing audio:", e);
              setIsPlaying(false);
              setHighlightedIndex(null);
            });
          } else {
            currentIndex++;
            playNextLetter();
          }
        } else {
          setHighlightedIndex(null);
          setIsPlaying(false);
        }
      };

      playNextLetter();
    }
  }

  if (content.type === "message") {
    return (
      <div
        key={content.key}
        className="max-w-xl font-body text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground/70 px-8 text-center select-none animate-in fade-in duration-500"
      >
        {content.value}
      </div>
    );
  }

  const isWord = content.type === "word";

  return (
    <Card
      key={content.key}
      className="relative animate-fade-in-zoom w-[90vw] h-[45vw] max-w-[700px] max-h-[350px] border-none" // Responsive card size
      style={{
        backgroundColor: content.color,
        boxShadow: "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
        borderTop: "1px solid rgba(255,255,255,0.2)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {content.type === "word" && content.isHardWord && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-4 right-4 text-foreground/50">
                <Star className="h-6 w-6" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hard Word</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <CardContent className="p-0 h-full flex items-center justify-center">
        {isWord ? (
          <div className={cn(
            "font-headline font-normal leading-none",
            "select-none [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]",
            "text-6xl sm:text-8xl md:text-[10rem]"
          )} style={{
            color: content.textColor || 'white',
            transform: `translateY(${content.verticalOffset || 0}rem)`,
            transition: 'transform 0.2s ease-out'
          }}>
            {content.value.split('').map((letter, index) => (
              <span key={index} className={cn(
                highlightedIndex === index && "opacity-50",
                highlightedIndex === null && "opacity-100 transition-opacity duration-500"
              )}>
                {letter}
              </span>
            ))}
          </div>
        ) : (
          <span
            className={cn(
              "font-headline font-normal leading-none",
              "select-none [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]",
              "text-9xl sm:text-[14rem] md:text-[17.5rem]"
            )}
            style={{
              color: content.textColor || 'white',
              transform: `translateY(${content.verticalOffset || 0}rem)`,
              transition: 'transform 0.2s ease-out'
            }}
          >
            {content.value}
          </span>
        )}
        {content.type === "letter" && (
          <Button
            variant="ghost"
            size="icon-lg"
            className="absolute bottom-4 right-4 text-foreground/70 hover:text-foreground"
            onClick={(e) => speakLetter(e)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isPlaying ? <Volume2 className="h-12 w-12" /> : <Speaker className="h-12 w-12" />}
          </Button>
        )}
        {content.type === "word" && (
          <Button
            variant="ghost"
            size="icon-lg"
            className="absolute bottom-4 right-4 text-foreground/70 hover:text-foreground"
            onClick={(e) => speakWord(e)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isPlaying ? <Volume2 className="h-12 w-12" /> : <Speaker className="h-12 w-12" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

