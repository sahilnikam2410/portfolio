'use client';

import { useEffect, useRef } from 'react';

/** Subtle katakana/hex rain, drawn on a 2D canvas behind the content. */
export default function MatrixRain({ opacity = 0.16 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const glyphs = 'アイウエオカキクケコサシスセソ0123456789ABCDEF$#@%&*<>/\\|'.split('');
    const fontSize = 14;

    let columns = 0;
    let drops = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(window.innerWidth / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };

    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 55) return; // ~18fps is plenty for rain
      last = now;

      ctx.fillStyle = 'rgba(4, 7, 10, 0.09)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = `${fontSize}px ui-monospace, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = glyphs[(Math.random() * glyphs.length) | 0];
        const y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.985 ? '#d6efe3' : '#35ff9e';
        ctx.fillText(char, i * fontSize, y);
        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5]"
      style={{ opacity }}
    />
  );
}
