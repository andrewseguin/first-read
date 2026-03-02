
"use client";

import { useEffect, useState } from 'react';

type AudioUnlockerProps = {
    audioContext: AudioContext | null;
    onUnlocked?: () => void;
};

export function AudioUnlocker({ audioContext, onUnlocked }: AudioUnlockerProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        if (isUnlocked) return;

        const unlock = async (e: Event) => {
            if (isUnlocked) return;

            // 1. Play a tiny silent sound via HTML5 Audio
            const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== ";
            const audio = new Audio(silentWav);

            try {
                await audio.play();
            } catch (err) {
                console.warn("AudioUnlocker: HTML5 Audio play failed", err);
            }

            // 2. Resume the AudioContext
            if (audioContext) {
                try {
                    await audioContext.resume();

                    // 3. Play a tiny sound through the AudioContext itself
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    gain.gain.value = 0.001; // nearly silent
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.start(0);
                    osc.stop(0.001);
                } catch (err) {
                    console.warn("AudioUnlocker: Context resume failed", err);
                }
            }

            setIsUnlocked(true);
            onUnlocked?.();

            // Clean up all listeners
            ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(type => {
                window.removeEventListener(type, unlock, { capture: true });
            });
        };

        // Use more triggers and CAPTURE phase to bypass stopPropagation
        ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(type => {
            window.addEventListener(type, unlock, { once: true, capture: true });
        });

        return () => {
            ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(type => {
                window.removeEventListener(type, unlock, { capture: true });
            });
        };
    }, [audioContext, isUnlocked, onUnlocked]);

    return null;
}
