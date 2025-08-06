import React, { useState } from 'react';
import mockData from '../data/mock_data.json';
import { Search, Filter, CreditCard, CheckCircle, XCircle, Clock, ChevronDown, Eye, MoreVertical } from 'lucide-react';

interface Order {
  order_id: number;
  id_payment: number;
  kode_order: string;
  va_name: string;
  virtual_account: string;
  payment_method: string;
  tagihan: number;
  admin: number;
  total_amount: number;
  status: 'paid' | 'pending' | 'failed';
  contract_id: string;
  trx_id: string;
  expired_at: string;
}

const statusConfig = {
  paid: {
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: CheckCircle,
    label: 'Berhasil'
  },
  pending: {
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: Clock,
    label: 'Menunggu'
  },
  failed: {
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: XCircle,
    label: 'Gagal'
  }
};

const OrderPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const orders: Order[] = (mockData.orderlist || []).map((order: any) => ({
    ...order,
    status: order.status as 'paid' | 'pending' | 'failed',
  }));

  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchSearch =
      order.va_name.toLowerCase().includes(search.toLowerCase()) ||
      order.payment_method.toLowerCase().includes(search.toLowerCase()) ||
      order.kode_order.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Manajemen Order
              </h1>
              <p className="text-slate-600">Kelola dan pantau semua transaksi pembayaran</p>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/20">
                <span className="text-sm font-medium text-slate-600">Total: </span>
                <span className="text-lg font-bold text-slate-900">{orders.length}</span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, metode pembayaran, atau kode order..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center px-6 py-3 rounded-xl border transition-all duration-200 ${
                    showFilter 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilter && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 min-w-48 z-10">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Status Pembayaran</label>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                    >
                      <option value="all">Semua Status</option>
                      <option value="paid">Berhasil</option>
                      <option value="pending">Menunggu</option>
                      <option value="failed">Gagal</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Pelanggan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Pembayaran</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Jumlah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kadaluwarsa</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="text-slate-500">Tidak ada order yang ditemukan</div>
                        <div className="text-sm text-slate-400">Coba ubah filter atau kata kunci pencarian</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusInfo = statusConfig[order.status];
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr key={order.order_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">{order.kode_order}</div>
                            <div className="text-sm text-slate-500">ID: {order.order_id}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-800">{order.va_name}</div>
                            <div className="text-sm font-mono text-slate-500">{order.virtual_account}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="font-medium text-slate-700">{order.payment_method}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">
                              Rp{order.total_amount.toLocaleString('id-ID')}
                            </div>
                            <div className="text-sm text-slate-500">
                              Tagihan: Rp{order.tagihan.toLocaleString('id-ID')} + Admin: Rp{order.admin.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusInfo.label}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600">
                            {new Date(order.expired_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        {filteredOrders.length > 0 && (
          <div className="flex justify-between items-center text-sm text-slate-500 px-2">
            <div>Menampilkan {filteredOrders.length} dari {orders.length} order</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;