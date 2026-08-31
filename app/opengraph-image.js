import { ImageResponse } from 'next/og';
import { identity } from '@/data/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${identity.name} — ${identity.role}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#04070a',
          color: '#d6efe3',
          fontFamily: 'monospace',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* grid wash */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage:
              'linear-gradient(rgba(53,255,158,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(53,255,158,0.07) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 24 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 99,
              background: '#35ff9e',
            }}
          />
          <div style={{ color: '#35ff9e' }}>sahil@lab</div>
          <div style={{ color: '#6b8479' }}>:~$ ./whoami</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>{identity.name}</div>
          <div style={{ fontSize: 32, color: '#35e0ff' }}>{identity.role}</div>
          <div style={{ fontSize: 24, color: '#6b8479', maxWidth: 880, lineHeight: 1.45 }}>
            {identity.tagline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            fontSize: 20,
            color: '#6b8479',
          }}
        >
          {['Wazuh', 'Splunk', 'MITRE ATT&CK', 'WAPT', 'Nmap'].map((t) => (
            <div
              key={t}
              style={{
                display: 'flex',
                border: '1px solid rgba(53,255,158,0.3)',
                padding: '6px 14px',
                color: '#35ff9e',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
