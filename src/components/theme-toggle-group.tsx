"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ThemeToggleGroup({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full p-1 bg-muted",
        className
      )}
    >
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        className="rounded-full w-full"
        onClick={() => setTheme("light")}
      >
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        className="rounded-full w-full"
        onClick={() => setTheme("dark")}
      >
        Dark
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        className="rounded-full w-full"
        onClick={() => setTheme("system")}
      >
        System
      </Button>
    </div>
  );
}
