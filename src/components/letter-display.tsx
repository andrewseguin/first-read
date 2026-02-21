
"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Volume2, Mic, Play, Trash2, StopCircle } from "lucide-react"; // Import necessary icons
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
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { audioStorage } from "@/lib/audio-storage";

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
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const stopPlayback = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
    setHighlightedIndex(null);
  };

  useEffect(() => {
    // Abort playback when content changes or component unmounts
    stopPlayback();
    loadLocalRecording();
    return () => {
      stopPlayback();
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    };
  }, [content.key]);

  const loadLocalRecording = async () => {
    const blob = await audioStorage.getRecording(content.value);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setLocalAudioUrl(url);
    } else {
      setLocalAudioUrl(null);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      await audioStorage.saveRecording(content.value, blob);
      const url = URL.createObjectURL(blob);
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
      setLocalAudioUrl(url);
    } else {
      stopPlayback();
      await startRecording();
    }
  };

  const handleDeleteRecording = async () => {
    await audioStorage.deleteRecording(content.value);
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    setLocalAudioUrl(null);
  };

  const playLocalRecording = () => {
    if (localAudioUrl) {
      stopPlayback();
      const audio = new Audio(localAudioUrl);
      setIsPlaying(true);
      currentAudioRef.current = audio;
      audio.onended = () => {
        setIsPlaying(false);
        currentAudioRef.current = null;
      };
      audio.play().catch(e => {
        console.error("Error playing local recording:", e);
        setIsPlaying(false);
      });
    }
  };

  function speakLetter(event: React.MouseEvent) {
    event.stopPropagation();
    if (isPlaying) {
      stopPlayback();
      return;
    }

    // Try playing local recording first
    if (localAudioUrl) {
      playLocalRecording();
      return;
    }

    if (audioCache) {
      const audio = audioCache[content.value.toLowerCase()];
      if (audio) {
        setIsPlaying(true);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsPlaying(false);
          currentAudioRef.current = null;
        };
        audio.play().catch(e => {
          console.error("Error playing audio:", e)
          setIsPlaying(false);
          currentAudioRef.current = null;
        });
      }
    }
  }

  function speakWord(event: React.MouseEvent) {
    event.stopPropagation();
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    if (localAudioUrl) {
      playLocalRecording();
      return;
    }

    if (content.isHardWord) return;

    if (!audioCache) return;

    const segments = splitIntoPhonicsSegments(content.value);
    let currentIndex = 0;
    setIsPlaying(true);

    const playNextSegment = () => {
      if (signal.aborted) return;

      if (currentIndex < segments.length) {
        setHighlightedIndex(currentIndex);
        const segment = segments[currentIndex];
        const soundKey = getSoundKeyForSegment(segment);
        const audio = audioCache[soundKey];

        if (audio) {
          currentAudioRef.current = audio;
          audio.onended = () => {
            if (signal.aborted) return;
            currentIndex++;
            playNextSegment();
          };
          audio.currentTime = 0;
          audio.play().catch(e => {
            console.error("Error playing audio:", e);
            if (signal.aborted) return;
            currentIndex++;
            playNextSegment();
          });
        } else {
          // No audio file found, skip
          if (signal.aborted) return;
          currentIndex++;
          playNextSegment();
        }
      } else {
        setHighlightedIndex(null);
        setIsPlaying(false);
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    };


    playNextSegment();
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
        <div className="absolute bottom-4 left-4 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "transition-all duration-300",
              isRecording ? "text-red-500 scale-110 animate-pulse bg-red-500/10" : "text-white/50 hover:text-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleRecording();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title={isRecording ? "Stop Recording" : "Record your own voice"}
          >
            {isRecording ? <StopCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {localAudioUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white/30 hover:text-red-400 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRecording();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              title="Delete recording"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        {content.type === "letter" && (
          <Button
            variant="ghost"
            size="icon-lg"
            className={cn(
              "absolute bottom-4 right-4 transition-all duration-300 hover:bg-white/10",
              isPlaying ? "scale-110 opacity-100" : "text-white/70 hover:text-white"
            )}
            onClick={(e) => speakLetter(e)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ color: 'white' }}
          >
            <Volume2
              className="h-12 w-12"
              style={{
                filter: isPlaying ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))' : 'none'
              }}
            />
          </Button>
        )}
        {content.type === "word" && (content.isHardWord ? localAudioUrl : true) && (
          <Button
            variant="ghost"
            size="icon-lg"
            className={cn(
              "absolute bottom-4 right-4 transition-all duration-300 hover:bg-white/10",
              isPlaying ? "scale-110 opacity-100" : "text-white/70 hover:text-white"
            )}
            onClick={(e) => speakWord(e)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ color: 'white' }}
          >
            <Volume2
              className="h-12 w-12"
              style={{
                filter: isPlaying ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))' : 'none'
              }}
            />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

