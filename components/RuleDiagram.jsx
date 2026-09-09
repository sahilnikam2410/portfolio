'use client';

/**
 * A detection, drawn from its own parameters.
 *
 * Deliberately not an image, and deliberately not a picture of an alert. It
 * says how a rule is built — source, base event, correlation, what it raises
 * — and claims nothing about whether it ever fired. A capture makes that
 * second claim, and nothing drawn is allowed to stand in for one.
 *
 * Hand-authored SVG rather than a rendered picture: it re-tints with the
 * palette, scales to any width, weighs about a kilobyte, and can be corrected
 * when a threshold changes, none of which a PNG does.
 *
 * Stacked rather than laid out left to right, because the narrow screens are
 * the ones with no room to spare and a horizontal chain of five boxes is what
 * forces a scroller.
 */

const W = 300;
const ROW = 42;
const GAP = 14;
const PAD = 6;

export default function RuleDiagram({ logic }) {
  if (!logic) return null;

  const stages = [
    { k: 'source', label: 'source', value: logic.source },
    { k: 'base', label: 'base event', value: logic.base },
    { k: 'correlate', label: 'correlates', value: logic.correlate },
    { k: 'fires', label: 'raises', value: logic.fires },
    { k: 'attack', label: 'att&ck', value: logic.attack },
  ].filter((s) => s.value);

  const H = stages.length * ROW + (stages.length - 1) * GAP + PAD * 2;

  const spoken = stages.map((s) => `${s.label}: ${s.value}`).join('. ');

  return (
    <figure className="mt-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-[320px]"
        role="img"
        aria-label={`How this detection is built. ${spoken}. This describes the rule, not a record of it firing.`}
      >
        {stages.map((s, i) => {
          const y = PAD + i * (ROW + GAP);
          const last = i === stages.length - 1;
          return (
            <g key={s.k}>
              <rect
                x="0.5" y={y + 0.5} width={W - 1} height={ROW}
                fill="rgba(8,13,18,0.7)"
                stroke={last ? 'rgb(var(--acid-rgb)/0.45)' : 'rgb(var(--acid-rgb)/0.2)'}
                strokeWidth="1"
              />
              <text
                x="10" y={y + 15}
                fontSize="7"
                letterSpacing="1.4"
                fill="var(--color-dim)"
                fontFamily="var(--font-mono)"
              >
                {s.label.toUpperCase()}
              </text>
              <text
                x="10" y={y + 30}
                fontSize="10"
                fill={last ? 'var(--color-acid)' : 'var(--color-bone)'}
                fontFamily="var(--font-mono)"
              >
                {s.value}
              </text>

              {!last && (
                <g stroke="rgb(var(--acid-rgb)/0.35)" strokeWidth="1">
                  <line x1={W / 2} y1={y + ROW} x2={W / 2} y2={y + ROW + GAP} />
                  <path
                    d={`M ${W / 2 - 3} ${y + ROW + GAP - 4} L ${W / 2} ${y + ROW + GAP} L ${W / 2 + 3} ${y + ROW + GAP - 4}`}
                    fill="none"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-dim)]">
        How the rule is built — not a record of it firing.
      </figcaption>
    </figure>
  );
}
