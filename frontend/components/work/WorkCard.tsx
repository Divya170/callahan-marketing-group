import Link from 'next/link';
import { WORK_LAYOUT_STYLE } from '@/lib/format';
import type { WorkCard as WorkCardData } from '@/lib/types';

/** Work card used on the home page (dark) and the work listing (light). */
export function WorkCard({ w, variant }: { w: WorkCardData; variant: 'dark' | 'light' }) {
  const lay = WORK_LAYOUT_STYLE[w.layout] || WORK_LAYOUT_STYLE.landscape;
  const dark = variant === 'dark';
  const imgLabel = 'project image — ' + w.title.toLowerCase();

  return (
    <Link href={`/work/${w.slug}`} className={`work-card${dark ? ' work-card--dark' : ''}`} style={{ flex: lay.flex }}>
      <span className="work-card__media" style={{ aspectRatio: lay.ratio, background: dark ? undefined : 'var(--mist)' }}>
        <span className={`work-card__bg${dark ? ' hatch-dark' : ''}`} style={dark ? undefined : { backgroundImage: 'var(--hatch)' }} />
        <span aria-hidden="true" className="work-card__accent" style={{ background: w.accent }} />
        <span className="work-card__label" style={{ color: dark ? 'var(--on-dark-muted)' : 'var(--muted)' }}>
          {imgLabel}
        </span>
      </span>

      {dark ? (
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 'clamp(20px,1.8vw,26px)', letterSpacing: '-0.02em' }}>
            {w.title} <span style={{ color: 'var(--on-dark-muted)', fontWeight: 400 }}>— {w.subtitle}</span>
          </span>
          <span className="work-card__cat" style={{ gap: 8, fontSize: 11, color: 'var(--coral)' }}>
            {w.serviceName}
            {w.isDraft && <span className="tag-light">Concept</span>}
          </span>
        </span>
      ) : (
        <>
          <span className="work-card__cat">
            {w.serviceName}
            {w.isDraft && <span className="tag-dark">Concept · not client work</span>}
          </span>
          <span className="work-card__title">{w.title}</span>
          <span style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--muted)', maxWidth: 520 }}>{w.subtitle}</span>
        </>
      )}
    </Link>
  );
}
