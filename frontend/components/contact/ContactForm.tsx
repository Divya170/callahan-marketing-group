'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';
import { emptyLeadForm, LEAD_FIELDS, validateLead, type LeadField, type LeadForm } from '@/lib/lead-validation';
import { useSite } from '@/lib/site-context';
import type { LeadOptions } from '@/lib/types';

type Errs = Partial<Record<LeadField, string>>;

export function ContactForm({ options }: { options: LeadOptions }) {
  const { site } = useSite();
  const params = useSearchParams();
  const intentCall = params.get('intent') === 'call';
  const presetService = params.get('service');
  const serviceValues = options.services.map((o) => o.value);

  const [form, setForm] = useState<LeadForm>(() => {
    const f = emptyLeadForm();
    if (presetService && serviceValues.includes(presetService)) f.service = presetService;
    if (intentCall && f.method === 'Email') f.method = 'Either';
    return f;
  });
  const [errs, setErrs] = useState<Errs>({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successId, setSuccessId] = useState('');
  const [liveMsg, setLiveMsg] = useState('');
  const token = useRef<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const fetchToken = useCallback(async () => {
    try {
      token.current = (await api<{ token: string }>('/leads/form-token')).token;
    } catch {
      token.current = null;
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Keep preselection in sync when arriving via a different "Discuss …" link.
  useEffect(() => {
    setForm((f) => {
      let next = f;
      if (presetService && serviceValues.includes(presetService) && f.service !== presetService) next = { ...next, service: presetService };
      if (intentCall && next.method === 'Email') next = { ...next, method: 'Either' };
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetService, intentCall]);

  useEffect(() => {
    if (successId) setTimeout(() => successRef.current?.focus(), 30);
  }, [successId]);

  const setField = (k: keyof LeadForm, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    // Re-validate a field live once it has shown an error, or after a submit attempt.
    // (Fixes clear immediately; new errors only appear on submit.) Changing the contact
    // method re-checks the phone field, which may no longer be required.
    const field: LeadField | null = k === 'method' ? 'phone' : (LEAD_FIELDS as readonly string[]).includes(k) ? (k as LeadField) : null;
    if (!field || (!errs[field] && !touchedSubmit)) return;
    const msg = validateLead(next, serviceValues)[field];
    setErrs((prev) => {
      const out = { ...prev };
      if (!msg) delete out[field];
      else if (out[field]) out[field] = msg;
      return out;
    });
  };

  const focusFirst = (e: Errs) => {
    const first = LEAD_FIELDS.find((k) => e[k]);
    if (first) setTimeout(() => document.getElementById('f-' + first)?.focus(), 20);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    const e = validateLead(form, serviceValues);
    if (Object.keys(e).length) {
      setErrs(e);
      setServerError('');
      setTouchedSubmit(true);
      setLiveMsg('Please fix the highlighted fields.');
      focusFirst(e);
      return;
    }
    setSubmitting(true);
    setServerError('');
    setErrs({});
    setLiveMsg('Sending your enquiry…');
    try {
      if (!token.current) await fetchToken();
      const res = await api<{ id: string }>('/leads', { method: 'POST', json: { ...form, formToken: token.current } });
      setSuccessId(res.id);
      setForm(emptyLeadForm());
      setTouchedSubmit(false);
      setLiveMsg('Your enquiry was received.');
    } catch (err) {
      const ae = err as ApiError;
      if (ae.errors && Object.keys(ae.errors).length) {
        setErrs(ae.errors as Errs);
        setTouchedSubmit(true);
        setLiveMsg('Please fix the highlighted fields.');
        focusFirst(ae.errors as Errs);
      } else {
        setServerError(ae.message);
        setLiveMsg('Your enquiry could not be sent.');
        if (/expired/i.test(ae.message)) fetchToken();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const newBrief = () => {
    setSuccessId('');
    setLiveMsg('');
    setServerError('');
    fetchToken();
  };

  const nErr = Object.keys(errs).length;
  const err = (k: LeadField) => (errs[k] ? '⚠ ' + errs[k] : '');
  const showCallNote = !site.booking.enabled && intentCall && !successId;

  return (
    <div className="contact-card">
      {showCallNote && (
        <div role="note" style={{ marginBottom: 28, padding: '16px 18px', background: 'var(--blush)', fontSize: 15, lineHeight: 1.55, color: 'var(--muted-2)' }}>
          Online booking isn’t set up yet. To request a strategy call, send the brief below and choose “Phone” or “Either” as your preferred contact method — or call us on{' '}
          <a href={site.contact.phoneHref} style={{ fontWeight: 600 }}>
            {site.contact.phone}
          </a>
          .
        </div>
      )}

      {successId ? (
        <div ref={successRef} tabIndex={-1} role="status" style={{ outline: 'none', display: 'flex', flexDirection: 'column', gap: 20, padding: 'clamp(8px,2vw,24px) 0' }}>
          <div aria-hidden="true" className="success-mark">
            ✓
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(30px,3.4vw,44px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Thanks — your enquiry was received.
          </h2>
          <p className="body" style={{ margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
            We’ll review your project brief and get back to you using your preferred contact method. Your reference is{' '}
            <strong className="mono" style={{ color: 'var(--ink)' }}>
              {successId}
            </strong>
            .
          </p>
          <div className="btn-row" style={{ gap: 12, marginTop: 8 }}>
            <Link href="/work" className="btn btn--outline btn--sm">
              View our work
            </Link>
            <button type="button" className="btn btn--link btn--sm" onClick={newBrief}>
              Send another brief
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate aria-describedby="form-note" style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
            <h2 className="display" style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.025em', fontWeight: 700 }}>
              Project brief
            </h2>
            <p id="form-note" style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              <span aria-hidden="true" className="req">
                *
              </span>{' '}
              Required field
            </p>
          </div>

          {serverError && (
            <div role="alert" className="alert-error">
              <strong>We couldn’t send your enquiry.</strong> {serverError}
            </div>
          )}
          {nErr > 1 && (
            <div role="alert" className="alert-soft">
              Please fix the {nErr} fields marked below.
            </div>
          )}

          <div aria-hidden="true" className="honeypot">
            <label htmlFor="f-hp">Leave this field empty</label>
            <input id="f-hp" tabIndex={-1} autoComplete="off" value={form.hp} onChange={(e) => setField('hp', e.target.value)} />
          </div>

          <fieldset className="fs">
            <legend className="legend">01 · About you</legend>
            <div className="field-row">
              <div className="field">
                <label htmlFor="f-name" className="label">
                  Name <span aria-hidden="true" className="req">*</span>
                </label>
                <input id="f-name" className="input" type="text" autoComplete="name" maxLength={100} aria-required="true" aria-invalid={!!errs.name} aria-describedby="e-name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
                <p id="e-name" className="field-error">
                  {err('name')}
                </p>
              </div>
              <div className="field">
                <label htmlFor="f-email" className="label">
                  Business email <span aria-hidden="true" className="req">*</span>
                </label>
                <input id="f-email" className="input" type="email" inputMode="email" autoComplete="email" maxLength={254} aria-required="true" aria-invalid={!!errs.email} aria-describedby="e-email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                <p id="e-email" className="field-error">
                  {err('email')}
                </p>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="f-company" className="label">
                  Company name <span aria-hidden="true" className="req">*</span>
                </label>
                <input id="f-company" className="input" type="text" autoComplete="organization" maxLength={120} aria-required="true" aria-invalid={!!errs.company} aria-describedby="e-company" value={form.company} onChange={(e) => setField('company', e.target.value)} />
                <p id="e-company" className="field-error">
                  {err('company')}
                </p>
              </div>
              <div className="field">
                <label htmlFor="f-website" className="label">
                  Website <span className="opt">(optional)</span>
                </label>
                <input id="f-website" className="input" type="text" inputMode="url" autoComplete="url" maxLength={200} placeholder="example.com" aria-invalid={!!errs.website} aria-describedby="e-website" value={form.website} onChange={(e) => setField('website', e.target.value)} />
                <p id="e-website" className="field-error">
                  {err('website')}
                </p>
              </div>
            </div>
          </fieldset>

          <fieldset className="fs fs-divider">
            <legend className="legend">02 · Your project</legend>
            <div className="field">
              <label htmlFor="f-service" className="label">
                Service interest <span aria-hidden="true" className="req">*</span>
              </label>
              <select id="f-service" className="select" aria-required="true" aria-invalid={!!errs.service} aria-describedby="e-service" value={form.service} onChange={(e) => setField('service', e.target.value)}>
                <option value="">Choose a service</option>
                {options.services.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p id="e-service" className="field-error">
                {err('service')}
              </p>
            </div>
            <div className="field">
              <label htmlFor="f-goals" className="label">
                Project goals and details <span aria-hidden="true" className="req">*</span>
              </label>
              <p id="hint-goals" className="hint">
                What are you trying to achieve, and what’s getting in the way? A few sentences is plenty.
              </p>
              <textarea id="f-goals" className="textarea" rows={6} maxLength={3000} aria-required="true" aria-invalid={!!errs.goals} aria-describedby="hint-goals e-goals" value={form.goals} onChange={(e) => setField('goals', e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <p id="e-goals" className="field-error" style={{ display: 'block' }}>
                  {err('goals')}
                </p>
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {form.goals.length} / 3000
                </span>
              </div>
            </div>
            <div className="field-row">
              <div className="field" style={{ flexBasis: 220 }}>
                <label htmlFor="f-budget" className="label">
                  Estimated budget <span className="opt">(optional)</span>
                </label>
                <select id="f-budget" className="select" aria-describedby="hint-budget" value={form.budget} onChange={(e) => setField('budget', e.target.value)}>
                  {options.budgets.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <p id="hint-budget" className="hint" style={{ fontSize: 13 }}>
                  A rough estimate, not a commitment.
                </p>
              </div>
              <div className="field" style={{ flexBasis: 220 }}>
                <label htmlFor="f-timeline" className="label">
                  Desired timeline <span className="opt">(optional)</span>
                </label>
                <select id="f-timeline" className="select" value={form.timeline} onChange={(e) => setField('timeline', e.target.value)}>
                  {options.timelines.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="fs fs-divider" style={{ gap: 16 }}>
            <legend className="legend">03 · How should we reach you?</legend>
            <div role="radiogroup" aria-label="Preferred contact method" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {options.methods.map((m) => (
                <label key={m} className="radio-pill">
                  <input type="radio" name="method" value={m} checked={form.method === m} onChange={() => setField('method', m)} />
                  {m}
                </label>
              ))}
            </div>
            {form.method !== 'Email' && (
              <div className="field" style={{ maxWidth: 360 }}>
                <label htmlFor="f-phone" className="label">
                  Phone number <span aria-hidden="true" className="req">*</span>
                </label>
                <input id="f-phone" className="input" type="tel" autoComplete="tel" maxLength={30} aria-required="true" aria-invalid={!!errs.phone} aria-describedby="e-phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                <p id="e-phone" className="field-error">
                  {err('phone')}
                </p>
              </div>
            )}
          </fieldset>

          <div className="fs-divider" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, flex: '1 1 280px', maxWidth: 440, fontSize: 13, lineHeight: 1.55, color: 'var(--muted)' }}>
              We’ll only use these details to respond to your enquiry. We won’t add you to a mailing list.
            </p>
            <button type="submit" disabled={submitting} aria-disabled={submitting} className="btn btn--coral" style={{ padding: '0 30px', ...(submitting ? { background: 'var(--coral-soft)', color: 'var(--ink)', transform: 'none' } : {}) }}>
              {submitting && <Spinner />}
              {submitting ? 'Sending…' : 'Send Project Enquiry →'}
            </button>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {liveMsg}
          </p>
        </form>
      )}
    </div>
  );
}
