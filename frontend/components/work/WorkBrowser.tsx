'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ErrorPanel } from '@/components/ui/States';
import { qs } from '@/lib/api';
import type { WorkList } from '@/lib/types';
import { useApi } from '@/lib/use-api';
import { WorkCard } from './WorkCard';

export function WorkBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cat = params.get('cat') || 'all';
  const { data, error, loading, reload } = useApi<WorkList>(`/work${qs({ cat: cat === 'all' ? undefined : cat })}`, { keepPrevious: true });

  const setCat = (c: string) => router.replace(c === 'all' ? pathname : `${pathname}?cat=${c}`, { scroll: false });

  const firstLoad = loading && !data;
  const activeCat = data?.activeCat ?? 'all';
  const items = data?.items ?? [];

  return (
    <>
      {data && data.filters.length > 0 && (
        <div className="filter-bar">
          <div role="group" aria-label="Filter work by service" className="chip-group">
            {data.filters.map((f) => (
              <button key={f.slug} type="button" className="chip" aria-pressed={activeCat === f.slug} onClick={() => setCat(f.slug)}>
                {f.name}
                <span className="chip__count">{f.count}</span>
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mono" style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            {loading ? 'Updating…' : `${items.length} ${items.length === 1 ? 'project' : 'projects'}`}
          </p>
        </div>
      )}

      {firstLoad && (
        <div aria-busy="true" aria-label="Loading work" style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 28 }}>
          <div className="skeleton" style={{ flex: '2 1 520px', aspectRatio: '16/10' }} />
          <div className="skeleton" style={{ flex: '1 1 300px', aspectRatio: '4/5' }} />
        </div>
      )}

      {error && !data && <ErrorPanel message={error.message} onRetry={reload} />}
      {error && data && <ErrorPanel message={error.message} onRetry={reload} style={{ marginTop: 24 }} />}

      {data && items.length > 0 && (
        <div className="work-grid" style={{ marginTop: 48, opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }} aria-busy={loading}>
          {items.map((w) => (
            <WorkCard key={w.slug} w={w} variant="light" />
          ))}
        </div>
      )}

      {data && items.length === 0 && !loading && (
        <div className="empty-panel">
          <div aria-hidden="true" className="circle rel clip" style={{ width: 96, height: 96, border: '1.5px solid var(--ink)', flex: 'none' }}>
            <span className="deco" style={{ left: 40, top: -20, width: 90, height: 90, background: 'var(--violet)' }} />
          </div>
          <div style={{ flex: '1 1 320px' }}>
            <h2>{data.total === 0 ? 'Case studies are on their way.' : 'No projects match this filter.'}</h2>
            <p style={{ margin: '0 0 20px', fontSize: 16, lineHeight: 1.6, color: 'var(--muted)', maxWidth: 520 }}>
              {data.total === 0
                ? 'Approved work will be published here soon. If you’d like to see relevant examples, get in touch and we’ll talk you through them.'
                : 'Try another service, or reset the filters to see everything.'}
            </p>
            <div className="btn-row">
              {activeCat !== 'all' && (
                <button type="button" className="btn btn--outline btn--sm" style={{ background: 'var(--white)' }} onClick={() => setCat('all')}>
                  Reset filters
                </button>
              )}
              <Link href="/contact" className="link-plain" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48 }}>
                Talk to us about your project →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
