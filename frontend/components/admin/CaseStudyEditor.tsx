'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { AdminCaseStudy, ServiceItem, WorkLayout } from '@/lib/types';
import { useAdmin } from './admin-context';
import { AccentPicker, EditorFrame, FieldError, StatusSelect } from './EditorFrame';

interface Form {
  title: string;
  slug: string;
  subtitle: string;
  serviceSlug: string;
  client: string;
  context: string;
  objectives: string;
  approach: string;
  deliverables: string;
  results: string;
  layout: WorkLayout;
  accent: string;
  status: string;
  sortOrder: string;
}

const EMPTY: Form = {
  title: '',
  slug: '',
  subtitle: '',
  serviceSlug: '',
  client: '',
  context: '',
  objectives: '',
  approach: '',
  deliverables: '',
  results: '',
  layout: 'landscape',
  accent: '#6941C6',
  status: 'draft',
  sortOrder: '',
};

const LAYOUTS: { value: WorkLayout; label: string }[] = [
  { value: 'landscape', label: 'Wide (16:10)' },
  { value: 'portrait', label: 'Tall (4:5)' },
  { value: 'square', label: 'Square (1:1)' },
];

const toForm = (w: AdminCaseStudy): Form => ({
  title: w.title,
  slug: w.slug,
  subtitle: w.subtitle,
  serviceSlug: w.serviceSlug,
  client: w.client,
  context: w.context,
  objectives: w.objectives,
  approach: w.approach,
  deliverables: w.deliverables.join('\n'),
  results: w.results,
  layout: w.layout,
  accent: w.accent,
  status: w.status,
  sortOrder: String(w.sortOrder),
});

