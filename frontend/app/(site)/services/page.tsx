import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ScrollToService } from '@/components/services/ScrollToService';
import { ServiceSections } from '@/components/services/ServiceSections';
import { getServices } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Services', alternates: { canonical: '/services' } };

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToService />
      </Suspense>

      <section aria-labelledby="sp-h" className="bg-cream clip rel">
        <div aria-hidden="true" className="deco" style={{ right: -140, bottom: -200, width: 520, height: 520, background: 'var(--violet)' }} />
        <div className="wrap rel sec-page-top" style={{ paddingBottom: 'clamp(56px,7vw,104px)' }}>
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Services</span>
          </nav>
          <h1 id="sp-h" data-reveal="0" className="display h-page" style={{ maxWidth: 1000 }}>
            Marketing built around your next move<span className="dot-coral">.</span>
          </h1>
          <p className="lead" style={{ margin: '32px 0 0', maxWidth: 540 }}>
            Explore the services we offer. Each one is scoped around your goals, and they can be combined as your needs change.
          </p>
          <div className="btn-row" style={{ marginTop: 36 }}>
            <Link href="/contact" className="btn btn--coral">
              Discuss Your Project <span aria-hidden="true">→</span>
            </Link>
          </div>
          <nav aria-label="Services on this page" className="chip-group" style={{ marginTop: 'clamp(48px,6vw,80px)', gap: 10 }}>
            {services.map((s) => (
              <Link key={s.slug} href={`/services?s=${s.slug}`} scroll={false} className="chip chip--white">
                <span className="chip__count" style={{ opacity: 1 }}>
                  {s.number}
                </span>
                {s.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <ServiceSections services={services} />

      <section aria-labelledby="sx-h" className="bg-violet rel clip">
        <div aria-hidden="true" className="deco" style={{ right: -80, bottom: -120, width: 320, height: 320, background: 'var(--coral)' }} />
        <div className="wrap rel sec-lg">
          <h2 id="sx-h" className="display" style={{ maxWidth: 820, fontSize: 'clamp(36px,5.4vw,80px)', lineHeight: 0.98, letterSpacing: '-0.04em' }}>
            Not sure which service fits?
          </h2>
          <p style={{ margin: '24px 0 0', maxWidth: 480, fontSize: 18, lineHeight: 1.55 }}>
            That’s fine. Tell us about the problem and we’ll work out the right mix together.
          </p>
          <Link href="/contact" className="btn btn--white" style={{ marginTop: 36 }}>
            Tell Us About Your Project →
          </Link>
        </div>
      </section>
    </>
  );
}
