'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { identity, socials, projects, resumes } from '@/data/content';
import { useSceneStore } from './sceneStore';
import { useFocusTrap } from './useFocusTrap';

/** Tiny subsequence matcher — "wk" matches "work". */
function score(needle, haystack) {
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (!n) return 1;
  if (h.includes(n)) return 100 - h.indexOf(n);
  let i = 0;
  for (const ch of h) {
    if (ch === n[i]) i++;
    if (i === n.length) return 50;
  }
  return 0;
}

export default function CommandPalette() {
  const open = useSceneStore((s) => s.paletteOpen);
  const setOpen = useSceneStore((s) => s.setPaletteOpen);
  const toggle = useSceneStore((s) => s.togglePalette);

  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const trapRef = useFocusTrap(open);

  const items = useMemo(() => {
    const go = (id) => () => {
      const el = document.querySelector(id);
      if (!el) return;
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
      else el.scrollIntoView({ behavior: 'smooth' });
    };
    const link = (href) => () => window.open(href, '_blank', 'noopener');

    return [
      { group: 'navigate', label: 'Home', hint: 'top', run: go('#top') },
      { group: 'navigate', label: 'About', hint: 'whoami', run: go('#about') },
      { group: 'navigate', label: 'Toolchain', hint: 'skills', run: go('#skills') },
      { group: 'navigate', label: 'Engagements', hint: 'work', run: go('#work') },
      { group: 'navigate', label: 'Detection coverage', hint: 'attack → detection', run: go('#coverage') },
      { group: 'navigate', label: 'Shell', hint: 'interactive terminal', run: go('#shell') },
      { group: 'navigate', label: 'Contact', hint: 'reach me', run: go('#contact') },
      ...projects.map((p) => ({
        group: 'engagements',
        label: p.title,
        hint: p.kind,
        run: () => {
          const el = document.querySelector('#work');
          if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: -80 });
          else el?.scrollIntoView({ behavior: 'smooth' });
          window.dispatchEvent(new CustomEvent('select-project', { detail: p.id }));
        },
      })),
      ...socials.map((s) => ({
        group: 'links',
        label: s.label,
        hint: s.handle,
        run: link(s.href),
      })),
      ...resumes.map((r) => ({
        group: 'resume',
        label: r.role,
        hint: r.note,
        run: link(r.file),
      })),
      {
        group: 'actions',
        label: 'Copy email',
        hint: identity.email,
        run: () => navigator.clipboard?.writeText(identity.email),
      },
      {
        group: 'actions',
        label: 'Switch palette',
        hint: 'terminal · spider',
        run: () => {
          const { theme, setTheme } = useSceneStore.getState();
          setTheme(theme === 'spider' ? 'hacker' : 'spider');
        },
      },
      {
        group: 'actions',
        label: 'Back to top',
        hint: 'scroll',
        run: () =>
          window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
    ];
  }, []);

  const results = useMemo(() => {
    return items
      .map((it) => ({ it, s: Math.max(score(query, it.label), score(query, it.hint ?? '') * 0.6) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9)
      .map((r) => r.it);
  }, [items, query]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      results[index]?.run();
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 z-[80] flex items-start justify-center bg-[rgba(2,4,6,0.72)] px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-lg border border-[rgb(var(--acid-rgb)/0.25)] bg-[rgba(8,13,18,0.96)] shadow-[0_0_60px_rgb(var(--acid-rgb)/0.1)]"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[rgb(var(--acid-rgb)/0.14)] px-4 py-3">
              <span className="text-[var(--color-acid)]">&gt;</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="jump to section, project, or link…"
                spellCheck={false}
                aria-label="command palette"
                className="w-full bg-transparent text-sm text-[var(--color-bone)] outline-none placeholder:text-[rgb(var(--dim-rgb)/0.6)]"
              />
              <kbd className="border border-[rgb(var(--acid-rgb)/0.2)] px-1.5 py-0.5 text-[10px] text-[var(--color-dim)]">
                esc
              </kbd>
            </div>

            <ul className="max-h-[52vh] overflow-y-auto py-1">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center text-[13px] text-[var(--color-dim)]">
                  no matches
                </li>
              )}
              {results.map((r, i) => (
                <li key={`${r.group}-${r.label}`}>
                  <button
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => {
                      r.run();
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-[13px] transition-colors ${
                      i === index
                        ? 'bg-[rgb(var(--acid-rgb)/0.1)] text-[var(--color-acid)]'
                        : 'text-[var(--color-bone)]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-dim)]">
                        {r.group}
                      </span>
                      {r.label}
                    </span>
                    <span className="truncate text-[11px] text-[var(--color-dim)]">{r.hint}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 border-t border-[rgb(var(--acid-rgb)/0.14)] px-4 py-2 text-[10px] text-[var(--color-dim)]">
              <span>↑↓ move</span>
              <span>⏎ select</span>
              <span className="ml-auto">ctrl + k</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
