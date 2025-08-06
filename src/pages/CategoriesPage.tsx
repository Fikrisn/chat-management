// src/pages/CategoriesPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import mockData from '../data/mock_data.json'; // Assuming you have a mockData file with categories
import {
  Plus, Edit2, Trash2, Save, X, Search, Filter, MoreVertical, Tag, Grid3X3, CheckCircle, Calendar, FileText, AlertTriangle
} from 'lucide-react';

interface Category {
  id: string | number;
  name: string;
  description?: string;
  created_at?: string;
}

interface ResponseData {
  status: string;
  message: string;
  data: Category;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(mockData.categories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryDescription, setEditingCategoryDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [createdResponse, setCreatedResponse] = useState<ResponseData | null>(null);

  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    hasDescription: 'all',
    dateRange: 'all',
    nameLength: 'all'
  });

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    categoryId: string | number | null;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });

  // Ref for filter dropdown
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCategories = categories.filter(category => {
    // Search filter
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Has description filter
    const matchesDescription = activeFilters.hasDescription === 'all' || (() => {
      switch (activeFilters.hasDescription) {
        case 'with': return category.description && category.description.trim() !== '';
        case 'without': return !category.description || category.description.trim() === '';
        default: return true;
      }
    })();

    // Date range filter
    const matchesDateRange = activeFilters.dateRange === 'all' || (() => {
      if (!category.created_at) return activeFilters.dateRange === 'all';
      
      const categoryDate = new Date(category.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - categoryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (activeFilters.dateRange) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'year': return daysDiff <= 365;
        default: return true;
      }
    })();

    // Name length filter
    const matchesNameLength = activeFilters.nameLength === 'all' || (() => {
      const nameLength = category.name.length;
      switch (activeFilters.nameLength) {
        case 'short': return nameLength <= 10;
        case 'medium': return nameLength > 10 && nameLength <= 20;
        case 'long': return nameLength > 20;
        default: return true;
      }
    })();

    return matchesSearch && matchesDescription && matchesDateRange && matchesNameLength;
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
      hasDescription: 'all',
      dateRange: 'all',
      nameLength: 'all'
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') return;

    const newCategory: Category = {
      id: uuidv4(),
      name: newCategoryName,
      description: newCategoryDescription,
      created_at: new Date().toISOString(),
    };

    const response: ResponseData = {
      status: 'success',
      message: 'Categories created successfully',
      data: newCategory,
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setShowAddForm(false);
    setCreatedResponse(response);

    setTimeout(() => {
      setCreatedResponse(null);
    }, 4000);
  };

  const handleDeleteCategory = (id: string | number, categoryName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      categoryId: id,
      categoryName: categoryName
    });
  };

  const confirmDeleteCategory = () => {
    if (deleteConfirmation.categoryId) {
      setCategories(categories.filter(cat => cat.id !== deleteConfirmation.categoryId));
      setDeleteConfirmation({
        isOpen: false,
        categoryId: null,
        categoryName: ''
      });
    }
  };

  const cancelDeleteCategory = () => {
    setDeleteConfirmation({
      isOpen: false,
      categoryId: null,
      categoryName: ''
    });
  };

  const handleEditCategory = (id: string | number) => {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      setEditingCategoryId(id);
      setEditingCategoryName(category.name);
      setEditingCategoryDescription(category.description || '');
    }
  };

  const handleSaveEdit = () => {
    if (!editingCategoryId || editingCategoryName.trim() === '') return;

    const updated = categories.map(cat =>
      cat.id === editingCategoryId
        ? { ...cat, name: editingCategoryName, description: editingCategoryDescription }
        : cat
    );
    setCategories(updated);
    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingCategoryDescription('');
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingCategoryDescription('');
  };

  const SuccessModal = () => {
    if (!createdResponse) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]">
        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative transform animate-in fade-in zoom-in duration-300">
          {/* Close Button */}
          <button
            onClick={() => setCreatedResponse(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Success Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Success!</h2>
              <p className="text-sm text-green-600 font-medium">{createdResponse.message}</p>
            </div>
          </div>

          {/* Category Details */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Category Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Name</p>
                  <p className="text-sm font-semibold text-slate-800">{createdResponse.data.name}</p>
                </div>
              </div>

              {createdResponse.data.description && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{createdResponse.data.description}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Created At</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {createdResponse.data.created_at ? new Date(createdResponse.data.created_at).toLocaleString() : 'N/A'}
                  </p>
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
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]">
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
              Apakah Anda yakin ingin menghapus kategori berikut?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-red-500">
              <p className="font-semibold text-slate-800">{deleteConfirmation.categoryName}</p>
              <p className="text-sm text-slate-600">Kategori ini akan dihapus secara permanen</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeleteCategory}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteCategory}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Kategori
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-8">
      {/* Add top padding to account for fixed header */}
      <div className="pt-16 sm:pt-20"> {/* Adjust this value based on your header height */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Categories
              </h1>
              <p className="mt-2 text-slate-600">Manage and organize your content categories</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/20">
              <span className="text-sm font-medium text-slate-600">Total: </span>
              <span className="text-lg font-bold text-slate-900">{categories.length}</span>
            </div>
          </div>

          {/* Search & Add Button */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white shadow-lg transition-all duration-200"
                />
              </div>
              <div className="flex space-x-3">
                <div className="relative" ref={filterDropdownRef}>
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

                  {/* Filter Dropdown - Fixed positioning and z-index */}
                  {showFilterDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-white/20 p-4 min-w-[300px] z-[9998]">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800">Filter Categories</h3>
                          {getActiveFilterCount() > 0 && (
                            <button
                              onClick={clearAllFilters}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {/* Has Description Filter */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Description Status</label>
                          <select
                            value={activeFilters.hasDescription}
                            onChange={(e) => handleFilterChange('hasDescription', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All Categories</option>
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

                        {/* Name Length Filter */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Name Length</label>
                          <select
                            value={activeFilters.nameLength}
                            onChange={(e) => handleFilterChange('nameLength', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All Lengths</option>
                            <option value="short">Short (≤10 chars)</option>
                            <option value="medium">Medium (11-20 chars)</option>
                            <option value="long">Long (&gt;20 chars)</option>
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
                  Add Category
                </button>
              </div>
            </div>

            {showAddForm && (
              <div className="bg-white/80 p-6 rounded-2xl shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-500" />
                  Add New Category
                </h3>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description..."
                    className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleAddCategory}
                      className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newCategoryName.trim()}
                    >
                      <Save className="inline w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewCategoryName('');
                        setNewCategoryDescription('');
                      }}
                      className="bg-slate-500 text-white px-4 py-3 rounded-xl hover:bg-slate-600"
                    >
                      <X className="inline w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Grid3X3 className="mx-auto w-16 h-16 text-slate-300 mb-4" />
                <p className="text-lg font-semibold text-slate-500">No categories found</p>
                <p className="text-slate-400">Try adjusting your search terms</p>
              </div>
            ) : (
              filteredCategories.map(category => (
                <div
                  key={category.id}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  {editingCategoryId === category.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={editingCategoryDescription}
                        onChange={(e) => setEditingCategoryDescription(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors"
                        >
                          <Save className="inline w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-slate-500 text-white px-4 py-2 rounded-xl hover:bg-slate-600 transition-colors"
                        >
                          <X className="inline w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            Category #{filteredCategories.indexOf(category) + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{category.name}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                          {category.description || 'No description available'}
                        </p>
                        {category.created_at && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(category.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleEditCategory(category.id)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default CategoriesPage;