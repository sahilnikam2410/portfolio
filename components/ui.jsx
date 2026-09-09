'use client';

import { useEffect, useRef, useState } from 'react';
import Scramble from './Scramble';

/**
 * An editorial spread rather than a stack.
 *
 * Every section used to be the same shape: heading across the top, rule under
 * it, content below, all centred in one box. Repeat that seven times and the
 * page reads as a template no matter what is written in it — the eye gets no
 * landmarks, because nothing is ever anywhere different.
 *
 * The heading now sits in its own narrow column and stays put while the
 * content scrolls past it. That is worth more than the look: on a long section
 * the reader can always see which part of the argument they are inside. The
 * rule that used to run under the heading becomes the vertical hairline
 * between the two columns, so it divides rather than separates.
 *
 * `wide` opts out, for content that genuinely needs the full measure — a
 * technique matrix, a terminal — rather than being squeezed to two thirds.
 */
export function Section({ id, index, title, subtitle, children, wide = false }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:py-32 lg:py-44">
      {wide ? (
        <>
          <SectionHeading index={index} title={title} subtitle={subtitle} wide />
          {children}
        </>
      ) : (
        <div className="grid gap-x-16 gap-y-10 sm:gap-y-14 lg:grid-cols-12">
          {/* self-start, or the cell stretches to the row and sticky has no
              room left to travel in */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading index={index} title={title} subtitle={subtitle} />
          </div>
          <div className="min-w-0 lg:col-span-8 lg:border-l lg:border-[var(--edge)] lg:pl-16">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}

export function SectionHeading({ index, title, subtitle, wide = false }) {
  return (
    <Reveal>
      <div
        className={
          wide ? 'mb-12 sm:mb-16 border-b border-[var(--edge)] pb-8' : 'mb-2'
        }
      >
        {/* The wide heading sets its numeral beside the title, which is the
            point of it at desktop width. On a phone that pushed the title 60px
            in — numeral plus gap — while every other section title on the page
            sat at the 20px margin, so this one heading broke the left edge the
            whole page reads down. Below sm it stacks like the others. */}
        <div className={wide ? 'sm:flex sm:items-start sm:gap-5' : ''}>
          <span
            aria-hidden="true"
            className={`index-numeral block select-none ${wide ? 'sm:shrink-0' : ''}`}
          >
            {index}
          </span>
          <div className={`min-w-0 mt-3 ${wide ? 'sm:mt-0 sm:pt-1' : ''}`}>
            <Scramble
              as="h2"
              text={title}
              className="t-h2 block font-bold text-[var(--color-bone)]"
            />
            {subtitle && <p className="t-body mt-5 text-[var(--color-prose)]">{subtitle}</p>}
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
 *
 * No longer a motion component either. This module is imported by every
 * section on the page, so framer came with it into the first chunk the
 * browser parses — for an effect that is one class toggle and a transition.
 * The hidden state now lives in CSS behind [data-anim='on'], which also
 * closes the hole where a bundle that never arrived left the page blank.
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
    <div
      ref={ref}
      className={`reveal${shown ? ' is-shown' : ''}`}
      style={delay ? { '--reveal-delay': `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return (
    <div
      className={`relative border border-[var(--edge)] bg-[var(--surface)] backdrop-blur-sm ${className}`}
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
