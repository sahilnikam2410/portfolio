'use client';

const words = [
  'WAZUH', 'SPLUNK', 'SYSMON', 'MITRE ATT&CK', 'ALERT TRIAGE',
  'INCIDENT RESPONSE', 'THREAT HUNTING', 'WAPT', 'OWASP TOP 10',
  'NMAP', 'WIRESHARK', 'DETECTION ENGINEERING',
];

export default function Marquee() {
  const row = [...words, ...words];
  return (
    <div data-print="hide" className="relative overflow-hidden border-y border-[rgba(53,255,158,0.14)] bg-[rgba(8,13,18,0.6)] py-3">
      <div className="marquee flex w-max gap-8 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8 text-[11px] tracking-[0.3em] text-[var(--color-dim)]">
            {w}
            <span className="text-[var(--color-acid)]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
