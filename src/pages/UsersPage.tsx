import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Mail, Phone, Save, X, Filter, Calendar, AlertTriangle, Users, Check } from 'lucide-react';
import mockData from '../data/mock_data.json';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
}

interface UserResponse {
  status: string;
  message: string;
  data: User;
}


interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [createdResponse, setCreatedResponse] = useState<UserResponse | null>(null);

  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    domain: 'all',
    phonePrefix: 'all'
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });

  const [editFormData, setEditFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    phone: ''
  });

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: ''
  });

  // Load data from mock JSON file
  useEffect(() => {
    try {
      const usersData = mockData.users || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error loading mock data:', error);
    }
  }, []);

  const validateForm = (data: FormData): boolean => {
    const newErrors: FormErrors = {
      name: '',
      email: '',
      phone: ''
    };

    // Name validation
    if (!data.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Phone validation
    if (!data.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9+\-\s()]+$/.test(data.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    // Check for duplicate email (excluding current editing user)
    const isDuplicateEmail = users.some(user => 
      user.email.toLowerCase() === data.email.toLowerCase() && 
      user.id !== editingUserId
    );

    if (isDuplicateEmail) {
      newErrors.email = 'Email sudah digunakan';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.phone;
  };

  const handleAddUser = (): void => {
    if (!validateForm(formData)) return;

    try {
      const newUser: User = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        created_at: new Date().toISOString()
      };

      const response: UserResponse = {
        status: 'success',
        message: 'User berhasil dibuat',
        data: newUser
      };

      setUsers(prev => [newUser, ...prev]);
      setFormData({ name: '', email: '', phone: '' });
      setShowAddForm(false);
      setCreatedResponse(response);

      // Auto hide response after 5 seconds
      setTimeout(() => {
        setCreatedResponse(null);
      }, 5000);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditUser = (user: User): void => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone
    });
  };

  const handleSaveEdit = (): void => {
    if (!validateForm(editFormData)) return;

    try {
      setUsers(prev => prev.map(user => 
        user.id === editingUserId 
          ? { 
              ...user, 
              name: editFormData.name.trim(),
              email: editFormData.email.trim(),
              phone: editFormData.phone.trim()
            }
          : user
      ));
      setEditingUserId(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancelEdit = (): void => {
    setEditingUserId(null);
    setEditFormData({ name: '', email: '', phone: '' });
    setErrors({ name: '', email: '', phone: '' });
  };

  const handleDeleteUser = (id: number, userName: string): void => {
    setDeleteConfirmation({
      isOpen: true,
      userId: id,
      userName: userName
    });
  };

  const confirmDeleteUser = (): void => {
    if (deleteConfirmation.userId) {
      setUsers(prev => prev.filter(user => user.id !== deleteConfirmation.userId));
      setDeleteConfirmation({
        isOpen: false,
        userId: null,
        userName: ''
      });
    }
  };

  const cancelDeleteUser = (): void => {
    setDeleteConfirmation({
      isOpen: false,
      userId: null,
      userName: ''
    });
  };

  const filteredUsers = users.filter((user: User) => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    // Status filter (simulate active/inactive based on email domain or phone)
    const isActive = user.email.includes('gmail') || user.email.includes('kapten');
    const matchesStatus = activeFilters.status === 'all' || 
      (activeFilters.status === 'active' && isActive) ||
      (activeFilters.status === 'inactive' && !isActive);

    // Domain filter
    const emailDomain = user.email.split('@')[1];
    const matchesDomain = activeFilters.domain === 'all' ||
      (activeFilters.domain === 'gmail' && emailDomain?.includes('gmail')) ||
      (activeFilters.domain === 'yahoo' && emailDomain?.includes('yahoo')) ||
      (activeFilters.domain === 'kapten' && emailDomain?.includes('kapten')) ||
      (activeFilters.domain === 'other' && !emailDomain?.includes('gmail') && !emailDomain?.includes('yahoo') && !emailDomain?.includes('kapten'));

    // Phone prefix filter
    const matchesPhonePrefix = activeFilters.phonePrefix === 'all' ||
      (activeFilters.phonePrefix === '+62' && user.phone.startsWith('+62')) ||
      (activeFilters.phonePrefix === 'local' && user.phone.startsWith('0')) ||
      (activeFilters.phonePrefix === 'international' && !user.phone.startsWith('+62') && !user.phone.startsWith('0'));

    return matchesSearch && matchesStatus && matchesDomain && matchesPhonePrefix;
  });

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
      status: 'all',
      domain: 'all',
      phonePrefix: 'all'
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

  const handleInputChange = (field: keyof FormData, value: string, isEdit = false): void => {
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Success!</h2>
              <p className="text-sm text-green-600 font-medium">{createdResponse.message}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">User Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Name</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse.data.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse.data.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse.data.phone}</p>
                  </div>
                </div>

                {createdResponse.data.created_at && (
                  <div className="flex items-center gap-3 md:col-span-2">
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
                )}
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
              Apakah Anda yakin ingin menghapus user berikut?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-red-500">
              <p className="font-semibold text-slate-800">{deleteConfirmation.userName}</p>
              <p className="text-sm text-slate-600">User ini akan dihapus secara permanen</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeleteUser}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteUser}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus User
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="mt-2 text-slate-600">Kelola data pengguna sistem</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <span className="text-sm font-medium text-slate-600">Total: </span>
            <span className="text-lg font-bold text-slate-900">{users.length}</span>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari user berdasarkan nama, email, atau phone..."
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
                        <h3 className="font-semibold text-slate-800">Filter Users</h3>
                        {getActiveFilterCount() > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                        <select
                          value={activeFilters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Email Domain Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Domain</label>
                        <select
                          value={activeFilters.domain}
                          onChange={(e) => handleFilterChange('domain', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Domains</option>
                          <option value="gmail">Gmail</option>
                          <option value="yahoo">Yahoo</option>
                          <option value="kapten">Kapten</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Phone Prefix Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone Type</label>
                        <select
                          value={activeFilters.phonePrefix}
                          onChange={(e) => handleFilterChange('phonePrefix', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Phone Types</option>
                          <option value="+62">Indonesian (+62)</option>
                          <option value="local">Local (0xxx)</option>
                          <option value="international">International</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah User
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Tambah User Baru
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+62812345678 atau 081234567890"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddUser}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  disabled={!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()}
                >
                  <Save className="inline w-4 h-4 mr-2" />
                  Simpan User
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', email: '', phone: '' });
                    setErrors({ name: '', email: '', phone: '' });
                  }}
                  className="bg-slate-500 text-white px-4 py-3 rounded-xl hover:bg-slate-600 transition-colors"
                >
                  <X className="inline w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="mx-auto w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-semibold text-slate-500">Tidak ada user ditemukan</p>
              <p className="text-slate-400">
                {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambah user pertama'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  {editingUserId === user.id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => handleInputChange('name', e.target.value, true)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => handleInputChange('email', e.target.value, true)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={editFormData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value, true)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
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
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                            <p className="text-sm text-slate-500">User #{users.indexOf(user) + 1}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                            <p className="text-sm text-slate-700 break-all">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                            <p className="text-sm text-slate-700">{user.phone}</p>
                          </div>
                        </div>

                        {user.created_at && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase">Created</p>
                              <p className="text-sm text-slate-700">{formatDate(user.created_at)}</p>
                            </div>
                          </div>
                        )}
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

export default UsersPage;
