'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, qs } from '@/lib/api';
import { fmtDateTime } from '@/lib/format';
import type { LeadDetail, LeadList, LeadStatus } from '@/lib/types';
import { useAdmin } from './admin-context';
import { ConfirmDialog } from './ConfirmDialog';

const STATUS_FILTERS: { value: 'all' | LeadStatus; label: string }[] = [
  { value: 'all', label: 'All leads' },
  { value: 'new', label: 'New' },
  { value: 'review', label: 'In Review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export function LeadsTab() {
  const { notify, handleError } = useAdmin();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState<'all' | LeadStatus>('all');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<LeadList | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [sel, setSel] = useState<LeadDetail | null>(null);
  const [selLoading, setSelLoading] = useState(false);
  const [statusBusy, setStatusBusy] = useState<LeadStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [notesBusy, setNotesBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const loadList = useCallback(async () => {
    const id = ++seq.current;
    setListLoading(true);
    setListError('');
    try {
      const data = await api<LeadList>(`/admin/leads${qs({ q: debouncedQ, status, page })}`);
      if (id !== seq.current) return;
      setList(data);
      if (data.page !== page) setPage(data.page);
    } catch (e) {
      if (id === seq.current) setListError(handleError(e));
    } finally {
      if (id === seq.current) setListLoading(false);
    }
  }, [debouncedQ, status, page, handleError]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openLead = useCallback(
    async (id: string) => {
      setSelId(id);
      setSelLoading(true);
      notify('');
      try {
        const d = await api<LeadDetail>(`/admin/leads/${encodeURIComponent(id)}`);
        setSel(d);
        setNotes(d.notes || '');
        if (window.innerWidth < 900) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      } catch (e) {
        handleError(e);
        setSel(null);
        setSelId(null);
      } finally {
        setSelLoading(false);
      }
    },
    [handleError, notify],
  );

  const setLeadStatus = async (s: LeadStatus) => {
    if (!sel || sel.status === s) return;
    setStatusBusy(s);
    try {
      const d = await api<LeadDetail>(`/admin/leads/${encodeURIComponent(sel.id)}/status`, { method: 'PATCH', json: { status: s } });
      setSel(d);
      notify(`Status updated to ${d.statusLabel}.`);
      loadList();
    } catch (e) {
      handleError(e);
    } finally {
      setStatusBusy(null);
    }
  };

  const saveNotes = async () => {
    if (!sel) return;
    setNotesBusy(true);
    try {
      const d = await api<LeadDetail>(`/admin/leads/${encodeURIComponent(sel.id)}/notes`, { method: 'PATCH', json: { notes } });
      setSel(d);
      setNotes(d.notes);
      notify('Notes saved.');
    } catch (e) {
      handleError(e);
    } finally {
      setNotesBusy(false);
    }
  };

  const deleteLead = async () => {
    if (!sel) return;
    setDeleting(true);
    try {
      await api(`/admin/leads/${encodeURIComponent(sel.id)}`, { method: 'DELETE' });
      notify(`Lead ${sel.id} deleted.`);
      setSel(null);
      setSelId(null);
      setConfirmDelete(false);
      loadList();
    } catch (e) {
      handleError(e);
    } finally {
      setDeleting(false);
    }
  };

  const counts = list?.counts;
  const notesDirty = sel ? notes.trim() !== (sel.notes || '').trim() : false;
  const exportHref = `/api/admin/leads/export${qs({ q: debouncedQ, status: status === 'all' ? undefined : status })}`;

  return (
    <>
      {counts && (
        <div className="stat-row" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className="stat"
              aria-pressed={status === f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
            >
              <span className="stat__n">{counts[f.value] ?? 0}</span>
              <span className="stat__k">{f.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="toolbar">
        <div className="field" style={{ flex: '1 1 260px' }}>
          <label htmlFor="a-q">Search</label>
          <input
            id="a-q"
            type="search"
            className="input input--sm"
            placeholder="Name, company or email"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="field" style={{ flex: '0 1 200px' }}>
          <label htmlFor="a-s">Status</label>
          <select
            id="a-s"
            className="select select--sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'all' | LeadStatus);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {STATUS_FILTERS.slice(1).map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <a href={exportHref} className="small-btn" style={{ minHeight: 44 }} download>
          ⤓ Export CSV
        </a>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div className="panel" style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div className="panel-head">
            <span aria-live="polite">
              {listLoading ? (
                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <Spinner size={12} /> Loading…
                </span>
              ) : (
                `${list?.total ?? 0} ${list?.total === 1 ? 'lead' : 'leads'}`
              )}
            </span>
            <span>Newest first</span>
          </div>

          {listError && !list && (
            <div style={{ padding: 20 }}>
              <p role="alert" className="field-error" style={{ display: 'block', marginBottom: 12 }}>
                {listError}
              </p>
              <button type="button" className="small-btn" onClick={loadList}>
                Try again
              </button>
            </div>
          )}

          {list && list.items.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 15 }}>
              {list.counts.all === 0 ? 'No enquiries yet. Submitted project briefs will appear here.' : 'No leads match your search.'}
              {list.counts.all > 0 && (q || status !== 'all') && (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="small-btn"
                    onClick={() => {
                      setQ('');
                      setStatus('all');
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ opacity: listLoading && list ? 0.6 : 1, transition: 'opacity .2s' }}>
            {list?.items.map((l) => (
              <button key={l.id} type="button" className="lead-row" aria-pressed={selId === l.id} onClick={() => openLead(l.id)}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: '1 1 200px' }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    {l.name} · {l.company}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {l.serviceName} · {fmtDateTime(l.createdAt)}
                  </span>
                </span>
                <span className={`badge badge--${l.status}`}>{l.statusLabel}</span>
              </button>
            ))}
          </div>

          {list && list.pages > 1 && (
            <nav aria-label="Lead pages" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', fontSize: 14 }}>
              <button type="button" className="small-btn" disabled={list.page <= 1} onClick={() => setPage(list.page - 1)}>
                ← Prev
              </button>
              <span>
                Page {list.page} of {list.pages}
              </span>
              <button type="button" className="small-btn" disabled={list.page >= list.pages} onClick={() => setPage(list.page + 1)}>
                Next →
              </button>
            </nav>
          )}
        </div>

        <div ref={detailRef} className="panel" style={{ flex: '1 1 380px', minWidth: 0, padding: 24, scrollMarginTop: 16 }}>
          {!selId && <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>Select a lead to see the full enquiry.</p>}
          {selId && selLoading && !sel && (
            <p style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)' }}>
              <Spinner size={14} /> Loading enquiry…
            </p>
          )}
          {sel && (
            <div style={{ opacity: selLoading ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <p className="mono" style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--muted)' }}>
                  {sel.id}
                </p>
                <button type="button" className="small-btn small-btn--danger" onClick={() => setConfirmDelete(true)}>
                  Delete
                </button>
              </div>
              <h2 className="display" style={{ margin: '0 0 4px', fontSize: 28, letterSpacing: '-0.02em' }}>
                {sel.name}
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: 15, color: 'var(--muted)' }}>
                {sel.company} · received {fmtDateTime(sel.createdAt)}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }} id="sel-status">
                  Status
                </span>
                <div role="group" aria-labelledby="sel-status" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {STATUS_FILTERS.slice(1).map((s) => (
                    <button key={s.value} type="button" className="pill-btn" aria-pressed={sel.status === s.value} disabled={!!statusBusy} onClick={() => setLeadStatus(s.value as LeadStatus)}>
                      {statusBusy === s.value ? '…' : s.label}
                    </button>
                  ))}
                </div>
              </div>

              <dl className="detail-dl">
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${sel.email}`}>{sel.email}</a>
                </dd>
                <dt>Phone</dt>
                <dd>{sel.phone ? <a href={`tel:${sel.phone.replace(/[^\d+]/g, '')}`}>{sel.phone}</a> : '—'}</dd>
                <dt>Prefers</dt>
                <dd>{sel.method}</dd>
                <dt>Service</dt>
                <dd>{sel.serviceName}</dd>
                <dt>Website</dt>
                <dd>{sel.website || '—'}</dd>
                <dt>Budget</dt>
                <dd>{sel.budget}</dd>
                <dt>Timeline</dt>
                <dd>{sel.timeline}</dd>
              </dl>

              <h3 style={{ margin: '20px 0 8px', fontSize: 13, fontWeight: 600 }}>Project goals</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'var(--cream)', padding: 14 }}>{sel.goals}</p>

              <div className="field" style={{ marginTop: 20 }}>
                <label htmlFor="lead-notes" style={{ fontSize: 13, fontWeight: 600 }}>
                  Internal notes
                </label>
                <textarea id="lead-notes" className="textarea" style={{ minHeight: 90, fontSize: 15 }} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to the team" />
                <div>
                  <button type="button" className="small-btn small-btn--primary" disabled={!notesDirty || notesBusy} onClick={saveNotes}>
                    {notesBusy && <Spinner size={12} color="currentColor" />}
                    {notesBusy ? 'Saving…' : 'Save notes'}
                  </button>
                </div>
              </div>

              <h3 style={{ margin: '20px 0 8px', fontSize: 13, fontWeight: 600 }}>History</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sel.history.map((h, i) => (
                  <li key={i}>
                    {h.label} · {fmtDateTime(h.at)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && sel && (
        <ConfirmDialog
          title="Delete this lead?"
          body={`${sel.name} (${sel.company}) and its history will be permanently removed. This can’t be undone.`}
          confirmLabel="Delete lead"
          busy={deleting}
          onConfirm={deleteLead}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
