
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AudioUnlocker } from './AudioUnlocker';

type AudioContextType = {
  audioContext: AudioContext | null;
  buffers: Record<string, AudioBuffer>;
  isReady: boolean;
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
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!globalAudioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        globalAudioContext = new AudioContextClass();
        console.log("AudioContext created, initial state:", globalAudioContext.state);
      }
    }
    const ctx = globalAudioContext;
    if (!ctx) return;

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const newBuffers: Record<string, AudioBuffer> = {};

    const loadAudio = async () => {
      const basePath = process.env.NODE_ENV === 'production' ? '/first-read' : '';

      await Promise.all(
        alphabet.map(async (letter) => {
          try {
            // Updated to load .m4a files which are better for iOS
            const response = await fetch(`${basePath}/sounds/optimized/alphasounds-${letter}.m4a`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            newBuffers[letter] = audioBuffer;
          } catch (e) {
            console.warn(`Failed to load audio buffer for ${letter}:`, e);
          }
        })
      );

      setBuffers(newBuffers);
      setIsInitialized(true);
    };

    loadAudio();
  }, []);

  const value = useMemo(() => ({
    audioContext: globalAudioContext,
    buffers,
    isReady: isInitialized && isUnlocked
  }), [buffers, isInitialized, isUnlocked]);

  return (
    <Context.Provider value={value}>
      <AudioUnlocker
        audioContext={globalAudioContext}
        onUnlocked={() => {
          setIsUnlocked(true);
          console.log("Audio Provider: Audio session is now unlocked");
        }}
      />
      {children}
    </Context.Provider>
  );
}
