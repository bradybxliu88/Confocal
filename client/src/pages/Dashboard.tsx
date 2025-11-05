import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { DashboardStats, Project, Protocol, Reagent, Booking } from '../types';
import { toast } from 'react-toastify';
import {
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentProtocols, setRecentProtocols] = useState<Protocol[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Reagent[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getStats();
      const data = response.data;
      setStats(data.stats);
      setRecentProjects(data.recentProjects || []);
      setRecentProtocols(data.recentProtocols || []);
      setCriticalAlerts(data.criticalStockAlerts || []);
      setTodaySchedule(data.todaySchedule || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: BeakerIcon,
      color: 'from-purple-500 to-indigo-500',
      link: '/projects',
    },
    {
      name: 'Protocols',
      value: stats?.protocolsCount || 0,
      icon: DocumentTextIcon,
      color: 'from-blue-500 to-cyan-500',
      link: '/protocols',
    },
    {
      name: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      icon: ExclamationTriangleIcon,
      color: 'from-orange-500 to-red-500',
      link: '/inventory?filter=lowStock',
    },
    {
      name: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: ShoppingBagIcon,
      color: 'from-green-500 to-teal-500',
      link: '/orders?status=REQUESTED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening in your lab today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Link key={idx} to={stat.link} className="group">
            <div className="card group-hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            <Link
              to="/projects"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No projects yet
              </p>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  {project.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Critical Stock Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Stock Alerts
            </h2>
            <Link
              to="/inventory"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {criticalAlerts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No alerts
              </p>
            ) : (
              criticalAlerts.slice(0, 5).map((reagent) => (
                <div
                  key={reagent.id}
                  className="flex items-start justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {reagent.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {reagent.isLowStock && `Low stock: ${reagent.quantity} ${reagent.unit}`}
                      {reagent.expirationDate && new Date(reagent.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                        ` • Expires: ${new Date(reagent.expirationDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button className="btn-primary text-xs py-1 px-3">
                    Reorder
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Protocols */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Protocols
            </h2>
            <Link
              to="/protocols"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentProtocols.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No protocols yet
              </p>
            ) : (
              recentProtocols.map((protocol) => (
                <div
                  key={protocol.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {protocol.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        v{protocol.version}
                        {protocol.category && ` • ${protocol.category}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Today's Equipment Schedule
            </h2>
            <Link
              to="/equipment"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {todaySchedule.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No bookings today
              </p>
            ) : (
              todaySchedule.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {booking.equipment?.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(booking.endTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {booking.user && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {booking.user.firstName} {booking.user.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
