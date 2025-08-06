import React, { useEffect, useState } from 'react';
import mockData from '../data/mock_data.json';
import { 
  Plus, Edit2, Trash2, Save, X, Search, Filter, MoreVertical, 
  CreditCard, CheckCircle, Calendar, Building,
  Copy, AlertTriangle, ExternalLink
} from 'lucide-react';

interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  image_url: string;
  created_at: string;
  updated_at: string | null;
}

interface PaymentResponse {
  status: string;
  message: string;
  data: PaymentMethod;
}

const PaymentsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  useEffect(() => {
    // Load data from mock_data.json
    setPaymentMethods(mockData.payment || []);
  }, []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [createdResponse, setCreatedResponse] = useState<PaymentResponse | null>(null);
  
  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    provider: 'all',
    dateRange: 'all',
    hasImage: 'all'
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    image_url: ''
  });

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    provider: '',
    image_url: ''
  });

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    paymentId: string | null;
    paymentName: string;
  }>({
    isOpen: false,
    paymentId: null,
    paymentName: ''
  });

  const filteredPaymentMethods = paymentMethods.filter(payment => {
    // Search filter
    const matchesSearch = payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.provider.toLowerCase().includes(searchTerm.toLowerCase());

    // Provider filter
    const matchesProvider = activeFilters.provider === 'all' || 
      payment.provider.toLowerCase() === activeFilters.provider;

    // Date range filter
    const matchesDateRange = activeFilters.dateRange === 'all' || (() => {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (activeFilters.dateRange) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'year': return daysDiff <= 365;
        default: return true;
      }
    })();

    // Has image filter
    const matchesImage = activeFilters.hasImage === 'all' || (() => {
      const hasCustomImage = !payment.image_url.includes('placeholder');
      switch (activeFilters.hasImage) {
        case 'with': return hasCustomImage;
        case 'without': return !hasCustomImage;
        default: return true;
      }
    })();

    return matchesSearch && matchesProvider && matchesDateRange && matchesImage;
  });

  // Filter helper functions
  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== 'all').length;
  };

  const clearAllFilters = () => {
    setActiveFilters({
      provider: 'all',
      dateRange: 'all',
      hasImage: 'all'
    });
  };

  // Edit handlers
  const handleEditPayment = (payment: PaymentMethod) => {
    setEditingPaymentId(String(payment.id));
    setEditFormData({
      name: payment.name,
      provider: payment.provider,
      image_url: payment.image_url
    });
  };

  const handleSaveEdit = () => {
    if (!editFormData.name.trim() || !editFormData.provider.trim()) return;
    setPaymentMethods(paymentMethods.map(payment =>
      String(payment.id) === editingPaymentId
        ? {
            ...payment,
            name: editFormData.name,
            provider: editFormData.provider,
            image_url: editFormData.image_url,
            updated_at: new Date().toISOString()
          }
        : payment
    ));
    setEditingPaymentId(null);
  };

  const handleCancelEdit = () => {
    setEditingPaymentId(null);
  };

  const handleAddPayment = () => {
    if (!formData.name.trim() || !formData.provider.trim()) return;

    const newPayment: PaymentMethod = {
      id: Date.now(),
      name: formData.name,
      provider: formData.provider,
      image_url: formData.image_url || 'https://via.placeholder.com/150x100?text=' + formData.name,
      created_at: new Date().toISOString(),
      updated_at: null
    };

    const response: PaymentResponse = {
      status: 'success',
      message: 'Berhasil create metode pembayaran',
      data: newPayment
    };

    setPaymentMethods([...paymentMethods, newPayment]);
    setFormData({
      name: '',
      provider: '',
      image_url: ''
    });
    setShowAddForm(false);
    setCreatedResponse(response);

    setTimeout(() => {
      setCreatedResponse(null);
    }, 5000);
  };

  const handleDeletePayment = (id: string, paymentName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      paymentId: id,
      paymentName: paymentName
    });
  };

  const confirmDeletePayment = () => {
    if (deleteConfirmation.paymentId) {
      setPaymentMethods(paymentMethods.filter(payment => payment.id !== Number(deleteConfirmation.paymentId)));
      setDeleteConfirmation({
        isOpen: false,
        paymentId: null,
        paymentName: ''
      });
    }
  };

  const cancelDeletePayment = () => {
    setDeleteConfirmation({
      isOpen: false,
      paymentId: null,
      paymentName: ''
    });
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'sparkpay': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'winpay': return 'bg-green-100 text-green-700 border-green-200';
      case 'mitra': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const SuccessModal = () => {
    if (!createdResponse) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative transform animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setCreatedResponse(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Success!</h2>
              <p className="text-sm text-green-600 font-medium">{createdResponse.message}</p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Payment Method Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Payment Name</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse.data.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Provider</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse.data.provider}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Created At</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(createdResponse.data.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Payment Image</h4>
              <div className="bg-white rounded-lg p-3 border flex items-center gap-3">
                <img 
                  src={createdResponse.data.image_url} 
                  alt={createdResponse.data.name}
                  className="w-16 h-10 object-contain rounded border"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/150x100?text=${createdResponse.data.name}`;
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{createdResponse.data.name}</p>
                  <p className="text-xs text-slate-500">Provider: {createdResponse.data.provider}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setCreatedResponse(null)}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmationModal = () => {
    if (!deleteConfirmation.isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative transform animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Konfirmasi Hapus</h2>
              <p className="text-sm text-slate-600">Aksi ini tidak dapat dibatalkan</p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-slate-700 mb-2">
              Apakah Anda yakin ingin menghapus metode pembayaran berikut?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-red-500">
              <p className="font-semibold text-slate-800">{deleteConfirmation.paymentName}</p>
              <p className="text-sm text-slate-600">Metode pembayaran ini akan dihapus secara permanen</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeletePayment}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDeletePayment}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Metode Pembayaran
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Metode Pembayaran
            </h1>
            <p className="mt-2 text-slate-600">Kelola metode pembayaran untuk sistem billing</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <span className="text-sm font-medium text-slate-600">Total: </span>
            <span className="text-lg font-bold text-slate-900">{paymentMethods.length}</span>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari metode pembayaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white shadow-lg transition-all duration-200"
              />
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center px-4 py-3 bg-white/80 border rounded-2xl text-slate-600 hover:text-slate-800 hover:bg-white shadow-lg transition-all relative"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-white/20 p-4 min-w-[300px] z-50">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Filter Payment Methods</h3>
                        {getActiveFilterCount() > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Provider Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Provider</label>
                        <select
                          value={activeFilters.provider}
                          onChange={(e) => handleFilterChange('provider', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Providers</option>
                          <option value="sparkpay">SparkPay</option>
                          <option value="winpay">WinPay</option>
                          <option value="mitra">Mitra</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Created Date</label>
                        <select
                          value={activeFilters.dateRange}
                          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">Last 7 Days</option>
                          <option value="month">Last 30 Days</option>
                          <option value="year">Last Year</option>
                        </select>
                      </div>

                      {/* Image Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Image Status</label>
                        <select
                          value={activeFilters.hasImage}
                          onChange={(e) => handleFilterChange('hasImage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Images</option>
                          <option value="with">With Custom Image</option>
                          <option value="without">With Placeholder</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Metode Pembayaran
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                Tambah Metode Pembayaran Baru
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Metode Pembayaran</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: BCA, Mandiri, dll..."
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Provider</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih provider...</option>
                    <option value="sparkpay">SparkPay</option>
                    <option value="winpay">WinPay</option>
                    <option value="mitra">Mitra</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL Gambar</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.png (opsional)"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Jika kosong, akan digunakan placeholder otomatis</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddPayment}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  disabled={!formData.name.trim() || !formData.provider.trim()}
                >
                  <Save className="inline w-4 h-4 mr-2" />
                  Simpan Metode Pembayaran
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      name: '',
                      provider: '',
                      image_url: ''
                    });
                  }}
                  className="bg-slate-500 text-white px-4 py-3 rounded-xl hover:bg-slate-600 transition-colors"
                >
                  <X className="inline w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPaymentMethods.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <CreditCard className="mx-auto w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-semibold text-slate-500">Tidak ada metode pembayaran ditemukan</p>
              <p className="text-slate-400">Coba sesuaikan kata kunci pencarian Anda</p>
            </div>
          ) : (
            filteredPaymentMethods.map((payment) => (
              <div
                key={payment.id}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  {editingPaymentId === String(payment.id) ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Provider</label>
                        <select
                          value={editFormData.provider}
                          onChange={(e) => setEditFormData({...editFormData, provider: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="sparkpay">SparkPay</option>
                          <option value="winpay">WinPay</option>
                          <option value="mitra">Mitra</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">URL Gambar</label>
                        <input
                          type="url"
                          value={editFormData.image_url}
                          onChange={(e) => setEditFormData({...editFormData, image_url: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                              Payment #{filteredPaymentMethods.indexOf(payment) + 1}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">{payment.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getProviderColor(payment.provider)}`}>
                            {payment.provider}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            className="text-slate-400 hover:text-slate-600 p-1 rounded"
                            onClick={() => window.open(payment.image_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="flex-1 mb-4">
                        <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-center min-h-[100px]">
                          <img 
                            src={payment.image_url} 
                            alt={payment.name}
                            className="max-w-full max-h-20 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/150x100?text=${payment.name}`;
                            }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditPayment(payment)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePayment(String(payment.id), payment.name)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="text-slate-600 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default PaymentsPage;
