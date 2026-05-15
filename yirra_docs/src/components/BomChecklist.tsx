import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BOM_CATEGORIES,
  getFilteredItems,
  getTotalCount,
  itemMatchesFilters,
  type Platform,
  type StackMount,
} from '@site/src/data/bomData';

const API_BASE = 'https://api.yirrasystems.com';
const LS_CHECKLIST = 'ys_bom_checklist';
const LS_EMAIL = 'ys_bom_email';
const LS_DL_EMAIL = 'ys_download_email'; // reuse DownloadGate cached email
const LS_STACK = 'ys_bom_stack';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistState {
  items: Record<string, boolean>;
  updatedAt: number;
}

type SyncStatus = 'idle' | 'saving' | 'loading' | 'saved' | 'error';

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadLocal(): ChecklistState {
  if (typeof window === 'undefined') return { items: {}, updatedAt: 0 };
  try {
    const raw = window.localStorage.getItem(LS_CHECKLIST);
    if (!raw) return { items: {}, updatedAt: 0 };
    return JSON.parse(raw) as ChecklistState;
  } catch {
    return { items: {}, updatedAt: 0 };
  }
}

function saveLocal(state: ChecklistState) {
  try {
    window.localStorage.setItem(LS_CHECKLIST, JSON.stringify(state));
  } catch {}
}

function getCachedEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // prefer dedicated BOM email, fall back to DownloadGate email
    const bomEmail = window.localStorage.getItem(LS_EMAIL);
    if (bomEmail) return bomEmail;
    const raw = window.localStorage.getItem(LS_DL_EMAIL);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email: string; ts: number };
    const TTL = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.ts > TTL) return null;
    return parsed.email;
  } catch {
    return null;
  }
}

