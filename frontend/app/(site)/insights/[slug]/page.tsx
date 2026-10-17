import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articleDate } from '@/lib/format';
import { getArticleDetail, NotFoundError } from '@/lib/server-api';
import type { ArticleDetail } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string): Promise<ArticleDetail> {
  try {
    return await getArticleDetail(slug);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { item } = await getArticleDetail(slug);
    return {
      title: item.title,
      description: item.excerpt,
      alternates: { canonical: `/insights/${slug}` },
      openGraph: { type: 'article', title: item.title, description: item.excerpt },
    };
  } catch {
    return { title: 'Page not found' };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { item: art, related } = await load(slug);

  return (
    <article aria-labelledby="ar-h" className="bg-white">
      <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(40px,6vw,88px) var(--gutter) 40px' }}>
        <nav aria-label="Breadcrumb" className="crumbs" style={{ marginBottom: 32 }}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/insights">Insights</Link>
        </nav>
        <p className="article-card__meta" style={{ margin: '0 0 20px', gap: '10px 16px', letterSpacing: '.08em' }}>
          <span className="c-violet">{art.category}</span>
          <span>{articleDate(art)}</span>
          {art.isDraft && (
            <span className="tag-dark" style={{ padding: '3px 8px' }}>
              Sample layout · not published
            </span>
          )}
        </p>
        <h1 id="ar-h" className="display" style={{ fontSize: 'clamp(38px,5.6vw,72px)', lineHeight: 1, letterSpacing: '-0.04em' }}>
          {art.title}
        </h1>
        <p style={{ margin: '24px 0 0', fontSize: 'clamp(18px,1.6vw,22px)', lineHeight: 1.55, color: 'var(--muted)' }}>{art.excerpt}</p>
      </div>

      <div aria-hidden="true" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div className="hatch rel clip" style={{ aspectRatio: '2/1', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
          <span className="deco" style={{ right: -60, top: -60, width: 200, height: 200, background: art.accent }} />
          <span className="ph-label rel">featured image</span>
        </div>
      </div>

      <div className="prose" style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,6vw,80px) var(--gutter)' }}>
        {art.body.map((b, i) => {
          if (b.type === 'heading') return <h2 key={i}>{b.text}</h2>;
          if (b.type === 'list')
            return (
              <ul key={i}>
                {b.items.map((li, j) => (
                  <li key={j}>{li}</li>
                ))}
              </ul>
            );
          return <p key={i}>{b.text}</p>;
        })}
      </div>

      {related.length > 0 && (
        <section aria-labelledby="rel-h" className="bg-cream">
          <div className="wrap" style={{ paddingTop: 'clamp(56px,7vw,96px)', paddingBottom: 'clamp(56px,7vw,96px)' }}>
            <h2 id="rel-h" className="display" style={{ margin: '0 0 32px', fontSize: 32, letterSpacing: '-0.03em' }}>
              Related
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '0 32px' }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/insights/${r.slug}`} className="related-link">
                  <span className="mono" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)' }}>
                    {r.category}
                  </span>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{r.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-ink">
        <div className="wrap cta-band">
          <h2 style={{ fontSize: 'clamp(28px,3.6vw,48px)' }}>Want to talk it through?</h2>
          <div className="btn-row" style={{ gap: 12 }}>
            <Link href="/contact" className="btn btn--coral btn--md on-dark">
              Contact us →
            </Link>
            <Link href="/services" className="btn btn--outline-light btn--md">
              Explore services
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
