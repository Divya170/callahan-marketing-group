'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';

export function LoginForm({ notice, usingDefaultPasscode, onSuccess }: { notice?: string; usingDefaultPasscode: boolean; onSuccess: () => void }) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!pass.trim()) {
      setErr('Enter the passcode.');
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await api('/auth/login', { method: 'POST', json: { passcode: pass } });
      setPass('');
      onSuccess();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Sign-in failed. Please try again.');
      inputRef.current?.select();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 'clamp(48px,8vw,96px) 20px' }}>
      <h1 className="display" style={{ margin: '0 0 8px', fontSize: 36, letterSpacing: '-0.03em' }}>
        Sign in
      </h1>
      {notice && (
        <p role="alert" className="alert-soft" style={{ margin: '12px 0 16px' }}>
          {notice}
        </p>
      )}
      {usingDefaultPasscode ? (
        <p style={{ margin: '0 0 28px', fontSize: 15, color: 'var(--muted)' }}>
          Default passcode:{' '}
          <code className="mono" style={{ background: 'var(--white)', padding: '2px 6px', border: '1px solid var(--line)' }}>
            callahan
          </code>{' '}
          — change <code className="mono">ADMIN_PASSCODE</code> in <code className="mono">backend/.env</code> before going live.
        </p>
      ) : (
        <p style={{ margin: '0 0 28px', fontSize: 15, color: 'var(--muted)' }}>Enter the admin passcode to manage leads and content.</p>
      )}
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label htmlFor="a-pass" className="label">
          Passcode
        </label>
        <input
          ref={inputRef}
          id="a-pass"
          className="input"
          type="password"
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          aria-invalid={!!err}
          aria-describedby="a-err"
        />
        <p id="a-err" role="alert" className="field-error" style={{ display: 'block', minHeight: 20 }}>
          {err}
        </p>
        <button type="submit" disabled={busy} className="small-btn small-btn--primary" style={{ minHeight: 52, justifyContent: 'center', fontSize: 16 }}>
          {busy && <Spinner size={14} color="currentColor" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
