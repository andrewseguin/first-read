"use client";

import { useEffect, useState } from 'react';

type AudioUnlockerProps = {
    audioContext: AudioContext | null;
    onUnlocked?: () => void;
};

/**
 * AudioUnlocker is a silent component that "unlocks" the audio session on iOS/iPadOS.
 * It listens for the first user interaction (pointerdown or touchstart) and plays
 * a short silent sound using a standard HTMLAudioElement. This is more reliable 
 * than just resuming an AudioContext for setting the app's audio session category.
 */
export function AudioUnlocker({ audioContext, onUnlocked }: AudioUnlockerProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        if (isUnlocked) return;

        const unlock = async () => {
            if (isUnlocked) return;

            // 1. Play a tiny silent sound via HTML5 Audio
            // This is a 0.1s silent WAV file
            const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== ";
            const audio = new Audio(silentWav);

            try {
                await audio.play();
                console.log("Audio session unlocked via HTML5 Audio");
            } catch (e) {
                console.warn("Failed to play silent unlocker sound:", e);
            }

            // 2. Resume the AudioContext
            if (audioContext && audioContext.state === 'suspended') {
                try {
                    await audioContext.resume();
                    console.log("AudioContext resumed");
                } catch (e) {
                    console.warn("Failed to resume AudioContext during unlock:", e);
                }
            }

            setIsUnlocked(true);
            onUnlocked?.();

            // Clean up listeners
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('touchstart', unlock);
        };

        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });

        return () => {
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
    }, [audioContext, isUnlocked, onUnlocked]);

    return null; // This component doesn't render anything visible
}
