import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminSettings = () => {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(getApiUrl('/api/admin/settings'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [key]: value
        }));
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (err) {
      console.error('Settings update error:', err);
      alert('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h2>System Settings</h2>
        <button onClick={fetchSettings} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="settings-sections">
        {/* General Settings */}
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>Site Name</label>
            <input
              type="text"
              value={settings.site_name || 'Yirra Systems'}
              onChange={(e) => updateSetting('site_name', e.target.value)}
              className="setting-input"
            />
            <div className="setting-description">
              The name of your store displayed throughout the site
            </div>
          </div>

          <div className="setting-item">
            <label>Site Description</label>
            <textarea
              value={settings.site_description || 'Professional drone parts and 3D printable STL files'}
              onChange={(e) => updateSetting('site_description', e.target.value)}
              className="setting-textarea"
              rows={3}
            />
            <div className="setting-description">
              Brief description used for SEO and social media
            </div>
          </div>

          <div className="setting-item">
            <label>Contact Email</label>
            <input
              type="email"
              value={settings.contact_email || 'support@yirrasystems.com'}
              onChange={(e) => updateSetting('contact_email', e.target.value)}
              className="setting-input"
            />
            <div className="setting-description">
              Primary contact email for customer support
            </div>
          </div>
        </div>

        {/* E-commerce Settings */}
        <div className="settings-section">
          <h3>E-commerce Settings</h3>
          <div className="setting-item">
            <label>Default Currency</label>
            <select
              value={settings.default_currency || 'USD'}
              onChange={(e) => updateSetting('default_currency', e.target.value)}
              className="setting-select"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={settings.tax_rate || '0'}
              onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value))}
              className="setting-input"
            />
            <div className="setting-description">
              Default tax rate applied to orders (can be overridden by location)
            </div>
          </div>

          <div className="setting-item">
            <label>Enable Guest Checkout</label>
            <div className="setting-toggle">
              <input
                type="checkbox"
                id="guest_checkout"
                checked={settings.allow_guest_checkout || false}
                onChange={(e) => updateSetting('allow_guest_checkout', e.target.checked)}
              />
              <label htmlFor="guest_checkout" className="toggle-label">
                Allow customers to checkout without creating an account
              </label>
            </div>
          </div>
        </div>

        {/* STL File Settings */}
        <div className="settings-section">
          <h3>STL File Settings</h3>
          <div className="setting-item">
            <label>Max File Size (MB)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={settings.max_stl_file_size || '50'}
              onChange={(e) => updateSetting('max_stl_file_size', parseInt(e.target.value))}
              className="setting-input"
            />
            <div className="setting-description">
              Maximum size for STL file uploads
            </div>
          </div>

          <div className="setting-item">
            <label>Download Limit per User</label>
            <input
              type="number"
              min="0"
              value={settings.download_limit_per_user || '0'}
              onChange={(e) => updateSetting('download_limit_per_user', parseInt(e.target.value))}
              className="setting-input"
            />
            <div className="setting-description">
              Maximum downloads per user per day (0 = unlimited)
            </div>
          </div>

          <div className="setting-item">
            <label>Require License Agreement</label>
            <div className="setting-toggle">
              <input
                type="checkbox"
                id="require_license"
                checked={settings.require_license_agreement || false}
                onChange={(e) => updateSetting('require_license_agreement', e.target.checked)}
              />
              <label htmlFor="require_license" className="toggle-label">
                Users must accept license before downloading STL files
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="settings-section">
          <h3>Email Settings</h3>
          <div className="setting-item">
            <label>SMTP Server</label>
            <input
              type="text"
              value={settings.smtp_server || ''}
              onChange={(e) => updateSetting('smtp_server', e.target.value)}
              className="setting-input"
              placeholder="smtp.example.com"
            />
          </div>

          <div className="setting-item">
            <label>SMTP Port</label>
            <input
              type="number"
              value={settings.smtp_port || '587'}
              onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Enable Email Notifications</label>
            <div className="setting-toggle">
              <input
                type="checkbox"
                id="email_notifications"
                checked={settings.email_notifications_enabled || false}
                onChange={(e) => updateSetting('email_notifications_enabled', e.target.checked)}
              />
              <label htmlFor="email_notifications" className="toggle-label">
                Send email notifications for orders and downloads
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <h3>Security Settings</h3>
          <div className="setting-item">
            <label>Session Timeout (minutes)</label>
            <input
              type="number"
              min="5"
              max="1440"
              value={settings.session_timeout || '60'}
              onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Max Login Attempts</label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.max_login_attempts || '5'}
              onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Enable Two-Factor Authentication</label>
            <div className="setting-toggle">
              <input
                type="checkbox"
                id="enable_2fa"
                checked={settings.enable_2fa || false}
                onChange={(e) => updateSetting('enable_2fa', e.target.checked)}
              />
              <label htmlFor="enable_2fa" className="toggle-label">
                Require 2FA for admin accounts
              </label>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="settings-section">
          <h3>Maintenance</h3>
          <div className="setting-item">
            <label>Maintenance Mode</label>
            <div className="setting-toggle">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={settings.maintenance_mode || false}
                onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
              />
              <label htmlFor="maintenance_mode" className="toggle-label">
                Enable maintenance mode (site will be temporarily unavailable)
              </label>
            </div>
          </div>

          <div className="setting-item">
            <label>Maintenance Message</label>
            <textarea
              value={settings.maintenance_message || 'We are currently performing scheduled maintenance. Please check back soon.'}
              onChange={(e) => updateSetting('maintenance_message', e.target.value)}
              className="setting-textarea"
              rows={3}
            />
          </div>
        </div>
      </div>

      {saving && (
        <div className="saving-indicator">
          Saving settings...
        </div>
      )}

      <style jsx>{`
        .admin-settings {
          padding: 0;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .settings-header h2 {
          margin: 0;
          color: #ffffff;
        }

        .refresh-btn {
          padding: 8px 16px;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .refresh-btn:hover {
          background: #3182ce;
        }

        .error-banner {
          background: #fed7d7;
          color: #742a2a;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #feb2b2;
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .settings-section {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
        }

        .settings-section h3 {
          margin: 0 0 20px 0;
          color: #ffffff;
          font-size: 1.25rem;
          border-bottom: 2px solid rgba(56, 68, 82, 0.3);
          padding-bottom: 10px;
        }

        .setting-item {
          margin-bottom: 24px;
        }

        .setting-item:last-child {
          margin-bottom: 0;
        }

        .setting-item label {
          display: block;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .setting-input, .setting-select, .setting-textarea {
          width: 100%;
          max-width: 400px;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          color: #1a202c;
          background-color: #ffffff;
          transition: border-color 0.2s;
        }

        .setting-input:focus, .setting-select:focus, .setting-textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .setting-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .setting-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .setting-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #4299e1;
        }

        .toggle-label {
          font-weight: 400 !important;
          margin-bottom: 0 !important;
          color: #e2e8f0;
          cursor: pointer;
        }

        .setting-description {
          font-size: 13px;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.4;
        }

        .saving-indicator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #4299e1;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-size: 14px;
          font-weight: 500;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .settings-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .setting-input, .setting-select, .setting-textarea {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;