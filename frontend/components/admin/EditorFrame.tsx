'use client';

import { useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { ConfirmDialog } from './ConfirmDialog';

export const ACCENTS = [
  { value: '#6941C6', label: 'Violet' },
  { value: '#FF735F', label: 'Coral' },
  { value: '#865BEE', label: 'Lilac' },
];

export function FieldError({ id, msg }: { id: string; msg?: string }) {
  return (
    <p id={id} className="field-error">
      {msg ? '⚠ ' + msg : ''}
    </p>
  );
}

export function AccentPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <span className="label" id="accent-l">
        Accent colour
      </span>
      <div className="swatches" role="group" aria-labelledby="accent-l">
        {ACCENTS.map((a) => (
          <button key={a.value} type="button" className="swatch" style={{ background: a.value }} aria-pressed={value.toUpperCase() === a.value} aria-label={a.label} onClick={() => onChange(a.value)} />
        ))}
      </div>
    </div>
  );
}

export function StatusSelect({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <div className="field">
      <label htmlFor="ed-status" className="label">
        Status
      </label>
      <select id="ed-status" className="select" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby="ed-status-h">
        <option value="draft">Draft — visible only in preview mode</option>
        <option value="published">Published — live on the site</option>
        <option value="archived">Archived — hidden everywhere</option>
      </select>
      <FieldError id="ed-status-h" msg={error} />
    </div>
  );
}

interface FrameProps {
  title: string;
  loading: boolean;
  loadError: string;
  saving: boolean;
  dirty: boolean;
  formError: string;
  saved: { href: string | null; label: string } | null;
  onSubmit: () => void;
  onClose: (changed: boolean) => void;
  onKeepEditing: () => void;
  onRetryLoad: () => void;
  changed: boolean;
  children: React.ReactNode;
}

/** Shared chrome for the content editors: header, loading/error, save bar, success card, discard guard. */
export function EditorFrame(p: FrameProps) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const back = () => (p.dirty ? setConfirmDiscard(true) : p.onClose(p.changed));

  return (
    <div className="panel" style={{ padding: 'clamp(20px,3vw,36px)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="display" style={{ fontSize: 26, letterSpacing: '-0.02em' }}>
          {p.title}
        </h2>
        <button type="button" className="small-btn" onClick={back}>
          ← Back to content
        </button>
      </div>

      {p.loading && (
        <p style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)' }}>
          <Spinner size={14} /> Loading…
        </p>
      )}

      {p.loadError && (
        <div>
          <p role="alert" className="field-error" style={{ display: 'block', marginBottom: 12 }}>
            {p.loadError}
          </p>
          <button type="button" className="small-btn" onClick={p.onRetryLoad}>
            Try again
          </button>
        </div>
      )}

      {p.saved && (
        <div role="status" tabIndex={-1} ref={(el) => el?.focus()} style={{ outline: 'none', display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 0' }}>
          <div aria-hidden="true" className="success-mark" style={{ width: 56, height: 56, fontSize: 26 }}>
            ✓
          </div>
          <h3 className="display" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
            {p.saved.label}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {p.saved.href && (
              <a href={p.saved.href} target="_blank" rel="noopener noreferrer" className="small-btn small-btn--primary">
                View on site ↗
              </a>
            )}
            <button type="button" className="small-btn" onClick={() => p.onClose(true)}>
              Back to content
            </button>
            <button type="button" className="small-btn" onClick={p.onKeepEditing}>
              Keep editing
            </button>
          </div>
        </div>
      )}

      {!p.loading && !p.loadError && !p.saved && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            p.onSubmit();
          }}
        >
          {p.formError && (
            <div role="alert" className="alert-error" style={{ marginBottom: 20 }}>
              {p.formError}
            </div>
          )}
          {p.children}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" className="small-btn" onClick={back} disabled={p.saving}>
              Cancel
            </button>
            <button type="submit" className="small-btn small-btn--primary" disabled={p.saving} style={{ minHeight: 48, padding: '0 20px' }}>
              {p.saving && <Spinner size={14} color="currentColor" />}
              {p.saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard your changes?"
          body="You have unsaved edits. If you leave now they’ll be lost."
          confirmLabel="Discard changes"
          onConfirm={() => p.onClose(p.changed)}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  );
}
