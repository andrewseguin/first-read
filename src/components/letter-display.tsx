
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
import { splitIntoPhonicsSegments, getSoundKeyForSegment } from "@/lib/phonics";

type DisplayContent = {
  key: string;
  type: "letter" | "message" | "word";
  value: string;
  color?: string;
  textColor?: string;
  verticalOffset?: number;
  isHardWord?: boolean; // New property to indicate if the word is hard
  isMediumWord?: boolean; // New property for words with special sounds
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
      // For easy and medium words, sound it out
      if (!audioCache) return;

      const segments = splitIntoPhonicsSegments(content.value);
      let currentIndex = 0;
      setIsPlaying(true);

      const playNextSegment = () => {
        if (currentIndex < segments.length) {
          setHighlightedIndex(currentIndex);
          const segment = segments[currentIndex];
          const soundKey = getSoundKeyForSegment(segment);
          const audio = audioCache[soundKey];

          if (audio) {
            audio.onended = () => {
              currentIndex++;
              playNextSegment();
            };
            audio.currentTime = 0;
            audio.play().catch(e => {
              console.error("Error playing audio, falling back to speech synthesis:", e);
              speakSegmentWithFallback(segment, () => {
                currentIndex++;
                playNextSegment();
              });
            });
          } else {
            // No audio file found, fallback to speech synthesis
            speakSegmentWithFallback(segment, () => {
              currentIndex++;
              playNextSegment();
            });
          }
        } else {
          setHighlightedIndex(null);
          setIsPlaying(false);
        }
      };

      const speakSegmentWithFallback = (text: string, onEnd: () => void) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.7; // Slightly slower for clarity
          utterance.pitch = 1.2;
          utterance.onend = onEnd;
          utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            onEnd();
          };
          window.speechSynthesis.speak(utterance);
        } else {
          onEnd();
        }
      };

      playNextSegment();
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
      {content.type === "word" && (content.isHardWord || content.isMediumWord) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "absolute top-4 right-4",
                content.isHardWord ? "text-foreground/50" : "text-yellow-500/50"
              )}>
                <Star className="h-6 w-6" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{content.isHardWord ? "Hard Word" : "Medium Word"}</p>
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
            transform: `translateY(${content.verticalOffset || 0}em)`,
            transition: 'transform 0.2s ease-out'
          }}>
            {splitIntoPhonicsSegments(content.value).map((segment, index) => (
              <span key={index} className={cn(
                "inline-block transition-all duration-300 ease-in-out",
                highlightedIndex !== null && highlightedIndex !== index && "opacity-60",
                highlightedIndex === index && "scale-110 brightness-110 [text-shadow:0_0_10px_rgba(255,255,255,0.4)]",
                highlightedIndex === null && "opacity-100 scale-100 transition-opacity duration-300"
              )}>
                {segment}
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
              transform: `translateY(${content.verticalOffset || 0}em)`,
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

