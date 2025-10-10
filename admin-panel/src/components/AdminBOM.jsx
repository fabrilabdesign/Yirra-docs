import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import BarcodeScanner from './BarcodeScanner';

const AdminBOM = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [boms, setBoms] = useState([]);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [products, setProducts] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [bomForm, setBomForm] = useState({
    product_id: '',
    version: '1.0',
    name: '',
    description: '',
    labor_cost: 0,
    overhead_cost: 0,
    notes: ''
  });

  const [lineForm, setLineForm] = useState({
    component_type: 'product',
    product_id: '',
    component_id: '',
    quantity: 1,
    unit_of_measure: 'each',
    reference_designator: '',
    unit_cost: 0,
    notes: '',
    is_optional: false
  });

  const [componentSearch, setComponentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [notification, setNotification] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    loadBOMs();
    loadProducts();
  }, [statusFilter]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const apiCall = async (endpoint, options = {}) => {
    const token = await getToken();
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return response.json();
  };

  const loadBOMs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const data = await apiCall(`/admin/boms?${params}`);
      setBoms(data.boms || data);
    } catch (error) {
      console.error('Error loading BOMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiCall('/admin/products');
      setProducts(data.products || data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadBOM = async (bomId) => {
    try {
      setLoading(true);
      const bom = await apiCall(`/admin/boms/${bomId}`);
      setSelectedBOM(bom);
      setActiveTab('edit');
    } catch (error) {
      console.error('Error loading BOM:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBOM = async () => {
    // Validate required fields
    if (!bomForm.product_id) {
      showNotification('Please select a product', 'error');
      return;
    }
    if (!bomForm.name.trim()) {
      showNotification('Please enter a BOM name', 'error');
      return;
    }
    if (!bomForm.version.trim()) {
      showNotification('Please enter a version', 'error');
      return;
    }
    
    try {
      setOperationLoading(true);
      const newBOM = await apiCall('/admin/boms', {
        method: 'POST',
        body: JSON.stringify(bomForm)
      });
      
      setBoms([newBOM, ...boms]);
      setBomForm({
        product_id: '',
        version: '1.0',
        name: '',
        description: '',
        labor_cost: 0,
        overhead_cost: 0,
        notes: ''
      });
      setActiveTab('list');
      showNotification('BOM created successfully!');
    } catch (error) {
      console.error('Error creating BOM:', error);
      showNotification('Failed to create BOM', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const searchComponents = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await apiCall(`/admin/components/search?q=${encodeURIComponent(query)}`);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching components:', error);
    }
  };

  const selectComponent = (component) => {
    setLineForm({
      ...lineForm,
      component_type: component.component_type,
      product_id: component.component_type === 'product' ? component.id : '',
      component_id: component.component_type === 'component' ? component.component_id || component.id : '',
      unit_cost: component.unit_cost || component.price || 0
    });
    setComponentSearch(component.name);
    setSearchResults([]);
  };

  const addBOMLine = async () => {
    if (!selectedBOM) return;
    
    // Validate required fields
    if (!componentSearch.trim()) {
      showNotification('Please select a component', 'error');
      return;
    }
    
    if (!lineForm.product_id && !lineForm.component_id) {
      showNotification('Please select a valid component from the search results', 'error');
      return;
    }
    
    if (!lineForm.quantity || lineForm.quantity <= 0) {
      showNotification('Please enter a valid quantity', 'error');
      return;
    }
    
    try {
      setOperationLoading(true);
      const newLine = await apiCall(`/admin/boms/${selectedBOM.id}/lines`, {
        method: 'POST',
        body: JSON.stringify(lineForm)
      });
      
      setSelectedBOM({
        ...selectedBOM,
        lines: [...(selectedBOM.lines || []), newLine]
      });
      
      setLineForm({
        component_type: 'product',
        product_id: '',
        component_id: '',
        quantity: 1,
        unit_of_measure: 'each',
        reference_designator: '',
        unit_cost: 0,
        notes: '',
        is_optional: false
      });
      setComponentSearch('');
      setSearchResults([]);
      
      showNotification('BOM line added successfully!');
    } catch (error) {
      console.error('Error adding BOM line:', error);
      showNotification('Failed to add BOM line', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const deleteBOMLine = async (lineId) => {
    if (!confirm('Are you sure you want to delete this BOM line?')) return;
    
    try {
      await apiCall(`/admin/boms/lines/${lineId}`, {
        method: 'DELETE'
      });
      
      setSelectedBOM({
        ...selectedBOM,
        lines: selectedBOM.lines.filter(line => line.id !== lineId)
      });
      
      showNotification('BOM line deleted successfully!');
    } catch (error) {
      console.error('Error deleting BOM line:', error);
      showNotification('Failed to delete BOM line', 'error');
    }
  };

  const approveBOM = async (bomId) => {
    if (!confirm('Are you sure you want to approve this BOM? This will make it the active version.')) return;
    
    try {
      await apiCall(`/admin/boms/${bomId}/approve`, {
        method: 'POST'
      });
      
      loadBOMs();
      if (selectedBOM && selectedBOM.id === bomId) {
        loadBOM(bomId);
      }
      
      showNotification('BOM approved and activated successfully!');
    } catch (error) {
      console.error('Error approving BOM:', error);
      showNotification('Failed to approve BOM', 'error');
    }
  };

  const handleScannedComponent = (component, scannedData) => {
    console.log('Scanned component:', component, scannedData);
    
    // Auto-populate the line form with scanned component
    setLineForm({
      ...lineForm,
      component_type: 'component',
      component_id: component.id,
      unit_cost: component.unit_cost || component.price || 0,
      notes: component.isManual ? `Manual entry from barcode: ${scannedData.text}` : ''
    });
    
    setComponentSearch(component.name);
    setShowScanner(false);
  };

  const deleteBOM = async (bomId) => {
    if (!confirm('Are you sure you want to delete this BOM? This action cannot be undone.')) return;
    
    try {
      setOperationLoading(true);
      await apiCall(`/admin/boms/${bomId}`, {
        method: 'DELETE'
      });
      
      setBoms(boms.filter(bom => bom.id !== bomId));
      if (selectedBOM && selectedBOM.id === bomId) {
        setSelectedBOM(null);
        setActiveTab('list');
      }
      
      showNotification('BOM deleted successfully!');
    } catch (error) {
      console.error('Error deleting BOM:', error);
      showNotification('Failed to delete BOM', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const filteredBOMs = boms.filter(bom => 
    bom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.version.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderBOMList = () => (
    <div className="space-y-4 p-4">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Bill of Materials</h2>
        <button
          onClick={() => setActiveTab('create')}
          className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium touch-manipulation w-full sm:w-auto"
        >
          + Create New BOM
        </button>
      </div>

      {/* Mobile Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search BOMs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="obsolete">Obsolete</option>
        </select>
      </div>

      {/* Mobile Card Layout */}
      <div className="space-y-4">
        {filteredBOMs.map((bom) => (
          <div key={bom.id} className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col space-y-3">
              {/* Header Row */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{bom.name}</h3>
                  <p className="text-sm text-gray-300">{bom.product_name || bom.product_id}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  bom.status === 'active' ? 'bg-green-100 text-green-800' :
                  bom.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bom.status}
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 py-2 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-sm font-medium text-white">{bom.version}</div>
                  <div className="text-xs text-gray-400">Version</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{bom.line_count || 0}</div>
                  <div className="text-xs text-gray-500">Components</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">${(parseFloat(bom.total_cost) || 0).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Total Cost</div>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => loadBOM(bom.id)}
                  className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  ✏️ Edit
                </button>
                {bom.status === 'draft' && (
                  <button
                    onClick={() => approveBOM(bom.id)}
                    disabled={bom.status === 'active'}
                    className="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✓ {bom.status === 'active' ? 'Active' : 'Approve'}
                  </button>
                )}
                <button
                  onClick={() => deleteBOM(bom.id)}
                  disabled={operationLoading}
                  className="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredBOMs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <p className="text-gray-500">No BOMs found</p>
          <button
            onClick={() => setActiveTab('create')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first BOM
          </button>
        </div>
      )}
    </div>
  );

  const renderCreateBOM = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Create New BOM</h2>
        <button
          onClick={() => setActiveTab('list')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to List
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={bomForm.product_id}
              onChange={(e) => setBomForm({...bomForm, product_id: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
            <input
              type="text"
              value={bomForm.version}
              onChange={(e) => setBomForm({...bomForm, version: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">BOM Name</label>
            <input
              type="text"
              value={bomForm.name}
              onChange={(e) => setBomForm({...bomForm, name: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={bomForm.description}
              onChange={(e) => setBomForm({...bomForm, description: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost ($)</label>
            <input
              type="number"
              step="0.01"
              value={bomForm.labor_cost}
              onChange={(e) => setBomForm({...bomForm, labor_cost: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overhead Cost ($)</label>
            <input
              type="number"
              step="0.01"
              value={bomForm.overhead_cost}
              onChange={(e) => setBomForm({...bomForm, overhead_cost: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={bomForm.notes}
              onChange={(e) => setBomForm({...bomForm, notes: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              rows="2"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setActiveTab('list')}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={createBOM}
            disabled={loading || !bomForm.product_id || !bomForm.name}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create BOM'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderEditBOM = () => {
    if (!selectedBOM) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{selectedBOM.name}</h2>
            <p className="text-gray-600">Version {selectedBOM.version} - {selectedBOM.status}</p>
          </div>
          <div className="space-x-2">
            {selectedBOM.status === 'draft' && (
              <button
                onClick={() => approveBOM(selectedBOM.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Approve BOM
              </button>
            )}
            <button
              onClick={() => setActiveTab('list')}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* BOM Header Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BOM Details</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-800">Product:</span> <span className="text-gray-900">{selectedBOM.product_name}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Total Cost:</span> <span className="text-gray-900">${(parseFloat(selectedBOM.total_cost) || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Lines:</span> <span className="text-gray-900">{selectedBOM.lines?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Add BOM Line */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Component</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Search Component</label>
              <div className="relative">
                <input
                  type="text"
                  value={componentSearch}
                  onChange={(e) => {
                    setComponentSearch(e.target.value);
                    searchComponents(e.target.value);
                  }}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Search products or components..."
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-t-0 rounded-b max-h-40 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => selectComponent(result)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-semibold text-gray-900">{result.name}</div>
                        <div className="text-sm text-gray-700">
                          {result.component_type} - ${(parseFloat(result.unit_cost) || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Quantity</label>
              <input
                type="number"
                step="0.01"
                value={lineForm.quantity}
                onChange={(e) => setLineForm({...lineForm, quantity: parseFloat(e.target.value) || 1})}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Reference</label>
              <input
                type="text"
                value={lineForm.reference_designator}
                onChange={(e) => setLineForm({...lineForm, reference_designator: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="R1, U1, etc."
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            {/* Debug info - remove in production */}
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <span>Search: {componentSearch ? '✓' : '✗'}</span>
              <span>Product: {lineForm.product_id ? '✓' : '✗'}</span>
              <span>Component: {lineForm.component_id ? '✓' : '✗'}</span>
              <span>Qty: {lineForm.quantity}</span>
            </div>
            <button
              onClick={addBOMLine}
              disabled={!componentSearch.trim() || (!lineForm.product_id && !lineForm.component_id) || operationLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {operationLoading ? 'Adding...' : 'Add Line'}
            </button>
          </div>
        </div>

        {/* BOM Lines */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">BOM Lines</h3>
          </div>
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Line</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Component</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Extended</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedBOM.lines?.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{line.line_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{line.component_name || 'Unknown Component'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{line.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${(parseFloat(line.unit_cost) || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${(parseFloat(line.extended_cost) || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{line.reference_designator}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => deleteBOMLine(line.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {(!selectedBOM.lines || selectedBOM.lines.length === 0) && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No components added to this BOM yet. Use the form above to add components.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(loading || operationLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && renderBOMList()}
      {activeTab === 'create' && renderCreateBOM()}
      {activeTab === 'edit' && renderEditBOM()}
    </div>
  );
};

export default AdminBOM;
