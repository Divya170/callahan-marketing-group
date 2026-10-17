'use client';

import { SiteProvider, useSite } from '@/lib/site-context';
import type { ServiceItem, SiteInfo } from '@/lib/types';
import { Footer } from './Footer';
import { Header } from './Header';
import { BackToTop, RevealAndFocus, SkipLink } from './ShellExtras';

function PreviewBanner() {
  const { site } = useSite();
  if (!site.preview) return null;
  return (
    <div role="note" className="preview-banner">
      <strong>PREVIEW BUILD</strong>
      <span>
        Concept studies, sample articles and proposed copy are placeholders. Switch Admin → Settings → Content mode to “production” to see the public site without
        them.
      </span>
    </div>
  );
}

/** Public site chrome: header, main landmark, footer. */
export function SiteShell({ site, services, notFound, children }: { site: SiteInfo; services: ServiceItem[]; notFound?: boolean; children: React.ReactNode }) {
  return (
    <SiteProvider value={{ site, services }}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--white)' }}>
        <SkipLink />
        <PreviewBanner />
        <Header notFound={notFound} />
        <main id="main" tabIndex={-1} style={{ flex: 1, outline: 'none' }}>
          {children}
        </main>
        <Footer />
        <BackToTop />
        <RevealAndFocus />
      </div>
    </SiteProvider>
  );
}
