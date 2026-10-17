import Link from 'next/link';
import { CtaLink } from '@/components/ui/CtaLink';
import { ServiceGlyph } from '@/components/ui/ServiceGlyph';
import { WorkCard } from '@/components/work/WorkCard';
import { callCta } from '@/lib/cta';
import { numberWord } from '@/lib/format';
import { getBootstrap, getHomeWork } from '@/lib/server-api';
import type { WorkList } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PROCESS = [
  { n: '01', title: 'Discover', text: 'Understand the business, the audience, and the goals behind the project.', style: { background: 'var(--violet)', color: 'var(--white)', border: 0 } },
  { n: '02', title: 'Strategize', text: 'Define the priorities and agree on the proposed approach.' },
  { n: '03', title: 'Create', text: 'Develop the agreed creative and marketing deliverables.' },
  { n: '04', title: 'Refine', text: 'Review, improve, and prepare the work for delivery.' },
  { n: '05', title: 'Evaluate', text: 'Assess the agreed objectives and decide on next steps.', style: { background: 'var(--coral)', border: 0 } },
];

export default async function HomePage() {
  const boot = await getBootstrap();
  if (!boot) throw new Error('API unavailable');
  const { site, services } = boot;
  const cta = callCta(site);
  let work: WorkList | null = null;
  try {
    work = await getHomeWork();
  } catch {
    work = null;
  }
  const c = site.contact;

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-h" className="bg-cream rel clip">
        <div className="wrap hero__grid">
          <div style={{ flex: '1 1 580px', minWidth: 0, maxWidth: 900 }}>
            <p data-reveal="0" className="hero__kicker">
              <span aria-hidden="true" className="circle" style={{ width: 10, height: 10, background: 'var(--coral)' }} />
              Callahan Marketing Group · Orlando, FL
            </p>
            <h1 id="hero-h" data-reveal="80" className="display h-hero">
              Make your next move <span className="c-violet">impossible</span> to ignore<span className="dot-coral">.</span>
            </h1>
            <p data-reveal="200" className="lead" style={{ margin: 'clamp(24px,3vw,36px) 0 0', maxWidth: 520 }}>
              Creative strategy and digital marketing built around what your business wants to achieve.
            </p>
            <div data-reveal="300" className="btn-row" style={{ marginTop: 'clamp(28px,3.5vw,44px)' }}>
              <CtaLink cta={cta} className="btn btn--coral" arrow />
              <Link href="/work" className="btn btn--outline">
                Explore Our Work
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="hero__art">
            <div className="deco" style={{ right: '-8%', top: 0, width: '92%', aspectRatio: '1/1', background: 'var(--violet)' }} />
            <div className="hatch ph" style={{ position: 'absolute', left: 0, bottom: 0, width: '58%', aspectRatio: '3/4', border: '1px solid var(--line)' }}>
              <span className="ph-label">
                campaign visual
                <br />
                (approved asset)
              </span>
            </div>
            <div className="deco" style={{ right: '6%', bottom: '12%', width: '22%', aspectRatio: '1/1', background: 'var(--coral)' }} />
            <div className="mono" style={{ position: 'absolute', left: '62%', top: '14%', fontSize: 11, letterSpacing: '.06em', color: 'var(--white)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>FIG. 01</span>
              <span style={{ width: 48, height: 1, background: 'var(--white)' }} />
              <span>Strategy → Creative</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service band */}
      <div className="band">
        <div className="wrap band__inner">
          {services.map((s, i) => (
            <span key={s.slug} style={{ display: 'contents' }}>
              <span>{s.name}</span>
              {i < services.length - 1 && <span aria-hidden="true" className="band__dot" style={{ background: i % 2 ? 'var(--lilac)' : 'var(--coral)' }} />}
            </span>
          ))}
        </div>
      </div>

      {/* Services */}
      <section aria-labelledby="svc-h" className="bg-white">
        <div className="wrap sec-xl" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(32px,5vw,80px)' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 420 }}>
            <p className="eyebrow">01 — Services</p>
            <h2 id="svc-h" data-reveal="0" className="display h-section">
              {numberWord(services.length)} way{services.length === 1 ? '' : 's'} we can help you move.
            </h2>
            <p className="body" style={{ margin: '24px 0 32px' }}>
              Each service can stand alone or work alongside the others. Start with the one closest to your problem.
            </p>
            <Link href="/services" className="link-arrow">
              Explore All Services <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div style={{ flex: '2 1 520px', minWidth: 0, borderBottom: '1px solid var(--line)' }}>
            {services.map((s) => (
              <Link key={s.slug} href={`/services?s=${s.slug}`} aria-label={`${s.longName || s.name} — explore service`} className="svc-row">
                <ServiceGlyph g={s.glyph} />
                <span style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {s.number}
                  </span>
                  <span className="svc-row__name">{s.name}</span>
                </span>
                <span style={{ flex: '1 1 260px', minWidth: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.55, color: 'var(--muted)' }}>{s.shortDescription}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--violet)', whiteSpace: 'nowrap' }}>Explore service →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Selected work */}
      <section aria-labelledby="work-h" className="bg-ink rel clip">
        <div aria-hidden="true" className="deco" style={{ left: -180, top: -180, width: 420, height: 420, border: '1.5px solid rgba(134,91,238,.5)' }} />
        <div className="wrap rel sec-xl">
          <div className="split-head" style={{ marginBottom: 'clamp(40px,5vw,64px)' }}>
            <div style={{ maxWidth: 720 }}>
              <p className="eyebrow eyebrow--coral">02 — Selected work</p>
              <h2 id="work-h" data-reveal="0" className="display" style={{ fontSize: 'clamp(34px,5vw,72px)', lineHeight: 0.98, letterSpacing: '-0.04em' }}>
                Ideas, made visible.
              </h2>
            </div>
            <Link href="/work" className="btn btn--outline-light btn--md" style={{ fontSize: 15 }}>
              View Selected Work
            </Link>
          </div>

          {work && work.items.length > 0 ? (
            <div className="work-grid work-grid--home">
              {work.items.map((w) => (
                <WorkCard key={w.slug} w={w} variant="dark" />
              ))}
            </div>
          ) : (
            <div style={{ border: '1px dashed rgba(247,245,242,.3)', padding: 'clamp(32px,5vw,64px)', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, maxWidth: 560, fontSize: 18, lineHeight: 1.55, color: 'var(--on-dark)' }}>
                {work
                  ? 'Case studies are being prepared and will be published here once approved. In the meantime, we’re happy to talk through relevant work on a call.'
                  : 'Our selected work couldn’t be loaded just now. Please refresh the page, or get in touch and we’ll talk you through relevant projects.'}
              </p>
              <Link href="/contact" style={{ color: 'var(--coral)', fontWeight: 600 }}>
                Start a conversation →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section aria-labelledby="proc-h" className="bg-cream">
        <div className="wrap sec-xl">
          <div className="split-head" style={{ marginBottom: 'clamp(40px,5vw,72px)' }}>
            <div style={{ maxWidth: 640 }}>
              <p className="eyebrow">03 — How we work</p>
              <h2 id="proc-h" data-reveal="0" className="display h-section">
                From first call to finished work.
              </h2>
            </div>
            {site.preview && <p className="pending-note">Proposed framework · pending approval</p>}
          </div>
          <ol className="process">
            {PROCESS.map((p, i) => (
              <li key={p.n} data-reveal={String(i * 80)}>
                <span className="process__n" style={p.style}>
                  {p.n}
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/contact" className="link-arrow" style={{ marginTop: 'clamp(40px,5vw,64px)' }}>
            Discuss Your Project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-h" className="bg-ink rel clip">
        <div aria-hidden="true" className="deco" style={{ right: '-12vw', top: '50%', transform: 'translateY(-50%)', width: 'clamp(320px,46vw,680px)', aspectRatio: '1/1', background: 'var(--violet)' }} />
        <div aria-hidden="true" className="deco" style={{ right: 'clamp(40px,14vw,240px)', bottom: -60, width: 'clamp(120px,14vw,200px)', aspectRatio: '1/1', background: 'var(--coral)' }} />
        <div className="wrap rel" style={{ paddingTop: 'clamp(88px,11vw,180px)', paddingBottom: 'clamp(88px,11vw,180px)' }}>
          <h2 id="cta-h" data-reveal="0" className="display" style={{ maxWidth: 860, fontSize: 'clamp(42px,7vw,108px)', lineHeight: 0.95, letterSpacing: '-0.045em' }}>
            Have a challenge worth solving?
          </h2>
          <p style={{ margin: '28px 0 0', maxWidth: 460, fontSize: 'clamp(17px,1.4vw,20px)', lineHeight: 1.55, color: 'var(--on-dark)' }}>
            Tell us what you’re working toward, and let’s explore the right next step.
          </p>
          <div className="btn-row" style={{ marginTop: 40 }}>
            <CtaLink cta={cta} className="btn btn--coral on-dark" arrow />
            <Link href="/contact" className="btn btn--outline-light">
              Start a Project Brief
            </Link>
          </div>
        </div>
      </section>

      {/* Direct contact */}
      <section aria-labelledby="contact-h" className="bg-white">
        <div className="wrap" style={{ paddingTop: 'clamp(56px,7vw,100px)', paddingBottom: 'clamp(56px,7vw,100px)' }}>
          <h2 id="contact-h" className="eyebrow eyebrow--muted" style={{ margin: '0 0 36px', fontWeight: 400 }}>
            Get in touch directly
          </h2>
          <div className="contact-strip">
            <a href={`mailto:${c.email}`}>
              <span className="contact-strip__k">Email</span>
              <span className="contact-strip__v">{c.email}</span>
            </a>
            <a href={c.phoneHref}>
              <span className="contact-strip__k">Phone</span>
              <span className="contact-strip__v">{c.phone}</span>
            </a>
            <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer">
              <span className="contact-strip__k">Address · opens map in new tab</span>
              <span className="contact-strip__v">
                {c.addressLine1}, {c.addressLine2}
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
