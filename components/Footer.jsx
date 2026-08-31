import { identity } from '@/data/content';

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(53,255,158,0.14)] px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[11px] text-[var(--color-dim)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {identity.name} — built with Next.js + Three.js
        </span>
        <span>
          <span className="text-[var(--color-acid)]">●</span> all targets owned or authorised
        </span>
      </div>
    </footer>
  );
}
