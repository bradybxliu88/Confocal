import { useEffect, useState } from 'react';
import { reagentsAPI } from '../services/api';
import { Reagent, StorageSuggestion } from '../types';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Inventory = () => {
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [newReagent, setNewReagent] = useState<any>({
    name: '',
    vendor: '',
    catalogNumber: '',
    lotNumber: '',
    quantity: '',
    unit: 'mL',
    lowStockThreshold: '',
    receivedDate: new Date().toISOString().split('T')[0],
  });
  const [aiSuggestions, setAiSuggestions] = useState<StorageSuggestion | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadReagents();
  }, [filterLowStock]);

  const loadReagents = async () => {
    try {
      const params = filterLowStock ? { lowStock: 'true' } : {};
      const response = await reagentsAPI.getAll(params);
      setReagents(response.data.reagents);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async () => {
    if (!newReagent.name) {
      toast.error('Please enter reagent name first');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await reagentsAPI.getStorageSuggestions({
        name: newReagent.name,
        vendor: newReagent.vendor,
        catalogNumber: newReagent.catalogNumber,
      });
      setAiSuggestions(response.data.suggestions);
      toast.success('AI suggestions generated!');

      // Apply suggestions
      setNewReagent({
        ...newReagent,
        storageLocation: response.data.suggestions.storageLocation,
        storageTemp: response.data.suggestions.storageTemp,
        handlingNotes: response.data.suggestions.handlingNotes,
      });
    } catch (error) {
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleBarcodeInput = async () => {
    if (!scannedBarcode) return;

    try {
      const response = await reagentsAPI.scanBarcode(scannedBarcode);
      if (response.data.exists) {
        toast.info('Reagent already exists in inventory');
        setShowScanModal(false);
        setScannedBarcode('');
      } else {
        setNewReagent({ ...newReagent, barcode: scannedBarcode });
        setShowScanModal(false);
        setShowAddModal(true);
        toast.success('New reagent detected! Fill in details.');
      }
    } catch (error) {
      toast.error('Barcode scan failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reagentsAPI.create(newReagent);
      toast.success('Reagent added successfully!');
      loadReagents();
      setShowAddModal(false);
      setNewReagent({
        name: '',
        vendor: '',
        catalogNumber: '',
        lotNumber: '',
        quantity: '',
        unit: 'mL',
        lowStockThreshold: '',
        receivedDate: new Date().toISOString().split('T')[0],
      });
      setAiSuggestions(null);
    } catch (error) {
      toast.error('Failed to add reagent');
    }
  };

  const filteredReagents = reagents.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.catalogNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage lab reagents and supplies</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowScanModal(true)} className="btn-secondary flex items-center">
            <QrCodeIcon className="w-5 h-5 mr-2" />
            Scan Barcode
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Reagent
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reagents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterLowStock
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Low Stock Only
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReagents.map((reagent) => (
          <div key={reagent.id} className={`card ${reagent.isLowStock ? 'border-2 border-orange-500' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{reagent.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{reagent.vendor}</p>
              </div>
              {reagent.isLowStock && (
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 flex-shrink-0" />
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Catalog #:</span>
                <span className="font-medium text-gray-900 dark:text-white">{reagent.catalogNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                <span className={`font-medium ${reagent.isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                  {reagent.quantity} {reagent.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                <span className="font-medium text-gray-900 dark:text-white">{reagent.storageLocation}</span>
              </div>
              {reagent.storageTemp && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{reagent.storageTemp}</span>
                </div>
              )}
              {reagent.expirationDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                  <span className={`font-medium ${
                    new Date(reagent.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? 'text-red-600'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {new Date(reagent.expirationDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {reagent.handlingNotes && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">{reagent.handlingNotes}</p>
              </div>
            )}

            <button className="mt-4 w-full btn-secondary text-sm">
              Update Stock
            </button>
          </div>
        ))}
      </div>

      {/* Barcode Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Scan Barcode</h2>
            <input
              type="text"
              placeholder="Enter or scan barcode..."
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeInput()}
              className="input-field"
              autoFocus
            />
            <div className="mt-6 flex space-x-3">
              <button onClick={handleBarcodeInput} className="btn-primary flex-1">
                Continue
              </button>
              <button onClick={() => { setShowScanModal(false); setScannedBarcode(''); }} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reagent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add New Reagent</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={newReagent.name}
                    onChange={(e) => setNewReagent({ ...newReagent, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vendor</label>
                  <input
                    type="text"
                    value={newReagent.vendor}
                    onChange={(e) => setNewReagent({ ...newReagent, vendor: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Catalog #</label>
                  <input
                    type="text"
                    value={newReagent.catalogNumber}
                    onChange={(e) => setNewReagent({ ...newReagent, catalogNumber: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newReagent.quantity}
                    onChange={(e) => setNewReagent({ ...newReagent, quantity: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Unit</label>
                  <input
                    type="text"
                    value={newReagent.unit}
                    onChange={(e) => setNewReagent({ ...newReagent, unit: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Storage Suggestions</h3>
                  <button
                    type="button"
                    onClick={getAISuggestions}
                    disabled={loadingSuggestions}
                    className="text-sm btn-primary py-1 px-3"
                  >
                    {loadingSuggestions ? 'Loading...' : 'Get AI Suggestions'}
                  </button>
                </div>
                {aiSuggestions && (
                  <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Suggested Location:</strong> {aiSuggestions.storageLocation}</p>
                    <p><strong>Temperature:</strong> {aiSuggestions.storageTemp}</p>
                    <p><strong>Handling:</strong> {aiSuggestions.handlingNotes}</p>
                    <p><strong>Shelf Life:</strong> {aiSuggestions.shelfLife}</p>
                    <p className="text-xs italic mt-2">{aiSuggestions.reasoning}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Storage Location</label>
                  <input
                    type="text"
                    value={newReagent.storageLocation || ''}
                    onChange={(e) => setNewReagent({ ...newReagent, storageLocation: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Storage Temp</label>
                  <input
                    type="text"
                    value={newReagent.storageTemp || ''}
                    onChange={(e) => setNewReagent({ ...newReagent, storageTemp: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Low Stock Alert</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newReagent.lowStockThreshold}
                    onChange={(e) => setNewReagent({ ...newReagent, lowStockThreshold: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Handling Notes</label>
                  <textarea
                    value={newReagent.handlingNotes || ''}
                    onChange={(e) => setNewReagent({ ...newReagent, handlingNotes: e.target.value })}
                    className="input-field"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Add Reagent</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
