'use client';

import { useEffect, useState } from 'react';
import { identity } from '@/data/content';
import { useSceneStore } from './sceneStore';
import { SpiderGlyph } from './spiderGlyph';

const links = [
  { id: 'about', label: 'about' },
  { id: 'skills', label: 'skills' },
  { id: 'work', label: 'work' },
  { id: 'coverage', label: 'coverage' },
  { id: 'shell', label: 'shell' },
  { id: 'contact', label: 'contact' },
];

export default function Nav() {
  const [active, setActive] = useState('about');
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const togglePalette = useSceneStore((s) => s.togglePalette);
  const theme = useSceneStore((s) => s.theme);
  const switching = useSceneStore((s) => s.switching);
  const setSwitching = useSceneStore((s) => s.setSwitching);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'border-b border-[rgb(var(--acid-rgb)/0.14)] bg-[rgba(4,7,10,0.82)] backdrop-blur-md' : ''
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className="group flex items-center gap-2 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-acid)] shadow-[0_0_10px_var(--color-acid)]" />
          <span className="text-[var(--color-bone)]">{identity.handle}</span>
          <span className="text-[var(--color-dim)] transition-colors group-hover:text-[var(--color-acid)]">
            :~$
          </span>
        </a>

        <ul className="hidden items-center gap-1 text-xs sm:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={`px-3 py-2 transition-colors ${
                  active === l.id
                    ? 'text-[var(--color-acid)]'
                    : 'text-[var(--color-dim)] hover:text-[var(--color-bone)]'
                }`}
              >
                <span className="text-[var(--color-dim)]">/</span>
                {l.label}
              </a>
            </li>
          ))}
          {/* The palette switch. It lives in the nav rather than floating,
              because it is a site-wide control and belongs with the others —
              and until now the palette could only be reached with a key, so
              nobody on a touch screen could reach it at all. */}
          <li>
            <button
              onClick={() => setSwitching(true)}
              disabled={switching}
              aria-label={
                theme === 'spider' ? 'Switch to terminal palette' : 'Switch to spider palette'
              }
              title={theme === 'spider' ? 'terminal palette' : 'spider palette'}
              data-cursor="palette"
              className="ml-2 flex items-center border border-[rgb(var(--acid-rgb)/0.2)] px-2.5 py-2 text-[var(--color-dim)] transition-colors hover:border-[var(--color-acid)] hover:text-[var(--color-acid)] disabled:opacity-40"
            >
              <SpiderGlyph size={16} />
            </button>
          </li>

          <li>
            <button
              onClick={togglePalette}
              data-cursor="⌘k"
              className="ml-2 whitespace-nowrap border border-[rgb(var(--acid-rgb)/0.2)] px-3 py-2 text-[var(--color-dim)] transition-colors hover:border-[var(--color-acid)] hover:text-[var(--color-acid)]"
            >
              ctrl k
            </button>
          </li>
          <li>
            <a
              href={identity.resumeUrl}
              className="ml-1 whitespace-nowrap border border-[rgb(var(--acid-rgb)/0.35)] px-3 py-2 text-[var(--color-acid)] transition-colors hover:bg-[rgb(var(--acid-rgb)/0.1)]"
            >
              resume.pdf
            </a>
          </li>
        </ul>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="border border-[rgb(var(--acid-rgb)/0.25)] px-3 py-1.5 text-xs text-[var(--color-acid)] sm:hidden"
        >
          {open ? 'esc' : 'menu'}
        </button>
      </nav>

      {open && (
        <ul className="border-t border-[rgb(var(--acid-rgb)/0.14)] bg-[rgba(4,7,10,0.96)] px-5 pb-4 text-sm sm:hidden">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-[var(--color-dim)]"
              >
                <span className="text-[var(--color-acid)]">&gt;</span> {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={identity.resumeUrl} className="block py-2.5 text-[var(--color-acid)]">
              &gt; resume.pdf
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
