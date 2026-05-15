import React, { useCallback, useMemo, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { criteriaForUseTypes, USE_TYPE_OPTIONS, type CriterionLevel } from './complianceMatrix';

const LS_EMAIL_KEY = 'ys_download_email';

type Evidence = Record<string, unknown>;

function loadCachedEmail(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(LS_EMAIL_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { email?: string; ts?: number };
    if (!parsed.email) return '';
    if (Date.now() - (parsed.ts || 0) > 7 * 24 * 60 * 60 * 1000) return '';
    return parsed.email;
  } catch {
    return '';
  }
}

async function presignAndUpload(
  apiBase: string,
  submissionId: string,
  ref: string,
  file: File
): Promise<string> {
  const pres = await fetch(`${apiBase}/api/compliance/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      submissionId,
      ref,
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
    }),
  });
  const pj = await pres.json();
  if (!pres.ok) throw new Error(pj.error || 'Presign failed');
  const fd = new FormData();
  fd.append('token', pj.uploadToken);
  fd.append('file', file);
  const up = await fetch(pj.uploadUrl, { method: 'POST', body: fd });
  const uj = await up.json();
  if (!up.ok) throw new Error(uj.error || 'Upload failed');
  return uj.storageKey as string;
}

function levelBlock(
  id: string,
  title: string,
  body: string,
  level: CriterionLevel,
  children: React.ReactNode
): React.ReactNode | null {
  if (level === 'hidden') return null;
  return (
    <details
      key={id}
      style={{
        marginBottom: 12,
        border: '1px solid #30363d',
        borderRadius: 8,
        padding: '8px 12px',
        background: '#161b22',
      }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#e6edf3' }}>
        {id} — {title}
        {level === 'required' ? <span style={{ color: '#f85149' }}> *</span> : <span style={{ color: '#8b949e' }}> (optional)</span>}
      </summary>
      <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.5 }}>{body}</p>
      {children}
    </details>
  );
}

const inp: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  marginBottom: 10,
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #30363d',
  background: '#0d1117',
  color: '#f0f6fc',
  fontSize: 14,
};

const lab: React.CSSProperties = { fontSize: 13, color: '#c9d1d9' };

const btnPri: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  background: '#238636',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSec: React.CSSProperties = {
  ...btnPri,
  background: '#21262d',
  border: '1px solid #30363d',
};

export default function ComplianceEvidenceForm(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const apiBase =
    (siteConfig.customFields as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ||
    'https://api.yirrasystems.com';

  const submissionId = useMemo(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `sub-${Date.now()}`;
  }, []);

  const [step, setStep] = useState(1);
  const [useTypes, setUseTypes] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [evidence, setEvidence] = useState<Evidence>({});
  const [declaration, setDeclaration] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [doneRef, setDoneRef] = useState<string | null>(null);

  React.useEffect(() => {
    const c = loadCachedEmail();
    if (c) setEmail(c);
  }, []);

  const levels = useMemo(() => criteriaForUseTypes(useTypes), [useTypes]);

  const toggleUse = (v: string) => {
    setUseTypes(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
  };

  const setEv = (k: string, v: unknown) => {
    setEvidence(prev => ({ ...prev, [k]: v }));
  };

  const pushFileKey = async (ref: string, file: File | null) => {
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const key = await presignAndUpload(apiBase, submissionId, ref, file);
      const prev = (evidence[ref] as { storageKey: string }[] | undefined) || [];
      setEv(ref, [...prev, { storageKey: key }]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const validateStep3 = (): string | null => {
    const L = levels;
    const ev = evidence;
    const hasFiles = (ref: string) => Array.isArray(ev[ref]) && (ev[ref] as unknown[]).length > 0;
    const hasUrl = (ref: string) => typeof ev[ref] === 'string' && String(ev[ref]).startsWith('https://');

    if (L.C1 === 'required' && !hasFiles('C1a') && !hasUrl('C1b')) {
      return 'C1: provide at least one notice upload (C1a) or URL (C1b).';
    }
    if (L.C2 === 'required') {
      if (!hasUrl('C2a')) return 'C2: HTTPS source URL (C2a) is required.';
      if (!ev.C2b) return 'C2: publication date (C2b) is required.';
      if (!hasFiles('C2c')) return 'C2: at least one screenshot upload (C2c) is required.';
    }
    if (L.C3 === 'required' && !hasFiles('C3a') && !String(ev.C3b || '').trim()) {
      return 'C3: provide attribution file (C3a) or text (C3b).';
    }
    if (L.C4 === 'required' && !hasFiles('C4a') && !String(ev.C4b || '').trim()) {
      return 'C4: provide licence notice file (C4a) or text/URL (C4b).';
    }
    if (L.C5 === 'required') {
      if (!hasFiles('C5a')) return 'C5: upload evidence for “no extra restrictions” (C5a).';
      if (ev.C5b === undefined || ev.C5b === '') return 'C5: answer the restrictions question (C5b).';
      const needC5c = useTypes.some(u =>
        ['modified_dist', 'modified_products', 'mixed_dist', 'reinstatement'].includes(u)
      );
      if (needC5c && !hasFiles('C5c')) return 'C5: upload C5c (mixed / modified / reinstatement path).';
    }
    if (L.C6 === 'required') {
      if (!hasFiles('C6a') && !hasUrl('C6b')) return 'C6: provide change log file (C6a) or URL (C6b).';
      if (!hasFiles('C6c')) return 'C6: provide at least one visual (C6c).';
    }
    return null;
  };

  const goNext = () => {
    setErr('');
    if (step === 1 && !useTypes.length) {
      setErr('Select at least one use type.');
      return;
    }
    if (step === 2) {
      if (!name.trim() || !email.trim() || !country.trim()) {
        setErr('Name, email, and country are required.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErr('Valid email required.');
        return;
      }
    }
    if (step === 3) {
      const v = validateStep3();
      if (v) {
        setErr(v);
        return;
      }
    }
    setStep(s => Math.min(5, s + 1));
  };

  const submit = useCallback(async () => {
    if (!declaration) {
      setErr('You must confirm the declaration.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const res = await fetch(`${apiBase}/api/compliance/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          identity: { name: name.trim(), email: email.trim(), country: country.trim() },
          useTypes,
          evidence,
          declaration: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setDoneRef(data.compliance_ref);
      setStep(5);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setBusy(false);
    }
  }, [apiBase, submissionId, name, email, country, useTypes, evidence, declaration]);

  const L = levels;

  return (
    <div className="ys-compliance-evidence-root" style={{ maxWidth: 720 }}>
      <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 16, lineHeight: 1.55 }}>
        Each step below maps to the criteria matrix for your declared use types. Have the PDF compliance guide handy
        while you work — see the cards above.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: step >= n ? '#238636' : '#21262d',
              color: '#fff',
              border: '1px solid #30363d',
            }}>
            {n}
          </span>
        ))}
      </div>

      {err && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(248,81,73,0.12)',
            border: '1px solid rgba(248,81,73,0.35)',
            color: '#f85149',
            fontSize: 14,
          }}>
          {err}
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 style={{ color: '#f0f6fc' }}>Step 1 — Use declaration</h3>
          <p style={{ color: '#8b949e', fontSize: 14 }}>Select all that apply.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {USE_TYPE_OPTIONS.map(o => (
              <label
                key={o.value}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', color: '#c9d1d9' }}>
                <input
                  type="checkbox"
                  checked={useTypes.includes(o.value)}
                  onChange={() => toggleUse(o.value)}
                  style={{ marginTop: 3 }}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ color: '#f0f6fc' }}>Step 2 — Identity</h3>
          <input
            style={inp}
            placeholder="Full name or organisation"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            style={inp}
            placeholder="Email (required for correspondence)"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            style={inp}
            placeholder="Country of operation"
            value={country}
            onChange={e => setCountry(e.target.value)}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ color: '#f0f6fc' }}>Step 3 — Criteria evidence</h3>
          <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 16 }}>
            Uploads use a short-lived token (max 10 MB per file). URLs must use <code>https://</code>.
          </p>

          {levelBlock(
            'C1',
            'Notice preservation',
            'Photos or PDFs of retained notices, or a stable HTTPS URL where they appear.',
            L.C1,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={lab}>
                C1a files (PNG, JPG, PDF){' '}
                <input type="file" disabled={busy} onChange={e => void pushFileKey('C1a', e.target.files?.[0] || null)} />
              </label>
              <input style={inp} placeholder="C1b URL (https://…)" onChange={e => setEv('C1b', e.target.value)} />
            </div>
          )}

          {levelBlock(
            'C2',
            'Source publication',
            'Public HTTPS repository or page where corresponding source is available.',
            L.C2,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <input style={inp} placeholder="C2a source URL" onChange={e => setEv('C2a', e.target.value)} />
              <input style={inp} placeholder="C2b publication date (DD/MM/YYYY)" onChange={e => setEv('C2b', e.target.value)} />
              <label style={lab}>
                C2c screenshot (PNG, JPG){' '}
                <input type="file" disabled={busy} onChange={e => void pushFileKey('C2c', e.target.files?.[0] || null)} />
              </label>
            </div>
          )}

          {levelBlock(
            'C3',
            'Attribution',
            'How you credit Yirra / Replicant GEN 1.',
            L.C3,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={lab}>
                C3a files{' '}
                <input type="file" disabled={busy} onChange={e => void pushFileKey('C3a', e.target.files?.[0] || null)} />
              </label>
              <textarea style={{ ...inp, minHeight: 72 }} placeholder="C3b attribution text" onChange={e => setEv('C3b', e.target.value)} />
            </div>
          )}

          {levelBlock(
            'C4',
            'Licence notice',
            'Show recipients see CERN-OHL-W-2.0 terms for licensed portions.',
            L.C4,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={lab}>
                C4a files{' '}
                <input type="file" disabled={busy} onChange={e => void pushFileKey('C4a', e.target.files?.[0] || null)} />
              </label>
              <textarea style={{ ...inp, minHeight: 72 }} placeholder="C4b notice text or URL" onChange={e => setEv('C4b', e.target.value)} />
            </div>
          )}

          {levelBlock(
            'C5',
            'No extra restrictions',
            'Evidence you are not imposing extra legal restrictions on the open materials. Answering “Yes” to imposing restrictions flags priority review.',
            L.C5,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={lab}>
                C5a (PDF / DOCX){' '}
                <input type="file" disabled={busy} onChange={e => void pushFileKey('C5a', e.target.files?.[0] || null)} />
              </label>
              <div style={{ color: '#c9d1d9', fontSize: 14 }}>
                C5b — Do you impose additional restrictions on the licensed CAD?
                <label style={{ marginLeft: 12 }}>
                  <input type="radio" name="c5b" onChange={() => setEv('C5b', 'no')} /> No
                </label>
                <label style={{ marginLeft: 12 }}>
                  <input type="radio" name="c5b" onChange={() => setEv('C5b', 'yes')} /> Yes
                </label>
              </div>
              {L.C5 !== 'hidden' &&
                useTypes.some(u =>
                  ['modified_dist', 'modified_products', 'mixed_dist', 'reinstatement'].includes(u)
                ) && (
                  <label style={lab}>
                    C5c (PDF / XLSX / TXT){' '}
                    <input type="file" disabled={busy} onChange={e => void pushFileKey('C5c', e.target.files?.[0] || null)} />
                  </label>
                )}
            </div>
          )}

          {levelBlock(
            'C6',
            'Change documentation',
            'Change log, readme, or visual diffs for your modifications.',
            L.C6,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={lab}>
                C6a (MD / TXT / PDF){' '}
                <input type="file" disabled={busy} onChange={e => void pushFileKey('C6a', e.target.files?.[0] || null)} />
              </label>
              <input style={inp} placeholder="C6b URL to changelog" onChange={e => setEv('C6b', e.target.value)} />
              <label style={lab}>
                C6c images{' '}
                <input type="file" disabled={busy} onChange={e => void pushFileKey('C6c', e.target.files?.[0] || null)} />
              </label>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 style={{ color: '#f0f6fc' }}>Step 4 — Review &amp; declaration</h3>
          <pre
            style={{
              background: '#0d1117',
              padding: 14,
              borderRadius: 8,
              fontSize: 12,
              color: '#8b949e',
              overflow: 'auto',
              maxHeight: 220,
            }}>
            {JSON.stringify({ useTypes, identity: { name, email, country }, evidence }, null, 2)}
          </pre>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 16, color: '#c9d1d9', cursor: 'pointer' }}>
            <input type="checkbox" checked={declaration} onChange={e => setDeclaration(e.target.checked)} />
            <span>
              I declare the information submitted is accurate and complete to the best of my knowledge.
            </span>
          </label>
        </div>
      )}

      {step === 5 && doneRef && (
        <div>
          <h3 style={{ color: '#3fb950' }}>Submission received</h3>
          <p style={{ color: '#e6edf3', fontSize: 16 }}>
            Reference: <strong>{doneRef}</strong>
          </p>
          <p style={{ color: '#8b949e' }}>
            Under review — Yirra Systems will respond within 10 business days. Check your inbox for confirmation.
          </p>
        </div>
      )}

      {step < 5 && (
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 1 && (
            <button type="button" style={btnSec} onClick={() => setStep(s => Math.max(1, s - 1))} disabled={busy}>
              Back
            </button>
          )}
          {step < 4 && (
            <button type="button" style={btnPri} onClick={goNext} disabled={busy}>
              Next
            </button>
          )}
          {step === 4 && (
            <button type="button" style={btnPri} onClick={() => void submit()} disabled={busy}>
              {busy ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
