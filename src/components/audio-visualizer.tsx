"use client";

import React, { useEffect, useRef, useState } from "react";

interface AudioVisualizerProps {
    stream: MediaStream | null;
}

export function AudioVisualizer({ stream }: AudioVisualizerProps) {
    const [level, setLevel] = useState(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (!stream) {
            setLevel(0);
            return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 256;

        analyserRef.current = analyser;
        audioContextRef.current = audioContext;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            // Calculate average level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Normalize to 0-1 and apply a slight boost/dampening for better visuals
            const normalizedLevel = Math.min(1, (average / 128) * 1.5);
            setLevel(normalizedLevel);

            animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stream]);

    if (!stream) return null;

    return (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl bg-white/10">
            <div
                className="h-full bg-white transition-all duration-75 ease-out shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                style={{
                    width: `${Math.max(5, level * 100)}%`,
                    opacity: 0.5 + (level * 0.5),
                    margin: '0 auto'
                }}
            />
        </div>
    );
}
