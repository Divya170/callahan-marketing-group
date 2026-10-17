import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { InsightsBrowser } from '@/components/insights/InsightsBrowser';

export const metadata: Metadata = { title: 'Insights', alternates: { canonical: '/insights' } };

export default function InsightsPage() {
  return (
    <section aria-labelledby="in-h" className="bg-white" style={{ minHeight: '70vh' }}>
      <div className="wrap sec-page-top" style={{ paddingBottom: 'clamp(72px,9vw,128px)' }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Insights</span>
        </nav>
        <div className="split-head" style={{ paddingBottom: 40, borderBottom: '1.5px solid var(--ink)' }}>
          <h1 id="in-h" data-reveal="0" className="display" style={{ fontSize: 'clamp(56px,10vw,160px)', lineHeight: 0.88, letterSpacing: '-0.055em' }}>
            Insights<span className="dot-coral">.</span>
          </h1>
          <p style={{ margin: 0, maxWidth: 400, fontSize: 17, lineHeight: 1.6, color: 'var(--muted)' }}>Notes on strategy, search, social, branding and advertising.</p>
        </div>
        <Suspense fallback={null}>
          <InsightsBrowser />
        </Suspense>
      </div>
    </section>
  );
}
