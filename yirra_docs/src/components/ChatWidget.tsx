import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Lightweight markdown renderer ──────────────────────────────────────────
function renderMarkdown(text: string): string {
  if (!text) return '';
  return text
    // Strip image markdown — images are relative to docs domain, can't render in chat
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Markdown links [text](https://url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Bare URLs — negative lookbehind avoids double-wrapping URLs already inside href=""
    .replace(/(?<!href=")(https?:\/\/[^\s<>"']+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br/>');
}

function relativeTime(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// ─── Scoped styles ───────────────────────────────────────────────────────────
const WIDGET_STYLES = `
  .ys-chat-root[data-theme="dark"] {
    --chat-bg: #141414;
    --chat-surface: #1a1a1a;
    --chat-border: #262626;
    --chat-text: #e5e5e5;
    --chat-text-muted: #737373;
    --chat-text-placeholder: #525252;
    --chat-accent: #0ea5e9;
    --chat-accent-dark: #38bdf8;
    --chat-accent-glow: rgba(14,165,233,0.12);
    --chat-header-bg: #0f0f0f;
    --chat-header-text: #e5e5e5;
    --chat-bubble-user-bg: #0ea5e9;
    --chat-bubble-user-text: #ffffff;
    --chat-bubble-ai-bg: #1a1a1a;
    --chat-bubble-ai-text: #e5e5e5;
    --chat-bubble-ai-border: #262626;
    --chat-bubble-admin-bg: #052e16;
    --chat-bubble-admin-text: #4ade80;
    --chat-bubble-admin-border: #14532d;
    --chat-input-bg: #0f0f0f;
    --chat-input-border: #262626;
    --chat-fab-bg: #1a1a1a;
    --chat-fab-text: #0ea5e9;
    --chat-fab-ring: rgba(14,165,233,0.15);
    --chat-shadow: 0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
    --chat-scrollbar-track: #0a0a0a;
    --chat-scrollbar-thumb: #404040;
    --chat-code-bg: #0f0f0f;
  }
  .ys-chat-panel {
    background: var(--chat-bg);
    border: 1px solid var(--chat-border);
    box-shadow: var(--chat-shadow);
    display: flex; flex-direction: column;
    width: 360px; height: 520px;
    border-radius: 20px; overflow: hidden;
    backdrop-filter: blur(20px);
  }
  @media (max-width: 480px) {
    .ys-chat-panel { width: calc(100vw - 2rem); height: calc(100vh - 120px); border-radius: 16px; }
  }
  .ys-chat-header {
    flex-shrink: 0;
    background: var(--chat-header-bg);
    color: var(--chat-header-text);
    padding: 14px 16px;
    border-bottom: 2px solid var(--chat-accent);
    box-shadow: 0 1px 20px var(--chat-accent-glow);
    display: flex; align-items: center; justify-content: space-between;
  }
  .ys-chat-messages {
    flex: 1; overflow-y: auto; padding: 16px 12px;
    background: var(--chat-surface);
    display: flex; flex-direction: column; gap: 12px;
  }
  .ys-chat-messages::-webkit-scrollbar { width: 4px; }
  .ys-chat-messages::-webkit-scrollbar-track { background: var(--chat-scrollbar-track); }
  .ys-chat-messages::-webkit-scrollbar-thumb { background: var(--chat-scrollbar-thumb); border-radius: 2px; }
  .ys-chat-footer { flex-shrink: 0; padding: 12px; border-top: 1px solid var(--chat-border); background: var(--chat-bg); }
  .ys-chat-input-row { display: flex; gap: 8px; align-items: flex-end; }
  .ys-chat-input {
    flex: 1; background: var(--chat-input-bg); border: 1px solid var(--chat-input-border);
    color: var(--chat-text); border-radius: 12px; padding: 10px 14px;
    font-size: 14px; font-family: 'Outfit', -apple-system, sans-serif;
    resize: none; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    max-height: 100px; line-height: 1.4;
  }
  .ys-chat-input::placeholder { color: var(--chat-text-placeholder); }
  .ys-chat-input:focus { border-color: var(--chat-accent); box-shadow: 0 0 0 3px var(--chat-accent-glow); }
  .ys-chat-send-btn {
    width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer;
    background: var(--chat-accent); color: white;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, transform 0.1s, opacity 0.15s; flex-shrink: 0;
  }
  .ys-chat-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .ys-chat-send-btn:not(:disabled):hover { background: var(--chat-accent-dark); }
  .ys-chat-send-btn:not(:disabled):active { transform: scale(0.94); }
  .ys-bubble-wrap { display: flex; flex-direction: column; max-width: 82%; }
  .ys-bubble-wrap.user { align-self: flex-end; align-items: flex-end; }
  .ys-bubble-wrap.ai, .ys-bubble-wrap.admin { align-self: flex-start; align-items: flex-start; }
  .ys-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.55; word-break: break-word; }
  .ys-bubble.user { background: var(--chat-bubble-user-bg); color: var(--chat-bubble-user-text); border-bottom-right-radius: 4px; }
  .ys-bubble.ai { background: var(--chat-bubble-ai-bg); color: var(--chat-bubble-ai-text); border: 1px solid var(--chat-bubble-ai-border); border-bottom-left-radius: 4px; }
  .ys-bubble.admin { background: var(--chat-bubble-admin-bg); color: var(--chat-bubble-admin-text); border: 1px solid var(--chat-bubble-admin-border); border-bottom-left-radius: 4px; }
  .ys-bubble a { color: var(--chat-accent); text-decoration: underline; }
  .ys-bubble code { background: var(--chat-code-bg); border: 1px solid var(--chat-border); border-radius: 4px; padding: 1px 5px; font-size: 12px; font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace; }
  .ys-bubble ul { margin: 6px 0 0 0; padding-left: 16px; }
  .ys-bubble li { margin: 2px 0; }
  .ys-sender-badge { font-size: 11px; font-weight: 600; letter-spacing: 0.03em; padding: 2px 7px; border-radius: 20px; margin-bottom: 4px; display: inline-block; }
  .ys-sender-badge.ai { background: var(--chat-accent-glow); color: var(--chat-accent); }
  .ys-sender-badge.admin { background: var(--chat-bubble-admin-border); color: var(--chat-bubble-admin-text); }
  .ys-timestamp { font-size: 11px; color: var(--chat-text-muted); margin-top: 4px; padding: 0 2px; }
  .ys-typing { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--chat-bubble-ai-bg); border: 1px solid var(--chat-bubble-ai-border); border-radius: 16px; border-bottom-left-radius: 4px; align-self: flex-start; }
  .ys-shimmer { width: 80px; height: 8px; border-radius: 4px; background: linear-gradient(90deg, var(--chat-border) 0%, var(--chat-accent) 40%, var(--chat-border) 80%); background-size: 200% 100%; animation: ys-shimmer 1.4s ease-in-out infinite; }
  @keyframes ys-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .ys-fab { width: 56px; height: 56px; border-radius: 50%; border: 1px solid var(--chat-border); cursor: pointer; background: var(--chat-fab-bg); color: var(--chat-fab-text); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px var(--chat-fab-ring), 0 2px 8px rgba(0,0,0,0.4); transition: transform 0.2s, box-shadow 0.2s; position: relative; }
  .ys-fab:hover { transform: scale(1.06); box-shadow: 0 12px 32px var(--chat-fab-ring), 0 4px 12px rgba(0,0,0,0.5); }
  .ys-fab:active { transform: scale(0.96); }
  .ys-fab-pulse { position: absolute; inset: -4px; border-radius: 50%; border: 2px solid var(--chat-accent); animation: ys-pulse 2s ease-out infinite; pointer-events: none; }
  @keyframes ys-pulse { 0% { opacity: 0.7; transform: scale(1); } 100% { opacity: 0; transform: scale(1.5); } }
  .ys-icon-btn { background: transparent; border: none; cursor: pointer; color: var(--chat-header-text); opacity: 0.7; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: opacity 0.15s; }
  .ys-icon-btn:hover { opacity: 1; }
  @keyframes ys-spin { to { transform: rotate(360deg); } }

  /* ── Side Panel Mode ──────────────────────────────────────── */
  .ys-side-tab {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 9998;
    background: var(--chat-bg);
    border: 1px solid var(--chat-border);
    border-right: none;
    border-radius: 10px 0 0 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 8px;
    gap: 8px;
    color: var(--chat-accent);
    box-shadow: -4px 0 20px rgba(0,0,0,0.35);
    transition: background 0.15s, box-shadow 0.15s;
    font-family: 'Outfit', sans-serif;
  }
  .ys-side-tab:hover {
    background: var(--chat-surface);
    box-shadow: -6px 0 28px rgba(14,165,233,0.15), -4px 0 20px rgba(0,0,0,0.4);
  }
  .ys-side-tab-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--chat-text-muted);
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    margin-top: 2px;
  }
  .ys-side-panel-container {
    position: fixed;
    top: var(--ifm-navbar-height, 60px);
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    background: var(--chat-bg);
    border-left: 1px solid var(--chat-border);
    box-shadow: -8px 0 40px rgba(0,0,0,0.5), -1px 0 0 rgba(255,255,255,0.04);
    overflow: hidden;
  }
  .ys-side-panel-container .ys-chat-header {
    border-radius: 0;
    border-bottom: 1px solid var(--chat-border);
    background: var(--chat-header-bg);
    flex-shrink: 0;
  }
  .ys-side-panel-container .ys-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    gap: 14px;
    display: flex;
    flex-direction: column;
  }
  .ys-side-panel-container .ys-chat-footer {
    flex-shrink: 0;
    padding: 14px 16px;
    border-top: 1px solid var(--chat-border);
    background: var(--chat-bg);
  }
  .ys-side-panel-container .ys-bubble { max-width: 100%; }
  .ys-side-panel-container .ys-bubble-wrap { max-width: 88%; }
  .ys-resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    cursor: ew-resize;
    background: transparent;
    transition: background 0.15s;
    z-index: 1;
  }
  .ys-resize-handle:hover, .ys-resize-handle:active {
    background: var(--chat-accent);
    opacity: 0.4;
  }
  .ys-resize-handle::after {
    content: '';
    position: absolute;
    left: 1px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 32px;
    border-radius: 3px;
    background: var(--chat-border);
  }
  @media (max-width: 768px) {
    .ys-side-panel-container {
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
    }
    .ys-side-tab { top: auto; bottom: 24px; transform: none; border-radius: 10px; border: 1px solid var(--chat-border); right: 20px; }
    .ys-side-tab-label { display: none; }
    .ys-resize-handle { display: none; }
  }
`;

interface ChatMessage {
  id: string;
  sender: string;
  text?: string;
  type?: string;
  cards?: any[];
  ts: string;
}

interface ChatWidgetProps {
  theme?: 'light' | 'dark';
  apiBase?: string;
  mode?: 'widget' | 'panel';
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ theme = 'dark', apiBase = 'https://api.yirrasystems.com', mode = 'widget' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(420);
  const resizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, width: 0 });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ys_chat_messages');
      return saved ? JSON.parse(saved).slice(-80) : [];
    } catch { return []; }
  });
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('ys_chat_session'));
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [lastPollTime, setLastPollTime] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const api = (path: string) => `${apiBase}${path}`;

  useEffect(() => {
    if (messages.length > 0) {
      try { localStorage.setItem('ys_chat_messages', JSON.stringify(messages.slice(-80))); } catch {}
    }
  }, [messages]);

  useEffect(() => {
    if (sessionId) localStorage.setItem('ys_chat_session', sessionId);
  }, [sessionId]);

  useEffect(() => { if (isOpen) setShowPulse(false); }, [isOpen]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [isOpen]);

  const createSession = async (): Promise<string | null> => {
    if (isCreatingSession) return null;
    setIsCreatingSession(true);
    try {
      const res = await fetch(api('/api/chat/session'), { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.session_id;
    } catch (err) {
      console.error('ChatWidget: session creation failed', err);
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  };

  useEffect(() => {
    if (!isOpen || sessionId) return;
    (async () => {
      const id = await createSession();
      if (id) {
        setSessionId(id);
        setMessages([{
          id: 'welcome',
          sender: 'ai',
          text: "Hey! I'm Yirra AI — ask me anything about the Replicant GEN 1 build. Parts, downloads, firmware, assembly — I've got the full docs.",
          ts: new Date().toISOString()
        }]);
      }
    })();
  }, [isOpen]);

  const pollMessages = useCallback(async () => {
    if (!sessionId) return;
    const since = lastPollTime || new Date(Date.now() - 5000).toISOString();
    try {
      const res = await fetch(api(`/api/chat/poll/${sessionId}?after=${encodeURIComponent(since)}`));
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMsgs = data.messages
            .filter((m: any) => !existingIds.has(String(m.id)))
            .map((m: any) => ({ id: String(m.id), sender: m.sender, text: m.message, ts: m.timestamp }));
          return newMsgs.length ? [...prev, ...newMsgs] : prev;
        });
        setLastPollTime(new Date().toISOString());
      }
    } catch {}
  }, [sessionId, lastPollTime, apiBase]);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    pollIntervalRef.current = setInterval(pollMessages, 3000);
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, [isOpen, sessionId, pollMessages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending || !sessionId) return;
    setInput('');
    setIsSending(true);

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    // Add empty AI bubble immediately — text fills in token by token
    const aiMsgId = `a-${Date.now()}`;
    setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: '', ts: new Date().toISOString() }]);

    try {
      const res = await fetch(api('/api/chat/anthropic'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let event: { type: string; text?: string; ui?: { productCards?: unknown[] }; message?: string };
          try { event = JSON.parse(line.slice(6)); } catch { continue; }

          if (event.type === 'delta' && event.text) {
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, text: m.text + event.text } : m
            ));
          } else if (event.type === 'done') {
            setLastPollTime(new Date().toISOString());
            if ((event.ui?.productCards?.length ?? 0) > 0) {
              setMessages(prev => [...prev, {
                id: `pc-${Date.now()}`, sender: 'ai' as const, type: 'product_cards',
                cards: event.ui!.productCards as unknown[], ts: new Date().toISOString()
              } as ChatMessage]);
            }
          } else if (event.type === 'error') {
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId
                ? { ...m, type: 'error', text: "Sorry, I'm having trouble connecting. Please try again." }
                : m
            ));
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, type: 'error', text: "Sorry, I'm having trouble connecting. Try again in a moment." }
          : m
      ));
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startResize = (e: React.MouseEvent) => {
    resizingRef.current = true;
    resizeStartRef.current = { x: e.clientX, width: panelWidth };
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = resizeStartRef.current.x - ev.clientX;
      setPanelWidth(Math.min(640, Math.max(280, resizeStartRef.current.width + delta)));
    };
    const onUp = () => {
      resizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setLastPollTime(null);
    localStorage.removeItem('ys_chat_messages');
    localStorage.removeItem('ys_chat_session');
  };

  // ── Shared inner content (used by both modes) ───────────────────────────
  const chatHeader = (
    <div className="ys-chat-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" fill="none" stroke="#0ea5e9" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.471-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--chat-header-text)' }}>Yirra AI</div>
          <div style={{ fontSize: 11, color: 'var(--chat-text-muted)' }}>
            {isCreatingSession ? 'Starting session…' : 'Replicant GEN 1 Expert'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {messages.length > 0 && (
          <button className="ys-icon-btn" onClick={clearChat} title="Clear chat">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        )}
        <button className="ys-icon-btn" onClick={() => setIsOpen(false)} title="Close">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );

  const chatMessages = (
    <div className="ys-chat-messages">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`ys-bubble-wrap ${msg.sender === 'user' ? 'user' : msg.sender === 'admin' ? 'admin' : 'ai'}`}
          >
            {msg.sender !== 'user' && (
              <span className={`ys-sender-badge ${msg.sender === 'admin' ? 'admin' : 'ai'}`}>
                {msg.sender === 'admin' ? 'Support' : 'AI'}
              </span>
            )}
            <div
              className={`ys-bubble ${msg.sender === 'user' ? 'user' : msg.sender === 'admin' ? 'admin' : 'ai'}`}
              dangerouslySetInnerHTML={msg.sender !== 'user' ? { __html: renderMarkdown(msg.text || '') } : undefined}
            >
              {msg.sender === 'user' ? msg.text : undefined}
            </div>
            <span className="ys-timestamp">{relativeTime(msg.ts)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {isTyping && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ys-typing">
          <div className="ys-shimmer" />
          <span style={{ fontSize: 12, color: 'var(--chat-text-muted)' }}>Thinking…</span>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const chatFooter = (
    <div className="ys-chat-footer">
      <div className="ys-chat-input-row">
        <textarea
          ref={inputRef}
          className="ys-chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about builds, parts, downloads…"
          rows={1}
          disabled={isSending || isCreatingSession}
          autoComplete="off"
        />
        <button className="ys-chat-send-btn" onClick={sendMessage} disabled={!input.trim() || isSending || isCreatingSession}>
          {isSending ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'ys-spin 0.8s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
            </svg>
          )}
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--chat-text-muted)', marginTop: 8, textAlign: 'center' }}>
        Yirra AI · <a href="https://yirrasystems.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--chat-accent)', textDecoration: 'none' }}>Store</a>
      </div>
    </div>
  );

  // ── Panel mode ───────────────────────────────────────────────────────────
  if (mode === 'panel') {
    return (
      <>
        <style>{WIDGET_STYLES}</style>
        <div className="ys-chat-root" data-theme={theme} style={{ fontFamily: "'Outfit', -apple-system, sans-serif" }}>
          {/* Closed: persistent edge tab */}
          <AnimatePresence>
            {!isOpen && (
              <motion.button
                className="ys-side-tab"
                onClick={() => setIsOpen(true)}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                title="Open Yirra AI"
              >
                {showPulse && <div className="ys-fab-pulse" style={{ borderRadius: 10 }} />}
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.471-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"/>
                </svg>
                <span className="ys-side-tab-label">AI</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Open: side panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="ys-side-panel-container"
                style={{ width: panelWidth }}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              >
                <div className="ys-resize-handle" onMouseDown={startResize} />
                {chatHeader}
                {chatMessages}
                {chatFooter}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  }

  // ── Widget mode (default — floating FAB + popup) ──────────────────────────
  return (
    <>
      <style>{WIDGET_STYLES}</style>
      <div
        className="ys-chat-root"
        data-theme={theme}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: "'Outfit', -apple-system, sans-serif" }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="ys-chat-panel"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{ marginBottom: '12px', transformOrigin: 'bottom right' }}
            >
              {chatHeader}
              {chatMessages}
              {chatFooter}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button className="ys-fab" onClick={() => setIsOpen(o => !o)} whileTap={{ scale: 0.93 }}>
          {showPulse && !isOpen && <div className="ys-fab-pulse" />}
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.471-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"/>
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <style>{`@keyframes ys-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
};

export default ChatWidget;
