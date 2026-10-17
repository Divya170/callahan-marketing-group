'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';
import type { AdminSettings } from '@/lib/types';
import { useAdmin } from './admin-context';
import { FieldError } from './EditorFrame';

export function SettingsTab() {
  const { notify, handleError } = useAdmin();
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [initial, setInitial] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const s = await api<AdminSettings>('/admin/settings');
      setForm(s);
      setInitial(s);
    } catch (e) {
      setLoadError(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setErrors({});
    setFormError('');
    try {
      const s = await api<AdminSettings>('/admin/settings', { method: 'PUT', json: form });
      setForm(s);
      setInitial(s);
      notify('Settings saved. The public site uses them immediately.');
    } catch (ex) {
      const ae = ex as ApiError;
      if (ae.errors) {
        setErrors(ae.errors);
        setFormError(ae.message);
      } else setFormError(handleError(ex));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)' }}>
        <Spinner size={14} /> Loading settings…
      </p>
    );
  if (loadError || !form)
    return (
      <div>
        <p role="alert" className="field-error" style={{ display: 'block', marginBottom: 12 }}>
          {loadError || 'Settings could not be loaded.'}
        </p>
        <button type="button" className="small-btn" onClick={load}>
          Try again
        </button>
      </div>
    );

  const text = (k: 'bookingUrl' | 'contactName' | 'contactEmail' | 'contactPhone' | 'addressLine1' | 'addressLine2', label: string, hint?: string, type = 'text') => (
    <div className="field">
      <label htmlFor={`st-${k}`} className="label">
        {label}
      </label>
      {hint && (
        <p id={`st-${k}-h`} className="hint" style={{ fontSize: 13 }}>
          {hint}
        </p>
      )}
      <input
        id={`st-${k}`}
        className="input"
        type={type}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={`${hint ? `st-${k}-h ` : ''}st-${k}-e`}
      />
      <FieldError id={`st-${k}-e`} msg={errors[k]} />
    </div>
  );

  return (
    <form onSubmit={save} noValidate className="panel" style={{ padding: 'clamp(20px,3vw,36px)', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {formError && (
        <div role="alert" className="alert-error">
          {formError}
        </div>
      )}

      <fieldset className="fs">
        <legend className="legend">Content</legend>
        <div role="radiogroup" aria-label="Content mode" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {(
            [
              ['preview', 'Preview', 'Drafts are shown with labels; a preview banner appears.'],
              ['production', 'Production', 'Only published content is public.'],
            ] as const
          ).map(([v, label, hint]) => (
            <label key={v} className="radio-pill" style={{ minHeight: 56, borderRadius: 12, alignItems: 'flex-start', padding: '12px 18px', flex: '1 1 260px' }}>
              <input type="radio" name="contentMode" checked={form.contentMode === v} onChange={() => set('contentMode', v)} style={{ marginTop: 2 }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong>{label}</strong>
                <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--muted)' }}>{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="fs fs-divider">
        <legend className="legend">Integrations</legend>
        {text('bookingUrl', 'Strategy call booking link', 'An https:// scheduling page (e.g. Calendly). Leave empty to route “Request a Strategy Call” to the contact form.', 'url')}
      </fieldset>

      <fieldset className="fs fs-divider">
        <legend className="legend">Contact details</legend>
        <div className="editor-grid">
          {text('contactName', 'Point of contact')}
          {text('contactEmail', 'Email', undefined, 'email')}
          {text('contactPhone', 'Phone', undefined, 'tel')}
          {text('addressLine1', 'Street address')}
          {text('addressLine2', 'City, state, ZIP')}
        </div>
      </fieldset>

      <fieldset className="fs fs-divider">
        <legend className="legend">Testing</legend>
        <label className="toggle">
          <input type="checkbox" checked={form.simulateServerError} onChange={(e) => set('simulateServerError', e.target.checked)} />
          <span>
            Simulate a server error on enquiry submissions
            <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)' }}>Use to check the contact form’s error state. Turn off before going live.</span>
          </span>
        </label>
      </fieldset>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <button type="button" className="small-btn" disabled={!dirty || saving} onClick={() => initial && (setForm(initial), setErrors({}), setFormError(''))}>
          Reset
        </button>
        <button type="submit" className="small-btn small-btn--primary" disabled={!dirty || saving} style={{ minHeight: 48, padding: '0 20px' }}>
          {saving && <Spinner size={14} color="currentColor" />}
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
