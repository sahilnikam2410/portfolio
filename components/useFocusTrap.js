'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Keeps Tab inside an open overlay and restores focus to whatever opened it.
 *
 * Without this, tabbing through a modal walks straight out into the page
 * behind it — the content is visually covered but still focusable, so a
 * keyboard user ends up somewhere they cannot see.
 *
 * Returns a ref to put on the overlay container.
 */
export function useFocusTrap(active) {
  const ref = useRef(null);
  const restoreTo = useRef(null);

  useEffect(() => {
    if (!active) return;

    const container = ref.current;
    if (!container) return;

    restoreTo.current = document.activeElement;

    const nodes = () =>
      [...container.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // move focus in, so the first Tab starts inside rather than at the top
    const first = nodes()[0];
    first?.focus();

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const items = nodes();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      } else if (!container.contains(document.activeElement)) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);

    // the page behind is inert while the overlay is up
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = previousOverflow;
      const target = restoreTo.current;
      if (target && typeof target.focus === 'function') target.focus();
    };
  }, [active]);

  return ref;
}
