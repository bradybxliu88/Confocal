import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { DashboardStats, Project, Protocol, Reagent, Booking, Order } from '../types';
import { toast } from 'react-toastify';
import {
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentProtocols, setRecentProtocols] = useState<Protocol[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Reagent[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [projectProgressData, setProjectProgressData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);

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

      // Prepare chart data
      if (data.recentProjects && data.recentProjects.length > 0) {
        const progressData = data.recentProjects.map((p: Project) => ({
          name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
          progress: p.progress,
        }));
        setProjectProgressData(progressData);

        const budgetChartData = data.recentProjects
          .filter((p: Project) => p.budget && p.budget > 0)
          .map((p: Project) => ({
            name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
            budget: p.budget,
            used: p.budgetUsed,
            remaining: (p.budget || 0) - p.budgetUsed,
          }));
        setBudgetData(budgetChartData);
      }

      if (data.recentOrders && data.recentOrders.length > 0) {
        const statusCounts = data.recentOrders.reduce((acc: any, order: Order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});

        const statusData = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.replace('_', ' '),
          value: count,
        }));
        setOrderStatusData(statusData);
      }
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
      trend: '+12%',
    },
    {
      name: 'Protocols',
      value: stats?.protocolsCount || 0,
      icon: DocumentTextIcon,
      color: 'from-blue-500 to-cyan-500',
      link: '/protocols',
      trend: '+5%',
    },
    {
      name: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      icon: ExclamationTriangleIcon,
      color: 'from-orange-500 to-red-500',
      link: '/inventory?filter=lowStock',
      trend: '-3%',
      trendUp: false,
    },
    {
      name: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: ShoppingBagIcon,
      color: 'from-green-500 to-teal-500',
      link: '/orders?status=REQUESTED',
      trend: '+8%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening in your lab today.
          </p>
        </div>
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="btn-secondary flex items-center"
        >
          <ChartBarIcon className="w-5 h-5 mr-2" />
          {showCharts ? 'Hide' : 'Show'} Analytics
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Link key={idx} to={stat.link} className="group">
            <div className="card group-hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-3">
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
              <div className="flex items-center text-sm">
                <ArrowTrendingUpIcon
                  className={`w-4 h-4 mr-1 ${
                    stat.trendUp === false ? 'text-red-500 rotate-180' : 'text-green-500'
                  }`}
                />
                <span
                  className={`font-medium ${
                    stat.trendUp === false ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {stat.trend}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Progress Chart */}
          {projectProgressData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Project Progress
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={projectProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="progress" fill="#8b5cf6" name="Progress %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Order Status Distribution */}
          {orderStatusData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Order Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Budget Overview */}
          {budgetData.length > 0 && (
            <div className="card lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Budget Overview
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Total Budget" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="used" fill="#8b5cf6" name="Used" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="remaining" fill="#10b981" name="Remaining" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

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
