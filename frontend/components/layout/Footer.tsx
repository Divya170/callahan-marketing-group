'use client';

import Link from 'next/link';
import { useSite } from '@/lib/site-context';

export function Footer() {
  const { site, services } = useSite();
  const c = site.contact;
  return (
    <footer className="site-footer">
      <div aria-hidden="true" className="deco" style={{ right: -120, bottom: -200, width: 460, height: 460, border: '1.5px solid rgba(134,91,238,.6)' }} />
      <div aria-hidden="true" className="deco" style={{ right: 120, bottom: -60, width: 140, height: 140, background: 'var(--coral)' }} />
      <div className="wrap site-footer__inner">
        <div className="site-footer__cols">
          <div style={{ flex: '2 1 320px', maxWidth: 460 }}>
            <Link href="/" className="footer-brand">
              <span aria-hidden="true" className="brand__mark" />
              <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em' }}>Callahan Marketing Group</span>
            </Link>
            <p style={{ margin: '20px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--on-dark)' }}>
              A creative digital marketing agency helping businesses communicate their value through strategy, creative execution and digital marketing.
            </p>
          </div>
          <nav aria-label="Footer pages" style={{ flex: '1 1 140px' }}>
            <h2>Pages</h2>
            <ul>
              {[
                ['Services', '/services'],
                ['Work', '/work'],
                ['About', '/about'],
                ['Insights', '/insights'],
                ['Contact', '/contact'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer services" style={{ flex: '1 1 180px' }}>
            <h2>Services</h2>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services?s=${s.slug}`} className="footer-link">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ flex: '1 1 220px' }}>
            <h2>Contact</h2>
            <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <a href={`mailto:${c.email}`} className="footer-link">
                {c.email}
              </a>
              <a href={c.phoneHref} className="footer-link">
                {c.phone}
              </a>
              <span style={{ padding: '6px 0', color: 'var(--on-dark)', lineHeight: 1.5 }}>
                {c.addressLine1}
                <br />
                {c.addressLine2}
              </span>
            </address>
          </div>
        </div>
        <div className="site-footer__base">
          <span>© {new Date().getFullYear()} Callahan Marketing Group</span>
          <Link href="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
