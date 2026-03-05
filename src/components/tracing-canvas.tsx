"use client";

import { useEffect, useRef, useState } from "react";

export function TracingCanvas({ contentKey }: { contentKey: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Clear canvas whenever the contentKey changes (new letter/word)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [contentKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle resizing to match parent container visually
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Set actual bitmap layout resolution to CSS layout sizes
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      // e.clientX is viewport relative. We map to the element's actual layout bounds.
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation(); // Explicitly consume event so main page Swipe doesn't trigger
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 14;       // Perfect thickness for tracing letters
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // Opaque white so it layers nicely
    setIsDrawing(true);
    // Draw a single dot incase they just tap without moving
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation(); 
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    // Note: We don't call preventDefault on PointerEvent directly usually, touch-action: none handles it.
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      onPointerOut={stopDrawing}
      className="absolute inset-0 z-20 touch-none cursor-crosshair rounded-3xl"
    />
  );
}
