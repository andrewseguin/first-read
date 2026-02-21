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
            <DialogContent className="max-w-2xl w-full h-full sm:h-auto sm:max-h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-none sm:border sm:rounded-2xl bg-background/95 backdrop-blur-md shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-white/5 relative bg-background/50">
                    <DialogTitle className="text-2xl font-headline flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-white/70">
                            <Play className="w-5 h-5" />
                        </div>
                        Manage Recordings
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="absolute left-6 top-6 sm:hidden text-foreground/50 hover:text-foreground"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </DialogHeader>

                <ScrollArea className="flex-1 px-4 py-2">
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
                                    className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300"
                                >
                                    <span className="text-xl font-medium capitalize flex-1 truncate pr-4">
                                        {key}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handlePlay(key)}
                                            className="h-10 w-10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                            title="Play"
                                        >
                                            <Play className="h-5 w-5 fill-current" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(key)}
                                            className="h-10 w-10 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t border-white/5 bg-background/50 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="hidden sm:inline-flex rounded-xl border-white/10 hover:bg-white/5"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
