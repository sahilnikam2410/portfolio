import Link from 'next/link';

export const metadata = {
  title: '404 — route not found',
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-25" />

      <div className="relative w-full max-w-lg border border-[rgb(var(--acid-rgb)/0.2)] bg-[rgba(8,13,18,0.85)]">
        <div className="flex items-center gap-2 border-b border-[rgb(var(--acid-rgb)/0.14)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-acid)]" />
          <span className="ml-2 text-[11px] text-[var(--color-dim)]">sahil@lab: ~ — bash</span>
        </div>

        <div className="px-5 py-6 text-[13px] leading-relaxed">
          <div className="text-[var(--color-bone)]">
            <span className="text-[var(--color-acid)]">sahil@lab</span>
            <span className="text-[var(--color-dim)]">:~$ </span>
            cat $REQUESTED_PATH
          </div>
          <div className="mt-1 text-[#ff6b6b]">cat: no such file or directory</div>

          <div className="mt-5 text-[var(--color-bone)]">
            <span className="text-[var(--color-acid)]">sahil@lab</span>
            <span className="text-[var(--color-dim)]">:~$ </span>
            echo $?
          </div>
          <div className="mt-1 text-[var(--color-dim)]">404</div>

          <div className="mt-8 text-[var(--color-dim)]">
            Nothing is served from that path. Everything lives on one page.
          </div>

          <Link
            href="/"
            className="mt-6 inline-block border border-[rgb(var(--acid-rgb)/0.35)] px-4 py-2 text-[var(--color-acid)] transition-colors hover:bg-[rgb(var(--acid-rgb)/0.1)]"
          >
            cd ~
          </Link>
        </div>
      </div>
    </main>
  );
}
