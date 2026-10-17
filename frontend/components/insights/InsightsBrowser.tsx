'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ErrorPanel } from '@/components/ui/States';
import { qs } from '@/lib/api';
import { articleDate } from '@/lib/format';
import type { ArticleList } from '@/lib/types';
import { useApi } from '@/lib/use-api';

export function InsightsBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cat = params.get('cat') || 'all';
  const { data, error, loading, reload } = useApi<ArticleList>(`/articles${qs({ cat: cat === 'all' ? undefined : cat })}`, { keepPrevious: true });

  const setCat = (c: string) => router.replace(c === 'all' ? pathname : `${pathname}?cat=${encodeURIComponent(c)}`, { scroll: false });
  const items = data?.items ?? [];
  const featured = items.length > 1;

  return (
    <>
      {loading && !data && (
        <div aria-busy="true" aria-label="Loading articles" style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 28 }}>
          <div className="skeleton" style={{ flex: '2 1 520px', height: 320 }} />
          <div className="skeleton" style={{ flex: '1 1 280px', height: 320 }} />
        </div>
      )}

      {error && <ErrorPanel message={error.message} onRetry={reload} />}

      {data && data.total > 0 && (
        <>
          {data.categories.length > 0 && (
            <div role="group" aria-label="Filter articles by category" className="chip-group" style={{ marginTop: 28 }}>
              {['all', ...data.categories].map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={data.activeCat === c} onClick={() => setCat(c)}>
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          )}
          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: '48px clamp(20px,3vw,40px)', opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }} aria-busy={loading}>
            {items.map((a, i) => {
              const big = i === 0 && featured;
              return (
                <Link key={a.slug} href={`/insights/${a.slug}`} className="article-card" style={{ flex: big ? '2 1 560px' : '1 1 300px' }}>
                  <span aria-hidden="true" className="hatch rel clip" style={{ display: 'block', aspectRatio: big ? '16/9' : '4/3' }}>
                    <span className="deco" style={{ left: -40, bottom: -40, width: 140, height: 140, background: a.accent }} />
                  </span>
                  <span className="article-card__meta">
                    <span className="c-violet">{a.category}</span>
                    <span>{articleDate(a)}</span>
                    {a.isDraft && <span className="tag-dark">Sample · not published</span>}
                  </span>
                  <span className="article-card__title" style={{ fontSize: big ? 'clamp(30px,3.4vw,48px)' : 'clamp(22px,2vw,28px)' }}>
                    {a.title}
                  </span>
                  <span style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--muted)', maxWidth: 560 }}>{a.excerpt}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {data && data.total === 0 && (
        <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', padding: 'clamp(40px,6vw,80px) 0' }}>
          <div aria-hidden="true" className="circle rel clip" style={{ width: 120, height: 120, background: 'var(--blush)', flex: 'none' }}>
            <span className="deco" style={{ right: -30, bottom: -30, width: 80, height: 80, background: 'var(--coral)' }} />
          </div>
          <div style={{ flex: '1 1 320px', maxWidth: 560 }}>
            <h2 className="display" style={{ margin: '0 0 10px', fontSize: 30, letterSpacing: '-0.025em' }}>
              The first articles are on their way.
            </h2>
            <p className="body" style={{ margin: '0 0 18px', lineHeight: 1.6 }}>
              Nothing has been published yet. In the meantime, explore our services or get in touch.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              <Link href="/services" className="link-plain">
                Explore services →
              </Link>
              <Link href="/contact" className="link-plain">
                Contact us →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
