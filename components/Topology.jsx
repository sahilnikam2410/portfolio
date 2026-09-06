'use client';

import { Reveal } from './ui';

const HOSTS = [
  { x: 40, y: 96, label: 'Kali Linux', role: 'attacker' },
  { x: 40, y: 176, label: 'Windows 10', role: 'agent · Sysmon' },
  { x: 40, y: 256, label: 'Ubuntu', role: 'agent' },
];

/**
 * Lab topology. Drawn rather than screenshotted so it stays readable in both
 * themes and at any width, and so nothing real leaks into it.
 */
export default function Topology() {
  return (
    <Reveal delay={0.1}>
      <figure className="overflow-x-auto border border-[rgb(var(--acid-rgb)/0.14)] bg-[rgba(8,13,18,0.55)] p-4">
        <figcaption className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">
          lab topology — host-only, no route out
        </figcaption>

        <svg
          viewBox="0 0 620 360"
          className="h-auto w-full min-w-[520px]"
          role="img"
          aria-label="Isolated lab: Kali, Windows and Ubuntu virtual machines forward logs to a Wazuh manager inside a host-only network, with no route to the internet or any production system."
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#35ff9e" />
            </marker>
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#35e0ff" />
            </marker>
          </defs>

          {/* host machine boundary */}
          <rect
            x="16"
            y="52"
            width="500"
            height="284"
            rx="4"
            fill="none"
            stroke="rgb(var(--acid-rgb)/0.25)"
            strokeDasharray="4 4"
          />
          <text x="26" y="44" fill="#6b8479" fontSize="11" fontFamily="monospace">
            physical host · VirtualBox · host-only adapter
          </text>

          {/* endpoints */}
          {HOSTS.map((h) => (
            <g key={h.label}>
              <rect
                x={h.x}
                y={h.y}
                width="150"
                height="52"
                fill="rgba(4,7,10,0.9)"
                stroke="rgb(var(--acid-rgb)/0.35)"
              />
              <text
                x={h.x + 12}
                y={h.y + 22}
                fill="#d6efe3"
                fontSize="12"
                fontFamily="monospace"
              >
                {h.label}
              </text>
              <text
                x={h.x + 12}
                y={h.y + 39}
                fill="#6b8479"
                fontSize="10"
                fontFamily="monospace"
              >
                {h.role}
              </text>

              {/* log forwarding */}
              <line
                x1={h.x + 150}
                y1={h.y + 26}
                x2="336"
                y2="200"
                stroke="#35ff9e"
                strokeOpacity="0.4"
                strokeWidth="1.2"
                markerEnd="url(#arrow)"
              />
            </g>
          ))}

          {/* SIEM */}
          <rect
            x="340"
            y="150"
            width="150"
            height="100"
            fill="rgba(4,7,10,0.95)"
            stroke="#35ff9e"
          />
          <text x="356" y="178" fill="#35ff9e" fontSize="13" fontFamily="monospace">
            Wazuh
          </text>
          <text x="356" y="198" fill="#6b8479" fontSize="10" fontFamily="monospace">
            manager + indexer
          </text>
          <text x="356" y="216" fill="#6b8479" fontSize="10" fontFamily="monospace">
            rules · correlation
          </text>
          <text x="356" y="234" fill="#6b8479" fontSize="10" fontFamily="monospace">
            active response
          </text>

          {/* attack path */}
          <path
            d="M 118 96 C 118 72, 250 72, 250 148"
            fill="none"
            stroke="#35e0ff"
            strokeOpacity="0.55"
            strokeWidth="1.2"
            strokeDasharray="5 4"
            markerEnd="url(#arrow-cyan)"
          />
          <text x="150" y="76" fill="#35e0ff" fontSize="10" fontFamily="monospace">
            simulated attack
          </text>

          {/* the world, explicitly unreachable */}
          <rect
            x="530"
            y="168"
            width="74"
            height="64"
            fill="none"
            stroke="rgba(255,107,107,0.4)"
            strokeDasharray="3 3"
          />
          <text x="540" y="196" fill="#ff6b6b" fontSize="10" fontFamily="monospace">
            internet
          </text>
          <text x="540" y="212" fill="#ff6b6b" fontSize="10" fontFamily="monospace">
            production
          </text>

          <line
            x1="492"
            y1="200"
            x2="528"
            y2="200"
            stroke="#ff6b6b"
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          <line x1="503" y1="190" x2="517" y2="210" stroke="#ff6b6b" strokeWidth="1.6" />
          <line x1="517" y1="190" x2="503" y2="210" stroke="#ff6b6b" strokeWidth="1.6" />
          <text x="486" y="230" fill="#ff6b6b" fontSize="9" fontFamily="monospace">
            no route
          </text>
        </svg>
      </figure>
    </Reveal>
  );
}
