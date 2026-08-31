'use client';

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
      <div className="mb-12 border-b border-[rgba(53,255,158,0.14)] pb-5">
        <div className="flex items-baseline gap-3">
          <span className="text-xs text-[var(--color-acid)]">{index}</span>
          <Scramble
            as="h2"
            text={title}
            className="text-2xl font-semibold tracking-tight text-[var(--color-bone)] sm:text-3xl"
          />
        </div>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-dim)]">{subtitle}</p>
        )}
      </div>
    </Reveal>
  );
}

export function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Panel({ children, className = '' }) {
  return (
    <div
      className={`relative border border-[rgba(53,255,158,0.14)] bg-[rgba(8,13,18,0.72)] backdrop-blur-sm ${className}`}
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
    <span className="border border-[rgba(53,224,255,0.25)] px-2 py-0.5 text-[11px] text-[var(--color-cyan)]">
      {children}
    </span>
  );
}
