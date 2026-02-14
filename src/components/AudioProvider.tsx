
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AudioContext = createContext<Record<string, HTMLAudioElement> | null>(null);

export function useAudio() {
  return useContext(AudioContext);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audioCache, setAudioCache] = useState<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const newAudioCache: Record<string, HTMLAudioElement> = {};
    alphabet.forEach(letter => {
      const basePath = process.env.NODE_ENV === 'production' ? '/first-read' : '';
      const audio = new Audio(`${basePath}/sounds/optimized/alphasounds-${letter}.mp3`);
      audio.preload = 'auto';
      newAudioCache[letter] = audio;
    });

    setAudioCache(newAudioCache);
  }, []);

  const value = useMemo(() => audioCache, [audioCache]);

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}
