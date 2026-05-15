import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input } from '../ui/input';
import { useAuth } from '@clerk/clerk-react';

function relativeTime(ts) {
  if (!ts) return '—';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

function isActive(session) {
  if (!session.last_activity) return false;
  return Date.now() - new Date(session.last_activity).getTime() < 5 * 60 * 1000;
}

function isToday(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

// Highlight [redacted-*] tokens in message content
function RedactedContent({ content }) {
  const parts = content.split(/(\[redacted-[^\]]+\])/g);
  return (
    <span>
      {parts.map((part, i) =>
        /^\[redacted-/.test(part) ? (
          <span
            key={i}
            title="PII was redacted before storage — original is now preserved"
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-0.5"
          >
            ⚠ {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// Session score badge
function LeadScore({ score }) {
  if (!score || score === 0) return null;
  const color = score >= 10 ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
    : score >= 5 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    : 'text-text-tertiary bg-elev1 border-line-soft';
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${color}`}>
      {score}pts
    </span>
  );
}

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'email', label: 'Has Email' },
  { id: 'today', label: 'Today' },
];

const AdminChat = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  // Mobile: show message pane when a session is selected
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'messages'

  const { getToken } = useAuth();
  const tokenRef = useRef(null);
  const sessionsAbortRef = useRef(null);
  const messagesAbortRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const replyInputRef = useRef(null);

  // Handle ?session= deep link from notification email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    if (sessionParam) {
      // Will auto-select after sessions load
      tokenRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { tokenRef.current = await getToken(); } catch (_) {}
      if (mounted) fetchChatSessions('');
    })();
    return () => { mounted = false; };
  }, [getToken]);

  const authHeaders = useCallback(async () => {
    const token = tokenRef.current || (await getToken());
    return { Authorization: token ? `Bearer ${token}` : undefined, 'Content-Type': 'application/json' };
  }, [getToken]);

  const fetchChatSessions = useCallback(async (query) => {
    try {
      setLoadingSessions(true);
      if (sessionsAbortRef.current) sessionsAbortRef.current.abort();
      const ac = new AbortController();
      sessionsAbortRef.current = ac;
      const headers = await authHeaders();
      const url = `/api/chat/sessions?limit=300&hide_empty=${hideEmpty}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const response = await fetch(url, { headers, signal: ac.signal });
      if (response.ok) {
        const data = await response.json();
        const rows = Array.isArray(data) ? data : [];
        setSessions(rows);

        // Auto-select from URL param
        const params = new URLSearchParams(window.location.search);
        const sessionParam = params.get('session');
        if (sessionParam) {
          const match = rows.find(s => s.id === sessionParam || s.id.endsWith(sessionParam));
          if (match) {
            setSelectedSession(match);
            setMobileView('messages');
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
      setLoadingSessions(false);
    }
  }, [authHeaders, hideEmpty]);

  useEffect(() => {
    const handle = setTimeout(() => fetchChatSessions(searchTerm.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchTerm, fetchChatSessions]);

  // Refresh sessions every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchChatSessions(searchTerm.trim()), 30000);
    return () => clearInterval(interval);
  }, [fetchChatSessions, searchTerm]);

  const fetchSessionMessages = useCallback(async (sessionId, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      if (messagesAbortRef.current) messagesAbortRef.current.abort();
      const ac = new AbortController();
      messagesAbortRef.current = ac;
      const headers = await authHeaders();
      const response = await fetch(`/api/chat/session/${sessionId}`, { headers, signal: ac.signal });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching session messages:', error);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedSession) return;
    pollRef.current = setInterval(() => {
      fetchSessionMessages(selectedSession.id, true);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedSession, fetchSessionMessages]);

  const selectSession = (session) => {
    // Stop the old poll immediately so it can't abort the incoming fetch
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setMessages([]);
    setSelectedSession(session);
    setReplyText('');
    fetchSessionMessages(session.id);
    setMobileView('messages');
  };

  const goBackToList = () => {
    setMobileView('list');
  };

  const sendAdminReply = async () => {
    if (!replyText.trim() || !selectedSession || sending) return;
    const text = replyText.trim();
    setReplyText('');
    setSending(true);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/chat/admin-reply', {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId: selectedSession.id, message: text }),
      });
      if (res.ok) {
        setMessages(prev => [...prev, {
          role: 'admin',
          content: text,
          redacted: false,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error('Admin reply error:', err);
    } finally {
      setSending(false);
      setTimeout(() => replyInputRef.current?.focus(), 100);
    }
  };

  const handleReplyKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAdminReply();
    }
  };

  // Client-side filter on top of API results
  const filteredSessions = useMemo(() => {
    let list = [...sessions];
    if (filterTab === 'active') list = list.filter(s => isActive(s));
    else if (filterTab === 'email') list = list.filter(s => s.user_email);
    else if (filterTab === 'today') list = list.filter(s => isToday(s.last_activity || s.created_at));

    return list.sort((a, b) => {
      const aActive = isActive(a), bActive = isActive(b);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return new Date(b.last_activity || 0) - new Date(a.last_activity || 0);
    });
  }, [sessions, filterTab]);

  const counts = useMemo(() => ({
    all: sessions.length,
    active: sessions.filter(isActive).length,
    email: sessions.filter(s => s.user_email).length,
    today: sessions.filter(s => isToday(s.last_activity || s.created_at)).length,
  }), [sessions]);

  const getSenderStyle = (role) => {
    switch (role) {
      case 'user': return {
        wrap: 'flex justify-end',
        bubble: 'bg-brand text-text-inverse rounded-2xl rounded-br-sm',
      };
      case 'admin': return {
        wrap: 'flex justify-start',
        bubble: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-2xl rounded-bl-sm',
      };
      default: return {
        wrap: 'flex justify-start',
        bubble: 'bg-elev1 text-text-primary border border-line-soft rounded-2xl rounded-bl-sm',
      };
    }
  };

  const getSenderLabel = (role) => {
    if (role === 'admin') return 'You (Support)';
    if (role === 'assistant') return 'Yirra AI';
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Session list panel
  // ──────────────────────────────────────────────────────────────────────────
  const SessionList = (
    <div className={`flex flex-col h-full ${mobileView === 'messages' ? 'hidden lg:flex' : 'flex'} lg:flex`}>
      {/* Search */}
      <div className="p-3 border-b border-line-soft space-y-2">
        <Input
          type="text"
          placeholder="Search sessions or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-[13px]"
        />
        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`flex-1 text-[11px] font-medium px-1.5 py-1 rounded-6 transition-colors ${
                filterTab === tab.id
                  ? 'bg-brand text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary hover:bg-hover'
              }`}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={`ml-1 ${filterTab === tab.id ? 'opacity-80' : 'opacity-60'}`}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Hide empty toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setHideEmpty(v => !v)}
            className={`relative w-8 h-4 rounded-full transition-colors ${hideEmpty ? 'bg-brand' : 'bg-neutral-600'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${hideEmpty ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-[11px] text-text-tertiary">Hide empty sessions</span>
        </label>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-text-tertiary text-[13px]">
            {loadingSessions ? 'Loading…' : 'No sessions match'}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const active = isActive(session);
            const selected = selectedSession?.id === session.id;
            return (
              <div
                key={session.id}
                onClick={() => selectSession(session)}
                className={`p-3 border-b border-line-soft cursor-pointer transition-colors ${
                  selected ? 'bg-brand/10 border-l-2 border-l-brand' : 'hover:bg-hover'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Active dot */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${active ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-neutral-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {session.user_email ? (
                        <span className="text-[12px] font-semibold text-text-primary truncate max-w-[180px]">
                          {session.user_email}
                        </span>
                      ) : (
                        <span className="text-[12px] font-mono text-text-tertiary">
                          …{session.id.slice(-10)}
                        </span>
                      )}
                      {session.user_email && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 font-medium flex-shrink-0">
                          ✉
                        </span>
                      )}
                      <LeadScore score={session.lead_score} />
                    </div>
                    {/* First message preview */}
                    {session.first_message && (
                      <p className="text-[11px] text-text-secondary truncate mt-0.5 leading-4">
                        {session.first_message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-text-tertiary">
                        {relativeTime(session.last_activity || session.created_at)}
                      </span>
                      <span className="text-[10px] text-text-tertiary">
                        {session.message_count} msg{session.message_count !== 1 ? 's' : ''}
                      </span>
                      {active && (
                        <span className="text-[10px] font-semibold text-emerald-400">● live</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t border-line-soft flex items-center justify-between">
        <span className="text-[11px] text-text-tertiary">
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
        </span>
        {loadingSessions && (
          <div className="w-3 h-3 border border-brand border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Messages panel
  // ──────────────────────────────────────────────────────────────────────────
  const hasRedacted = messages.some(m => m.redacted);

  const MessagesPanel = (
    <div className={`flex flex-col h-full ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'} lg:flex`}>
      {/* Header */}
      <div className="px-3 py-3 border-b border-line-soft flex items-center gap-2">
        {/* Mobile back button */}
        <button
          onClick={goBackToList}
          className="lg:hidden p-1.5 rounded-8 hover:bg-hover text-text-secondary mr-1 flex-shrink-0"
          aria-label="Back to sessions"
        >
          ←
        </button>
        {selectedSession ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold text-text-primary">
                {selectedSession.user_email || `…${selectedSession.id.slice(-12)}`}
              </span>
              {isActive(selectedSession) && (
                <span className="text-[11px] text-emerald-400 font-medium">● Active now</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {selectedSession.user_email && (
                <span className="text-[11px] text-text-secondary font-mono truncate">
                  {selectedSession.id.slice(-16)}
                </span>
              )}
              {hasRedacted && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">
                  ⚠ contains old redactions
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[14px] text-text-tertiary">Select a session</span>
        )}
        {selectedSession && (
          <button
            onClick={() => fetchSessionMessages(selectedSession.id)}
            className="text-[11px] text-text-tertiary hover:text-text-secondary ml-auto flex-shrink-0"
          >
            ↺
          </button>
        )}
      </div>

      {/* Session meta bar */}
      {selectedSession && (
        <div className="px-3 py-2 bg-elev1 border-b border-line-soft flex flex-wrap items-center gap-3 text-[11px] text-text-tertiary">
          {selectedSession.user_email && (
            <span>✉ <a href={`mailto:${selectedSession.user_email}`} className="text-brand underline underline-offset-2">{selectedSession.user_email}</a></span>
          )}
          <span>💬 {selectedSession.message_count} messages</span>
          {selectedSession.lead_score > 0 && (
            <span>⭐ {selectedSession.lead_score} pts</span>
          )}
          {selectedSession.last_intent && (
            <span>🎯 {selectedSession.last_intent}</span>
          )}
          <span>🕐 Started {relativeTime(selectedSession.created_at)}</span>
        </div>
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
        {!selectedSession ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-2">
            <span className="text-4xl opacity-20">💬</span>
            <p className="text-[14px]">Select a chat session to view messages</p>
          </div>
        ) : loadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-text-tertiary py-12 text-[13px]">No messages yet</div>
        ) : (
          messages.map((message, index) => {
            const role = message.role || message.sender;
            const { wrap, bubble } = getSenderStyle(role);
            const label = getSenderLabel(role);
            return (
              <div key={index} className={wrap}>
                <div className="max-w-[85%] lg:max-w-[70%]">
                  {label && (
                    <div className={`text-[10px] font-semibold mb-1 px-1 ${
                      role === 'admin' ? 'text-emerald-400' : 'text-text-tertiary'
                    }`}>
                      {label}
                    </div>
                  )}
                  <div className={`px-3 py-2 ${bubble}`}>
                    <p className="text-[13px] leading-5 whitespace-pre-wrap">
                      <RedactedContent content={message.content || ''} />
                    </p>
                    <p className="text-[11px] mt-1 opacity-50">
                      {relativeTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Admin reply input */}
      {selectedSession && (
        <div className="border-t border-line-soft p-3 bg-surface">
          <div className="flex gap-2 items-end">
            <textarea
              ref={replyInputRef}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={handleReplyKey}
              placeholder="Type to take over from AI…"
              rows={2}
              disabled={sending}
              className="flex-1 resize-none rounded-12 border border-line-soft bg-elev1 text-text-primary text-[13px] px-3 py-2.5 outline-none focus:border-brand transition-colors placeholder:text-text-tertiary"
              style={{ fontFamily: 'inherit', fontSize: '16px' /* prevent iOS zoom */ }}
            />
            <button
              onClick={sendAdminReply}
              disabled={!replyText.trim() || sending}
              className="px-4 py-2.5 rounded-12 bg-brand text-text-inverse text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0 min-w-[72px] text-center"
            >
              {sending ? '…' : 'Send'}
            </button>
          </div>
          <p className="text-[10px] text-text-tertiary mt-1.5">
            ↵ Enter to send · AI paused for 5 min after your reply
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-app text-text-primary overflow-hidden">
      {/* Top bar - visible on desktop only or when in list view on mobile */}
      <div className={`px-4 py-3 border-b border-line-soft flex-shrink-0 ${mobileView === 'messages' ? 'hidden lg:flex' : 'flex'} items-center justify-between`}>
        <div>
          <h1 className="text-[17px] font-semibold text-text-primary leading-5">Live Chat</h1>
          <p className="text-[12px] text-text-secondary">View and respond to customer sessions</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 lg:grid lg:grid-cols-[320px_1fr]">
        {/* Sessions panel */}
        <div className="border-r border-line-soft flex flex-col min-h-0 w-full lg:w-auto">
          {SessionList}
        </div>

        {/* Messages panel */}
        <div className="flex flex-col min-h-0 w-full">
          {MessagesPanel}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
