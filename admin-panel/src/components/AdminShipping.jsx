import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import getApiUrl from '../utils/api.js';

const AdminShipping = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('zones');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real data from backend APIs
  const [zones, setZones] = useState([]);
  const [rates, setRates] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [services, setServices] = useState([]);
  
  // Modal states
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  
  // Form states
  const [zoneForm, setZoneForm] = useState({
    name: '',
    description: '',
    countries: []
  });
  
  const [rateForm, setRateForm] = useState({
    zone_id: '',
    carrier_id: '',
    service_id: '',
    weight_min: 0,
    weight_max: '',
    price: '',
    currency: 'USD'
  });
  
  useEffect(() => {
    loadShippingData();
  }, []);
  
  const apiCall = async (endpoint, options = {}) => {
    const token = await getToken();
    const response = await fetch(getApiUrl(endpoint), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };
  
  const loadShippingData = async () => {
    try {
      setLoading(true);
      const [zonesData, ratesData, carriersData, servicesData] = await Promise.all([
        apiCall('/api/admin/shipping/zones'),
        apiCall('/api/admin/shipping/rates'),
        apiCall('/api/admin/shipping/carriers'),
        apiCall('/api/admin/shipping/services')
      ]);
      
      setZones(zonesData);
      setRates(ratesData);
      setCarriers(carriersData);
      setServices(servicesData);
      setError(null);
    } catch (err) {
      console.error('Error loading shipping data:', err);
      setError('Failed to load shipping data');
    } finally {
      setLoading(false);
    }
  };
  
  // Zone CRUD functions
  const handleCreateZone = () => {
    setEditingZone(null);
    setZoneForm({ name: '', description: '', countries: [] });
    setShowZoneModal(true);
  };
  
  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      description: zone.description || '',
      countries: zone.countries || []
    });
    setShowZoneModal(true);
  };
  
  const handleSaveZone = async () => {
    try {
      if (editingZone) {
        await apiCall(`/api/admin/shipping/zones/${editingZone.id}`, {
          method: 'PUT',
          body: JSON.stringify(zoneForm)
        });
      } else {
        await apiCall('/api/admin/shipping/zones', {
          method: 'POST',
          body: JSON.stringify(zoneForm)
        });
      }
      
      setShowZoneModal(false);
      loadShippingData();
    } catch (err) {
      console.error('Error saving zone:', err);
      setError('Failed to save zone');
    }
  };
  
  const handleDeleteZone = async (zoneId) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return;
    
    try {
      await apiCall(`/api/admin/shipping/zones/${zoneId}`, {
        method: 'DELETE'
      });
      loadShippingData();
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError('Failed to delete zone');
    }
  };
  
  // Rate CRUD functions
  const handleCreateRate = () => {
    setEditingRate(null);
    setRateForm({
      zone_id: '',
      carrier_id: '',
      service_id: '',
      weight_min: 0,
      weight_max: '',
      price: '',
      currency: 'USD'
    });
    setShowRateModal(true);
  };
  
  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateForm({
      zone_id: rate.zone_id,
      carrier_id: rate.carrier_id,
      service_id: rate.service_id,
      weight_min: rate.weight_min || 0,
      weight_max: rate.weight_max || '',
      price: rate.price,
      currency: rate.currency || 'USD'
    });
    setShowRateModal(true);
  };
  
  const handleSaveRate = async () => {
    try {
      if (editingRate) {
        await apiCall(`/api/admin/shipping/rates/${editingRate.id}`, {
          method: 'PUT',
          body: JSON.stringify(rateForm)
        });
      } else {
        await apiCall('/api/admin/shipping/rates', {
          method: 'POST',
          body: JSON.stringify(rateForm)
        });
      }
      
      setShowRateModal(false);
      loadShippingData();
    } catch (err) {
      console.error('Error saving rate:', err);
      setError('Failed to save rate');
    }
  };
  
  const handleDeleteRate = async (rateId) => {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return;
    
    try {
      await apiCall(`/api/admin/shipping/rates/${rateId}`, {
        method: 'DELETE'
      });
      loadShippingData();
    } catch (err) {
      console.error('Error deleting rate:', err);
      setError('Failed to delete rate');
    }
  };
  
  const toggleCarrier = async (carrierId, enabled) => {
    try {
      await apiCall(`/api/admin/shipping/carriers/${carrierId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ enabled })
      });
      loadShippingData();
    } catch (err) {
      console.error('Error toggling carrier:', err);
      setError('Failed to toggle carrier');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadShippingData}
                className="bg-red-100 px-2 py-1 rounded text-sm text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-shipping">
      <div className="page-header">
        <h2>Shipping Management</h2>
      </div>
      
      <div className="shipping-tabs">
        <button 
          className={`tab-btn ${activeTab === 'zones' ? 'active' : ''}`}
          onClick={() => setActiveTab('zones')}
        >
          Zones
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`}
          onClick={() => setActiveTab('rates')}
        >
          Rates
        </button>
        <button 
          className={`tab-btn ${activeTab === 'carriers' ? 'active' : ''}`}
          onClick={() => setActiveTab('carriers')}
        >
          Carriers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'labels' ? 'active' : ''}`}
          onClick={() => setActiveTab('labels')}
        >
          Labels
        </button>
      </div>
      
      <div className="shipping-content">
        {activeTab === 'zones' && (
          <div className="zones-section">
            <div className="section-header">
              <h3>Shipping Zones</h3>
              <button 
                className="btn btn-primary"
                onClick={handleCreateZone}
              >
                Add Zone
              </button>
            </div>
            {zones.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No shipping zones configured yet.</p>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={handleCreateZone}
                >
                  Create First Zone
                </button>
              </div>
            ) : (
              <div className="zones-grid">
                {zones.map(zone => (
                  <div key={zone.id} className="zone-card">
                    <h4>{zone.name}</h4>
                    <p>{zone.description || 'No description'}</p>
                    <div className="countries">
                      {(zone.countries || []).map(country => (
                        <span key={country} className="country-tag">{country}</span>
                      ))}
                    </div>
                    <div className="zone-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleEditZone(zone)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'rates' && (
          <div className="rates-section">
            <div className="section-header">
              <h3>Shipping Rates</h3>
              <button 
                className="btn btn-primary"
                onClick={handleCreateRate}
              >
                Add Rate
              </button>
            </div>
            {rates.length === 0 ? (
              <div className="text-center py-8 text-text-tertiary">
                <p>No shipping rates configured yet.</p>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={handleCreateRate}
                >
                  Create First Rate
                </button>
              </div>
            ) : (
              <div className="rates-table">
                <table className="w-full">
                  <thead>
                    <tr className="bg-elev2">
                      <th className="px-4 py-2 text-left">Zone</th>
                      <th className="px-4 py-2 text-left">Carrier</th>
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-left">Weight Range</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map(rate => {
                      const zone = zones.find(z => z.id === rate.zone_id);
                      const carrier = carriers.find(c => c.id === rate.carrier_id);
                      const service = services.find(s => s.id === rate.service_id);
                      
                      return (
                        <tr key={rate.id} className="border-b border-line-soft">
                          <td className="px-4 py-2">{zone?.name || 'Unknown'}</td>
                          <td className="px-4 py-2">{carrier?.name || 'Unknown'}</td>
                          <td className="px-4 py-2">{service?.name || 'Unknown'}</td>
                          <td className="px-4 py-2">
                            {rate.weight_min || 0}kg - {rate.weight_max || '∞'}kg
                          </td>
                          <td className="px-4 py-2">
                            {rate.currency || 'USD'} {parseFloat(rate.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <button 
                              className="btn btn-secondary mr-2"
                              onClick={() => handleEditRate(rate)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleDeleteRate(rate.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'carriers' && (
          <div className="carriers-section">
            <div className="section-header">
              <h3>Shipping Carriers</h3>
            </div>
            {carriers.length === 0 ? (
              <div className="text-center py-8 text-text-tertiary">
                <p>No shipping carriers available.</p>
              </div>
            ) : (
              <div className="carriers-list">
                {carriers.map(carrier => (
                  <div key={carrier.id} className="carrier-card bg-elev1 border border-line-soft rounded-12 p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="carrier-info">
                        <h4 className="text-[16px] leading-6 font-semibold text-text-primary">{carrier.name}</h4>
                        <p className="text-[13px] text-text-tertiary">Code: {carrier.code}</p>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            carrier.is_enabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {carrier.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          {carrier.supports_tracking && (
                            <span className="inline-block ml-2 px-2 py-1 rounded text-xs bg-[rgba(99,102,241,.12)] text-brand">
                              Tracking
                            </span>
                          )}
                          {carrier.supports_labels && (
                            <span className="inline-block ml-2 px-2 py-1 rounded text-xs bg-[rgba(168,85,247,.12)] text-accent-secondary">
                              Labels
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="carrier-actions">
                        <button 
                          className={`btn mr-2 ${
                            carrier.is_enabled ? 'btn-danger' : 'btn-success'
                          }`}
                          onClick={() => toggleCarrier(carrier.id, !carrier.is_enabled)}
                        >
                          {carrier.is_enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'labels' && (
          <div className="labels-section">
            <div className="section-header">
              <h3>Shipping Labels</h3>
              <button className="btn btn-primary" disabled>
                Generate Labels
              </button>
            </div>
            <div className="labels-placeholder text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Shipping Label Integration</h3>
              <p className="text-gray-600 mb-2">Connect with shipping carriers to generate and print shipping labels directly from the admin panel.</p>
              <p className="text-blue-600 font-medium">Coming soon...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingZone ? 'Edit Zone' : 'Create Zone'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Domestic, Europe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={zoneForm.description}
                  onChange={(e) => setZoneForm({...zoneForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Zone description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Countries (comma-separated)
                </label>
                <input
                  type="text"
                  value={zoneForm.countries.join(', ')}
                  onChange={(e) => setZoneForm({...zoneForm, countries: e.target.value.split(',').map(c => c.trim()).filter(c => c)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="US, CA, MX"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowZoneModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveZone}
                disabled={!zoneForm.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingZone ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingRate ? 'Edit Rate' : 'Create Rate'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone
                </label>
                <select
                  value={rateForm.zone_id}
                  onChange={(e) => setRateForm({...rateForm, zone_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier
                </label>
                <select
                  value={rateForm.carrier_id}
                  onChange={(e) => setRateForm({...rateForm, carrier_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Carrier</option>
                  {carriers.filter(c => c.is_enabled).map(carrier => (
                    <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <select
                  value={rateForm.service_id}
                  onChange={(e) => setRateForm({...rateForm, service_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Service</option>
                  {services.filter(s => !rateForm.carrier_id || s.carrier_id == rateForm.carrier_id).map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={rateForm.weight_min}
                    onChange={(e) => setRateForm({...rateForm, weight_min: parseFloat(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={rateForm.weight_max}
                    onChange={(e) => setRateForm({...rateForm, weight_max: e.target.value ? parseFloat(e.target.value) : ''})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    placeholder="No limit"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={rateForm.price}
                    onChange={(e) => setRateForm({...rateForm, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={rateForm.currency}
                    onChange={(e) => setRateForm({...rateForm, currency: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRate}
                disabled={!rateForm.zone_id || !rateForm.carrier_id || !rateForm.service_id || !rateForm.price}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingRate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .admin-shipping {
          padding: 0;
          color: #f0f6fc;
        }
        
        .page-header h2 {
          margin: 0 0 24px 0;
          color: #f0f6fc;
          font-size: 24px;
        }
        
        .shipping-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 1px solid #30363d;
        }
        
        .tab-btn {
          background: none;
          border: none;
          color: #8b949e;
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          color: #f0f6fc;
        }
        
        .tab-btn.active {
          color: #58a6ff;
          border-bottom-color: #58a6ff;
        }
        
        .shipping-content {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 24px;
        }
        
        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .tab-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }
        
        /* Zones */
        .zones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .zone-card {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 16px;
        }
        
        .zone-card h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 500;
        }
        
        .zone-card p {
          color: #8b949e;
          margin: 0 0 16px 0;
          font-size: 14px;
        }
        
        .zone-countries {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          align-items: center;
        }
        
        .label {
          font-size: 12px;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .zone-actions {
          display: flex;
          gap: 8px;
        }
        
        /* Rates */
        .rates-table {
          overflow-x: auto;
        }
        
        .rates-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .rates-table th,
        .rates-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #30363d;
        }
        
        .rates-table th {
          background: #0d1117;
          color: #8b949e;
          font-weight: 500;
          font-size: 14px;
        }
        
        .rates-table td {
          font-size: 14px;
        }
        
        /* Carriers */
        .carriers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .carrier-card {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 16px;
        }
        
        .carrier-card h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 500;
        }
        
        .carrier-status {
          margin-bottom: 16px;
        }
        
        .status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }
        
        .status.enabled {
          background: rgba(46, 160, 67, 0.1);
          color: #3fb950;
        }
        
        .status.disabled {
          background: rgba(248, 81, 73, 0.1);
          color: #f85149;
        }
        
        .carrier-actions {
          display: flex;
          gap: 8px;
        }
        
        /* Labels */
        .labels-placeholder {
          text-align: center;
          padding: 60px 20px;
          color: #8b949e;
        }
        
        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .labels-placeholder h3 {
          margin: 0 0 12px 0;
          color: #f0f6fc;
          font-size: 20px;
        }
        
        .labels-placeholder p {
          margin: 8px 0;
          font-size: 16px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .coming-soon {
          font-style: italic;
          color: #58a6ff;
        }
        
        /* Buttons */
        .btn-primary {
          background: #238636;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #2ea043;
        }
        
        .btn-primary:disabled {
          background: #30363d;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: #21262d;
          border: 1px solid #30363d;
          color: #f0f6fc;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: #30363d;
        }
        
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-danger {
          background: #da3633;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .btn-danger:hover {
          background: #f85149;
        }
        
        .btn-icon {
          background: none;
          border: none;
          color: #8b949e;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-icon:hover {
          background: #30363d;
          color: #f0f6fc;
        }
        
        .btn-icon.danger:hover {
          background: rgba(248, 81, 73, 0.1);
          color: #f85149;
        }
        
        .btn-toggle {
          background: #21262d;
          border: 1px solid #30363d;
          color: #f0f6fc;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-toggle:hover:not(:disabled) {
          background: #30363d;
        }
        
        .btn-toggle.enabled {
          background: rgba(46, 160, 67, 0.1);
          border-color: rgba(46, 160, 67, 0.4);
          color: #3fb950;
        }
      `}</style>
    </div>
  );
};

export default AdminShipping; 