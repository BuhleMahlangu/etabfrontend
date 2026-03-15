import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  BookOpen, 
  Search,
  Download,
  Eye,
  Grid,
  List,
  File,
  Video,
  Image as ImageIcon,
  Music,
  Archive,
  Clock,
  User,
  Star,
  RefreshCw,
  FolderOpen,
  History,
  TrendingUp,
  ChevronRight,
  X,
  ExternalLink,
  Filter,
  Heart,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { materialAPI, subjectAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const AllMaterials = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // all, recent, favorites, downloads
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('material-favorites') || '[]');
  });
  const [downloadHistory, setDownloadHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('download-history') || '[]');
  });
  const [previewModal, setPreviewModal] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchMaterials();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getMySubjects();
      if (response.success) {
        setSubjects(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getAll({ limit: 100 });
      if (response.success) {
        setMaterials(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      addToast('Failed to load materials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (materialId) => {
    const newFavorites = favorites.includes(materialId)
      ? favorites.filter(id => id !== materialId)
      : [...favorites, materialId];
    setFavorites(newFavorites);
    localStorage.setItem('material-favorites', JSON.stringify(newFavorites));
    addToast(favorites.includes(materialId) ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const handleDownload = (material) => {
    // Add to download history
    const newDownload = {
      materialId: material.id,
      title: material.title,
      subject: material.subject_name,
      downloadedAt: new Date().toISOString()
    };
    const updatedHistory = [newDownload, ...downloadHistory.slice(0, 19)];
    setDownloadHistory(updatedHistory);
    localStorage.setItem('download-history', JSON.stringify(updatedHistory));
    
    // Open download
    window.open(material.file_url, '_blank');
    addToast('Download started', 'success');
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-6 h-6 text-slate-400" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('video') || type.includes('mp4')) return <Video className="w-6 h-6 text-purple-500" />;
    if (type.includes('image')) return <ImageIcon className="w-6 h-6 text-green-500" />;
    if (type.includes('audio')) return <Music className="w-6 h-6 text-yellow-500" />;
    if (type.includes('zip')) return <Archive className="w-6 h-6 text-orange-500" />;
    return <FileText className="w-6 h-6 text-blue-500" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter materials
  let filteredMaterials = materials.filter(m => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        m.title?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.subject_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Subject filter
  if (selectedSubject !== 'all') {
    filteredMaterials = filteredMaterials.filter(m => m.subject_id === selectedSubject);
  }

  // Tab filter
  if (activeTab === 'favorites') {
    filteredMaterials = filteredMaterials.filter(m => favorites.includes(m.id));
  } else if (activeTab === 'recent') {
    filteredMaterials = filteredMaterials
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  } else if (activeTab === 'downloads') {
    const downloadedIds = downloadHistory.map(d => d.materialId);
    filteredMaterials = filteredMaterials.filter(m => downloadedIds.includes(m.id));
  }

  // Group by subject for the sidebar
  const materialsBySubject = subjects.map(subject => ({
    ...subject,
    count: materials.filter(m => m.subject_id === subject.id).length
  })).filter(s => s.count > 0);

  // Recent materials (last 7 days)
  const recentMaterials = materials.filter(m => {
    const daysSinceUpload = (Date.now() - new Date(m.created_at)) / (1000 * 60 * 60 * 24);
    return daysSinceUpload <= 7;
  });

  const stats = {
    total: materials.length,
    recent: recentMaterials.length,
    favorites: favorites.length,
    downloaded: downloadHistory.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Learning Materials</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Access all your study materials organized by subject
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl p-6 border-2 transition-all ${
            activeTab === 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total Materials</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('recent')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl p-6 border-2 transition-all ${
            activeTab === 'recent' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">New This Week</p>
              <p className="text-3xl font-bold text-green-600">{stats.recent}</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('favorites')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl p-6 border-2 transition-all ${
            activeTab === 'favorites' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Favorites</p>
              <p className="text-3xl font-bold text-pink-600">{stats.favorites}</p>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('downloads')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl p-6 border-2 transition-all ${
            activeTab === 'downloads' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Downloaded</p>
              <p className="text-3xl font-bold text-purple-600">{stats.downloaded}</p>
            </div>
            <Download className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Subjects
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedSubject === 'all' 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="font-medium">All Subjects</span>
                <span className="text-sm text-slate-400">{materials.length}</span>
              </button>
              {materialsBySubject.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedSubject === subject.id 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate">{subject.name}</span>
                  <span className="text-sm text-slate-400">{subject.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Downloads */}
          {downloadHistory.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Downloads
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {downloadHistory.slice(0, 5).map((download, idx) => (
                  <div key={idx} className="text-sm p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{download.title}</p>
                    <p className="text-xs text-slate-400">{formatDate(download.downloadedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {activeTab === 'all' && 'All Materials'}
              {activeTab === 'recent' && 'Recently Added'}
              {activeTab === 'favorites' && 'My Favorites'}
              {activeTab === 'downloads' && 'Downloaded'}
              <span className="ml-2 text-sm font-normal text-slate-400">({filteredMaterials.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Materials Display */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No materials found
              </h3>
              <p className="text-slate-500">
                {searchQuery ? 'Try adjusting your search' : 'Materials will appear here when uploaded'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Preview Area */}
                  <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center relative rounded-t-xl">
                    {getFileIcon(material.file_type)}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-t-xl">
                      <button
                        onClick={() => setPreviewModal(material)}
                        className="p-3 bg-white rounded-full hover:bg-slate-100 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(material)}
                        className="p-3 bg-white rounded-full hover:bg-slate-100 transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(material.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          favorites.includes(material.id) 
                            ? 'fill-pink-500 text-pink-500' 
                            : 'text-slate-400'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {material.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {material.subject_name}
                        </p>
                      </div>
                    </div>
                    
                    {material.description && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {material.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(material.created_at)}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                        {material.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        {getFileIcon(material.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {material.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span>{material.subject_name}</span>
                          <span>•</span>
                          <span>{formatDate(material.created_at)}</span>
                          {favorites.includes(material.id) && (
                            <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(material.id)}
                          className="p-2 text-slate-400 hover:text-pink-500 rounded-lg"
                        >
                          <Heart className={`w-5 h-5 ${favorites.includes(material.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => setPreviewModal(material)}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(material)}
                          className="p-2 text-slate-400 hover:text-green-600 rounded-lg"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {previewModal.title}
              </h3>
              <button
                onClick={() => setPreviewModal(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  {getFileIcon(previewModal.file_type)}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Subject</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{previewModal.subject_name}</p>
                </div>
              </div>
              
              {previewModal.description && (
                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-2">Description</p>
                  <p className="text-slate-700 dark:text-slate-300">{previewModal.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-xs text-slate-500">Uploaded</p>
                  <p className="font-medium">{formatDate(previewModal.created_at)}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-xs text-slate-500">By</p>
                  <p className="font-medium">{previewModal.uploaded_by_name}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(previewModal)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => window.open(previewModal.file_url, '_blank')}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
