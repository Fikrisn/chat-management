import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mock_data.json';

interface Props {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

interface OrderNotification {
  id: string;
  title: string;
  time: string;
  type: 'paid' | 'pending' | 'failed';
  orderData: {
    kode_order: string;
    va_name: string;
    total_amount: number;
    payment_method: string;
  };
}

const Header: React.FC<Props> = ({ onToggleSidebar, sidebarOpen = false }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  // Generate notifications from order data
  useEffect(() => {
    const generateOrderNotifications = () => {
      const orderNotifications: OrderNotification[] = [];
      
      if (mockData.orderlist && mockData.orderlist.length > 0) {
        // Get recent orders (last 5)
        const recentOrders = mockData.orderlist.slice(-5).reverse();
        
        recentOrders.forEach((order, index) => {
          const timeAgo = index === 0 ? '2 menit yang lalu' : 
                         index === 1 ? '5 menit yang lalu' :
                         index === 2 ? '10 menit yang lalu' :
                         index === 3 ? '15 menit yang lalu' : '20 menit yang lalu';
          
          let title = '';
          switch (order.status) {
            case 'paid':
              title = `Pembayaran berhasil dari ${order.va_name}`;
              break;
            case 'pending':
              title = `Pembayaran menunggu dari ${order.va_name}`;
              break;
            case 'failed':
              title = `Pembayaran gagal dari ${order.va_name}`;
              break;
            default:
              title = `Update order dari ${order.va_name}`;
          }

          orderNotifications.push({
            id: `order-${order.order_id}`,
            title,
            time: timeAgo,
            type: order.status as 'paid' | 'pending' | 'failed',
            orderData: {
              kode_order: order.kode_order,
              va_name: order.va_name,
              total_amount: order.total_amount,
              payment_method: order.payment_method
            }
          });
        });
      }

      setNotifications(orderNotifications);
    };

    generateOrderNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'paid':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'failed':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: OrderNotification) => {
    // Close notifications dropdown
    setShowNotifications(false);
    
    // Navigate to orders page with order ID as query parameter
    navigate(`/orders?highlight=${notification.orderData.kode_order}`);
  };

  return (
    <>
      {/* Fixed Header */}
      <header 
        className={`fixed top-0 right-0 h-18 z-40 bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 transition-all duration-300 ${
          sidebarOpen ? 'left-0 lg:left-72' : 'left-0 lg:left-72'
        }`}
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={onToggleSidebar} 
              className="lg:hidden group p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-800 transition-all duration-200 hover:scale-105"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-800 transition-all duration-200 hover:scale-105"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-200/50">
                    <h3 className="text-lg font-bold text-slate-800">Notifikasi Order</h3>
                    <p className="text-sm text-slate-500">
                      {notifications.length > 0 
                        ? `Anda memiliki ${notifications.length} notifikasi order`
                        : 'Tidak ada notifikasi order'
                      }
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Tidak ada notifikasi order</p>
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div 
                          key={notif.id} 
                          className="p-4 hover:bg-orange-50/50 transition-colors duration-200 border-b border-slate-100/50 last:border-b-0 cursor-pointer"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getNotificationColor(notif.type)}`}>
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 mb-1 hover:text-orange-600 transition-colors">
                                {notif.title}
                              </p>
                              <div className="text-xs text-slate-500 space-y-1">
                                <p>Kode: <span className="font-mono font-semibold text-slate-700">{notif.orderData.kode_order}</span></p>
                                <p>Metode: {notif.orderData.payment_method}</p>
                                <p className="font-semibold text-blue-600">
                                  Total: Rp{notif.orderData.total_amount.toLocaleString('id-ID')}
                                </p>
                                <p className="text-slate-400">{notif.time}</p>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notif.type === 'paid' ? 'bg-green-100 text-green-700' :
                              notif.type === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {notif.type === 'paid' ? 'Berhasil' :
                               notif.type === 'pending' ? 'Menunggu' : 'Gagal'}
                            </div>
                          </div>
                          {/* Click indicator */}
                          <div className="mt-2 text-xs text-orange-500 opacity-75">
                            ← Klik untuk melihat detail order
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 bg-orange-50/50 border-t border-slate-200/50">
                      <button 
                        className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/orders');
                        }}
                      >
                        Lihat semua order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-all duration-200 hover:scale-105 group"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FF4F03] to-orange-600 rounded-xl shadow-lg flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-800">Admin User</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#FF4F03] to-orange-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Admin User</p>
                        <p className="text-xs text-slate-500">admin@company.com</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-orange-50/50 transition-colors duration-200">
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    <hr className="my-2 border-slate-200/50" />
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors duration-200">
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click outside handler */}
        {(showProfileMenu || showNotifications) && (
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => {
              setShowProfileMenu(false);
              setShowNotifications(false);
            }}
          />
        )}
      </header>
    </>
  );
};

export default Header;
