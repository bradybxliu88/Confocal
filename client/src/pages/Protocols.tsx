import { useEffect, useState } from 'react';
import { protocolsAPI } from '../services/api';
import { Protocol } from '../types';
import { toast } from 'react-toastify';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Protocols = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    try {
      const response = await protocolsAPI.getAll();
      setProtocols(response.data.protocols);
    } catch (error) {
      toast.error('Failed to load protocols');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Protocols</h1>
        <button className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protocols.map((protocol) => (
          <div key={protocol.id} className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{protocol.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">v{protocol.version}</p>
              </div>
              <DocumentTextIcon className="w-6 h-6 text-blue-600 flex-shrink-0 ml-2" />
            </div>

            {protocol.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{protocol.description}</p>
            )}

            <div className="flex items-center justify-between">
              {protocol.category && (
                <span className="badge bg-purple-100 text-purple-800">{protocol.category}</span>
              )}
              {protocol.isPublic && (
                <span className="text-xs text-green-600">Public</span>
              )}
            </div>

            {protocol.tags && protocol.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {protocol.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Protocols;
