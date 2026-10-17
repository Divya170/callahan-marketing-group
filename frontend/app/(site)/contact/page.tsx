import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ContactForm } from '@/components/contact/ContactForm';
import { getBootstrap, getLeadOptions } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Contact & project brief', alternates: { canonical: '/contact' } };

export default async function ContactPage() {
  const [boot, options] = await Promise.all([getBootstrap(), getLeadOptions()]);
  if (!boot) throw new Error('API unavailable');
  const c = boot.site.contact;
  const booking = boot.site.booking;

  return (
    <>
      <section aria-labelledby="ct-h" className="bg-cream rel clip">
        <div aria-hidden="true" className="deco" style={{ left: -160, top: -200, width: 440, height: 440, background: 'var(--blush)' }} />
        <div className="wrap rel sec-page-top" style={{ paddingTop: 'clamp(48px,7vw,96px)', paddingBottom: 'clamp(32px,4vw,56px)' }}>
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Contact</span>
          </nav>
          <h1 id="ct-h" data-reveal="0" className="display" style={{ maxWidth: 1000, fontSize: 'clamp(42px,7vw,104px)', lineHeight: 0.95, letterSpacing: '-0.045em' }}>
            Let’s talk about what you’re building<span className="dot-coral">.</span>
          </h1>
          <p className="lead" style={{ margin: '28px 0 0', maxWidth: 520 }}>
            Share a little about your business, your goals, and the support you’re looking for.
          </p>
        </div>
      </section>

      <section aria-label="Project brief" className="bg-cream">
        <div className="wrap contact-layout">
          <aside aria-label="Contact details" className="contact-aside">
            <div aria-hidden="true" className="deco" style={{ right: -60, bottom: -60, width: 180, height: 180, background: 'var(--violet)' }} />
            <div className="rel" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <h2 className="display" style={{ fontSize: 26, letterSpacing: '-0.02em', fontWeight: 700 }}>
                Prefer to reach out directly?
              </h2>
              <div>
                <p className="k">Email</p>
                <a href={`mailto:${c.email}`} style={{ overflowWrap: 'anywhere' }}>
                  {c.email}
                </a>
              </div>
              <div>
                <p className="k">Phone</p>
                <a href={c.phoneHref}>{c.phone}</a>
              </div>
              <div>
                <p className="k">Address</p>
                <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ lineHeight: 1.4 }}>
                  {c.addressLine1}
                  <br />
                  {c.addressLine2}
                </a>
                <span style={{ display: 'block', marginTop: 4, fontSize: 13, color: 'var(--on-dark-muted)' }}>Opens Google Maps in a new tab</span>
              </div>
              {booking.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
                  <a href={booking.url} target="_blank" rel="noopener noreferrer" className="btn btn--coral btn--md on-dark" style={{ color: 'var(--ink)', fontSize: 16 }}>
                    Book a Strategy Call ↗
                  </a>
                  <span style={{ fontSize: 13, color: 'var(--on-dark-muted)' }}>Opens our external scheduling page.</span>
                </div>
              )}
            </div>
          </aside>

          {options ? (
            <Suspense fallback={<div className="contact-card skeleton" style={{ minHeight: 600 }} />}>
              <ContactForm options={options} />
            </Suspense>
          ) : (
            <div className="contact-card" role="alert">
              <h2 className="display" style={{ fontSize: 28, marginBottom: 12 }}>
                The brief form is unavailable right now.
              </h2>
              <p className="body">
                Please email <a href={`mailto:${c.email}`}>{c.email}</a> or call <a href={c.phoneHref}>{c.phone}</a> and we’ll take it from there.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
