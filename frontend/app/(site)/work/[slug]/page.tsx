import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkDetail, NotFoundError } from '@/lib/server-api';
import type { WorkDetail } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string): Promise<WorkDetail> {
  try {
    return await getWorkDetail(slug);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { item } = await getWorkDetail(slug);
    return { title: item.title, description: item.subtitle, alternates: { canonical: `/work/${slug}` } };
  } catch {
    return { title: 'Page not found' };
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const { item: cs, next } = await load(slug);

  return (
    <article aria-labelledby="cs-h">
      <header className="bg-ink rel clip">
        <div aria-hidden="true" className="deco" style={{ right: -120, top: -120, width: 420, height: 420, background: cs.accent }} />
        <div className="wrap rel" style={{ paddingTop: 'clamp(40px,6vw,88px)', paddingBottom: 'clamp(48px,6vw,80px)' }}>
          <nav aria-label="Breadcrumb" className="crumbs crumbs--dark" style={{ marginBottom: 32 }}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/work">Work</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{cs.title}</span>
          </nav>
          <p className="eyebrow eyebrow--coral" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {cs.serviceName}
            {cs.isDraft && (
              <span className="tag-light" style={{ padding: '3px 8px', letterSpacing: '.06em' }}>
                Concept study · not client work
              </span>
            )}
          </p>
          <h1 id="cs-h" className="display" style={{ maxWidth: 1000, fontSize: 'clamp(44px,7vw,108px)', lineHeight: 0.95, letterSpacing: '-0.045em' }}>
            {cs.title}
          </h1>
          <p style={{ margin: '24px 0 0', maxWidth: 600, fontSize: 'clamp(18px,1.6vw,22px)', lineHeight: 1.5, color: 'var(--on-dark)' }}>{cs.subtitle}</p>
          <dl className="cs-meta">
            <div>
              <dt>Client / industry</dt>
              <dd>{cs.client}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{cs.serviceName}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{cs.statusLabel}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div aria-hidden="true" className="hatch" style={{ aspectRatio: '21/9', maxHeight: 640, width: '100%', display: 'flex', alignItems: 'flex-end', padding: 'clamp(16px,3vw,32px)' }}>
        <span className="ph-label" style={{ fontSize: 12 }}>
          hero visual — approved campaign image
        </span>
      </div>

      <div className="wrap" style={{ paddingTop: 'clamp(64px,8vw,120px)', paddingBottom: 'clamp(64px,8vw,120px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px clamp(40px,6vw,96px)' }}>
          <h2 className="eyebrow" style={{ flex: '0 1 280px', margin: 0, fontWeight: 400 }}>
            Context
          </h2>
          <p style={{ flex: '1 1 420px', maxWidth: 720, margin: 0, fontFamily: 'var(--f-display)', fontSize: 'clamp(22px,2.4vw,32px)', lineHeight: 1.35, letterSpacing: '-0.015em', textWrap: 'pretty', whiteSpace: 'pre-line' }}>
            {cs.context}
          </p>
        </div>

        <div className="cs-cols">
          <div>
            <h2>Objectives</h2>
            <p>{cs.objectives}</p>
          </div>
          <div>
            <h2>Approach</h2>
            <p>{cs.approach}</p>
          </div>
          <div>
            <h2>Deliverables</h2>
            {cs.deliverables.length > 0 ? (
              <ul className="bullets">
                {cs.deliverables.map((d, i) => (
                  <li key={`${d}-${i}`}>{d}</li>
                ))}
              </ul>
            ) : (
              <p>Deliverables will be listed once confirmed.</p>
            )}
          </div>
        </div>

        <div aria-hidden="true" style={{ marginTop: 'clamp(56px,7vw,96px)', display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          <div className="hatch ph" style={{ flex: '1 1 300px', aspectRatio: '4/5' }}>
            <span className="ph-label">supporting visual</span>
          </div>
          <div className="hatch ph" style={{ flex: '2 1 520px', aspectRatio: '16/10' }}>
            <span className="ph-label">supporting visual</span>
          </div>
        </div>

        <div className="bg-cream" style={{ marginTop: 'clamp(56px,7vw,96px)', padding: 32, display: 'flex', flexWrap: 'wrap', gap: '16px 40px', alignItems: 'center' }}>
          <h2 className="h3">Results</h2>
          <p style={{ flex: '1 1 360px', margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>{cs.results}</p>
        </div>
      </div>

      <nav aria-label="Next project" style={{ borderTop: '1px solid var(--line)' }}>
        <Link href={next ? `/work/${next.slug}` : '/work'} className="next-link">
          <span className="eyebrow eyebrow--muted" style={{ margin: 0 }}>
            {next ? 'Next project' : 'Back to'}
          </span>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 'clamp(32px,5vw,64px)', letterSpacing: '-0.04em' }}>{next ? next.title : 'All work'} →</span>
        </Link>
      </nav>

      <section className="bg-ink">
        <div className="wrap cta-band">
          <h2 style={{ fontSize: 'clamp(30px,4vw,52px)' }}>Working on something similar?</h2>
          <Link href={`/contact?service=${cs.serviceSlug}`} className="btn btn--coral on-dark">
            Discuss a Similar Project →
          </Link>
        </div>
      </section>
    </article>
  );
}
