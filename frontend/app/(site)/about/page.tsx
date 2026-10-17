import type { Metadata } from 'next';
import Link from 'next/link';
import { getBootstrap } from '@/lib/server-api';

export const metadata: Metadata = { title: 'About', alternates: { canonical: '/about' } };

const PRINCIPLES = [
  { n: '1', title: 'Understand the challenge', text: 'Start with the business problem, not the channel.' },
  { n: '2', title: 'Align with real objectives', text: 'Tie marketing activity to goals the business actually cares about.' },
  { n: '3', title: 'Create for the audience', text: 'Make work that suits the people it’s meant to reach.' },
  { n: '4', title: 'Review against the goals', text: 'Check the work against what we agreed at the start.', coral: true },
];

export default async function AboutPage() {
  const boot = await getBootstrap();
  if (!boot) throw new Error('API unavailable');
  const { site, services } = boot;
  const c = site.contact;
  // Acronyms (e.g. SEO) stay as-is; other services use their full name in lower case.
  const serviceList = services.map((s) => (/^[A-Z]{2,}$/.test(s.name) ? s.name : (s.longName || s.name).toLowerCase()));
  const servicesSentence =
    serviceList.length > 1 ? `${serviceList.slice(0, -1).join(', ')} and ${serviceList[serviceList.length - 1]}` : serviceList.join('');

  return (
    <>
      <section aria-labelledby="ab-h" className="bg-white clip rel">
        <div aria-hidden="true" className="deco" style={{ right: '-10vw', top: '-10vw', width: 'clamp(280px,38vw,560px)', aspectRatio: '1/1', background: 'var(--blush)' }} />
        <div className="wrap rel sec-page-top" style={{ paddingBottom: 'clamp(64px,8vw,120px)' }}>
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About</span>
          </nav>
          <h1 id="ab-h" data-reveal="0" className="display h-page" style={{ maxWidth: 1100 }}>
            Good marketing starts with understanding what <span className="c-violet">matters</span>.
          </h1>
          <div style={{ marginTop: 'clamp(40px,5vw,64px)', display: 'flex', flexWrap: 'wrap', gap: '24px 64px' }}>
            <p style={{ flex: '1 1 340px', maxWidth: 560, margin: 0, fontSize: 'clamp(18px,1.5vw,21px)', lineHeight: 1.55 }}>
              Callahan Marketing Group is a creative digital marketing agency based in Orlando, Florida. We help businesses communicate their value through strategy, creative
              execution and digital marketing.
            </p>
            <p className="body" style={{ flex: '1 1 300px', maxWidth: 440, margin: 0 }}>
              Our services cover {servicesSentence}.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="ap-h" className="bg-cream">
        <div className="wrap sec-lg">
          <div className="split-head" style={{ gap: '12px 40px', marginBottom: 48 }}>
            <h2 id="ap-h" className="display" style={{ fontSize: 'clamp(32px,4vw,56px)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              How we approach the work
            </h2>
            {site.preview && <p className="pending-note">Suggested messaging · pending approval</p>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 clamp(24px,4vw,64px)' }}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.n} data-reveal={i % 2 ? '80' : '0'} className={`principle${i % 2 ? ' principle--offset' : ''}`}>
                <span className="principle__n" style={p.coral ? { color: 'var(--coral)' } : undefined}>
                  {p.n}
                </span>
                <div>
                  <h3>{p.title}</h3>
                  <p className="small-body" style={{ lineHeight: 1.6, maxWidth: 420 }}>
                    {p.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="tm-h" className="bg-white">
        <div className="wrap sec-lg" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px clamp(40px,6vw,96px)', alignItems: 'center' }}>
          <div
            aria-hidden="true"
            className="hatch circle rel"
            style={{ flex: '0 1 360px', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%', width: '100%' }}
          >
            <span className="ph-label">studio / team photo</span>
            <span className="deco" style={{ right: '4%', bottom: '4%', width: '22%', aspectRatio: '1/1', background: 'var(--coral)' }} />
          </div>
          <div style={{ flex: '1 1 400px', maxWidth: 600 }}>
            <p className="eyebrow" style={{ marginBottom: 18 }}>
              The team
            </p>
            <h2 id="tm-h" className="display" style={{ fontSize: 'clamp(30px,3.6vw,48px)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>
              Your point of contact is {c.name}.
            </h2>
            <p className="body" style={{ margin: '20px 0 0' }}>
              Reach {c.name.split(' ')[0]} directly at{' '}
              <a href={`mailto:${c.email}`} style={{ fontWeight: 600 }}>
                {c.email}
              </a>{' '}
              or{' '}
              <a href={c.phoneHref} style={{ fontWeight: 600 }}>
                {c.phone}
              </a>
              .
            </p>
            {site.preview && (
              <p className="mono" style={{ margin: '20px 0 0', fontSize: 12, lineHeight: 1.6, color: 'var(--muted)' }}>
                Team profiles, roles and photography will be added once confirmed.
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="abc-h" className="bg-ink clip rel">
        <div aria-hidden="true" className="deco" style={{ left: -100, bottom: -160, width: 380, height: 380, background: 'var(--violet)' }} />
        <div
          className="wrap rel"
          style={{ paddingTop: 'clamp(80px,10vw,150px)', paddingBottom: 'clamp(80px,10vw,150px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}
        >
          <h2 id="abc-h" className="display" style={{ maxWidth: 820, fontSize: 'clamp(40px,6.4vw,96px)', lineHeight: 0.95, letterSpacing: '-0.045em' }}>
            Let’s talk about what you need.
          </h2>
          <Link href="/contact" className="btn btn--coral on-dark" style={{ marginTop: 36 }}>
            Start a Conversation →
          </Link>
        </div>
      </section>
    </>
  );
}
