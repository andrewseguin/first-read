
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AudioContextType = {
  audioContext: AudioContext | null;
  buffers: Record<string, AudioBuffer>;
};

const Context = createContext<AudioContextType | null>(null);

export function useAudio() {
  return useContext(Context);
}

// Create a singleton instance outside to avoid recreation on rerenders
let globalAudioContext: AudioContext | null = null;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [buffers, setBuffers] = useState<Record<string, AudioBuffer>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!globalAudioContext) {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = globalAudioContext;

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const newBuffers: Record<string, AudioBuffer> = {};

    const loadAudio = async () => {
      const basePath = process.env.NODE_ENV === 'production' ? '/first-read' : '';

      await Promise.all(
        alphabet.map(async (letter) => {
          try {
            const response = await fetch(`${basePath}/sounds/optimized/alphasounds-${letter}.mp3`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            newBuffers[letter] = audioBuffer;
          } catch (e) {
            console.error(`Failed to load audio for ${letter}:`, e);
          }
        })
      );

      setBuffers(newBuffers);
      setIsInitialized(true);
    };

    loadAudio();

    // Ensure AudioContext is resumed on first user interaction (critical for iOS)
    const resumeAudio = () => {
      if (globalAudioContext && globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
      }
    };

    window.addEventListener('pointerdown', resumeAudio, { once: true });
    window.addEventListener('touchstart', resumeAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  const value = useMemo(() => ({
    audioContext: globalAudioContext,
    buffers
  }), [buffers, isInitialized]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
