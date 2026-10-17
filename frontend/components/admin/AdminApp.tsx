'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';
import { AdminContext, errMessage } from './admin-context';
import { ContentTab } from './ContentTab';
import { LeadsTab } from './LeadsTab';
import { LoginForm } from './LoginForm';
import { SettingsTab } from './SettingsTab';

const TABS = [
  { key: 'leads', label: 'Leads' },
  { key: 'content', label: 'Content' },
  { key: 'settings', label: 'Settings' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export function AdminApp() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : 'leads';

  const [auth, setAuth] = useState<'checking' | 'in' | 'out' | 'error'>('checking');
  const [usingDefault, setUsingDefault] = useState(false);
  const [signedOutMsg, setSignedOutMsg] = useState('');
  const [msg, setMsg] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const msgTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const check = useCallback(async () => {
    setAuth('checking');
    try {
      const me = await api<{ authenticated: boolean; usingDefaultPasscode: boolean }>('/auth/me');
      setUsingDefault(me.usingDefaultPasscode);
      setAuth(me.authenticated ? 'in' : 'out');
    } catch {
      setAuth('error');
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const notify = useCallback((text: string, error = false) => {
    setMsg({ text, error });
    clearTimeout(msgTimer.current);
    if (text) msgTimer.current = setTimeout(() => setMsg({ text: '', error: false }), 6000);
  }, []);

  const handleError = useCallback(
    (e: unknown) => {
      const m = errMessage(e);
      if (e instanceof ApiError && e.status === 401) {
        setSignedOutMsg(m);
        setAuth('out');
      } else notify(m, true);
      return m;
    },
    [notify],
  );

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      /* cookie may already be gone */
    }
    setSignedOutMsg('');
    setAuth('out');
  };

  const setTab = (k: TabKey) => {
    notify('');
    router.replace(k === 'leads' ? pathname : `${pathname}?tab=${k}`, { scroll: false });
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[n].key);
    setTimeout(() => document.getElementById(`tab-${TABS[n].key}`)?.focus(), 0);
  };

  return (
    <AdminContext.Provider value={{ notify, handleError }}>
      <div className="admin">
        <header className="admin-bar">
          <div className="admin-bar__inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span aria-hidden="true" className="brand__mark" style={{ width: 24, height: 24, background: 'var(--lilac)' }} />
              <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18 }}>CMG Admin</span>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 }}>
              <Link href="/">← View site</Link>
              {auth === 'in' && (
                <button type="button" className="admin-btn-ghost" onClick={logout}>
                  Sign out
                </button>
              )}
            </div>
          </div>
        </header>

        {auth === 'checking' && (
          <div className="admin-loading" aria-busy="true">
            <Spinner /> Checking your session…
          </div>
        )}

        {auth === 'error' && (
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 20px' }}>
            <div role="alert" className="alert-error" style={{ marginBottom: 16 }}>
              <strong>The admin couldn’t reach the server.</strong> Make sure the API is running, then try again.
            </div>
            <button type="button" className="small-btn small-btn--primary" onClick={check}>
              Try again
            </button>
          </div>
        )}

        {auth === 'out' && (
          <LoginForm
            notice={signedOutMsg}
            usingDefaultPasscode={usingDefault}
            onSuccess={() => {
              setSignedOutMsg('');
              setAuth('in');
            }}
          />
        )}

        {auth === 'in' && (
          <div className="admin-main">
            <div className="admin-head">
              <h1 className="display" style={{ fontSize: 'clamp(30px,3vw,40px)', letterSpacing: '-0.03em' }}>
                {TABS.find((t) => t.key === tab)!.label}
              </h1>
              <div role="tablist" aria-label="Admin sections" className="tabs">
                {TABS.map((t, i) => (
                  <button
                    key={t.key}
                    id={`tab-${t.key}`}
                    role="tab"
                    type="button"
                    className="tab"
                    aria-selected={tab === t.key}
                    aria-controls={`panel-${t.key}`}
                    tabIndex={tab === t.key ? 0 : -1}
                    onClick={() => setTab(t.key)}
                    onKeyDown={(e) => onTabKey(e, i)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <p role="status" aria-live="polite" className={`admin-msg${msg.error ? ' is-error' : ''}`}>
              {msg.text}
            </p>
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              {tab === 'leads' && <LeadsTab />}
              {tab === 'content' && <ContentTab />}
              {tab === 'settings' && <SettingsTab />}
            </div>
          </div>
        )}
      </div>
    </AdminContext.Provider>
  );
}
