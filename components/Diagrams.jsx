'use client';

/**
 * Drawn diagrams, not screenshots.
 *
 * Nothing here claims to be a capture of a running system — these describe
 * how the work is structured, which is honest, needs no redaction, and stays
 * readable at any width. Real screenshots belong in `artifacts`.
 */

const BOX = 'fill-[rgba(4,7,10,0.92)] stroke-[rgba(53,255,158,0.35)]';
const LABEL = 'fill-[#d6efe3] text-[11px] font-mono';
const SUB = 'fill-[#6b8479] text-[9px] font-mono';

function Arrow({ id = 'dgm-arrow', color = '#35ff9e' }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  );
}

function Frame({ title, children, viewBox, minWidth = 620 }) {
  return (
    <figure className="overflow-x-auto border border-[rgba(53,255,158,0.14)] bg-[rgba(8,13,18,0.55)] p-4">
      <figcaption className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">
        {title}
      </figcaption>
      <svg
        viewBox={viewBox}
        className="h-auto w-full"
        style={{ minWidth }}
        role="img"
        aria-label={title}
      >
        <defs>
          <Arrow />
          <Arrow id="dgm-arrow-cyan" color="#35e0ff" />
          <Arrow id="dgm-arrow-amber" color="#ffd166" />
        </defs>
        {children}
      </svg>
    </figure>
  );
}

/* ── detection pipeline ──────────────────────────────────────── */

export function DetectionPipeline() {
  const stages = [
    ['endpoint', 'windows · linux'],
    ['agent', 'sysmon · syslog'],
    ['manager', 'decoders'],
    ['rule', 'match · level'],
    ['alert', 'triage queue'],
    ['response', 'contain · report'],
  ];

  return (
    <Frame title="detection pipeline — what a single event passes through" viewBox="0 0 900 150">
      {stages.map(([name, sub], i) => {
        const x = 20 + i * 148;
        return (
          <g key={name}>
            <rect x={x} y={40} width={122} height={54} className={BOX} strokeWidth="1" />
            <text x={x + 12} y={64} className={LABEL}>
              {name}
            </text>
            <text x={x + 12} y={80} className={SUB}>
              {sub}
            </text>
            {i < stages.length - 1 && (
              <line
                x1={x + 122}
                y1={67}
                x2={x + 146}
                y2={67}
                stroke="#35ff9e"
                strokeOpacity="0.5"
                markerEnd="url(#dgm-arrow)"
              />
            )}
          </g>
        );
      })}
      <text x="20" y="122" className={SUB}>
        a gap at any stage means the alert never arrives — which stage failed is the whole question
      </text>
    </Frame>
  );
}

/* ── purple-team loop ────────────────────────────────────────── */

export function AttackLoop() {
  const nodes = [
    ['simulate', 'technique in lab', 200, 40],
    ['observe', 'what telemetry appeared', 520, 40],
    ['assess', 'did a rule fire', 520, 190],
    ['write', 'rule, then re-test', 200, 190],
  ];

  return (
    <Frame title="the loop — simulate, observe, assess, close" viewBox="0 0 780 280">
      {nodes.map(([name, sub, x, y]) => (
        <g key={name}>
          <rect x={x} y={y} width={190} height={56} className={BOX} strokeWidth="1" />
          <text x={x + 14} y={y + 24} className={LABEL}>
            {name}
          </text>
          <text x={x + 14} y={y + 41} className={SUB}>
            {sub}
          </text>
        </g>
      ))}

      <line x1="390" y1="68" x2="512" y2="68" stroke="#35ff9e" strokeOpacity="0.5" markerEnd="url(#dgm-arrow)" />
      <line x1="615" y1="96" x2="615" y2="182" stroke="#35e0ff" strokeOpacity="0.5" markerEnd="url(#dgm-arrow-cyan)" />
      <line x1="512" y1="218" x2="398" y2="218" stroke="#ffd166" strokeOpacity="0.5" markerEnd="url(#dgm-arrow-amber)" />
      <path
        d="M 295 190 C 295 140, 295 120, 295 96"
        fill="none"
        stroke="#35ff9e"
        strokeOpacity="0.5"
        markerEnd="url(#dgm-arrow)"
      />

      <text x="330" y="150" className={SUB}>
        gap → new rule → run it again
      </text>
    </Frame>
  );
}

/* ── alert lifecycle ─────────────────────────────────────────── */

export function AlertLifecycle() {
  const steps = [
    ['00:00', 'rule matches, alert raised', '#ffd166'],
    ['00:01', 'triage — real or noise', '#d6efe3'],
    ['00:02', 'scope — which hosts, how far', '#d6efe3'],
    ['00:03', 'contain — active response or manual', '#35ff9e'],
    ['00:04', 'record — what fired, what was tuned', '#6b8479'],
  ];

  return (
    <Frame title="alert lifecycle — from match to written up" viewBox="0 0 700 210" minWidth={520}>
      <line x1="70" y1="24" x2="70" y2="186" stroke="rgba(53,255,158,0.25)" />
      {steps.map(([t, text, color], i) => {
        const y = 36 + i * 34;
        return (
          <g key={t}>
            <circle cx="70" cy={y} r="4" fill={color} />
            <text x="20" y={y + 4} className={SUB}>
              {t}
            </text>
            <text x="94" y={y + 4} style={{ fill: color }} className="text-[11px] font-mono">
              {text}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}

/**
 * Single entry point. A server component cannot index a map of components
 * exported from a client module — Next replaces those exports with client
 * references, so the lookup yields nothing and the block renders empty.
 * Selecting by name inside the client boundary avoids that entirely.
 */
export default function Diagram({ name }) {
  if (name === 'pipeline') return <DetectionPipeline />;
  if (name === 'loop') return <AttackLoop />;
  if (name === 'lifecycle') return <AlertLifecycle />;
  return null;
}
