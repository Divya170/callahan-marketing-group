import Link from 'next/link';

export function NotFoundContent() {
  return (
    <section aria-labelledby="nf-h" className="clip rel" style={{ background: 'var(--cream)', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div
        aria-hidden="true"
        className="deco"
        style={{ right: '-8vw', top: '50%', transform: 'translateY(-50%)', width: 'clamp(260px,40vw,600px)', aspectRatio: '1/1', background: 'var(--violet)' }}
      />
      <div className="wrap rel" style={{ width: '100%', paddingTop: 'clamp(64px,8vw,120px)', paddingBottom: 'clamp(64px,8vw,120px)' }}>
        <p className="mono" style={{ margin: '0 0 16px', fontSize: 13, letterSpacing: '.12em', color: 'var(--muted)' }}>
          ERROR 404
        </p>
        <h1 id="nf-h" className="display" style={{ maxWidth: 720, fontSize: 'clamp(44px,7vw,104px)', lineHeight: 0.95, letterSpacing: '-0.045em' }}>
          This page took a different route.
        </h1>
        <p style={{ margin: '24px 0 32px', maxWidth: 440, fontSize: 18, lineHeight: 1.55, color: 'var(--muted)' }}>
          The page you’re looking for doesn’t exist or isn’t published yet.
        </p>
        <div className="btn-row">
          <Link href="/" className="btn btn--dark btn--md">
            Back to home
          </Link>
          <Link href="/contact" className="btn btn--outline btn--md" style={{ background: 'var(--cream)' }}>
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
