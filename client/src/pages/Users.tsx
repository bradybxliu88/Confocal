import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { User, UserRole } from '../types';
import { toast } from 'react-toastify';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

const roleLabels: Record<UserRole, string> = {
  [UserRole.PI_LAB_MANAGER]: 'PI / Lab Manager',
  [UserRole.POSTDOC_STAFF]: 'Postdoc / Staff',
  [UserRole.GRAD_STUDENT]: 'Graduate Student',
  [UserRole.UNDERGRAD_TECH]: 'Undergrad / Technician',
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lab Members</h1>
        <button className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="card">
            <div className="flex items-center space-x-4">
              <img
                src={user.profileImage || `https://ui-avatars.cc/api/?name=${user.firstName}+${user.lastName}&background=8b5cf6&color=fff`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                <span className="badge bg-purple-100 text-purple-800 mt-1">
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Lab:</span>
                <span className="font-medium text-gray-900 dark:text-white">{user.labAffiliation}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
