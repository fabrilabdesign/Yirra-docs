import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminNewsletter = () => {
  const { getToken } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    growth: 0
  });
  
  // Email composition state
  const [emailComposer, setEmailComposer] = useState({
    open: false,
    subject: '',
    content: '',
    type: 'announcement', // announcement, product_launch, update
    sending: false
  });
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    source: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(getApiUrl('/api/admin/newsletter/subscribers'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch subscribers');
      
      const data = await response.json();
      setSubscribers(data);
    } catch (err) {
      setError('Failed to load subscribers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(getApiUrl('/api/admin/newsletter/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const exportSubscribers = async (format = 'csv') => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`/api/admin/newsletter/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export subscribers');
      console.error(err);
    }
  };

  const sendEmail = async () => {
    try {
      setEmailComposer(prev => ({ ...prev, sending: true }));
      
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(getApiUrl('/api/admin/newsletter/send'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: emailComposer.subject,
          content: emailComposer.content,
          type: emailComposer.type,
          recipients: 'all' // Could be extended to support segments
        })
      });
      
      if (!response.ok) throw new Error('Failed to send email');
      
      setEmailComposer({
        open: false,
        subject: '',
        content: '',
        type: 'announcement',
        sending: false
      });
      
      alert('Email sent successfully to all subscribers!');
    } catch (err) {
      setError('Failed to send email');
      console.error(err);
      setEmailComposer(prev => ({ ...prev, sending: false }));
    }
  };

  const deleteSubscriber = async (id) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
    
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete subscriber');
      
      setSubscribers(prev => prev.filter(sub => sub.id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      setError('Failed to delete subscriber');
      console.error(err);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSource = filters.source === 'all' || subscriber.source === filters.source;
    
    let matchesDate = true;
    if (filters.dateRange !== 'all') {
      const subDate = new Date(subscriber.subscribed_at);
      const now = new Date();
      const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      matchesDate = subDate >= cutoff;
    }
    
    return matchesSearch && matchesSource && matchesDate;
  });

  return React.createElement('div', { 
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
    style: { 
      fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,sans-serif',
      background: '#0d1117',
      minHeight: '100vh'
    }
  },
    React.createElement('div', { className: 'mb-8' },
      React.createElement('h1', { 
        className: 'text-3xl font-bold mb-2',
        style: { 
          fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,sans-serif',
          color: '#f0f6fc',
          fontSize: '24px',
          fontWeight: '600',
          letterSpacing: '-0.01em'
        }
      }, 'Newsletter Marketing'),
      React.createElement('p', { 
        className: 'text-gray-400',
        style: { color: '#8b949e', fontSize: '14px' }
      }, 'Manage subscribers and send marketing campaigns')
    ),

    // Stats Cards
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-5 mb-8' },
      React.createElement('div', { 
        className: 'rounded-lg p-6',
        style: { 
          background: '#161b22',
          border: '1px solid #30363d'
        }
      },
        React.createElement('div', { className: 'flex items-center mb-4' },
          React.createElement('div', { 
            className: 'w-10 h-10 rounded flex items-center justify-center',
            style: { backgroundColor: 'rgba(0, 242, 254, 0.1)' }
          },
            React.createElement('svg', { 
              className: 'w-5 h-5', 
              fill: 'currentColor', 
              viewBox: '0 0 20 20',
              style: { color: '#00f2fe' }
            },
              React.createElement('path', { d: 'M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' }),
              React.createElement('path', { d: 'M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' })
            )
          )
        ),
        React.createElement('div', {},
          React.createElement('p', { 
            className: 'text-sm font-medium mb-1',
            style: { 
              color: '#8b949e', 
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }
          }, 'Total Subscribers'),
          React.createElement('p', { 
            className: 'text-2xl font-bold',
            style: { 
              color: '#f0f6fc',
              fontSize: '24px',
              fontWeight: '600'
            }
          }, stats.total.toLocaleString())
        )
      ),
      
      React.createElement('div', { 
        className: 'rounded-lg p-6',
        style: { 
          background: '#161b22',
          border: '1px solid #30363d'
        }
      },
        React.createElement('div', { className: 'flex items-center mb-4' },
          React.createElement('div', { 
            className: 'w-10 h-10 rounded flex items-center justify-center',
            style: { backgroundColor: 'rgba(63, 185, 80, 0.1)' }
          },
            React.createElement('svg', { 
              className: 'w-5 h-5', 
              fill: 'currentColor', 
              viewBox: '0 0 20 20',
              style: { color: '#3fb950' }
            },
              React.createElement('path', { fillRule: 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' })
            )
          )
        ),
        React.createElement('div', {},
          React.createElement('p', { 
            className: 'text-sm font-medium mb-1',
            style: { 
              color: '#8b949e', 
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }
          }, 'This Week'),
          React.createElement('p', { 
            className: 'text-2xl font-bold',
            style: { 
              color: '#f0f6fc',
              fontSize: '24px',
              fontWeight: '600'
            }
          }, stats.thisWeek.toLocaleString())
        )
      ),
      
      React.createElement('div', { 
        className: 'rounded-lg p-6',
        style: { 
          background: '#161b22',
          border: '1px solid #30363d'
        }
      },
        React.createElement('div', { className: 'flex items-center mb-4' },
          React.createElement('div', { 
            className: 'w-10 h-10 rounded flex items-center justify-center',
            style: { backgroundColor: 'rgba(88, 166, 255, 0.1)' }
          },
            React.createElement('svg', { 
              className: 'w-5 h-5', 
              fill: 'currentColor', 
              viewBox: '0 0 20 20',
              style: { color: '#58a6ff' }
            },
              React.createElement('path', { fillRule: 'evenodd', d: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' })
            )
          )
        ),
        React.createElement('div', {},
          React.createElement('p', { 
            className: 'text-sm font-medium mb-1',
            style: { 
              color: '#8b949e', 
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }
          }, 'This Month'),
          React.createElement('p', { 
            className: 'text-2xl font-bold',
            style: { 
              color: '#f0f6fc',
              fontSize: '24px',
              fontWeight: '600'
            }
          }, stats.thisMonth.toLocaleString())
        )
      ),
      
      React.createElement('div', { 
        className: 'rounded-lg p-6',
        style: { 
          background: '#161b22',
          border: '1px solid #30363d'
        }
      },
        React.createElement('div', { className: 'flex items-center mb-4' },
          React.createElement('div', { 
            className: 'w-10 h-10 rounded flex items-center justify-center',
            style: { backgroundColor: 'rgba(218, 120, 255, 0.1)' }
          },
            React.createElement('svg', { 
              className: 'w-5 h-5', 
              fill: 'currentColor', 
              viewBox: '0 0 20 20',
              style: { color: '#da78ff' }
            },
              React.createElement('path', { fillRule: 'evenodd', d: 'M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z' })
            )
          )
        ),
        React.createElement('div', {},
          React.createElement('p', { 
            className: 'text-sm font-medium mb-1',
            style: { 
              color: '#8b949e', 
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }
          }, 'Growth Rate'),
          React.createElement('p', { 
            className: 'text-2xl font-bold',
            style: { 
              color: '#f0f6fc',
              fontSize: '24px',
              fontWeight: '600'
            }
          }, `${stats.growth > 0 ? '+' : ''}${stats.growth.toFixed(1)}%`)
        )
      )
    ),

    // Action Buttons
    React.createElement('div', { className: 'flex flex-wrap gap-4 mb-6' },
      React.createElement('button', {
        onClick: () => setEmailComposer(prev => ({ ...prev, open: true })),
        className: 'px-6 py-2 text-white font-medium rounded-lg hover:scale-105 transition-all duration-200',
        style: { backgroundColor: '#00f2fe' },
        onMouseEnter: (e) => e.target.style.backgroundColor = '#00d8e0',
        onMouseLeave: (e) => e.target.style.backgroundColor = '#00f2fe'
      }, '📧 Compose Email'),
      
      React.createElement('button', {
        onClick: () => exportSubscribers('csv'),
        className: 'px-6 py-2 text-white font-medium rounded-lg transition-all duration-200',
        style: { backgroundColor: '#21262d', border: '1px solid #30363d' },
        onMouseEnter: (e) => e.target.style.backgroundColor = '#30363d',
        onMouseLeave: (e) => e.target.style.backgroundColor = '#21262d'
      }, '📊 Export CSV'),
      
      React.createElement('button', {
        onClick: () => exportSubscribers('json'),
        className: 'px-6 py-2 text-white font-medium rounded-lg transition-all duration-200',
        style: { backgroundColor: '#21262d', border: '1px solid #30363d' },
        onMouseEnter: (e) => e.target.style.backgroundColor = '#30363d',
        onMouseLeave: (e) => e.target.style.backgroundColor = '#21262d'
      }, '💾 Export JSON'),
      
      React.createElement('button', {
        onClick: fetchSubscribers,
        className: 'px-6 py-2 text-white font-medium rounded-lg transition-all duration-200',
        style: { backgroundColor: '#58a6ff' },
        onMouseEnter: (e) => e.target.style.backgroundColor = '#4493f8',
        onMouseLeave: (e) => e.target.style.backgroundColor = '#58a6ff'
      }, '🔄 Refresh')
    ),

    // Filters
    React.createElement('div', { 
      className: 'rounded-lg p-6 mb-6',
      style: { 
        background: '#161b22',
        border: '1px solid #30363d'
      }
    },
      React.createElement('h3', { 
        className: 'text-lg font-semibold mb-4',
        style: { color: '#f0f6fc' }
      }, 'Filters'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
        React.createElement('div', {},
          React.createElement('label', { 
            className: 'block text-sm font-medium mb-2',
            style: { color: '#f0f6fc' }
          }, 'Search'),
          React.createElement('input', {
            type: 'text',
            value: filters.search,
            onChange: (e) => setFilters(prev => ({ ...prev, search: e.target.value })),
            placeholder: 'Search by email...',
            className: 'w-full px-3 py-2 rounded-md focus:outline-none transition-colors',
            style: { 
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              color: '#f0f6fc'
            },
            onFocus: (e) => e.target.style.borderColor = '#00f2fe',
            onBlur: (e) => e.target.style.borderColor = '#30363d'
          })
        ),
        
        React.createElement('div', {},
          React.createElement('label', { 
            className: 'block text-sm font-medium mb-2',
            style: { color: '#f0f6fc' }
          }, 'Source'),
          React.createElement('select', {
            value: filters.source,
            onChange: (e) => setFilters(prev => ({ ...prev, source: e.target.value })),
            className: 'w-full px-3 py-2 rounded-md focus:outline-none transition-colors',
            style: { 
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              color: '#f0f6fc'
            },
            onFocus: (e) => e.target.style.borderColor = '#00f2fe',
            onBlur: (e) => e.target.style.borderColor = '#30363d'
          },
            React.createElement('option', { value: 'all' }, 'All Sources'),
            React.createElement('option', { value: 'coming_soon_page' }, 'Coming Soon Page'),
            React.createElement('option', { value: 'website' }, 'Website'),
            React.createElement('option', { value: 'manual' }, 'Manual Entry')
          )
        ),
        
        React.createElement('div', {},
          React.createElement('label', { 
            className: 'block text-sm font-medium mb-2',
            style: { color: '#f0f6fc' }
          }, 'Date Range'),
          React.createElement('select', {
            value: filters.dateRange,
            onChange: (e) => setFilters(prev => ({ ...prev, dateRange: e.target.value })),
            className: 'w-full px-3 py-2 rounded-md focus:outline-none transition-colors',
            style: { 
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              color: '#f0f6fc'
            },
            onFocus: (e) => e.target.style.borderColor = '#00f2fe',
            onBlur: (e) => e.target.style.borderColor = '#30363d'
          },
            React.createElement('option', { value: 'all' }, 'All Time'),
            React.createElement('option', { value: '7d' }, 'Last 7 Days'),
            React.createElement('option', { value: '30d' }, 'Last 30 Days'),
            React.createElement('option', { value: '90d' }, 'Last 90 Days')
          )
        )
      )
    ),

    // Subscribers Table
    React.createElement('div', { 
      className: 'rounded-lg overflow-hidden',
      style: { 
        background: '#161b22',
        border: '1px solid #30363d'
      }
    },
      React.createElement('div', { 
        className: 'px-6 py-4',
        style: { borderBottom: '1px solid #30363d' }
      },
        React.createElement('h3', { 
          className: 'text-lg font-semibold',
          style: { color: '#f0f6fc' }
        }, `Subscribers (${filteredSubscribers.length})`)
      ),
      
      loading ? (
        React.createElement('div', { className: 'p-8 text-center' },
          React.createElement('div', { className: 'inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' })
        )
      ) : error ? (
        React.createElement('div', { className: 'p-8 text-center text-red-600' }, error)
      ) : (
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { 
            className: 'min-w-full',
            style: { borderCollapse: 'separate', borderSpacing: '0' }
          },
            React.createElement('thead', {},
              React.createElement('tr', {},
                React.createElement('th', { 
                  className: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                  style: { 
                    color: '#8b949e',
                    backgroundColor: '#21262d',
                    borderBottom: '1px solid #30363d'
                  }
                }, 'Email'),
                React.createElement('th', { 
                  className: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                  style: { 
                    color: '#8b949e',
                    backgroundColor: '#21262d',
                    borderBottom: '1px solid #30363d'
                  }
                }, 'Source'),
                React.createElement('th', { 
                  className: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                  style: { 
                    color: '#8b949e',
                    backgroundColor: '#21262d',
                    borderBottom: '1px solid #30363d'
                  }
                }, 'Subscribed'),
                React.createElement('th', { 
                  className: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                  style: { 
                    color: '#8b949e',
                    backgroundColor: '#21262d',
                    borderBottom: '1px solid #30363d'
                  }
                }, 'Actions')
              )
            ),
            React.createElement('tbody', { 
              style: { backgroundColor: '#161b22' }
            },
              filteredSubscribers.map(subscriber =>
                React.createElement('tr', { 
                  key: subscriber.id,
                  style: { borderBottom: '1px solid #30363d' }
                },
                  React.createElement('td', { 
                    className: 'px-6 py-4 whitespace-nowrap text-sm font-medium',
                    style: { color: '#f0f6fc' }
                  }, subscriber.email),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm' },
                    React.createElement('span', { 
                      className: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      style: { 
                        backgroundColor: subscriber.source === 'coming_soon_page' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(139, 148, 158, 0.1)',
                        color: subscriber.source === 'coming_soon_page' ? '#00f2fe' : '#8b949e'
                      }
                    }, subscriber.source)
                  ),
                  React.createElement('td', { 
                    className: 'px-6 py-4 whitespace-nowrap text-sm',
                    style: { color: '#8b949e' }
                  }, new Date(subscriber.subscribed_at).toLocaleDateString()),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                    React.createElement('button', {
                      onClick: () => deleteSubscriber(subscriber.id),
                      className: 'transition-colors duration-200',
                      style: { color: '#f85149' },
                      onMouseEnter: (e) => e.target.style.color = '#ff6b6b',
                      onMouseLeave: (e) => e.target.style.color = '#f85149'
                    }, 'Remove')
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Email Composer Modal
    emailComposer.open && React.createElement('div', { 
      className: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50',
      onClick: (e) => {
        if (e.target === e.currentTarget) {
          setEmailComposer(prev => ({ ...prev, open: false }));
        }
      }
    },
      React.createElement('div', { 
        className: 'relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md',
        style: { 
          backgroundColor: '#161b22',
          border: '1px solid #30363d'
        }
      },
        React.createElement('div', { className: 'flex justify-between items-center mb-4' },
          React.createElement('h3', { 
            className: 'text-lg font-semibold',
            style: { color: '#f0f6fc' }
          }, 'Compose Newsletter Email'),
          React.createElement('button', {
            onClick: () => setEmailComposer(prev => ({ ...prev, open: false })),
            className: 'text-gray-400 hover:text-gray-600'
          }, '✕')
        ),
        
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', {},
            React.createElement('label', { 
              className: 'block text-sm font-medium mb-2',
              style: { color: '#f0f6fc' }
            }, 'Email Type'),
            React.createElement('select', {
              value: emailComposer.type,
              onChange: (e) => setEmailComposer(prev => ({ ...prev, type: e.target.value })),
              className: 'w-full px-3 py-2 rounded-md focus:outline-none transition-colors',
              style: { 
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                color: '#f0f6fc'
              }
            },
              React.createElement('option', { value: 'announcement' }, '📢 Announcement'),
              React.createElement('option', { value: 'product_launch' }, '🚀 Product Launch'),
              React.createElement('option', { value: 'update' }, '📰 Company Update')
            )
          ),
          
          React.createElement('div', {},
            React.createElement('label', { 
              className: 'block text-sm font-medium mb-2',
              style: { color: '#f0f6fc' }
            }, 'Subject Line'),
            React.createElement('input', {
              type: 'text',
              value: emailComposer.subject,
              onChange: (e) => setEmailComposer(prev => ({ ...prev, subject: e.target.value })),
              placeholder: 'Enter email subject...',
              className: 'w-full px-3 py-2 rounded-md focus:outline-none transition-colors',
              style: { 
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                color: '#f0f6fc'
              }
            })
          ),
          
          React.createElement('div', {},
            React.createElement('label', { 
              className: 'block text-sm font-medium mb-2',
              style: { color: '#f0f6fc' }
            }, 'Email Content'),
            React.createElement('textarea', {
              value: emailComposer.content,
              onChange: (e) => setEmailComposer(prev => ({ ...prev, content: e.target.value })),
              placeholder: 'Write your email content here...',
              rows: 10,
              className: 'w-full px-3 py-2 rounded-md focus:outline-none transition-colors',
              style: { 
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                color: '#f0f6fc'
              }
            })
          ),
          
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-4' },
            React.createElement('button', {
              onClick: () => setEmailComposer(prev => ({ ...prev, open: false })),
              className: 'px-4 py-2 rounded-md transition-colors duration-200',
              style: { 
                backgroundColor: '#21262d',
                color: '#f0f6fc',
                border: '1px solid #30363d'
              },
              onMouseEnter: (e) => e.target.style.backgroundColor = '#30363d',
              onMouseLeave: (e) => e.target.style.backgroundColor = '#21262d'
            }, 'Cancel'),
            React.createElement('button', {
              onClick: sendEmail,
              disabled: emailComposer.sending || !emailComposer.subject || !emailComposer.content,
              className: 'px-4 py-2 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
              style: { backgroundColor: '#00f2fe' }
            }, emailComposer.sending ? 'Sending...' : `Send to ${stats.total} subscribers`)
          )
        )
      )
    )
  );
};

export default AdminNewsletter;