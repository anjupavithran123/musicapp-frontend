import { useEffect, useRef } from "react";
import { useAudio } from "../context/AudioContext";

export default function Waveform() {
  const { analyser, isPlaying } = useAudio();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const centerY = HEIGHT / 2;

    analyser.fftSize = 1024;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    // 🎨 Gradient (blue → purple → pink)
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
    gradient.addColorStop(0, "#3b82f6");
    gradient.addColorStop(0.5, "#a855f7");
    gradient.addColorStop(1, "#ec4899");

    const barWidth = 2;
    const gap = 1;
    const bars = Math.floor(WIDTH / (barWidth + gap));

    const draw = () => {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = gradient;

      for (let i = 0; i < bars; i++) {
        const dataIndex = Math.floor((i / bars) * bufferLength);
        const v = (dataArray[dataIndex] - 128) / 128;

        const barHeight = Math.abs(v) * 80 + 2;

        const x = i * (barWidth + gap);

        // 🔼 top
        ctx.fillRect(
          x,
          centerY - barHeight,
          barWidth,
          barHeight
        );

        // 🔽 bottom
        ctx.fillRect(
          x,
          centerY,
          barWidth,
          barHeight
        );
      }
    };

    draw();
  }, [analyser, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={470}
      height={120}
      className="rounded-md"
    />
  );
}
