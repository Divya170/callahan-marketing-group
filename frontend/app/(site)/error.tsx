'use client';

import Link from 'next/link';

/** Error boundary for public pages (e.g. the API failed while loading a case study). */
export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section style={{ background: 'var(--cream)', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ width: '100%', paddingTop: 80, paddingBottom: 80 }}>
        <p className="eyebrow eyebrow--muted">Something went wrong</p>
        <h1 className="display h-section" style={{ maxWidth: 760 }}>
          We couldn’t load this page<span className="dot-coral">.</span>
        </h1>
        <p className="lead" style={{ margin: '20px 0 28px', maxWidth: 480 }}>
          It’s probably temporary. Try again, or head back to the home page.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn--dark btn--md" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn btn--outline btn--md">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
