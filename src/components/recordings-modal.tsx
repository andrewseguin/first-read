"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Trash2, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { audioStorage } from "@/lib/audio-storage";

interface RecordingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RecordingsModal({ open, onOpenChange }: RecordingsModalProps) {
    const [recordings, setRecordings] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecordings = async () => {
        setLoading(true);
        try {
            const keys = await audioStorage.getAllRecordings();
            setRecordings(keys.sort());
        } catch (error) {
            console.error("Failed to fetch recordings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchRecordings();
        }
    }, [open]);

    const handleDelete = async (key: string) => {
        try {
            await audioStorage.deleteRecording(key);
            setRecordings((prev) => prev.filter((k) => k !== key));
        } catch (error) {
            console.error("Failed to delete recording:", error);
        }
    };

    const handleClearAll = async () => {
        if (confirm("Are you sure you want to delete all recordings? This cannot be undone.")) {
            try {
                await audioStorage.clearAllRecordings();
                setRecordings([]);
            } catch (error) {
                console.error("Failed to clear all recordings:", error);
            }
        }
    };

    const handlePlay = async (key: string) => {
        try {
            const blob = await audioStorage.getRecording(key);
            if (blob) {
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.onended = () => URL.revokeObjectURL(url);
                audio.play();
            }
        } catch (error) {
            console.error("Failed to play recording:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-full h-[100dvh] sm:h-[600px] sm:max-h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-none sm:border sm:rounded-2xl bg-background/95 backdrop-blur-md shadow-2xl [&>button]:hidden fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                <DialogHeader className="p-6 pb-4 border-b border-border bg-background/50 flex flex-row items-center justify-start gap-4 shrink-0">
                    <DialogTitle className="text-xl sm:text-2xl font-headline">
                        Manage Recordings
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0 overflow-y-auto px-4 py-2 scroll-smooth overscroll-contain [touch-action:pan-y]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-foreground/30 animate-pulse">
                                <MicOff className="w-12 h-12 mb-4" />
                                <p>Loading your recordings...</p>
                            </div>
                        ) : recordings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-foreground/30">
                                <MicOff className="w-12 h-12 mb-4" />
                                <p className="text-lg">No custom recordings yet.</p>
                                <p className="text-sm">Record sounds on the cards to see them here.</p>
                            </div>
                        ) : (
                            <div className="grid gap-2 p-2">
                                {recordings.map((key) => (
                                    <div
                                        key={key}
                                        className="group flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/50 transition-all duration-300"
                                    >
                                        <span className="text-xl font-medium flex-1 truncate pr-4 text-foreground">
                                            {key}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handlePlay(key)}
                                                className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                                title="Play"
                                            >
                                                <Play className="h-5 w-5 fill-current" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(key)}
                                                className="h-10 w-10 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-background/50 flex items-center justify-between shrink-0">
                    <div>
                        {recordings.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-10 px-4 rounded-xl text-sm font-medium"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border-border hover:bg-accent h-10 px-6 sm:inline-flex"
                    >
                        {recordings.length === 0 ? "Close" : "Done"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
