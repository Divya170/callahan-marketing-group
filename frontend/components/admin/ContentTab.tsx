'use client';

import { useCallback, useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, qs } from '@/lib/api';
import { fmtDateTime } from '@/lib/format';
import type { ContentRow, ContentStatus } from '@/lib/types';
import { useAdmin } from './admin-context';
import { ArticleEditor } from './ArticleEditor';
import { CaseStudyEditor } from './CaseStudyEditor';
import { ConfirmDialog } from './ConfirmDialog';

type Editing = { type: 'work' | 'article'; id: number | null } | null;

export function ContentTab() {
  const { notify, handleError } = useAdmin();
  const [type, setType] = useState<'all' | 'work' | 'article'>('all');
  const [status, setStatus] = useState<'all' | ContentStatus>('all');
  const [q, setQ] = useState('');
  const [data, setData] = useState<{ items: ContentRow[]; counts: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<ContentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api(`/admin/content${qs({ type: type === 'all' ? undefined : type, status: status === 'all' ? undefined : status, q: q.trim() })}`));
    } catch (e) {
      setError(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [type, status, q, handleError]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const base = (r: ContentRow) => (r.type === 'work' ? '/admin/work' : '/admin/articles');

  const changeStatus = async (r: ContentRow, s: ContentStatus) => {
    const key = `${r.type}:${r.id}`;
    setBusyKey(key);
    try {
      await api(`${base(r)}/${r.id}/status`, { method: 'PATCH', json: { status: s } });
      notify('Content status saved.');
      await load();
    } catch (e) {
      handleError(e);
    } finally {
      setBusyKey(null);
    }
  };

  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`${base(toDelete)}/${toDelete.id}`, { method: 'DELETE' });
      notify(`“${toDelete.title}” deleted.`);
      setToDelete(null);
      load();
    } catch (e) {
      handleError(e);
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    const close = (changed: boolean) => {
      setEditing(null);
      if (changed) load();
    };
    return editing.type === 'work' ? <CaseStudyEditor id={editing.id} onClose={close} /> : <ArticleEditor id={editing.id} onClose={close} />;
  }

  return (
    <>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', flex: '1 1 520px' }}>
          <div className="field" style={{ flex: '1 1 220px' }}>
            <label htmlFor="c-q">Search</label>
            <input id="c-q" type="search" className="input input--sm" placeholder="Title, category or path" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="field" style={{ flex: '0 1 170px' }}>
            <label htmlFor="c-type">Type</label>
            <select id="c-type" className="select select--sm" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="all">All content</option>
              <option value="work">Case studies</option>
              <option value="article">Articles</option>
            </select>
          </div>
          <div className="field" style={{ flex: '0 1 170px' }}>
            <label htmlFor="c-status">Status</label>
            <select id="c-status" className="select select--sm" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="all">All statuses{data ? ` (${data.counts.all})` : ''}</option>
              <option value="draft">Draft{data ? ` (${data.counts.draft})` : ''}</option>
              <option value="published">Published{data ? ` (${data.counts.published})` : ''}</option>
              <option value="archived">Archived{data ? ` (${data.counts.archived})` : ''}</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="small-btn small-btn--primary" style={{ minHeight: 44 }} onClick={() => setEditing({ type: 'work', id: null })}>
            + New case study
          </button>
          <button type="button" className="small-btn small-btn--primary" style={{ minHeight: 44 }} onClick={() => setEditing({ type: 'article', id: null })}>
            + New article
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span>Only “Published” items appear on the public site. Drafts are visible in preview mode with a label; archived items are hidden everywhere.</span>
          {loading && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Spinner size={12} /> Loading…
            </span>
          )}
        </div>

        {error && !data && (
          <div style={{ padding: 20 }}>
            <p role="alert" className="field-error" style={{ display: 'block', marginBottom: 12 }}>
              {error}
            </p>
            <button type="button" className="small-btn" onClick={load}>
              Try again
            </button>
          </div>
        )}

        {data && data.items.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 15 }}>
            {data.counts.all === 0 ? 'No content yet. Create a case study or an article to get started.' : 'Nothing matches these filters.'}
          </div>
        )}

        {data?.items.map((r) => {
          const key = `${r.type}:${r.id}`;
          return (
            <div key={key} className="content-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 260px', minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{r.title}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {r.typeLabel} · {r.meta} · /{r.path} · updated {fmtDateTime(r.updatedAt)}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span className={`badge badge--${r.status}`} aria-hidden="true">
                  {r.status}
                </span>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                  <span className="sr-only">Status for {r.title}</span>
                  <select className="select select--sm" style={{ minHeight: 40, width: 'auto' }} value={r.status} disabled={busyKey === key} onChange={(e) => changeStatus(r, e.target.value as ContentStatus)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                {busyKey === key && <Spinner size={14} />}
                <button type="button" className="small-btn" onClick={() => setEditing({ type: r.type, id: r.id })}>
                  Edit
                </button>
                {r.status !== 'archived' && (
                  <a className="small-btn" href={`/${r.path}`} target="_blank" rel="noopener noreferrer">
                    View ↗
                  </a>
                )}
                <button type="button" className="small-btn small-btn--danger" onClick={() => setToDelete(r)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toDelete && (
        <ConfirmDialog
          title={`Delete this ${toDelete.type === 'work' ? 'case study' : 'article'}?`}
          body={`“${toDelete.title}” will be permanently removed from the site and the database. Consider archiving it instead if you might need it later.`}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={doDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
