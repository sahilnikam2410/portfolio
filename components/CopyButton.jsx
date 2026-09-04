'use client';

import { useState } from 'react';

/** Copies a value and says so. Recruiters copy contact details by hand today. */
export default function CopyButton({ value, label = 'copy', className = '' }) {
  const [state, setState] = useState('idle'); // idle | done | failed

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('done');
    } catch {
      // clipboard blocked (insecure origin, permissions) — say so, do not lie
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1800);
  };

  return (
    <button
      onClick={copy}
      data-cursor="copy"
      aria-label={`Copy ${value}`}
      className={`border px-2 py-0.5 text-[11px] transition-colors ${
        state === 'done'
          ? 'border-[var(--color-acid)] text-[var(--color-acid)]'
          : state === 'failed'
          ? 'border-[#ff6b6b] text-[#ff6b6b]'
          : 'border-[rgba(53,255,158,0.25)] text-[var(--color-dim)] hover:border-[var(--color-acid)] hover:text-[var(--color-acid)]'
      } ${className}`}
    >
      {state === 'done' ? 'copied' : state === 'failed' ? 'select it' : label}
    </button>
  );
}
