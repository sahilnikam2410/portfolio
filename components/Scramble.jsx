'use client';

import { useEffect, useRef, useState } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#01ABCDEF';

/**
 * Decrypt-in text. Resolves left to right while unresolved slots keep
 * cycling through junk characters — one rAF loop, no per-char timers.
 */
export function useScramble(text, { active = true, speed = 0.55 } = {}) {
  const [output, setOutput] = useState(active ? '' : text);
  const frame = useRef(0);

  useEffect(() => {
    if (!active) {
      setOutput(text);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOutput(text);
      return;
    }

    const queue = Array.from(text).map((char, i) => ({
      char,
      start: Math.floor(i * 1.6 + Math.random() * 8),
      end: Math.floor(i * 1.6 + 12 + Math.random() * 18),
    }));

    let raf = 0;
    frame.current = 0;

    const tick = () => {
      let done = 0;
      let out = '';
      for (const q of queue) {
        if (frame.current >= q.end) {
          done++;
          out += q.char;
        } else if (frame.current >= q.start) {
          out += CHARS[(Math.random() * CHARS.length) | 0];
        } else {
          out += q.char === ' ' ? ' ' : '';
        }
      }
      setOutput(out);
      if (done === queue.length) return;
      frame.current += speed * 1.8;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, speed]);

  return output;
}

/** Scrambles once when it scrolls into view. */
export default function Scramble({ text, as: Tag = 'span', className = '', once = true }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const output = useScramble(text, { active });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          if (once) obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{active ? output : text}</span>
    </Tag>
  );
}
