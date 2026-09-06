'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Scramble from './Scramble';

export function Section({ id, index, title, subtitle, children }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:py-32">
      <SectionHeading index={index} title={title} subtitle={subtitle} />
      {children}
    </section>
  );
}

export function SectionHeading({ index, title, subtitle }) {
  return (
    <Reveal>
      <div className="mb-12 border-b border-[rgb(var(--acid-rgb)/0.14)] pb-6">
        <div className="flex items-start gap-5">
          <span aria-hidden="true" className="index-numeral shrink-0 select-none">
            {index}
          </span>
          <div className="min-w-0 pt-1">
            <Scramble
              as="h2"
              text={title}
              className="block text-3xl font-bold tracking-tight text-[var(--color-bone)] sm:text-5xl"
            />
            {subtitle && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-dim)] sm:text-[15px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * Scroll-in reveal.
 *
 * Deliberately not framer's `whileInView`: that leaves content stuck at
 * opacity 0 when an element is already on screen at mount — which happens on
 * a deep link to #coverage, a command-palette jump, a browser-restored scroll
 * position, or a hot reload. Content that never appears is worse than content
 * that never animates, so this drives itself and fails open.
 */
export function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // already on screen at mount: show it now, no observer, no animation debt
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Panel({ children, className = '' }) {
  return (
    <div
      className={`relative border border-[rgb(var(--acid-rgb)/0.14)] bg-[rgba(8,13,18,0.72)] backdrop-blur-sm ${className}`}
    >
      <Corner className="-left-px -top-px border-l border-t" />
      <Corner className="-right-px -top-px border-r border-t" />
      <Corner className="-bottom-px -left-px border-b border-l" />
      <Corner className="-bottom-px -right-px border-b border-r" />
      {children}
    </div>
  );
}

function Corner({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-2.5 w-2.5 border-[var(--color-acid)] ${className}`}
    />
  );
}

export function Tag({ children }) {
  return (
    <span className="border border-[rgb(var(--cyan-rgb)/0.25)] px-2 py-0.5 text-[11px] text-[var(--color-cyan)]">
      {children}
    </span>
  );
}
