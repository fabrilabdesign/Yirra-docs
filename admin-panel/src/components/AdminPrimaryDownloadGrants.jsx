import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import getApiUrl from '../utils/api';

/**
 * One-off links for the single primary_cart_download product (same file as cart checkout).
 */
export default function AdminPrimaryDownloadGrants() {
  const { getToken } = useAuth();
  const [url, setUrl] = useState('');
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const create = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(getApiUrl('/api/admin/primary-download-grants'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ label: 'admin-panel' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || res.statusText);
      setUrl(data.download_url);
      setMeta(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold mb-2">Primary file download links</h1>
      <p className="text-gray-600 mb-4 text-sm">
        Generates a link for the product flagged <code className="bg-gray-100 px-1 rounded">primary_cart_download</code> in
        the database (same artifact as cart checkout). Each link allows up to 2 downloads and locks to the first client IP.
      </p>
      <button
        type="button"
        onClick={create}
        disabled={loading}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Generate new link'}
      </button>
      {err && <p className="text-red-600 mt-3 text-sm">{err}</p>}
      {url && (
        <div className="mt-6 space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full URL</label>
          <input
            readOnly
            className="w-full border border-gray-200 rounded-lg p-3 text-sm font-mono bg-gray-50"
            value={url}
            onFocus={(e) => e.target.select()}
          />
          {meta?.expires_at && (
            <p className="text-xs text-gray-500">Expires: {new Date(meta.expires_at).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
