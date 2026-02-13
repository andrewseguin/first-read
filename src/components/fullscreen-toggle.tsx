"use client";

import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function FullscreenToggle() {
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-16 text-foreground/50 hover:text-foreground active:scale-95 transition-transform"
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="h-6 w-6" />
      ) : (
        <Maximize className="h-6 w-6" />
      )}
    </Button>
  );
}
