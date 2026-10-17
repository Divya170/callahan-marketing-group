import Link from 'next/link';
import type { ServiceItem } from '@/lib/types';

const eyebrowName = (s: ServiceItem) => `${s.number} · ${s.longName || s.name}`;
const contactHref = (s: ServiceItem) => `/contact?service=${s.slug}`;

function WhoFor({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="who-box">
      <p className="svc-list-label">Who it’s for</p>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>{text}</p>
    </div>
  );
}

/** Layout A — visual left, copy right (Digital Marketing). */
function LayoutVisualLeft({ s }: { s: ServiceItem }) {
  return (
    <section id={s.slug} aria-labelledby={`${s.slug}-h`} className="bg-white" style={{ scrollMarginTop: 80 }}>
      <div className="wrap sec-lg" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px,6vw,96px)', alignItems: 'center' }}>
        <div aria-hidden="true" style={{ flex: '1 1 360px', maxWidth: 600, aspectRatio: '5/4', position: 'relative' }}>
          <div className="hatch ph" style={{ position: 'absolute', inset: '0 18% 0 0' }}>
            <span className="ph-label">{s.visualLabel || 'service visual'}</span>
          </div>
          <div className="deco" style={{ right: 0, top: '12%', width: '38%', aspectRatio: '1/1', background: 'var(--violet)' }} />
        </div>
        <div style={{ flex: '1 1 400px', minWidth: 0, maxWidth: 600 }}>
          <p className="eyebrow" style={{ marginBottom: 18 }}>
            {eyebrowName(s)}
          </p>
          <h2 id={`${s.slug}-h`} className="display h-block">
            {s.headline}
          </h2>
          <p className="body" style={{ margin: '24px 0 0' }}>
            {s.description}
          </p>
          {s.extra && (
            <p className="body" style={{ margin: '16px 0 0' }}>
              {s.extra}
            </p>
          )}
          <WhoFor text={s.audience} />
          <Link href={contactHref(s)} className="link-arrow" style={{ marginTop: 28 }}>
            {s.ctaLabel} →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Layout B — blush band with headline and a scoped checklist (SEO). */
function LayoutChecklist({ s }: { s: ServiceItem }) {
  return (
    <section id={s.slug} aria-labelledby={`${s.slug}-h`} className="bg-blush" style={{ scrollMarginTop: 80 }}>
      <div className="wrap sec-lg">
        <p className="eyebrow" style={{ marginBottom: 18, color: '#8A2E1F' }}>
          {eyebrowName(s)}
        </p>
        <h2 id={`${s.slug}-h`} className="display" style={{ maxWidth: 1100, fontSize: 'clamp(34px,5.4vw,80px)', lineHeight: 1, letterSpacing: '-0.04em' }}>
          {s.headline}
        </h2>
        <div style={{ marginTop: 'clamp(40px,5vw,64px)', display: 'flex', flexWrap: 'wrap', gap: '32px 64px' }}>
          <div style={{ flex: '1 1 360px', maxWidth: 560 }}>
            <p className="body" style={{ margin: 0, color: 'var(--muted-2)' }}>
              {s.description}
            </p>
            {s.extra && (
              <p className="body" style={{ margin: '16px 0 0', color: 'var(--muted-2)' }}>
                {s.extra}
              </p>
            )}
            {s.audience && (
              <p className="body" style={{ margin: '16px 0 0', color: 'var(--muted-2)' }}>
                <strong style={{ color: 'var(--ink)' }}>Who it’s for: </strong>
                {s.audience}
              </p>
            )}
          </div>
          <div style={{ flex: '1 1 300px', maxWidth: 440 }}>
            {s.points.length > 0 && (
              <>
                <p className="svc-list-label" style={{ marginBottom: 12 }}>
                  {s.pointsLabel || 'What it covers'}{' '}
                  {s.pointsNote && <span style={{ fontWeight: 400, color: 'var(--muted-2)' }}>{s.pointsNote}</span>}
                </p>
                <ul className="svc-points">
                  {s.points.map((p) => (
                    <li key={p.title}>{p.title}</li>
                  ))}
                </ul>
              </>
            )}
            <Link href={contactHref(s)} className="link-arrow link-arrow--ink" style={{ marginTop: 24 }}>
              {s.ctaLabel} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Layout C — copy left, social-format tiles right (Social Media). */
function LayoutTiles({ s }: { s: ServiceItem }) {
  return (
    <section id={s.slug} aria-labelledby={`${s.slug}-h`} className="bg-white" style={{ scrollMarginTop: 80 }}>
      <div className="wrap sec-lg" style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: 'clamp(40px,6vw,96px)', alignItems: 'center' }}>
        <div style={{ flex: '1 1 400px', minWidth: 0, maxWidth: 600 }}>
          <p className="eyebrow" style={{ marginBottom: 18 }}>
            {eyebrowName(s)}
          </p>
          <h2 id={`${s.slug}-h`} className="display h-block">
            {s.headline}
          </h2>
          <p className="body" style={{ margin: '24px 0 0' }}>
            {s.description}
          </p>
          {s.extra && (
            <p className="body" style={{ margin: '16px 0 0' }}>
              {s.extra}
            </p>
          )}
          <WhoFor text={s.audience} />
          <Link href={contactHref(s)} className="link-arrow" style={{ marginTop: 28 }}>
            {s.ctaLabel} →
          </Link>
        </div>
        <div aria-hidden="true" style={{ flex: '1 1 360px', maxWidth: 560, display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          <div className="hatch ph" style={{ flex: 1, aspectRatio: '4/5', padding: 12 }}>
            <span className="ph-label">post</span>
          </div>
          <div className="hatch ph clip rel" style={{ flex: 1, aspectRatio: '9/16', padding: 12 }}>
            <span className="deco" style={{ left: '-30%', top: '-15%', width: '90%', aspectRatio: '1/1', background: 'var(--coral)' }} />
            <span className="ph-label rel">story</span>
          </div>
          <div className="hatch ph" style={{ flex: 1, aspectRatio: '1/1', padding: 12 }}>
            <span className="ph-label">grid</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Layout D — dark statement band (Branding). */
function LayoutDark({ s }: { s: ServiceItem }) {
  return (
    <section id={s.slug} aria-labelledby={`${s.slug}-h`} className="bg-ink rel clip" style={{ scrollMarginTop: 80 }}>
      <div aria-hidden="true" className="deco" style={{ left: '50%', top: '-30%', width: 'clamp(400px,60vw,900px)', aspectRatio: '1/1', border: '1.5px solid rgba(134,91,238,.55)' }} />
      <div aria-hidden="true" className="deco" style={{ left: '62%', top: '20%', width: 'clamp(160px,22vw,320px)', aspectRatio: '1/1', background: 'var(--violet)' }} />
      <div className="wrap rel" style={{ paddingTop: 'clamp(80px,10vw,160px)', paddingBottom: 'clamp(80px,10vw,160px)' }}>
        <p className="eyebrow eyebrow--coral" style={{ marginBottom: 18 }}>
          {eyebrowName(s)}
        </p>
        <h2 id={`${s.slug}-h`} className="display" style={{ maxWidth: 760, fontSize: 'clamp(36px,5.6vw,84px)', lineHeight: 0.98, letterSpacing: '-0.04em' }}>
          {s.headline}
        </h2>
        <div style={{ marginTop: 40, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[s.description, s.extra, s.audience].filter(Boolean).map((t) => (
            <p key={t} className="body" style={{ margin: 0, color: 'var(--on-dark)' }}>
              {t}
            </p>
          ))}
        </div>
        <Link href={contactHref(s)} className="btn btn--outline-light btn--md" style={{ marginTop: 36 }}>
          {s.ctaLabel} →
        </Link>
      </div>
    </section>
  );
}

/** Layout E — copy left, lettered list right (Paid Advertising). */
function LayoutLettered({ s }: { s: ServiceItem }) {
  return (
    <section id={s.slug} aria-labelledby={`${s.slug}-h`} className="bg-cream" style={{ scrollMarginTop: 80 }}>
      <div className="wrap sec-lg" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px,6vw,96px)' }}>
        <div style={{ flex: '1 1 360px', maxWidth: 520 }}>
          <p className="eyebrow" style={{ marginBottom: 18 }}>
            {eyebrowName(s)}
          </p>
          <h2 id={`${s.slug}-h`} className="display h-block">
            {s.headline}
          </h2>
          <p className="body" style={{ margin: '24px 0 0' }}>
            {s.description}
          </p>
          {s.extra && (
            <p className="body" style={{ margin: '16px 0 0' }}>
              {s.extra}
            </p>
          )}
          <WhoFor text={s.audience} />
          <Link href={contactHref(s)} className="link-arrow" style={{ marginTop: 28 }}>
            {s.ctaLabel} →
          </Link>
        </div>
        {s.points.length > 0 && (
          <ol className="abc">
            {s.points.map((p, i) => (
              <li key={p.title}>
                <span className="abc__k">{String.fromCharCode(65 + i)}</span>
                <div>
                  <h3>{p.title}</h3>
                  {p.text && <p className="small-body" style={{ lineHeight: 1.6 }}>{p.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

const LAYOUTS = [LayoutVisualLeft, LayoutChecklist, LayoutTiles, LayoutDark, LayoutLettered];

export function ServiceSections({ services }: { services: ServiceItem[] }) {
  return (
    <>
      {services.map((s, i) => {
        const Layout = LAYOUTS[i % LAYOUTS.length];
        return <Layout key={s.slug} s={s} />;
      })}
    </>
  );
}
