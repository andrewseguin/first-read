"use client";

import { Clock, Eye } from "lucide-react";

type SessionStatsProps = {
  cardCount: number;
  timeElapsed: number; // in seconds
  showCardCount: boolean;
  showTimer: boolean;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export function SessionStats({
  cardCount,
  timeElapsed,
  showCardCount,
  showTimer,
}: SessionStatsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-foreground/50">
      {showCardCount && (
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <span>{cardCount}</span>
        </div>
      )}
      {showTimer && (
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>{formatTime(timeElapsed)}</span>
        </div>
      )}
    </div>
  );
}
