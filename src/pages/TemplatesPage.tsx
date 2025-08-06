import React, { useEffect, useState } from 'react';
import mockData from '../data/mock_data.json';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { 
  Plus, Edit2, Trash2, Save, X, Search, Filter, MoreVertical, 
  FileText, CheckCircle, Calendar, Tag, MessageSquare,
  Eye, Copy, Bell, Mail, Globe, Code, Type, AlertTriangle
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Template {
  id: number;
  category_id: number;
  channel_id: number;
  template_name: string;
  subject: string;
  body: string;
  has_attachment: boolean;
  created_at: string;
  category?: Category;
  channel?: Channel;
}

interface TemplateResponse {
  status: string;
  message: string;
  data: Template;
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    // Load data from mock_data.json
    setTemplates(mockData.templates || []);
    setCategories(mockData.categories || []);
    setChannels(mockData.channels || []);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [createdResponse, setCreatedResponse] = useState<TemplateResponse | null>(null);
  
  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categoryId: 'all',
    channelId: 'all',
    hasAttachment: 'all',
    dateRange: 'all'
  });
  
  // Form states
  const [formData, setFormData] = useState({
    template_name: '',
    subject: '',
    body: '',
    category_id: '',
    channel_id: '',
    has_attachment: false
  });

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    template_name: '',
    subject: '',
    body: '',
    category_id: '',
    channel_id: '',
    has_attachment: false
  });

  // Markdown preview states
  const [previewMode, setPreviewMode] = useState<{[key: string]: boolean}>({});
  const [editPreviewMode, setEditPreviewMode] = useState<{[key: string]: boolean}>({});
  const [addFormPreviewMode, setAddFormPreviewMode] = useState(false);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    templateId: string | null;
    templateName: string;
  }>({
    isOpen: false,
    templateId: null,
    templateName: ''
  });

  const filteredTemplates = templates.filter(template => {
    // Search filter
    const matchesSearch = template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.body.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = activeFilters.categoryId === 'all' || 
      String(template.category_id) === activeFilters.categoryId;

    // Channel filter
    const matchesChannel = activeFilters.channelId === 'all' || 
      String(template.channel_id) === activeFilters.channelId;

    // Has attachment filter
    const matchesAttachment = activeFilters.hasAttachment === 'all' || (() => {
      switch (activeFilters.hasAttachment) {
        case 'with': return template.has_attachment;
        case 'without': return !template.has_attachment;
        default: return true;
      }
    })();

    // Date range filter
    const matchesDateRange = activeFilters.dateRange === 'all' || (() => {
      const templateDate = new Date(template.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - templateDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (activeFilters.dateRange) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'year': return daysDiff <= 365;
        default: return true;
      }
    })();

    return matchesSearch && matchesCategory && matchesChannel && matchesAttachment && matchesDateRange;
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
      categoryId: 'all',
      channelId: 'all',
      hasAttachment: 'all',
      dateRange: 'all'
    });
  };

  // Toggle markdown preview
  const togglePreview = (templateId: string) => {
    setPreviewMode(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const toggleEditPreview = (templateId: string) => {
    setEditPreviewMode(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  // Edit handlers
  const handleEditTemplate = (template: Template) => {
    setEditingTemplateId(String(template.id));
    setEditFormData({
      template_name: template.template_name,
      subject: template.subject,
      body: template.body,
      category_id: String(template.category_id),
      channel_id: String(template.channel_id),
      has_attachment: template.has_attachment
    });
  };

  const handleSaveEdit = () => {
    if (!editFormData.template_name.trim() || !editFormData.category_id || !editFormData.channel_id) return;
    setTemplates(templates.map(template =>
      String(template.id) === editingTemplateId
        ? {
            ...template,
            template_name: editFormData.template_name,
            subject: editFormData.subject,
            body: editFormData.body,
            category_id: parseInt(editFormData.category_id),
            channel_id: parseInt(editFormData.channel_id),
            has_attachment: editFormData.has_attachment,
            category: categories.find(cat => cat.id === parseInt(editFormData.category_id)),
            channel: channels.find(ch => ch.id === parseInt(editFormData.channel_id))
          }
        : template
    ));
    setEditingTemplateId(null);
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
  };

  const handleAddTemplate = () => {
    if (!formData.template_name.trim() || !formData.category_id || !formData.channel_id) return;

    const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category_id));
    const selectedChannel = channels.find(ch => ch.id === parseInt(formData.channel_id));

    const newTemplate: Template = {
      id: Date.now(),
      category_id: parseInt(formData.category_id),
      channel_id: parseInt(formData.channel_id),
      template_name: formData.template_name,
      subject: formData.subject,
      body: formData.body,
      has_attachment: formData.has_attachment,
      created_at: new Date().toISOString(),
      category: selectedCategory,
      channel: selectedChannel
    };

    const response: TemplateResponse = {
      status: 'success',
      message: 'Template created successfully',
      data: newTemplate
    };

    setTemplates([...templates, newTemplate]);
    setFormData({
      template_name: '',
      subject: '',
      body: '',
      category_id: '',
      channel_id: '',
      has_attachment: false
    });
    setShowAddForm(false);
    setCreatedResponse(response);

    setTimeout(() => {
      setCreatedResponse(null);
    }, 5000);
  };

  const handleDeleteTemplate = (id: string, templateName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      templateId: id,
      templateName: templateName
    });
  };

  const confirmDeleteTemplate = () => {
    if (deleteConfirmation.templateId) {
      setTemplates(templates.filter(template => template.id !== Number(deleteConfirmation.templateId)));
      setDeleteConfirmation({
        isOpen: false,
        templateId: null,
        templateName: ''
      });
    }
  };

  const cancelDeleteTemplate = () => {
    setDeleteConfirmation({
      isOpen: false,
      templateId: null,
      templateName: ''
    });
  };

  // Markdown Renderer Component
  const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({ content, className = "" }) => {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Custom styling for markdown elements
            h1: ({children}) => <h1 className="text-lg font-bold text-slate-800 mb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-base font-semibold text-slate-700 mb-2">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm font-semibold text-slate-700 mb-1">{children}</h3>,
            p: ({children}) => <p className="text-sm text-slate-700 mb-2">{children}</p>,
            strong: ({children}) => <strong className="font-semibold text-slate-800">{children}</strong>,
            em: ({children}) => <em className="italic text-slate-600">{children}</em>,
            code: ({children}) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-slate-800">{children}</code>,
            pre: ({children}) => <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
            ul: ({children}) => <ul className="list-disc list-inside text-sm text-slate-700 mb-2">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside text-sm text-slate-700 mb-2">{children}</ol>,
            li: ({children}) => <li className="mb-1">{children}</li>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-slate-300 pl-3 italic text-slate-600 mb-2">{children}</blockquote>,
            a: ({children, href}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline">{children}</a>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const getChannelIcon = (channelName: string) => {
    switch (channelName.toLowerCase()) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'in-app notification': return <Bell className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channelName: string) => {
    switch (channelName.toLowerCase()) {
      case 'email': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sms': return 'bg-green-100 text-green-700 border-green-200';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-app notification': return 'bg-purple-100 text-purple-700 border-purple-200';
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

          {/* Template Details */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Template Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Template Name</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse.data.template_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Subject</p>
                    <p className="text-sm font-semibold text-slate-800">{createdResponse.data.subject}</p>
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

            {/* Category & Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 text-sm uppercase tracking-wide mb-3">Category</h4>
                <div className="space-y-2">
                  <p className="font-semibold text-blue-900">{createdResponse.data.category?.name}</p>
                  <p className="text-sm text-blue-700">{createdResponse.data.category?.description}</p>
                </div>
              </div>

              {/* Channel */}
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 text-sm uppercase tracking-wide mb-3">Channel</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(createdResponse.data.channel?.name || '')}
                    <p className="font-semibold text-green-900">{createdResponse.data.channel?.name}</p>
                  </div>
                  <p className="text-sm text-green-700">{createdResponse.data.channel?.description}</p>
                </div>
              </div>
            </div>

            {/* Body Preview */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Message Body</h4>
              <div className="bg-white rounded-lg p-3 border max-h-32 overflow-y-auto">
                <MarkdownRenderer content={createdResponse.data.body} />
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
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pt-20">
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
              Apakah Anda yakin ingin menghapus template berikut?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-red-500">
              <p className="font-semibold text-slate-800">{deleteConfirmation.templateName}</p>
              <p className="text-sm text-slate-600">Template ini akan dihapus secara permanen</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeleteTemplate}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteTemplate}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Template
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
              Template Notifikasi
            </h1>
            <p className="mt-2 text-slate-600">Kelola template pesan untuk berbagai channel komunikasi</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <span className="text-sm font-medium text-slate-600">Total: </span>
            <span className="text-lg font-bold text-slate-900">{templates.length}</span>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white shadow-lg transition-all duration-200"
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
                    <span className="ml-2 px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
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
                        <h3 className="font-semibold text-slate-800">Filter Templates</h3>
                        {getActiveFilterCount() > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-purple-600 hover:text-purple-800"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                        <select
                          value={activeFilters.categoryId}
                          onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">All Categories</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Channel Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Channel</label>
                        <select
                          value={activeFilters.channelId}
                          onChange={(e) => handleFilterChange('channelId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">All Channels</option>
                          {channels.map(channel => (
                            <option key={channel.id} value={channel.id}>{channel.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Attachment Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Attachment Status</label>
                        <select
                          value={activeFilters.hasAttachment}
                          onChange={(e) => handleFilterChange('hasAttachment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">All Templates</option>
                          <option value="with">With Attachment</option>
                          <option value="without">Without Attachment</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Created Date</label>
                        <select
                          value={activeFilters.dateRange}
                          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Template
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-500" />
                Tambah Template Baru
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Template</label>
                  <input
                    type="text"
                    value={formData.template_name}
                    onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                    placeholder="Masukkan nama template..."
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Masukkan subject..."
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Pilih kategori...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Channel</label>
                  <select
                    value={formData.channel_id}
                    onChange={(e) => setFormData({...formData, channel_id: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Pilih channel...</option>
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.id}>{channel.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Isi Pesan</label>
                    <button
                      type="button"
                      onClick={() => setAddFormPreviewMode(!addFormPreviewMode)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        addFormPreviewMode 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {addFormPreviewMode ? (
                        <>
                          <Code className="w-3 h-3" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          Preview
                        </>
                      )}
                    </button>
                  </div>
                  {addFormPreviewMode ? (
                    <div className="w-full min-h-[150px] px-4 py-3 border rounded-xl bg-white">
                      <MarkdownRenderer content={formData.body} />
                    </div>
                  ) : (
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({...formData, body: e.target.value})}
                      placeholder="Masukkan isi pesan template menggunakan markdown:&#10;&#10;**Bold text**&#10;*Italic text*&#10;`code`&#10;- List item&#10;[Link](url)&#10;&#10;> Blockquote&#10;### Heading"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={6}
                    />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.has_attachment}
                      onChange={(e) => setFormData({...formData, has_attachment: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700">Template memiliki attachment</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddTemplate}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  disabled={!formData.template_name.trim() || !formData.category_id || !formData.channel_id}
                >
                  <Save className="inline w-4 h-4 mr-2" />
                  Simpan Template
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      template_name: '',
                      subject: '',
                      body: '',
                      category_id: '',
                      channel_id: '',
                      has_attachment: false
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

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-semibold text-slate-500">Tidak ada template ditemukan</p>
              <p className="text-slate-400">Coba sesuaikan kata kunci pencarian Anda</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  {editingTemplateId === String(template.id) ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nama Template</label>
                        <input
                          type="text"
                          value={editFormData.template_name}
                          onChange={(e) => setEditFormData({...editFormData, template_name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                        <input
                          type="text"
                          value={editFormData.subject}
                          onChange={(e) => setEditFormData({...editFormData, subject: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                        <select
                          value={editFormData.category_id}
                          onChange={(e) => setEditFormData({...editFormData, category_id: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Channel</label>
                        <select
                          value={editFormData.channel_id}
                          onChange={(e) => setEditFormData({...editFormData, channel_id: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {channels.map(channel => (
                            <option key={channel.id} value={channel.id}>{channel.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-slate-700">Isi Pesan</label>
                          <button
                            type="button"
                            onClick={() => toggleEditPreview(String(template.id))}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                              editPreviewMode[String(template.id)] 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {editPreviewMode[String(template.id)] ? (
                              <>
                                <Code className="w-3 h-3" />
                                Edit
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Preview
                              </>
                            )}
                          </button>
                        </div>
                        {editPreviewMode[String(template.id)] ? (
                          <div className="w-full min-h-[100px] px-3 py-2 border rounded-lg bg-white">
                            <MarkdownRenderer content={editFormData.body} />
                          </div>
                        ) : (
                          <textarea
                            value={editFormData.body}
                            onChange={(e) => setEditFormData({...editFormData, body: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={4}
                            placeholder="Gunakan markdown untuk formatting:&#10;**Bold text**&#10;*Italic text*&#10;`code`&#10;- List item&#10;[Link](url)"
                          />
                        )}
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editFormData.has_attachment}
                            onChange={(e) => setEditFormData({...editFormData, has_attachment: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm text-slate-700">Template memiliki attachment</span>
                        </label>
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
                              Template #{filteredTemplates.indexOf(template) + 1}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">{template.template_name}</h3>
                          <p className="text-sm font-medium text-slate-600">{template.subject}</p>
                        </div>
                        <div className="flex gap-1">
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">
                          {template.category?.name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${getChannelColor(template.channel?.name || '')}`}>
                          {getChannelIcon(template.channel?.name || '')}
                          {template.channel?.name}
                        </span>
                        {template.has_attachment && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200">
                            Has Attachment
                          </span>
                        )}
                      </div>

                      {/* Body Preview */}
                      <div className="flex-1 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase">Content</span>
                          <button
                            onClick={() => togglePreview(String(template.id))}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                              previewMode[String(template.id)] 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {previewMode[String(template.id)] ? (
                              <>
                                <Type className="w-3 h-3" />
                                Raw
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Markdown
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 max-h-24 overflow-hidden">
                          {previewMode[String(template.id)] ? (
                            <div className="max-h-20 overflow-hidden">
                              <MarkdownRenderer content={template.body} />
                            </div>
                          ) : (
                            <p className="text-sm text-slate-700 line-clamp-3">
                              {template.body}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(template.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditTemplate(template)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTemplate(String(template.id), template.template_name)}
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

export default TemplatesPage;