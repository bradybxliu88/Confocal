import { useEffect, useState } from 'react';
import { equipmentAPI } from '../services/api';
import { Equipment as EquipmentType, Booking } from '../types';
import { toast } from 'react-toastify';
import { PlusIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const Equipment = () => {
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data.equipment);
    } catch (error) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipment</h1>
        <button className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                {item.model && <p className="text-sm text-gray-600 dark:text-gray-400">{item.model}</p>}
              </div>
              <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`badge ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.isAvailable ? 'Available' : 'In Use'}
                </span>
              </div>
              {item.requiresTraining && (
                <span className="badge bg-yellow-100 text-yellow-800">Training Required</span>
              )}
            </div>

            <button className="mt-4 w-full btn-primary">Book Equipment</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equipment;
