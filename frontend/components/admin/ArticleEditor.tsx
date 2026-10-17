'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { AdminArticle } from '@/lib/types';
import { useAdmin } from './admin-context';
import { AccentPicker, EditorFrame, FieldError, StatusSelect } from './EditorFrame';

interface Form {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  accent: string;
  bodyText: string;
  status: string;
  publishedAt: string;
}

const EMPTY: Form = { title: '', slug: '', excerpt: '', category: '', accent: '#6941C6', bodyText: '', status: 'draft', publishedAt: '' };

const toForm = (a: AdminArticle): Form => ({
  title: a.title,
  slug: a.slug,
  excerpt: a.excerpt,
  category: a.category,
  accent: a.accent,
  bodyText: a.bodyText,
  status: a.status,
  publishedAt: a.publishedAt ? a.publishedAt.slice(0, 10) : '',
});

export function ArticleEditor({ id, onClose }: { id: number | null; onClose: (changed: boolean) => void }) {
  const { notify, handleError } = useAdmin();
  const [currentId, setCurrentId] = useState<number | null>(id);
  const [form, setForm] = useState<Form>(EMPTY);
  const [initial, setInitial] = useState<Form>(EMPTY);
  const [categories, setCategories] = useState<string[]>([]);
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
      const [all, a] = await Promise.all([api<AdminArticle[]>('/admin/articles'), currentId ? api<AdminArticle>(`/admin/articles/${currentId}`) : Promise.resolve(null)]);
      setCategories([...new Set(all.map((x) => x.category))]);
      const f = a ? toForm(a) : EMPTY;
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
      publishedAt: form.publishedAt ? new Date(form.publishedAt + 'T12:00:00').toISOString() : null,
    };
    try {
      const a = await api<AdminArticle>(currentId ? `/admin/articles/${currentId}` : '/admin/articles', { method: currentId ? 'PUT' : 'POST', json: body });
      const f = toForm(a);
      setCurrentId(a.id);
      setForm(f);
      setInitial(f);
      setChanged(true);
      setSaved({ href: a.status === 'archived' ? null : `/insights/${a.slug}`, label: currentId ? 'Article updated.' : 'Article created.' });
      notify(`“${a.title}” saved.`);
    } catch (e) {
      const ae = e as ApiError;
      if (ae.errors) {
        setErrors(ae.errors);
        setFormError(ae.message);
        const first = Object.keys(ae.errors)[0];
        setTimeout(() => document.getElementById(`ar-${first}`)?.focus(), 20);
      } else setFormError(handleError(e));
    } finally {
      setSaving(false);
    }
  };

  const input = (k: keyof Form, label: string, opts: { required?: boolean; hint?: string; max?: number; span?: boolean; list?: string; type?: string } = {}) => (
    <div className={`field${opts.span ? ' span-all' : ''}`}>
      <label htmlFor={`ar-${k}`} className="label">
        {label} {opts.required ? <span aria-hidden="true" className="req">*</span> : <span className="opt">(optional)</span>}
      </label>
      {opts.hint && (
        <p id={`ar-${k}-hint`} className="hint" style={{ fontSize: 13 }}>
          {opts.hint}
        </p>
      )}
      <input
        id={`ar-${k}`}
        className="input"
        type={opts.type || 'text'}
        maxLength={opts.max}
        list={opts.list}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={`${opts.hint ? `ar-${k}-hint ` : ''}ar-${k}-e`}
      />
      <FieldError id={`ar-${k}-e`} msg={errors[k]} />
    </div>
  );

  return (
    <EditorFrame
      title={currentId ? 'Edit article' : 'New article'}
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
        {input('title', 'Title', { required: true, max: 180, span: true })}
        {input('slug', 'URL slug', { max: 80, hint: 'Leave empty to generate from the title.' })}
        {input('category', 'Category', { required: true, max: 60, list: 'ar-cats', hint: 'Used for the Insights filters, e.g. SEO, Branding.' })}
        <datalist id="ar-cats">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <div className="field span-all">
          <label htmlFor="ar-excerpt" className="label">
            Excerpt <span aria-hidden="true" className="req">*</span>
          </label>
          <textarea id="ar-excerpt" className="textarea" rows={2} style={{ minHeight: 0 }} maxLength={400} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} aria-invalid={!!errors.excerpt} aria-describedby="ar-excerpt-e" />
          <FieldError id="ar-excerpt-e" msg={errors.excerpt} />
        </div>
        <div className="field span-all">
          <label htmlFor="ar-bodyText" className="label">
            Body <span aria-hidden="true" className="req">*</span>
          </label>
          <p id="ar-body-hint" className="hint" style={{ fontSize: 13 }}>
            Separate paragraphs with a blank line. Start a line with <code className="mono">## </code> for a heading and <code className="mono">- </code> for a list item.
          </p>
          <textarea
            id="ar-bodyText"
            className="textarea mono"
            rows={14}
            style={{ fontSize: 14 }}
            value={form.bodyText}
            onChange={(e) => set('bodyText', e.target.value)}
            aria-invalid={!!errors.bodyText}
            aria-describedby="ar-body-hint ar-bodyText-e"
          />
          <FieldError id="ar-bodyText-e" msg={errors.bodyText} />
        </div>
        <AccentPicker value={form.accent} onChange={(v) => set('accent', v)} />
        <StatusSelect value={form.status} onChange={(v) => set('status', v)} error={errors.status} />
        {input('publishedAt', 'Publish date', { type: 'date', hint: 'Set automatically when first published; you can change it.' })}
      </div>
    </EditorFrame>
  );
}
