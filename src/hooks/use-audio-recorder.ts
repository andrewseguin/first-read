
import { useState, useRef, useCallback } from "react";


export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(mediaStream);
            const mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e: BlobEvent) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw err;
        }
    }, []);

    const stopRecording = useCallback((): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!mediaRecorderRef.current) {
                reject(new Error("No recorder active"));
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                setIsRecording(false);
                setStream(null);
                // Stop all tracks to release the microphone
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
                resolve(audioBlob);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    return {
        isRecording,
        stream,
        startRecording,
        stopRecording,
    };
}
