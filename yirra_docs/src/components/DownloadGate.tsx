import React, { useCallback, useEffect, useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const LS_EMAIL_KEY = 'ys_download_email';
const LS_NAME_KEY = 'ys_download_name';
const LS_TOKEN_KEY = 'ys_dl_access';
const LS_EMAIL_TTL = 7 * 24 * 60 * 60 * 1000;

function cacheOptionalIdentity(email: string, name: string) {
  if (typeof window === 'undefined') return;
  try {
    if (email.trim()) {
      window.localStorage.setItem(LS_EMAIL_KEY, JSON.stringify({ email: email.trim(), ts: Date.now() }));
    }
    if (name.trim()) {
      window.localStorage.setItem(LS_NAME_KEY, JSON.stringify({ name: name.trim(), ts: Date.now() }));
    }
  } catch {}
}

function loadCachedField(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { email?: string; name?: string; ts?: number };
    if (Date.now() - (parsed.ts || 0) > LS_EMAIL_TTL) {
      window.localStorage.removeItem(key);
      return '';
    }
    return (parsed.email || parsed.name || '') as string;
  } catch {
    return '';
  }
}

interface CachedToken {
  token: string;
  expires: number;
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LS_TOKEN_KEY);
    if (!raw) return null;
    const parsed: CachedToken = JSON.parse(raw);
    if (Date.now() > parsed.expires) {
      window.localStorage.removeItem(LS_TOKEN_KEY);
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

function saveAccessToken(token: string) {
  try {
    window.localStorage.setItem(
      LS_TOKEN_KEY,
      JSON.stringify({ token, expires: Date.now() + 30 * 24 * 60 * 60 * 1000 })
    );
  } catch {}
}

interface Props {
  file: string;
  category: string;
  label: string;
  icon?: string;
}

type BtnState = 'idle' | 'loading' | 'complete';

const STYLES = `
.ys-dg-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.ys-dg-modal {
  background: #161b22; border: 1px solid #30363d; border-radius: 12px;
  padding: 28px 32px; width: 100%; max-width: 520px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  animation: ys-dg-in 0.2s ease;
}
@keyframes ys-dg-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.ys-dg-logo {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: #8b949e; text-transform: uppercase; margin: 0 0 16px;
}
.ys-dg-title {
  font-size: 20px; font-weight: 600; color: #f0f6fc;
  margin: 0 0 8px; line-height: 1.3;
}
.ys-dg-sub { font-size: 13px; color: #8b949e; margin: 0 0 16px; line-height: 1.5; }
.ys-dg-file {
  background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  padding: 10px 14px; margin: 0 0 16px;
  font-size: 12px; color: #c9d1d9;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ys-dg-check {
  display: flex; align-items: flex-start; gap: 10px;
  margin: 0 0 12px; cursor: pointer;
}
.ys-dg-check input { margin-top: 3px; accent-color: #238636; flex-shrink: 0; }
.ys-dg-check span { font-size: 13px; color: #c9d1d9; line-height: 1.55; user-select: none; }
.ys-dg-check a { color: #58a6ff; }
.ys-dg-input {
  width: 100%; box-sizing: border-box;
  background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  padding: 10px 12px; font-size: 14px; color: #f0f6fc;
  outline: none; margin: 0 0 8px;
}
.ys-dg-input:focus { border-color: #58a6ff; }
.ys-dg-hint { font-size: 11px; color: #484f58; margin: 0 0 14px; line-height: 1.45; }
.ys-dg-btn {
  width: 100%; padding: 12px; border: none; border-radius: 8px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, opacity 0.15s, transform 0.1s;
}
.ys-dg-btn-primary { background: #1f6feb; color: #fff; }
.ys-dg-btn-primary:hover:not(:disabled) { background: #388bfd; transform: translateY(-1px); }
.ys-dg-btn-locked { background: #21262d; color: #484f58; cursor: not-allowed; opacity: 0.85; }
.ys-dg-btn-loading { background: #238636; color: #fff; cursor: wait; opacity: 0.9; }
.ys-dg-btn-done { background: #238636; color: #fff; cursor: default; }
.ys-dg-error {
  font-size: 12px; color: #f85149; margin: 0 0 12px;
  padding: 8px 12px; background: rgba(248,81,73,0.1);
  border: 1px solid rgba(248,81,73,0.3); border-radius: 6px;
}
.ys-dg-cancel {
  display: block; width: 100%; margin-top: 12px;
  background: none; border: none; cursor: pointer;
  font-size: 13px; color: #8b949e; text-align: center;
}
.ys-dg-cancel:hover { color: #c9d1d9; }
.ys-dg-trigger {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 8px; border: none;
  background: #1f2937; color: #fff;
  font-size: 15px; font-weight: 500; cursor: pointer;
  text-decoration: none; transition: background 0.15s, transform 0.1s;
}
.ys-dg-trigger:hover { background: #374151; transform: translateY(-1px); }
.ys-dg-progress {
  height: 4px; border-radius: 2px; background: #21262d; margin: 8px 0 16px; overflow: hidden;
}
.ys-dg-progress > i {
  display: block; height: 100%; background: linear-gradient(90deg, #238636, #1f6feb);
  transition: width 0.25s ease;
}
.ys-dg-ok { font-size: 13px; color: #3fb950; margin: 0 0 12px; line-height: 1.5; }
.ys-dg-badge {
  font-size: 12px; color: #58a6ff; background: rgba(56,139,253,0.12);
  border: 1px solid rgba(56,139,253,0.35); border-radius: 6px; padding: 8px 10px; margin-bottom: 14px;
}
.ys-dg-inbox-icon { font-size: 40px; display: block; margin: 0 0 16px; line-height: 1; }
`;

export default function DownloadGate({ file, category, label, icon = '📦' }: Props) {
  const { siteConfig } = useDocusaurusContext();
  const apiBase =
    (siteConfig.customFields as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ||
    'https://api.yirrasystems.com';

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'gate' | 'pending'>('gate');
  const [cbLicense, setCbLicense] = useState(false);
  const [cbCompliance, setCbCompliance] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [btnState, setBtnState] = useState<BtnState>('idle');
  const [triggerLoading, setTriggerLoading] = useState(false);
  const emailRedirectStarted = useRef(false);

  const fileId = file.split('/').pop() || file;
  const fileName = fileId;
  const hasSession = Boolean(getAccessToken());

  useEffect(() => {
    if (!open) return;
    setPhase('gate');
    setEmail(loadCachedField(LS_EMAIL_KEY));
    setName(loadCachedField(LS_NAME_KEY));
    setErrorMsg('');
    setConfirmMsg('');
    setBtnState('idle');
  }, [open]);

  const gateComplete = cbLicense && cbCompliance;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSendLink = gateComplete && emailOk;
  const canDownloadVerified = gateComplete && hasSession;

  const postAcknowledge = useCallback(async () => {
    const res = await fetch(`${apiBase}/api/download/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [fileId],
        file,
        category,
        checkbox_license: true,
        checkbox_compliance: true,
        email: email.trim() || undefined,
        name: name.trim() || undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Acknowledgement failed');
    return data as { download_urls?: Record<string, string> };
  }, [apiBase, file, category, fileId, email, name]);

  const runVerifiedDownload = useCallback(
    async (accessToken: string) => {
      setBtnState('loading');
      setErrorMsg('');
      setConfirmMsg('');
      try {
        await postAcknowledge();
        cacheOptionalIdentity(email, name);
        const res = await fetch(`${apiBase}/api/docs/request-download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, file, category }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) window.localStorage.removeItem(LS_TOKEN_KEY);
          throw new Error(data.error || 'Download session failed');
        }
        if (data.token) {
          setConfirmMsg('Recorded. Starting download…');
          setBtnState('complete');
          window.location.href = `${apiBase}/api/docs/download?token=${data.token}`;
          return;
        }
        throw new Error('No download token returned');
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : 'Download failed');
        setBtnState('idle');
      }
    },
    [apiBase, file, category, postAcknowledge, email, name]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dlAccess = params.get('dl_access');
    const dlFile = params.get('file');
    if (!dlAccess) return;

    saveAccessToken(dlAccess);
    params.delete('dl_access');
    params.delete('file');
    params.delete('cat');
    const qs = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${qs ? '?' + qs : ''}`);

    if (!dlFile || decodeURIComponent(dlFile) !== file) return;
    if (emailRedirectStarted.current) return;
    emailRedirectStarted.current = true;

    void (async () => {
      setTriggerLoading(true);
      try {
        const ack = await fetch(`${apiBase}/api/download/acknowledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: [fileId],
            file,
            category,
            checkbox_license: true,
            checkbox_compliance: true,
            email: loadCachedField(LS_EMAIL_KEY) || undefined,
            name: loadCachedField(LS_NAME_KEY) || undefined,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            timestamp: new Date().toISOString(),
          }),
        });
        if (!ack.ok) {
          emailRedirectStarted.current = false;
          return;
        }
        const res = await fetch(`${apiBase}/api/docs/request-download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: dlAccess, file, category }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          window.location.href = `${apiBase}/api/docs/download?token=${data.token}`;
        } else {
          emailRedirectStarted.current = false;
        }
      } catch {
        emailRedirectStarted.current = false;
      } finally {
        setTriggerLoading(false);
      }
    })();
  }, [file, category, apiBase, fileId]);

  const sendDownloadLink = useCallback(async () => {
    if (!canSendLink) return;
    setBtnState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${apiBase}/api/docs/request-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          file,
          category,
          marketingConsent,
          checkbox_license: true,
          checkbox_compliance: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.pending) {
        cacheOptionalIdentity(email, name);
        setPhase('pending');
        setBtnState('idle');
        return;
      }
      throw new Error('Unexpected response');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
      setBtnState('idle');
    }
  }, [apiBase, email, file, category, marketingConsent, canSendLink, name]);

  const onPrimaryAction = useCallback(async () => {
    if (!gateComplete) return;
    const at = getAccessToken();
    if (at) {
      await runVerifiedDownload(at);
      return;
    }
    await sendDownloadLink();
  }, [gateComplete, runVerifiedDownload, sendDownloadLink]);

  const close = () => {
    setOpen(false);
    setPhase('gate');
    setCbLicense(false);
    setCbCompliance(false);
    setErrorMsg('');
    setConfirmMsg('');
    setBtnState('idle');
  };

  const primaryDisabled =
    !gateComplete ||
    btnState === 'loading' ||
    btnState === 'complete' ||
    (!hasSession && !emailOk);

  const primaryLabel = hasSession
    ? btnState === 'loading'
      ? 'Preparing…'
      : btnState === 'complete'
        ? 'Downloading…'
        : 'Download design files'
    : btnState === 'loading'
      ? 'Sending…'
      : 'Send download link';

  const primaryClass =
    primaryDisabled && btnState === 'idle'
      ? 'ys-dg-btn ys-dg-btn-locked'
      : btnState === 'loading'
        ? 'ys-dg-btn ys-dg-btn-loading'
        : btnState === 'complete'
          ? 'ys-dg-btn ys-dg-btn-done'
          : 'ys-dg-btn ys-dg-btn-primary';

  const onTriggerClick = () => {
    const at = getAccessToken();
    const cached = loadCachedField(LS_EMAIL_KEY);
    if (at) {
      setOpen(true);
      return;
    }
    if (cached) {
      setEmail(cached);
      setOpen(true);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <style>{STYLES}</style>
      <button
        type="button"
        className="ys-dg-trigger"
        onClick={onTriggerClick}
        disabled={triggerLoading}
        title={label}>
        <span>{icon}</span>
        <span>{triggerLoading ? 'Preparing…' : label}</span>
      </button>

      {open && (
        <div className="ys-dg-overlay" onClick={e => e.target === e.currentTarget && close()}>
          {phase === 'pending' ? (
            <div className="ys-dg-modal" style={{ textAlign: 'center' }}>
              <p className="ys-dg-logo">Yirra Systems</p>
              <span className="ys-dg-inbox-icon">✉️</span>
              <h2 className="ys-dg-title">Check your email</h2>
              <p className="ys-dg-sub">
                We&apos;ve sent a link to <strong style={{ color: '#c9d1d9' }}>{email}</strong>. Click it to verify
                your address and start the download. The link expires in 24 hours.
              </p>
              <p className="ys-dg-hint">
                After you verify once, this device can download for 30 days without another email (you&apos;ll still
                confirm licence &amp; compliance each time).
              </p>
              <button type="button" className="ys-dg-btn ys-dg-btn-primary" onClick={() => setPhase('gate')}>
                Back
              </button>
              <button type="button" className="ys-dg-cancel" onClick={close}>
                Close
              </button>
              <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#484f58' }}>
                Didn&apos;t get it?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#58a6ff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline',
                  }}
                  onClick={() => void sendDownloadLink()}>
                  Send again
                </button>
              </p>
            </div>
          ) : (
            <div className="ys-dg-modal" role="dialog" aria-modal="true" aria-labelledby="ys-dg-h1">
              <p className="ys-dg-logo">Yirra Systems</p>
              <h2 id="ys-dg-h1" className="ys-dg-title">
                Download
              </h2>
              <p className="ys-dg-sub">
                Acknowledge both documents. First-time downloads require a <strong>verified email</strong> (we send a
                one-time link). After verification, this browser can download for 30 days with the same acknowledgements
                each time.
              </p>
              {hasSession && <div className="ys-dg-badge">Email verified on this device — no new link required.</div>}
              <div className="ys-dg-file">📄 {fileName}</div>

              <div className="ys-dg-progress">
                <i style={{ width: gateComplete ? '100%' : cbLicense || cbCompliance ? '50%' : '5%' }} />
              </div>

              <label className="ys-dg-check">
                <input type="checkbox" checked={cbLicense} onChange={e => setCbLicense(e.target.checked)} />
                <span>
                  I have read, understood, and agree to the terms of the{' '}
                  <a href="/docs/license" target="_blank" rel="noopener noreferrer">
                    CERN-OHL-W-2.0 License
                  </a>
                  . If I distribute Replicant-derived hardware commercially, I will move to the{' '}
                  <a href="/docs/compliance/partner" target="_blank" rel="noopener noreferrer">
                    Partner
                  </a>{' '}
                  or{' '}
                  <a href="/docs/compliance/enterprise" target="_blank" rel="noopener noreferrer">
                    Enterprise
                  </a>{' '}
                  door — no commercial licence is ever auto-applied.
                </span>
              </label>

              <label className="ys-dg-check">
                <input type="checkbox" checked={cbCompliance} onChange={e => setCbCompliance(e.target.checked)} />
                <span>
                  I have read and agree to the obligations set out in the{' '}
                  <a href="/docs/compliance-guide" target="_blank" rel="noopener noreferrer">
                    CERN-OHL-W-2.0 Compliance Guide
                  </a>
                  , and I understand that if I breach the licence, it ends until I cure within 30 days (CERN §7).
                </span>
              </label>

              {!hasSession && (
                <>
                  <p className="ys-dg-hint">
                    Work email preferred — we run MX checks. Name / organisation is optional and helps if you use{' '}
                    <a href="/docs/compliance">three doors / evidence</a> later.
                  </p>
                  <input
                    className="ys-dg-input"
                    type="text"
                    placeholder="Name / organisation (optional)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <input
                    className="ys-dg-input"
                    type="email"
                    placeholder="Email address (required for first-time download)"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <label className="ys-dg-check">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={e => setMarketingConsent(e.target.checked)}
                    />
                    <span>Keep me updated on Yirra Systems products and releases. Unsubscribe anytime.</span>
                  </label>
                </>
              )}

              {errorMsg && <p className="ys-dg-error">{errorMsg}</p>}
              {confirmMsg && <p className="ys-dg-ok">{confirmMsg}</p>}

              <button
                type="button"
                className={primaryClass}
                disabled={primaryDisabled}
                title={
                  !gateComplete
                    ? 'Acknowledge both documents above'
                    : !hasSession && !emailOk
                      ? 'Enter a valid email address'
                      : ''
                }
                onClick={() => void onPrimaryAction()}>
                {primaryLabel}
              </button>

              <button type="button" className="ys-dg-cancel" onClick={close}>
                Cancel
              </button>
              <p className="ys-dg-sub" style={{ marginTop: 16, fontSize: 12 }}>
                <a href="/docs/compliance" style={{ color: '#58a6ff' }} target="_blank" rel="noopener noreferrer">
                  Three doors (licensing)
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
