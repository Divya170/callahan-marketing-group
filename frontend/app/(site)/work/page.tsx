import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { WorkBrowser } from '@/components/work/WorkBrowser';

export const metadata: Metadata = { title: 'Work', alternates: { canonical: '/work' } };

export default function WorkPage() {
  return (
    <section aria-labelledby="wp-h" className="bg-cream" style={{ minHeight: '70vh' }}>
      <div className="wrap sec-page-top" style={{ paddingBottom: 'clamp(72px,9vw,128px)' }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Work</span>
        </nav>
        <div className="split-head">
          <h1 id="wp-h" data-reveal="0" className="display" style={{ fontSize: 'clamp(48px,8.4vw,128px)', lineHeight: 0.92, letterSpacing: '-0.05em' }}>
            Work made
            <br />
            with purpose<span className="dot-coral">.</span>
          </h1>
          <p style={{ margin: 0, maxWidth: 400, fontSize: 17, lineHeight: 1.6, color: 'var(--muted)' }}>Selected projects and campaigns across the services we offer.</p>
        </div>
        <Suspense fallback={null}>
          <WorkBrowser />
        </Suspense>
      </div>
    </section>
  );
}