function setCachedEmail(email: string) {
  try {
    window.localStorage.setItem(LS_EMAIL, email);
  } catch {}
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
.ys-bom-pill {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  transition: border-color 0.15s, transform 0.15s;
  user-select: none;
}
.ys-bom-pill:hover { border-color: #58a6ff; transform: translateY(-2px); }
.ys-bom-pill-icon { font-size: 16px; }
.ys-bom-pill-label { font-size: 13px; font-weight: 600; color: #c9d1d9; white-space: nowrap; }
.ys-bom-pill-title { font-size: 13px; font-weight: 600; color: #c9d1d9; white-space: nowrap; }
.ys-bom-pill-bar-wrap {
  width: 60px; height: 4px;
  background: #21262d;
  border-radius: 2px;
  overflow: hidden;
}
.ys-bom-pill-bar {
  height: 100%;
  background: #238636;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.ys-bom-panel {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 1200;
  width: 380px;
  max-width: calc(100vw - 32px);
  max-height: 70vh;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 16px 64px rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ys-bom-in 0.2s ease;
}
@keyframes ys-bom-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

.ys-bom-header {
  padding: 14px 16px 12px;
  border-bottom: 1px solid #21262d;
  flex-shrink: 0;
}
.ys-bom-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ys-bom-title { font-size: 14px; font-weight: 700; color: #f0f6fc; margin: 0; }
.ys-bom-close {
  background: none; border: none; cursor: pointer;
  color: #8b949e; font-size: 18px; line-height: 1;
  padding: 2px 4px; border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}
.ys-bom-close:hover { color: #f0f6fc; background: #21262d; }

.ys-bom-progress-bar-wrap {
  height: 5px; background: #21262d; border-radius: 3px; overflow: hidden; margin-bottom: 8px;
}
.ys-bom-progress-bar {
  height: 100%; background: #238636; border-radius: 3px;
  transition: width 0.3s ease;
}
.ys-bom-progress-text { font-size: 11px; color: #8b949e; }
.ys-bom-progress-pct  { color: #238636; font-weight: 600; }

.ys-bom-platform {
  display: flex; gap: 6px; margin-top: 10px;
}
.ys-bom-plat-btn {
  flex: 1; padding: 5px 0; border-radius: 6px; border: 1px solid #30363d;
  background: transparent; color: #8b949e; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.ys-bom-plat-btn:hover { border-color: #58a6ff; color: #c9d1d9; }
.ys-bom-plat-btn.active { background: #1f2937; border-color: #58a6ff; color: #58a6ff; }
.ys-bom-stack-label {
  font-size: 10px; font-weight: 600; color: #8b949e;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin: 10px 0 6px;
}

.ys-bom-body {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
}
.ys-bom-body::-webkit-scrollbar { width: 4px; }
.ys-bom-body::-webkit-scrollbar-track { background: transparent; }
.ys-bom-body::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }

.ys-bom-cat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}
.ys-bom-cat-header:hover { background: #161b22; }
.ys-bom-cat-left { display: flex; align-items: center; gap: 8px; }
.ys-bom-cat-chevron {
  font-size: 10px; color: #8b949e;
  transition: transform 0.2s;
  display: inline-block;
}
.ys-bom-cat-chevron.open { transform: rotate(90deg); }
.ys-bom-cat-name { font-size: 12px; font-weight: 700; color: #c9d1d9; text-transform: uppercase; letter-spacing: 0.06em; }
.ys-bom-cat-count { font-size: 11px; color: #8b949e; }
.ys-bom-cat-bulk {
  background: none; border: none; cursor: pointer;
  font-size: 11px; color: #8b949e; padding: 2px 6px;
  border-radius: 4px; transition: color 0.15s, background 0.15s;
}
.ys-bom-cat-bulk:hover { color: #c9d1d9; background: #21262d; }

.ys-bom-items { padding: 2px 0 6px; }

.ys-bom-item {
  display: flex; align-items: flex-start;
  gap: 10px; padding: 5px 16px;
  transition: background 0.1s;
}
.ys-bom-item:hover { background: #161b22; }
.ys-bom-item.checked .ys-bom-item-name { color: #484f58; text-decoration: line-through; }
.ys-bom-item-cb {
  margin-top: 2px; flex-shrink: 0;
  width: 15px; height: 15px; cursor: pointer;
  accent-color: #238636;
}
.ys-bom-item-info { flex: 1; min-width: 0; }
.ys-bom-item-name { font-size: 13px; color: #c9d1d9; line-height: 1.4; }
.ys-bom-item-qty  { font-size: 11px; color: #8b949e; margin-top: 1px; }
.ys-bom-item-buy  {
  flex-shrink: 0; margin-top: 1px;
  font-size: 11px; color: #58a6ff;
  text-decoration: none;
}
.ys-bom-item-buy:hover { text-decoration: underline; }

.ys-bom-footer {
  padding: 10px 14px;
  border-top: 1px solid #21262d;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ys-bom-footer-row { display: flex; gap: 8px; }
.ys-bom-btn {
  flex: 1; padding: 8px 0; border-radius: 6px; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.ys-bom-btn:hover:not(:disabled) { transform: translateY(-1px); }
.ys-bom-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ys-bom-btn-save  { background: #238636; color: #fff; }
.ys-bom-btn-save:hover:not(:disabled) { background: #2ea043; }
.ys-bom-btn-load  { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
.ys-bom-btn-load:hover:not(:disabled) { background: #2d333b; }
.ys-bom-btn-reset { background: none; color: #8b949e; border: 1px solid #30363d; flex: 0 0 auto; padding: 8px 12px; }
.ys-bom-btn-reset:hover:not(:disabled) { color: #f85149; border-color: #f85149; }
.ys-bom-status { font-size: 11px; text-align: center; }
.ys-bom-status.saving  { color: #8b949e; }
.ys-bom-status.saved   { color: #3fb950; }
.ys-bom-status.error   { color: #f85149; }

.ys-bom-email-row {
  display: flex; gap: 6px;
}
.ys-bom-email-input {
  flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 6px;
  padding: 7px 10px; font-size: 12px; color: #f0f6fc; outline: none;
  transition: border-color 0.15s;
}
.ys-bom-email-input:focus { border-color: #58a6ff; }
.ys-bom-email-input::placeholder { color: #484f58; }
.ys-bom-email-confirm {
  background: #238636; color: #fff; border: none; border-radius: 6px;
  padding: 7px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
  white-space: nowrap; transition: background 0.15s;
}
.ys-bom-email-confirm:hover { background: #2ea043; }
.ys-bom-email-cancel {
  background: none; border: 1px solid #30363d; color: #8b949e; border-radius: 6px;
  padding: 7px 10px; font-size: 12px; cursor: pointer; transition: border-color 0.15s;
}
.ys-bom-email-cancel:hover { border-color: #8b949e; }

@media (max-width: 768px) {
  /* Move to bottom-left so it doesn't conflict with the Chat widget (bottom-right) */
  .ys-bom-pill {
    bottom: 16px;
    right: auto;
    left: 16px;
    padding: 10px 14px;
    gap: 8px;
  }
  /* Compact pill: hide text label, keep icon + progress bar + count */
  .ys-bom-pill-title { display: none; }
  .ys-bom-pill-bar-wrap { width: 40px; }

  /* Panel opens from the left */
  .ys-bom-panel {
    left: 8px;
    right: 8px;
    width: auto;
    bottom: 72px;
    max-height: 75vh;
  }
}
`;

// ─── Component ────────────────────────────────────────────────────────────────

function readStackMount(): StackMount {
  if (typeof window === 'undefined') return '20x20';
  try {
    const s = window.localStorage.getItem(LS_STACK);
    if (s === '20x20' || s === '30x30') return s;
  } catch {}
  return '20x20';
}

export default function BomChecklist() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>('7in');
  const [stackMount, setStackMount] = useState<StackMount>(readStackMount);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [updatedAt, setUpdatedAt] = useState(0);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMsg, setSyncMsg] = useState('');
  const [emailPrompt, setEmailPrompt] = useState<'save' | 'load' | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadLocal();
    setChecked(stored.items);
    setUpdatedAt(stored.updatedAt);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_STACK, stackMount);
    } catch {}
  }, [stackMount]);

  // Pre-fill email if cached
  useEffect(() => {
    if (emailPrompt) {
      const cached = getCachedEmail();
      if (cached) setEmailInput(cached);
      setTimeout(() => emailRef.current?.focus(), 50);
    }
  }, [emailPrompt]);

  const totalItems = getTotalCount(platform, stackMount);
  const checkedCount = getFilteredItems(platform, stackMount).filter(i => checked[i.id]).length;
  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const toggle = useCallback((id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const state: ChecklistState = { items: next, updatedAt: Date.now() };
      saveLocal(state);
      setUpdatedAt(state.updatedAt);
      return next;
    });
  }, []);

  const toggleCat = (catId: string) => {
    setCollapsedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const checkAll = (catId: string, value: boolean) => {
    const cat = BOM_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    setChecked(prev => {
      const next = { ...prev };
      cat.items
        .filter(item => itemMatchesFilters(item, platform, stackMount))
        .forEach(item => { next[item.id] = value; });
      const state: ChecklistState = { items: next, updatedAt: Date.now() };
      saveLocal(state);
      setUpdatedAt(state.updatedAt);
      return next;
    });
  };

  const resetAll = () => {
    const state: ChecklistState = { items: {}, updatedAt: Date.now() };
    saveLocal(state);
    setChecked({});
    setUpdatedAt(state.updatedAt);
  };

  // ── Sync ──────────────────────────────────────────────────────────────────

  const doSave = async (email: string) => {
    setCachedEmail(email);
    setSyncStatus('saving');
    setSyncMsg('Saving…');
    try {
      const res = await fetch(`${API_BASE}/api/docs/bom-checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, items: checked }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      setSyncStatus('saved');
      setSyncMsg('Saved to cloud ✓');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e: unknown) {
      setSyncStatus('error');
      setSyncMsg(e instanceof Error ? e.message : 'Save failed');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  };

  const doLoad = async (email: string) => {
    setCachedEmail(email);
    setSyncStatus('loading');
    setSyncMsg('Loading…');
    try {
      const res = await fetch(
        `${API_BASE}/api/docs/bom-checklist?email=${encodeURIComponent(email)}`,
      );
      if (!res.ok) throw new Error((await res.json()).error || 'Load failed');
      const data = await res.json() as { items: Record<string, boolean>; updatedAt: number };
      // merge: remote wins if it's newer
      const localState = loadLocal();
      const remoteNewer = data.updatedAt > localState.updatedAt;
      const merged = remoteNewer ? data.items : { ...data.items, ...localState.items };
      const state: ChecklistState = { items: merged, updatedAt: Math.max(data.updatedAt, localState.updatedAt) };
      saveLocal(state);
      setChecked(state.items);
      setUpdatedAt(state.updatedAt);
      setSyncStatus('saved');
      setSyncMsg('Progress loaded ✓');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e: unknown) {
      setSyncStatus('error');
      setSyncMsg(e instanceof Error ? e.message : 'Load failed');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  };

  const handleSyncClick = (mode: 'save' | 'load') => {
    const cached = getCachedEmail();
    if (cached) {
      if (mode === 'save') doSave(cached);
      else doLoad(cached);
    } else {
      setEmailPrompt(mode);
    }
  };

  const handleEmailConfirm = () => {
    const email = emailInput.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailPrompt(null);
    if (emailPrompt === 'save') doSave(email);
    else doLoad(email);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const platforms: { key: Platform; label: string }[] = [
    { key: '6in', label: '6"' },
    { key: '7in', label: '7"' },
    { key: '8in', label: '8"' },
  ];

  const stackMounts: { key: StackMount; label: string }[] = [
    { key: '20x20', label: '20×20' },
    { key: '30x30', label: '30×30' },
  ];

  return (
    <>
      <style>{STYLES}</style>

      {/* Minimised pill */}
      {!open && (
        <button className="ys-bom-pill" onClick={() => setOpen(true)} aria-label="Open build checklist">
          <span className="ys-bom-pill-icon">🔧</span>
          <span className="ys-bom-pill-title">Build Checklist</span>
          <div className="ys-bom-pill-bar-wrap">
            <div className="ys-bom-pill-bar" style={{ width: `${pct}%` }} />
          </div>
          <span className="ys-bom-pill-label" style={{ color: '#8b949e', fontWeight: 400 }}>
            {checkedCount}/{totalItems}
          </span>
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="ys-bom-panel" role="dialog" aria-label="BOM Build Checklist">
          {/* Header */}
          <div className="ys-bom-header">
            <div className="ys-bom-header-row">
              <p className="ys-bom-title">🔧 Build Checklist</p>
              <button className="ys-bom-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="ys-bom-progress-bar-wrap">
              <div className="ys-bom-progress-bar" style={{ width: `${pct}%` }} />
            </div>
            <p className="ys-bom-progress-text">
              <span className="ys-bom-progress-pct">{pct}%</span>
              {' '}— {checkedCount} of {totalItems} items
            </p>
            <div className="ys-bom-platform" style={{ marginTop: 10 }}>
              {platforms.map(p => (
                <button
                  key={p.key}
                  type="button"
                  className={`ys-bom-plat-btn${platform === p.key ? ' active' : ''}`}
                  onClick={() => setPlatform(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="ys-bom-stack-label">FC stack</p>
            <div className="ys-bom-platform" style={{ marginTop: 0 }}>
              {stackMounts.map(s => (
                <button
                  key={s.key}
                  type="button"
                  className={`ys-bom-plat-btn${stackMount === s.key ? ' active' : ''}`}
                  onClick={() => setStackMount(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable item list */}
          <div className="ys-bom-body">
            {BOM_CATEGORIES.map(cat => {
              const visibleItems = cat.items.filter(item =>
                itemMatchesFilters(item, platform, stackMount),
              );
              if (visibleItems.length === 0) return null;

              const catChecked = visibleItems.filter(i => checked[i.id]).length;
              const allChecked = catChecked === visibleItems.length;
              const isOpen = !collapsedCats[cat.id];

              return (
                <div key={cat.id}>
                  <div className="ys-bom-cat-header" onClick={() => toggleCat(cat.id)}>
                    <div className="ys-bom-cat-left">
                      <span className={`ys-bom-cat-chevron${isOpen ? ' open' : ''}`}>▶</span>
                      <span className="ys-bom-cat-name">{cat.name}</span>
                      <span className="ys-bom-cat-count">{catChecked}/{visibleItems.length}</span>
                    </div>
                    <button
                      className="ys-bom-cat-bulk"
                      onClick={e => { e.stopPropagation(); checkAll(cat.id, !allChecked); }}
                      title={allChecked ? 'Uncheck all' : 'Check all'}
                    >
                      {allChecked ? '− All' : '✓ All'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="ys-bom-items">
                      {visibleItems.map(item => (
                        <label
                          key={item.id}
                          className={`ys-bom-item${checked[item.id] ? ' checked' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="ys-bom-item-cb"
                            checked={!!checked[item.id]}
                            onChange={() => toggle(item.id)}
                          />
                          <div className="ys-bom-item-info">
                            <div className="ys-bom-item-name">{item.name}</div>
                            {item.qty > 0 && (
                              <div className="ys-bom-item-qty">Qty: {item.qty}</div>
                            )}
                          </div>
                          {item.buyUrl && !checked[item.id] && (
                            <a
                              href={item.buyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ys-bom-item-buy"
                              onClick={e => e.stopPropagation()}
                              title="Buy this item"
                            >
                              Buy →
                            </a>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="ys-bom-footer">
            {emailPrompt && (
              <div className="ys-bom-email-row">
                <input
                  ref={emailRef}
                  type="email"
                  className="ys-bom-email-input"
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmailConfirm()}
                />
                <button className="ys-bom-email-confirm" onClick={handleEmailConfirm}>
                  {emailPrompt === 'save' ? 'Save' : 'Load'}
                </button>
                <button className="ys-bom-email-cancel" onClick={() => setEmailPrompt(null)}>
                  ✕
                </button>
              </div>
            )}

            {syncStatus !== 'idle' && (
              <p className={`ys-bom-status ${syncStatus}`}>{syncMsg}</p>
            )}

            <div className="ys-bom-footer-row">
              <button
                className="ys-bom-btn ys-bom-btn-save"
                onClick={() => handleSyncClick('save')}
                disabled={syncStatus === 'saving' || syncStatus === 'loading'}
              >
                ☁ Save Progress
              </button>
              <button
                className="ys-bom-btn ys-bom-btn-load"
                onClick={() => handleSyncClick('load')}
                disabled={syncStatus === 'saving' || syncStatus === 'loading'}
              >
                ↓ Load Progress
              </button>
              <button
                className="ys-bom-btn ys-bom-btn-reset"
                onClick={resetAll}
                disabled={syncStatus === 'saving' || syncStatus === 'loading'}
                title="Reset all checkboxes"
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