export function CaseStudyEditor({ id, onClose }: { id: number | null; onClose: (changed: boolean) => void }) {
  const { notify, handleError } = useAdmin();
  const [currentId, setCurrentId] = useState<number | null>(id);
  const [form, setForm] = useState<Form>(EMPTY);
  const [initial, setInitial] = useState<Form>(EMPTY);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState<{ href: string | null; label: string } | null>(null);
  const [changed, setChanged] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [svc, w] = await Promise.all([api<ServiceItem[]>('/services'), currentId ? api<AdminCaseStudy>(`/admin/work/${currentId}`) : Promise.resolve(null)]);
      setServices(svc);
      const f = w ? toForm(w) : { ...EMPTY, serviceSlug: svc[0]?.slug || '' };
      setForm(f);
      setInitial(f);
    } catch (e) {
      setLoadError(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [currentId, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = async () => {
    setSaving(true);
    setFormError('');
    setErrors({});
    const body = {
      ...form,
      slug: form.slug.trim() || undefined,
      deliverables: form.deliverables
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean),
      sortOrder: form.sortOrder.trim() === '' ? undefined : Number(form.sortOrder),
    };
    try {
      const w = await api<AdminCaseStudy>(currentId ? `/admin/work/${currentId}` : '/admin/work', { method: currentId ? 'PUT' : 'POST', json: body });
      const f = toForm(w);
      setCurrentId(w.id);
      setForm(f);
      setInitial(f);
      setChanged(true);
      setSaved({ href: w.status === 'archived' ? null : `/work/${w.slug}`, label: currentId ? 'Case study updated.' : 'Case study created.' });
      notify(`“${w.title}” saved.`);
    } catch (e) {
      const ae = e as ApiError;
      if (ae.errors) {
        setErrors(ae.errors);
        setFormError(ae.message);
        const first = Object.keys(ae.errors)[0];
        setTimeout(() => document.getElementById(`cs-${first}`)?.focus(), 20);
      } else setFormError(handleError(e));
    } finally {
      setSaving(false);
    }
  };

  const text = (k: keyof Form, label: string, opts: { required?: boolean; hint?: string; max?: number; area?: boolean; rows?: number; span?: boolean; placeholder?: string } = {}) => (
    <div className={`field${opts.span ? ' span-all' : ''}`}>
      <label htmlFor={`cs-${k}`} className="label">
        {label} {opts.required ? <span aria-hidden="true" className="req">*</span> : <span className="opt">(optional)</span>}
      </label>
      {opts.hint && (
        <p id={`cs-${k}-hint`} className="hint" style={{ fontSize: 13 }}>
          {opts.hint}
        </p>
      )}
      {opts.area ? (
        <textarea
          id={`cs-${k}`}
          className="textarea"
          rows={opts.rows || 4}
          style={{ minHeight: 0 }}
          maxLength={opts.max}
          value={form[k]}
          onChange={(e) => set(k, e.target.value)}
          aria-invalid={!!errors[k]}
          aria-describedby={`${opts.hint ? `cs-${k}-hint ` : ''}cs-${k}-e`}
          placeholder={opts.placeholder}
        />
      ) : (
        <input
          id={`cs-${k}`}
          className="input"
          maxLength={opts.max}
          value={form[k]}
          onChange={(e) => set(k, e.target.value)}
          aria-invalid={!!errors[k]}
          aria-describedby={`${opts.hint ? `cs-${k}-hint ` : ''}cs-${k}-e`}
          placeholder={opts.placeholder}
        />
      )}
      <FieldError id={`cs-${k}-e`} msg={errors[k]} />
    </div>
  );

  return (
    <EditorFrame
      title={currentId ? `Edit case study` : 'New case study'}
      loading={loading}
      loadError={loadError}
      saving={saving}
      dirty={dirty}
      formError={formError}
      saved={saved}
      changed={changed}
      onSubmit={submit}
      onClose={onClose}
      onKeepEditing={() => setSaved(null)}
      onRetryLoad={load}
    >
      <div className="editor-grid">
        {text('title', 'Title', { required: true, max: 140 })}
        {text('slug', 'URL slug', { max: 80, hint: 'Leave empty to generate from the title. Lowercase letters, numbers and hyphens.', placeholder: 'concept-study-07' })}
        {text('subtitle', 'Summary', { required: true, max: 240, span: true, hint: 'One line shown on cards and under the title.' })}
        <div className="field">
          <label htmlFor="cs-serviceSlug" className="label">
            Service <span aria-hidden="true" className="req">*</span>
          </label>
          <select id="cs-serviceSlug" className="select" value={form.serviceSlug} onChange={(e) => set('serviceSlug', e.target.value)} aria-invalid={!!errors.serviceSlug} aria-describedby="cs-serviceSlug-e">
            <option value="">Choose a service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.longName || s.name}
              </option>
            ))}
          </select>
          <FieldError id="cs-serviceSlug-e" msg={errors.serviceSlug} />
        </div>
        {text('client', 'Client / industry', { max: 160, hint: 'Shown once published. Drafts display “concept study”.' })}
        {text('context', 'Context', { required: true, area: true, rows: 3, max: 4000, span: true })}
        {text('objectives', 'Objectives', { required: true, area: true, rows: 3, max: 4000 })}
        {text('approach', 'Approach', { required: true, area: true, rows: 3, max: 4000 })}
        {text('deliverables', 'Deliverables', { area: true, rows: 4, hint: 'One per line (up to 12).' })}
        {text('results', 'Results', { area: true, rows: 4, max: 4000, hint: 'Only include outcomes with approved evidence. Leave empty to show the standard note.' })}

        <div className="field">
          <span className="label" id="cs-layout-l">
            Card layout
          </span>
          <div role="radiogroup" aria-labelledby="cs-layout-l" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LAYOUTS.map((l) => (
              <label key={l.value} className="radio-pill" style={{ minHeight: 44 }}>
                <input type="radio" name="cs-layout" checked={form.layout === l.value} onChange={() => set('layout', l.value)} />
                {l.label}
              </label>
            ))}
          </div>
        </div>
        <AccentPicker value={form.accent} onChange={(v) => set('accent', v)} />
        <StatusSelect value={form.status} onChange={(v) => set('status', v)} error={errors.status} />
        <div className="field">
          <label htmlFor="cs-sortOrder" className="label">
            Display order <span className="opt">(optional)</span>
          </label>
          <input id="cs-sortOrder" className="input" type="number" min={0} max={9999} value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} aria-describedby="cs-sortOrder-e" />
          <FieldError id="cs-sortOrder-e" msg={errors.sortOrder} />
        </div>
      </div>
    </EditorFrame>
  );
}
