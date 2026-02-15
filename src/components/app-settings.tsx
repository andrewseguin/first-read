"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ThemeToggleGroup } from "./theme-toggle-group";

type AppSettingsProps = {
  showCardCount: boolean;
  onShowCardCountChange: (show: boolean) => void;
  showTimer: boolean;
  onShowTimerChange: (show: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppSettings({
  showCardCount,
  onShowCardCountChange,
  showTimer,
  onShowTimerChange,
  open,
  onOpenChange,
}: AppSettingsProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground/50 hover:text-foreground active:scale-95 transition-transform"
          aria-label="App settings"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[90vw] sm:w-[300px]" align="end" onPointerDown={(e) => e.stopPropagation()}>
        <div className="grid gap-8">
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Theme
            </h4>
            <ThemeToggleGroup />
          </div>
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Display
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="card-count-toggle" className="text-base">
                Show Card Count
              </Label>
              <Switch
                id="card-count-toggle"
                checked={showCardCount}
                onCheckedChange={onShowCardCountChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="timer-toggle" className="text-base">
                Show Timer
              </Label>
              <Switch
                id="timer-toggle"
                checked={showTimer}
                onCheckedChange={onShowTimerChange}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
