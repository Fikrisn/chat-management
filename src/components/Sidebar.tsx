// src/components/Sidebar.tsx - Version Fixed
import React, { useEffect } from 'react';
import {
  Home,
  Package,
  LayoutGrid,
  FileText,
  ChevronRight,
  X,
  Sparkles,
  Tv,
  CreditCard,
  Users,
  ScrollText,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, badge: null },
    { id: 'channels', label: 'Channels', icon: <Tv size={20} />, badge: null },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} />, badge: null },
    { id: 'categories', label: 'Categories', icon: <LayoutGrid size={20} />, badge: null },
    { id: 'templates', label: 'Templates', icon: <FileText size={20} />, badge: null },
    { id: 'users', label: 'Users', icon: <Users size={20} />, badge: null },
    { id: 'orders', label: 'Orders', icon: <ScrollText size={20} />, badge: null }
  ];

  // Update activeTab berdasarkan URL saat ini
  useEffect(() => {
    const pathname = location.pathname;
    
    if (pathname === '/') {
      setActiveTab('dashboard');
    } else if (pathname === '/channels') {
      setActiveTab('channels');
    } else if (pathname === '/payments') {
      setActiveTab('payments');
    } else if (pathname === '/categories') {
      setActiveTab('categories');
    } else if (pathname === '/templates') {
      setActiveTab('templates');
    } else if (pathname === '/users') {
      setActiveTab('users');
    } else if (pathname === '/orders') {
      setActiveTab('orders');
    }
  }, [location.pathname, setActiveTab]);

  const handleClick = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
    navigate(id === 'dashboard' ? '/' : `/${id}`);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 w-72 h-screen overflow-y-auto bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-all duration-300 ease-out
          lg:translate-x-0`}
      >
        {/* Header */}
        <div className="relative p-3 border-b border-slate-200/50">
          {/* Close Button (Mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 lg:hidden"
          >
            <X size={20} />
          </button>

          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FF4F03] to-orange-600 rounded-xl shadow-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Management Chat
              </h1>
              <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  className="relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => handleClick(item.id)}
                    className={`group relative flex items-center w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF4F03] to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                        : 'text-slate-700 hover:bg-orange-50 hover:text-slate-900 hover:scale-102'
                    }`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                    )}

                    {/* Icon Container */}
                    <div className={`relative mr-4 p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 shadow-lg' 
                        : 'bg-orange-50 group-hover:bg-orange-100 group-hover:shadow-md'
                    }`}>
                      <span className={`${isActive ? 'text-white' : 'text-orange-600 group-hover:text-orange-700'} transition-colors duration-300`}>
                        {item.icon}
                      </span>
                    </div>

                    {/* Label */}
                    <span className="flex-1 text-left font-semibold">
                      {item.label}
                    </span>

                    {/* Badge */}
                    {item.badge && (
                      <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'New'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Chevron */}
                    <ChevronRight 
                      className={`ml-2 w-4 h-4 transition-all duration-300 ${
                        isActive 
                          ? 'text-white opacity-100 transform translate-x-1' 
                          : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                      }`} 
                    />

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF4F03] to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">Admin User</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Version Info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-400">Version 2.1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;