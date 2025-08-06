// src/pages/DashboardOverview.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Bell, CreditCard, TrendingUp, Activity, 
  FileText, LayoutGrid, Tv, UserCheck, Calendar, 
  BarChart3, PieChart, Target, Zap, Shield, Globe
} from 'lucide-react';

// Mock data untuk demo
const mockData = {
  users: Array.from({length: 125}, (_, i) => ({ id: i + 1 })),
  categories: Array.from({length: 8}, (_, i) => ({ 
    id: i + 1, 
    name: `Category ${i + 1}`,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  })),
  channels: [
    { name: 'WhatsApp' },
    { name: 'Telegram' },
    { name: 'Email' },
    { name: 'SMS' },
    { name: 'In-App Notification' }
  ],
  templates: Array.from({length: 32}, (_, i) => ({ 
    id: i + 1, 
    template_name: `Template ${i + 1}`,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  })),
  payment: Array.from({length: 6}, (_, i) => ({ id: i + 1 }))
};

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface UserActiveData {
  status: string;
  message: string;
  data: {
    user_active: number;
    customer_active: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalChannels: number;
  totalTemplates: number;
  totalPaymentMethods: number;
  userActive: number;
  customerActive: number;
}

const DashboardOverview: React.FC = () => {
  const [userActiveData, setUserActiveData] = useState<UserActiveData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCategories: 0,
    totalChannels: 0,
    totalTemplates: 0,
    totalPaymentMethods: 0,
    userActive: 0,
    customerActive: 0
  });

  useEffect(() => {
    // Simulate API call for user active data
    const fetchUserActiveData = () => {
      const response: UserActiveData = {
        "status": "success",
        "message": "Count User Active",
        "data": {
          "user_active": 250,
          "customer_active": 15000,
        }
      };
      setUserActiveData(response);
    };

    // Calculate stats from mock data
    const calculateStats = () => {
      setStats({
        totalUsers: mockData.users?.length || 0,
        totalCategories: mockData.categories?.length || 0,
        totalChannels: mockData.channels?.length || 0,
        totalTemplates: mockData.templates?.length || 0,
        totalPaymentMethods: mockData.payment?.length || 0,
        userActive: 250,
        customerActive: 15000
      });
    };

    fetchUserActiveData();
    calculateStats();
  }, []);

  const getRecentActivity = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    
    // Recent templates
    if (mockData.templates) {
      mockData.templates.slice(0, 2).forEach(template => {
        activities.push({
          id: `template-${template.id}`,
          type: 'Template',
          message: `Template "${template.template_name}" dibuat`,
          time: new Date(template.created_at).toLocaleString('id-ID'),
          icon: FileText,
          color: 'from-blue-500 to-cyan-500'
        });
      });
    }

    // Recent categories
    if (mockData.categories) {
      mockData.categories.slice(0, 2).forEach(category => {
        activities.push({
          id: `category-${category.id}`,
          type: 'Category',
          message: `Kategori "${category.name}" dibuat`,
          time: new Date(category.created_at).toLocaleString('id-ID'),
          icon: LayoutGrid,
          color: 'from-green-500 to-emerald-500'
        });
      });
    }

    return activities.slice(0, 5);
  };

  const getChannelDistribution = () => {
    if (!mockData.channels) return [];
    
    return mockData.channels.map(channel => ({
      name: channel.name,
      count: Math.floor(Math.random() * 100) + 50, // Simulated usage count
      color: getChannelColor(channel.name)
    }));
  };

  const getChannelColor = (channelName: string) => {
    const colors = {
      'WhatsApp': 'from-green-500 to-green-600',
      'Telegram': 'from-blue-500 to-blue-600',
      'Email': 'from-red-500 to-red-600',
      'SMS': 'from-yellow-500 to-yellow-600',
      'In-App Notification': 'from-purple-500 to-purple-600'
    };
    return colors[channelName as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-slate-600 text-lg">Welcome back! Here's what's happening in your chat management system.</p>
        </div>

        {/* User Active Status Card */}
        {userActiveData && (
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userActiveData.message}</h3>
                  <p className="text-emerald-100 text-sm">Status: {userActiveData.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Data</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-5 h-5 text-emerald-200" />
                  <span className="text-emerald-100 font-medium">Active Users</span>
                </div>
                <p className="text-3xl font-bold">{userActiveData.data.user_active.toLocaleString()}</p>
                <p className="text-emerald-200 text-sm mt-1">Currently online</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-cyan-200" />
                  <span className="text-cyan-100 font-medium">Active Customers</span>
                </div>
                <p className="text-3xl font-bold">{userActiveData.data.customer_active.toLocaleString()}</p>
                <p className="text-cyan-200 text-sm mt-1">Total active customers</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Total Users */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                <p className="text-xs text-blue-600 font-medium">Registered users</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Categories</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalCategories}</p>
                <p className="text-xs text-green-600 font-medium">Message categories</p>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Tv className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Channels</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalChannels}</p>
                <p className="text-xs text-purple-600 font-medium">Notification channels</p>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Templates</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalTemplates}</p>
                <p className="text-xs text-orange-600 font-medium">Message templates</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Payment Methods</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalPaymentMethods}</p>
                <p className="text-xs text-indigo-600 font-medium">Available methods</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Activity */}
          <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {getRecentActivity().map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div 
                      key={activity.id} 
                      className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50/50 transition-all duration-200 border border-transparent hover:border-slate-200/50"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`p-2 bg-gradient-to-r ${activity.color} rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-relaxed">{activity.message}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Channel Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Channel Usage</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {getChannelDistribution().map((channel, index) => (
                  <div 
                    key={channel.name} 
                    className="group"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                      <span className="text-sm font-bold text-slate-900">{channel.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${channel.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ 
                          width: `${(channel.count / Math.max(...getChannelDistribution().map(c => c.count))) * 100}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* System Performance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-800">System Performance</h4>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Uptime</span>
                <span className="text-sm font-bold text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Response Time</span>
                <span className="text-sm font-bold text-blue-600">120ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Success Rate</span>
                <span className="text-sm font-bold text-green-600">98.7%</span>
              </div>
            </div>
          </div>

          {/* Message Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-800">Messages Today</h4>
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Sent</span>
                <span className="text-sm font-bold text-blue-600">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Delivered</span>
                <span className="text-sm font-bold text-green-600">2,831</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Failed</span>
                <span className="text-sm font-bold text-red-600">16</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">Quick Actions</h4>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Create Template</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-600 group-hover:text-orange-600" />
                  <span className="text-sm font-medium text-slate-700">Send Notification</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-slate-600 group-hover:text-green-600" />
                  <span className="text-sm font-medium text-slate-700">View Analytics</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-2">
            <Globe className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString('id-ID')}</span>
          </div>
          <p className="text-slate-400 text-xs">Chat Management System v2.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;