"use client";

import { Settings, Mic, Lock } from "lucide-react";
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
  enableRecordings: boolean;
  onEnableRecordingsChange: (show: boolean) => void;
  enableTracing: boolean;
  onEnableTracingChange: (enable: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRecordings: () => void;
  enableUppercase: boolean;
  onEnableUppercaseChange: (enable: boolean) => void;
  enableWords: boolean;
  onEnableWordsChange: (enable: boolean) => void;
  onLockApp?: () => void;
};

export function AppSettings({
  showCardCount,
  onShowCardCountChange,
  showTimer,
  onShowTimerChange,
  enableRecordings,
  onEnableRecordingsChange,
  enableTracing,
  onEnableTracingChange,
  open,
  onOpenChange,
  onOpenRecordings,
  enableUppercase,
  onEnableUppercaseChange,
  enableWords,
  onEnableWordsChange,
  onLockApp,
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
      <PopoverContent
        className="w-[90vw] sm:w-[300px]"
        align="center"
        sideOffset={8}
        collisionPadding={16}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="grid gap-8">
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Theme
            </h4>
            <ThemeToggleGroup />
          </div>
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Counters
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

          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Card
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="recordings-toggle" className="text-base">
                Enable Recordings
              </Label>
              <Switch
                id="recordings-toggle"
                checked={enableRecordings}
                onCheckedChange={onEnableRecordingsChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tracing-toggle" className="text-base">
                Enable Tracing
              </Label>
              <Switch
                id="tracing-toggle"
                checked={enableTracing}
                onCheckedChange={onEnableTracingChange}
              />
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-12 rounded-xl border-border hover:bg-muted/50"
                onClick={() => {
                  onOpenChange(false);
                  onOpenRecordings();
                }}
              >
                <div className="p-1.5 rounded-md bg-foreground/5">
                  <Mic className="h-4 w-4 text-foreground" />
                </div>
                Manage Recordings
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Modes
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase-toggle" className="text-base">
                Allow Uppercase
              </Label>
              <Switch
                id="uppercase-toggle"
                checked={enableUppercase}
                onCheckedChange={onEnableUppercaseChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="words-toggle" className="text-base">
                Allow Words Mode
              </Label>
              <Switch
                id="words-toggle"
                checked={enableWords}
                onCheckedChange={onEnableWordsChange}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="destructive"
              className="w-full justify-start gap-2 h-12 rounded-xl"
              onClick={() => {
                onOpenChange(false);
                onLockApp?.();
              }}
            >
              <div className="p-1.5 rounded-md bg-white/20">
                <Lock className="h-4 w-4 text-white" />
              </div>
              Lock Settings
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
