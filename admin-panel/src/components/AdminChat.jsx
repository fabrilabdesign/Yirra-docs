import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input } from '../ui/input';
import { useAuth } from '@clerk/clerk-react';

const AdminChat = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { getToken } = useAuth();
  const tokenRef = useRef(null);
  const sessionsAbortRef = useRef(null);
  const messagesAbortRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        tokenRef.current = await getToken();
      } catch (e) {
        console.error('AdminChat: failed to get token', e);
      } finally {
        if (mounted) {
          fetchChatSessions('');
        }
      }
    })();
    return () => { mounted = false };
  }, [getToken]);

  const fetchChatSessions = useCallback(async (query) => {
    try {
      setLoadingSessions(true);
      // cancel any in-flight request
      if (sessionsAbortRef.current) sessionsAbortRef.current.abort();
      const ac = new AbortController();
      sessionsAbortRef.current = ac;
      const token = tokenRef.current || (await getToken());
      const url = `/api/chat/sessions?limit=200${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        },
        signal: ac.signal
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
      } else {
        console.warn('AdminChat: sessions fetch status', response.status);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching chat sessions:', error);
      }
    } finally {
      setLoading(false);
      setLoadingSessions(false);
    }
  }, [getToken]);

  // Debounced server-side search
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchChatSessions(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm, fetchChatSessions]);

  const fetchSessionMessages = async (sessionId) => {
    try {
      setLoadingMessages(true);
      if (messagesAbortRef.current) messagesAbortRef.current.abort();
      const ac = new AbortController();
      messagesAbortRef.current = ac;
      const token = tokenRef.current || (await getToken());
      const response = await fetch(`/api/chat/session/${sessionId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        },
        signal: ac.signal
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.warn('AdminChat: messages fetch status', response.status);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching session messages:', error);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-app min-h-screen text-text-primary">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-[18px] leading-6 font-semibold text-text-primary">Chat History</h1>
          <p className="text-text-secondary">View and manage customer chat sessions</p>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-12 shadow-elev1 overflow-hidden border border-line-soft">
              <div className="px-3 py-3 border-b border-line-soft">
                <h3 className="text-[14px] font-semibold text-text-primary">Chat Sessions ({sessions.length})</h3>
              </div>
                  <div className="max-h-96 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-4 text-center text-text-tertiary">
                    {loadingSessions ? 'Loading sessions…' : 'No chat sessions found'}
                  </div>
                ) : (
                  sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setSelectedSession(session);
                          fetchSessionMessages(session.id);
                        }}
                        className={`p-3 border-b border-line-soft cursor-pointer hover:bg-hover ${
                          selectedSession?.id === session.id ? 'bg-[rgba(99,102,241,.12)]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-text-primary">{session.id}</p>
                            {session.user_email && (
                              <p className="text-[12px] text-text-secondary">{session.user_email}</p>
                            )}
                            <p className="text-[12px] text-text-tertiary">
                              {formatDate(session.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-12 shadow-elev1 border border-line-soft">
              <div className="px-3 py-3 border-b border-line-soft">
                <h3 className="text-[14px] font-semibold text-text-primary">
                  {selectedSession ? `Messages for ${selectedSession.id}` : 'Select a session'}
                </h3>
              </div>
              <div className="p-3">
                {!selectedSession ? (
                  <div className="text-center text-text-tertiary py-8">
                    Select a chat session to view messages
                  </div>
                ) : loadingMessages ? (
                  <div className="text-center text-text-tertiary py-8">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-text-tertiary py-8">
                    No messages in this session
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-12 ${
                            message.role === 'user'
                              ? 'bg-brand text-text-inverse'
                              : 'bg-elev1 text-text-primary border border-line-soft'
                          }`}
                        >
                          <p className="text-[13px] leading-5">{message.content}</p>
                          <p className="text-[12px] mt-1 opacity-75">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
