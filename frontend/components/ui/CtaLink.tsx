import Link from 'next/link';

interface Cta {
  href: string;
  label: string;
  external: boolean;
}

/** Renders the strategy-call CTA as an internal link or an external (new tab) link. */
export function CtaLink({ cta, className, arrow, onClick }: { cta: Cta; className?: string; arrow?: boolean; onClick?: () => void }) {
  const content = (
    <>
      {cta.label}
      {arrow && <span aria-hidden="true">→</span>}
    </>
  );
  if (cta.external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className} onClick={onClick}>
      {content}
    </Link>
  );
}
