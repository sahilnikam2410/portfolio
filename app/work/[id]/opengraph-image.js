import { ImageResponse } from 'next/og';
import { projects, identity } from '@/data/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export const alt = 'Case study';

export default async function Image({ params }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

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

        <div style={{ display: 'flex', gap: 14, fontSize: 22, color: '#6b8479' }}>
          <span style={{ color: '#35ff9e' }}>case study</span>
          <span>/</span>
          <span>{project?.kind ?? 'engagement'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            {project?.title ?? 'Engagement'}
          </div>
          <div style={{ fontSize: 24, color: '#6b8479', maxWidth: 900, lineHeight: 1.45 }}>
            {(project?.summary ?? '').slice(0, 180)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {(project?.stack ?? []).slice(0, 4).map((s) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  border: '1px solid rgba(53,255,158,0.3)',
                  padding: '6px 14px',
                  color: '#35ff9e',
                }}
              >
                {s}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', color: '#35e0ff' }}>{identity.name}</div>
        </div>
      </div>
    ),
    size
  );
}
