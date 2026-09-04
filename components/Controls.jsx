'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSceneStore } from './sceneStore';
import { useFocusTrap } from './useFocusTrap';

const SECTIONS = ['top', 'about', 'skills', 'work', 'coverage', 'shell', 'contact'];

const SHORTCUTS = [
  { keys: ['ctrl', 'k'], what: 'command palette' },
  { keys: ['j'], what: 'next section' },
  { keys: ['k'], what: 'previous section' },
  { keys: ['g'], what: 'top of page' },
  { keys: ['G'], what: 'bottom of page' },
  { keys: ['/'], what: 'focus the shell' },
  { keys: ['q'], what: 'cycle scene quality — full · lite · off' },
  { keys: ['r'], what: 'recruiter brief — one screen, no scrolling' },
  { keys: ['p'], what: 'print / save as PDF' },
  { keys: ['?'], what: 'this panel' },
  { keys: ['esc'], what: 'close' },
];

const QUALITY_ORDER = ['auto', 'lite', 'off'];

/** Keyboard-first navigation, a shortcut sheet, and a scene-quality override. */
export default function Controls() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const quality = useSceneStore((s) => s.quality);
  const setQuality = useSceneStore((s) => s.setQuality);
  const trapRef = useFocusTrap(open);

  // restore a saved quality choice on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('scene-quality');
      if (saved && QUALITY_ORDER.includes(saved) && saved !== 'auto') setQuality(saved);
    } catch {
      // storage unavailable — stay on auto
    }
  }, [setQuality]);

  const scrollTo = useCallback((el) => {
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const step = useCallback(
    (dir) => {
      const positions = SECTIONS.map((id) => {
        const el = document.getElementById(id);
        return { id, el, top: el ? el.getBoundingClientRect().top : Infinity };
      }).filter((p) => p.el);

      // current = last section whose top is above the fold line
      let index = 0;
      positions.forEach((p, i) => {
        if (p.top <= 120) index = i;
      });

      const next = Math.min(positions.length - 1, Math.max(0, index + dir));
      scrollTo(positions[next].el);
    },
    [scrollTo]
  );

  const flash = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast(null), 1600);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case '?':
          e.preventDefault();
          setOpen((v) => !v);
          break;
        case 'j':
          e.preventDefault();
          step(1);
          break;
        case 'k':
          e.preventDefault();
          step(-1);
          break;
        case 'g':
          e.preventDefault();
          scrollTo(document.getElementById('top'));
          break;
        case 'G':
          e.preventDefault();
          scrollTo(document.getElementById('contact'));
          break;
        case '/': {
          e.preventDefault();
          const shell = document.getElementById('shell');
          scrollTo(shell);
          setTimeout(() => shell?.querySelector('input')?.focus(), 600);
          break;
        }
        case 'p':
          e.preventDefault();
          window.print();
          break;
        case 'q': {
          e.preventDefault();
          const next =
            QUALITY_ORDER[(QUALITY_ORDER.indexOf(quality) + 1) % QUALITY_ORDER.length];
          setQuality(next);
          flash(`scene: ${next === 'auto' ? 'full (auto)' : next}`);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, scrollTo, quality, setQuality, flash]);

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            data-print="hide"
            className="fixed bottom-16 left-1/2 z-[76] -translate-x-1/2 border border-[rgba(53,255,158,0.3)] bg-[rgba(8,13,18,0.95)] px-4 py-2 text-[12px] text-[var(--color-acid)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="shortcuts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            data-print="hide"
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="fixed inset-0 z-[82] flex items-center justify-center bg-[rgba(2,4,6,0.72)] px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md border border-[rgba(53,255,158,0.25)] bg-[rgba(8,13,18,0.97)]"
            >
              <div className="flex items-center justify-between border-b border-[rgba(53,255,158,0.14)] px-4 py-3 text-[12px]">
                <span className="text-[var(--color-acid)]">keyboard</span>
                <span className="text-[var(--color-dim)]">
                  scene: {quality === 'auto' ? 'auto' : quality}
                </span>
              </div>

              <ul className="px-4 py-3">
                {SHORTCUTS.map((s) => (
                  <li
                    key={s.what}
                    className="flex items-center justify-between gap-4 py-1.5 text-[13px]"
                  >
                    <span className="text-[var(--color-dim)]">{s.what}</span>
                    <span className="flex gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="min-w-[22px] border border-[rgba(53,255,158,0.25)] px-1.5 py-0.5 text-center text-[11px] text-[var(--color-bone)]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
