import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MessageSquare, Mail, Bell, Check, X, AlertTriangle, Calendar, Filter } from 'lucide-react';
import mockData from '../data/mock_data.json';

interface NotificationChannel {
  id: number | string;
  name: string;
  description?: string;
  created_at?: string;
}

interface NotificationPopup {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name: string;
  description: string;
}

interface ChannelResponse {
  status: string;
  message: string;
  data: NotificationChannel;
}

const ChannelPage: React.FC = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<NotificationPopup>({
    show: false,
    type: 'success',
    message: ''
  });

  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    channelType: 'all',
    hasDescription: 'all',
    dateRange: 'all'
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    description: ''
  });

  const [createdResponse, setCreatedResponse] = useState<ChannelResponse | null>(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    channelId: number | string | null;
    channelName: string;
  }>({
    isOpen: false,
    channelId: null,
    channelName: ''
  });

  // Load data from mock JSON file
  useEffect(() => {
    try {
      // Assuming mockData has a channels property
      const channelsData = mockData.channels || mockData;
      setChannels(Array.isArray(channelsData) ? channelsData : []);
    } catch (error) {
      console.error('Error loading mock data:', error);
      showNotification('error', 'Gagal memuat data channel');
    }
  }, []);

  const showNotification = (type: 'success' | 'error', message: string): void => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: '',
      description: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Nama channel wajib diisi';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nama channel minimal 3 karakter';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Deskripsi minimal 10 karakter';
    }

    // Check for duplicate name (excluding current editing channel)
    const isDuplicate = channels.some(channel => 
      channel.name.toLowerCase() === formData.name.toLowerCase() && 
      channel.id !== editingChannel?.id
    );

    if (isDuplicate) {
      newErrors.name = 'Nama channel sudah digunakan';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingChannel) {
        // Update existing channel
        setChannels(prev => prev.map(channel => 
          channel.id === editingChannel.id 
            ? { 
                ...channel, 
                name: formData.name.trim(),
                description: formData.description.trim()
              }
            : channel
        ));
        showNotification('success', 'Channel berhasil diperbarui');
      } else {
        // Create new channel
        const newChannel: NotificationChannel = {
          id: Date.now(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          created_at: new Date().toISOString()
        };

        const response: ChannelResponse = {
          status: 'success',
          message: 'Channel created successfully',
          data: newChannel
        };

        setChannels(prev => [newChannel, ...prev]);
        setCreatedResponse(response);
        showNotification('success', 'Channel berhasil dibuat');

        // Auto hide response after 5 seconds
        setTimeout(() => {
          setCreatedResponse(null);
        }, 5000);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving channel:', error);
      showNotification('error', 'Terjadi kesalahan saat menyimpan channel');
    }
  };

  const handleEdit = (channel: NotificationChannel): void => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      description: channel.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: number | string, channelName: string): void => {
    setDeleteConfirmation({
      isOpen: true,
      channelId: id,
      channelName: channelName
    });
  };

  const confirmDeleteChannel = () => {
    if (deleteConfirmation.channelId) {
      setChannels(prev => prev.filter(channel => channel.id !== deleteConfirmation.channelId));
      showNotification('success', 'Channel berhasil dihapus');
      setDeleteConfirmation({
        isOpen: false,
        channelId: null,
        channelName: ''
      });
    }
  };

  const cancelDeleteChannel = () => {
    setDeleteConfirmation({
      isOpen: false,
      channelId: null,
      channelName: ''
    });
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingChannel(null);
    setFormData({ name: '', description: '' });
    setErrors({ name: '', description: '' });
  };

  const getChannelIcon = (name: string): React.ReactElement => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('whatsapp') || lowerName.includes('wa')) {
      return <MessageSquare className="w-5 h-5" />;
    }
    if (lowerName.includes('email') || lowerName.includes('mail')) {
      return <Mail className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  const filteredChannels = channels.filter((channel: NotificationChannel) => {
    // Search filter
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (channel.description && channel.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Channel type filter (based on name keywords)
    const matchesChannelType = activeFilters.channelType === 'all' || (() => {
      const name = channel.name.toLowerCase();
      switch (activeFilters.channelType) {
        case 'email': return name.includes('email') || name.includes('mail');
        case 'sms': return name.includes('sms') || name.includes('text');
        case 'whatsapp': return name.includes('whatsapp') || name.includes('wa');
        case 'telegram': return name.includes('telegram');
        case 'push': return name.includes('push') || name.includes('notification');
        default: return true;
      }
    })();

    // Has description filter
    const matchesDescription = activeFilters.hasDescription === 'all' || (() => {
      switch (activeFilters.hasDescription) {
        case 'with': return channel.description && channel.description.trim() !== '';
        case 'without': return !channel.description || channel.description.trim() === '';
        default: return true;
      }
    })();

    // Date range filter
    const matchesDateRange = activeFilters.dateRange === 'all' || (() => {
      if (!channel.created_at) return activeFilters.dateRange === 'all';
      
      const channelDate = new Date(channel.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - channelDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (activeFilters.dateRange) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'year': return daysDiff <= 365;
        default: return true;
      }
    })();

    return matchesSearch && matchesChannelType && matchesDescription && matchesDateRange;
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
      channelType: 'all',
      hasDescription: 'all',
      dateRange: 'all'
    });
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // SuccessModal
  const SuccessModal = () => {
    if (!createdResponse || !createdResponse.data) return null;

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
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Success!</h2>
              <p className="text-sm text-green-600 font-medium">{createdResponse?.message}</p>
            </div>
          </div>

          {/* Channel Details */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Channel Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Channel Name</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse?.data.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Created At</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {createdResponse.data.created_at ? formatDate(createdResponse.data.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Description */}
            {createdResponse && createdResponse.data.description && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Description</h4>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-sm text-slate-700">{createdResponse?.data.description}</p>
                </div>
              </div>
            )}
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
              Apakah Anda yakin ingin menghapus channel berikut?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-red-500">
              <p className="font-semibold text-slate-800">{deleteConfirmation.channelName}</p>
              <p className="text-sm text-slate-600">Channel ini akan dihapus secara permanen</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeleteChannel}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteChannel}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Channel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Notification Popup */}
        {notification.show && (
          <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-top-2">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Notification Channels
            </h1>
            <p className="mt-2 text-slate-600">Kelola saluran notifikasi untuk sistem Anda</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <span className="text-sm font-medium text-slate-600">Total: </span>
            <span className="text-lg font-bold text-slate-900">{channels.length}</span>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari channel..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-white/20 p-4 min-w-[300px] z-40">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Filter Channels</h3>
                        {getActiveFilterCount() > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Channel Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Channel Type</label>
                        <select
                          value={activeFilters.channelType}
                          onChange={(e) => handleFilterChange('channelType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Types</option>
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="telegram">Telegram</option>
                          <option value="push">Push Notification</option>
                        </select>
                      </div>

                      {/* Has Description Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description Status</label>
                        <select
                          value={activeFilters.hasDescription}
                          onChange={(e) => handleFilterChange('hasDescription', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Channels</option>
                          <option value="with">With Description</option>
                          <option value="without">Without Description</option>
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
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Channel
              </button>
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChannels.map((channel: NotificationChannel) => (
            <div key={channel.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-200">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getChannelIcon(channel.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          Channel #{filteredChannels.indexOf(channel) + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">{channel.name}</h3>
                      <p className="text-sm text-slate-500">
                        {channel.created_at && formatDate(channel.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(channel)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Channel"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(channel.id, channel.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Channel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {channel.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-500 mb-2">Tidak ada channel ditemukan</h3>
            <p className="text-slate-400">
              {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan membuat channel pertama Anda'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop Blur Layer */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />
          {/* Modal Container */}
          <div className="relative flex items-center justify-center min-h-full p-4 pt-24">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingChannel ? 'Edit Channel' : 'Tambah Channel Baru'}
              </h2>
              <p className="text-gray-600 mt-1">
                {editingChannel ? 'Perbarui informasi channel' : 'Buat saluran notifikasi baru'}
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Channel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleInputChange('name', e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama channel"
                  maxLength={50}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleInputChange('description', e.target.value)
                  }
                  rows={4}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan deskripsi channel"
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-gray-400 text-sm">
                    {formData.description.length}/200
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingChannel ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Success Modal */}
      <div className={createdResponse ? 'fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50' : 'hidden'}>
        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 mt-20 relative transform animate-in fade-in zoom-in duration-300 max-h-[calc(100vh-8rem)] overflow-y-auto">
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
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Success!</h2>
              <p className="text-sm text-green-600 font-medium">{createdResponse?.message}</p>
            </div>
          </div>

          {/* Channel Details */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Channel Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Channel Name</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse?.data.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Created At</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {createdResponse?.data.created_at ? new Date(createdResponse.data.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {createdResponse && createdResponse.data.description && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Description</h4>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-sm text-slate-700">{createdResponse.data.description}</p>
                </div>
              </div>
            )}
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
      
      {/* Delete Confirmation Modal */}
      <div className={deleteConfirmation.isOpen ? 'fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50' : 'hidden'}>
        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 mt-20 relative transform animate-in fade-in zoom-in duration-300">
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
              Apakah Anda yakin ingin menghapus channel berikut?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-red-500">
              <p className="font-semibold text-slate-800">{deleteConfirmation.channelName}</p>
              <p className="text-sm text-slate-600">Channel ini akan dihapus secara permanen</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeleteChannel}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteChannel}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Channel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;