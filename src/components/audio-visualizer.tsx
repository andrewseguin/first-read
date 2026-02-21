"use client";

import React, { useEffect, useRef, useState } from "react";

interface AudioVisualizerProps {
    stream: MediaStream | null;
}

export function AudioVisualizer({ stream }: AudioVisualizerProps) {
    const barRef = useRef<HTMLDivElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (!stream) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.1; // Much more responsive

        analyserRef.current = analyser;
        audioContextRef.current = audioContext;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
            if (!analyserRef.current || !barRef.current) return;

            analyserRef.current.getByteTimeDomainData(dataArray);

            // Calculate RMS (Root Mean Square) for volume
            let sumSquares = 0;
            for (let i = 0; i < bufferLength; i++) {
                const amplitude = (dataArray[i] - 128) / 128;
                sumSquares += amplitude * amplitude;
            }
            const rms = Math.sqrt(sumSquares / bufferLength);

            // Normalize and boost for visualization
            const level = Math.min(1, rms * 5);

            // Direct DOM update for zero-lag performance
            barRef.current.style.width = `${Math.max(2, level * 100)}%`;
            barRef.current.style.opacity = `${0.6 + (level * 0.4)}`;
            barRef.current.style.boxShadow = `0 0 ${10 + (level * 25)}px rgba(255, 255, 255, ${0.3 + (level * 0.7)})`;

            animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        // Ensure AudioContext is running
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

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
        <div className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden rounded-b-xl bg-white/5 pointer-events-none">
            <div
                ref={barRef}
                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                style={{
                    width: '2%',
                    opacity: 0.7,
                    margin: '0 auto',
                    borderRadius: '999px'
                }}
            />
        </div>
    );
}
