import React, { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

const WaveCanvas = () => {
  const noise = createNoise3D();
  let w, h, nt = 0, i, x, ctx, canvas;
  const canvasRef = useRef(null);

  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    
    const init = () => {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = 'blur(10px)';
    };

    window.addEventListener('resize', init);
    init();
///changes new
    const drawWave = () => {
      ctx.fillStyle = 'black';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, w, h);

      const waveColors = [
        "#38bdf8",  // Light blue
        "#818cf8",  // Indigo
        "#c084fc",  // Purple
        "#e879f9",  // Pink
        "#22d3ee"   // Cyan
      ];

      // Draw 5 waves with different colors
      for (i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.lineWidth = 50;  // Default wave width
        ctx.strokeStyle = waveColors[i % waveColors.length];
        
        for (x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          if (x === 0) {
            ctx.moveTo(x, y + h * 0.5);
          } else {
            ctx.lineTo(x, y + h * 0.5);
          }
        }
        
        ctx.stroke();
        ctx.closePath();
      }

      nt += 0.002;  // Fast speed
      requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default WaveCanvas;
