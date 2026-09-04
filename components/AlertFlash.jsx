'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSceneStore } from './sceneStore';

/**
 * The set-piece. Reaching the detection-coverage table trips a simulated
 * incident: the globe destabilises and goes red, shockwaves fire, and this
 * banner runs the triage line an analyst would actually see.
 */
export default function AlertFlash() {
  const alert = useSceneStore((s) => s.alert);

  return (
    <AnimatePresence>
      {alert && [
          /* A Fragment cannot be tracked by AnimatePresence — it has no key to
             match on, so the children animate out and then stay mounted. These
             are siblings with keys instead. */
          <motion.div
            key="wash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.35, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, times: [0, 0.1, 0.3, 0.5, 1] }}
            data-print="hide"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[62] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(255,95,87,0.22)_100%)]"
          />,

          /* bottom-right: never covers the heading or the table it describes */

          <motion.div
            key="banner"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            data-print="hide"
            role="status"
            className="fixed bottom-6 right-6 z-[66] w-[min(92vw,420px)] border border-[rgba(255,95,87,0.5)] bg-[rgba(10,4,5,0.94)] shadow-[0_0_50px_rgba(255,95,87,0.18)]"
          >
            <div className="flex items-center gap-3 border-b border-[rgba(255,95,87,0.3)] px-4 py-2 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff5f57]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff5f57]" />
              </span>
              <span className="text-[#ff5f57]">INCIDENT — simulated</span>
              <span className="ml-auto text-[var(--color-dim)]">severity 10</span>
            </div>

            <ul className="space-y-1 px-4 py-3 text-[12px] leading-relaxed">
              {[
                ['00:00', 'technique executed against lab endpoint', 'var(--color-dim)'],
                ['00:01', 'telemetry ingested — sysmon, auth, network', 'var(--color-dim)'],
                ['00:02', 'rule matched · alert raised', '#ffd166'],
                ['00:03', 'active response fired — source contained', '#35ff9e'],
              ].map(([t, text, color], i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.5 }}
                  className="flex gap-3"
                >
                  <span className="text-[var(--color-dim)]">{t}</span>
                  <span style={{ color }}>{text}</span>
                </motion.li>
              ))}
            </ul>

            <div className="border-t border-[rgba(255,95,87,0.2)] px-4 py-2 text-[10px] text-[var(--color-dim)]">
              this is a demonstration of the loop below — attack, telemetry, rule, response
            </div>
          </motion.div>
        ]}
    </AnimatePresence>
  );
}
