'use client';

/** Shown when the API can't be reached while rendering the public site. */
export function SiteUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="site-down">
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <p className="eyebrow eyebrow--muted">Temporarily unavailable</p>
        <h1 className="display h-page" style={{ maxWidth: 820 }}>
          We’ll be right back<span className="dot-coral">.</span>
        </h1>
        <p className="lead" style={{ margin: '24px 0 32px', maxWidth: 480 }}>
          The site couldn’t load its content just now. Please try again in a moment.
        </p>
        <button type="button" className="btn btn--dark btn--md" onClick={() => (onRetry ? onRetry() : window.location.reload())}>
          Try again
        </button>
      </div>
    </div>
  );
}
