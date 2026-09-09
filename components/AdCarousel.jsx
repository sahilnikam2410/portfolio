'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * A slide strip, without a carousel library.
 *
 * Scroll-snap does the work the JavaScript would otherwise do: the strip is
 * a real overflow container, so a trackpad, a touch swipe and a scrollbar all
 * behave the way the platform already made them behave, and the whole thing
 * still functions with scripting off. What is left for JavaScript is telling
 * the reader where they are, which is the one part the browser will not do.
 *
 * The dots are buttons rather than decoration, the strip takes focus and
 * answers arrow keys, and position is read from an observer rather than a
 * scroll handler so it stays correct when the platform does the scrolling.
 *
 * Images go through next/image because the originals are five 1080px PNGs at
 * roughly 120KB each. Served as-is that is 610KB below the fold for an
 * illustration; resized and re-encoded it is a fraction of that, and the
 * intrinsic size is declared so nothing reflows when they land.
 */
export default function AdCarousel({ slides, label }) {
  const strip = useRef(null);
  const [at, setAt] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // which slide is showing, from the element itself rather than scroll maths
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const kids = [...el.querySelectorAll('[data-slide]')];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setAt(Number(e.target.dataset.slide));
        });
      },
      { root: el, threshold: 0.6 }
    );
    kids.forEach((k) => io.observe(k));
    return () => io.disconnect();
  }, [slides.length]);

  const go = useCallback(
    (i) => {
      const el = strip.current;
      if (!el) return;
      const target = el.querySelector(`[data-slide="${i}"]`);
      if (!target) return;
      el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    },
    [reduce]
  );

  const onKey = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(Math.min(slides.length - 1, at + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(Math.max(0, at - 1));
    }
  };

  return (
    <div>
      <div
        ref={strip}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        onKeyDown={onKey}
        className="flex snap-x snap-mandatory overflow-x-auto outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-acid)]"
        style={{ scrollbarWidth: 'none' }}
      >
        {slides.map((s, i) => (
          <div key={s.src} data-slide={i} className="w-full shrink-0 snap-start">
            <Image
              src={s.src}
              alt={s.alt}
              width={1080}
              height={1080}
              sizes="(max-width: 640px) 100vw, 420px"
              priority={i === 0}
              className="h-auto w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-[rgb(var(--acid-rgb)/0.14)] px-4 py-2.5">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1} of ${slides.length}`}
            aria-current={i === at}
            className={`tap h-1.5 rounded-full transition-all ${
              i === at
                ? 'w-5 bg-[var(--color-acid)]'
                : 'w-1.5 bg-[rgb(var(--acid-rgb)/0.3)] hover:bg-[rgb(var(--acid-rgb)/0.6)]'
            }`}
          />
        ))}
        <span className="ml-auto t-num text-[11px] text-[var(--color-dim)]">
          {at + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
}
