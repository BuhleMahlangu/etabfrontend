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
  Star,
  RefreshCw,
  FolderOpen,
  History,
  Heart,
  MoreVertical,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { materialAPI, subjectAPI, enrollmentAPI, downloadAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const AllMaterials = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('material-favorites') || '[]');
  });
  const [downloadHistory, setDownloadHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('download-history') || '[]');
  });
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, recent: 0, favorites: 0, downloaded: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchEnrolledSubjects(),
        fetchMaterials(),
        fetchAllSubjects()
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledSubjects = async () => {
    try {
      const response = await enrollmentAPI.getMyEnrollments();
      if (response.success) {
        setEnrolledSubjects(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  const fetchAllSubjects = async () => {
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
      const response = await materialAPI.getAll({ limit: 100 });
      if (response.success) {
        const materialsData = response.data || [];
        setMaterials(materialsData);
        
        // Calculate stats
        const recentMaterials = materialsData.filter(m => {
          const daysSinceUpload = (Date.now() - new Date(m.created_at)) / (1000 * 60 * 60 * 24);
          return daysSinceUpload <= 7;
        });
        
        setStats({
          total: materialsData.length,
          recent: recentMaterials.length,
          favorites: favorites.length,
          downloaded: downloadHistory.length
        });
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      addToast('Failed to load materials', 'error');
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

  const handleDownload = async (material) => {
    try {
      setDownloadingId(material.id);
      
      // Get token
      const token = localStorage.getItem('token')?.replace(/^["']|["']$/g, '');
      
      // Fetch the file through the proxy with authentication
      const downloadUrl = downloadAPI.material(material.id);
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Download failed');
      }
      
      // Get filename from Content-Disposition header or use material title
      const disposition = response.headers.get('content-disposition');
      let filename = material.original_filename || material.title;
      if (disposition) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
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
      
      addToast(`Downloaded: ${filename}`, 'success');
    } catch (error) {
      console.error('Download error:', error);
      addToast(error.message || 'Download failed. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const getFileIcon = (fileType, originalFilename) => {
    // Get extension from original filename as fallback
    const extension = originalFilename?.split('.').pop()?.toLowerCase();
    
    // Check MIME type first, then extension
    const type = (fileType || '').toLowerCase();
    
    if (type.includes('pdf') || extension === 'pdf') return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('video') || type.includes('mp4') || ['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return <Video className="w-6 h-6 text-purple-500" />;
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return <ImageIcon className="w-6 h-6 text-green-500" />;
    if (type.includes('audio') || ['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(extension)) return <Music className="w-6 h-6 text-yellow-500" />;
    if (type.includes('zip') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <Archive className="w-6 h-6 text-orange-500" />;
    if (['doc', 'docx'].includes(extension)) return <FileText className="w-6 h-6 text-blue-600" />;
    if (['xls', 'xlsx'].includes(extension)) return <FileText className="w-6 h-6 text-green-600" />;
    if (['ppt', 'pptx'].includes(extension)) return <FileText className="w-6 h-6 text-orange-600" />;
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

  if (selectedSubject !== 'all') {
    filteredMaterials = filteredMaterials.filter(m => m.subject_id === selectedSubject);
  }

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

  // Group by subject for sidebar
  const materialsBySubject = subjects.map(subject => ({
    ...subject,
    count: materials.filter(m => m.subject_id === subject.id).length
  })).filter(s => s.count > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no materials at all
  if (materials.length === 0 && enrolledSubjects.length === 0) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Get Started with Your Learning</h1>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You haven't enrolled in any subjects yet. Enroll in subjects to access learning materials.
          </p>
          <button
            onClick={() => navigate('/subjects')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <BookOpen className="w-5 h-5" />
            Browse Subjects
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">1. Choose Your Subjects</h3>
            <p className="text-sm text-slate-500">Browse and enroll in subjects relevant to your grade and interests.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">2. Access Materials</h3>
            <p className="text-sm text-slate-500">Once enrolled, you'll get instant access to all learning materials.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">3. Track Progress</h3>
            <p className="text-sm text-slate-500">Monitor your learning journey and stay on top of your studies.</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - enrolled but no materials yet
  if (materials.length === 0 && enrolledSubjects.length > 0) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Materials Coming Soon</h1>
          <p className="text-slate-500 mb-4 max-w-md mx-auto">
            You're enrolled in <strong>{enrolledSubjects.length} subject(s)</strong>, but your teachers haven't uploaded any materials yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/subjects')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <BookOpen className="w-5 h-5" />
              View My Subjects
            </button>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Enrolled Subjects Preview */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Enrolled Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledSubjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{subject.name}</h3>
                    <p className="text-sm text-slate-500">{subject.grade_name}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      Materials pending
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FolderOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">All Materials</h1>
        </div>
        <p className="text-slate-500">
          Access all your learning materials in one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setActiveTab('all')}
          className={`text-left p-5 rounded-xl border-2 transition-all ${
            activeTab === 'all' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-transparent bg-white hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FolderOpen className={`w-6 h-6 ${activeTab === 'all' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
          </div>
          <p className="text-sm text-slate-500">Total Materials</p>
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`text-left p-5 rounded-xl border-2 transition-all ${
            activeTab === 'recent' 
              ? 'border-green-500 bg-green-50' 
              : 'border-transparent bg-white hover:border-green-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className={`w-6 h-6 ${activeTab === 'recent' ? 'text-green-600' : 'text-slate-400'}`} />
            <span className="text-2xl font-bold text-slate-900">{stats.recent}</span>
          </div>
          <p className="text-sm text-slate-500">New This Week</p>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`text-left p-5 rounded-xl border-2 transition-all ${
            activeTab === 'favorites' 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-transparent bg-white hover:border-pink-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Heart className={`w-6 h-6 ${activeTab === 'favorites' ? 'text-pink-600' : 'text-slate-400'}`} />
            <span className="text-2xl font-bold text-slate-900">{stats.favorites}</span>
          </div>
          <p className="text-sm text-slate-500">Favorites</p>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`text-left p-5 rounded-xl border-2 transition-all ${
            activeTab === 'downloads' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-transparent bg-white hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Download className={`w-6 h-6 ${activeTab === 'downloads' ? 'text-purple-600' : 'text-slate-400'}`} />
            <span className="text-2xl font-bold text-slate-900">{stats.downloaded}</span>
          </div>
          <p className="text-sm text-slate-500">Downloaded</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subjects Filter */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-400" />
              Subjects
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedSubject === 'all' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-slate-50'
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
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-slate-50'
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
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Recent Downloads
              </h3>
              <div className="space-y-2">
                {downloadHistory.slice(0, 5).map((download, idx) => (
                  <div key={idx} className="text-sm p-2 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-700 truncate">{download.title}</p>
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
            <h2 className="text-lg font-semibold text-slate-900">
              {activeTab === 'all' && 'All Materials'}
              {activeTab === 'recent' && 'Recently Added'}
              {activeTab === 'favorites' && 'My Favorites'}
              {activeTab === 'downloads' && 'Downloaded'}
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({filteredMaterials.length})
              </span>
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
            <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No materials found
              </h3>
              <p className="text-slate-500">
                {searchQuery ? 'Try adjusting your search' : 'No materials match your filters'}
              </p>
              {(searchQuery || selectedSubject !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('all');
                    setActiveTab('all');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Preview */}
                  <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                    {getFileIcon(material.file_type, material.original_filename)}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => setPreviewMaterial(material)}
                        className="p-3 bg-white rounded-full hover:bg-slate-100 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(material)}
                        disabled={downloadingId === material.id}
                        className="p-3 bg-white rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                        title="Download"
                      >
                        {downloadingId === material.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Favorite */}
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
                    <h3 className="font-semibold text-slate-900 truncate mb-1">
                      {material.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      {material.subject_name}
                    </p>
                    
                    {material.description && (
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                        {material.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                      <span>{formatDate(material.created_at)}</span>
                      <span className="px-2 py-1 bg-slate-100 rounded-full">
                        {material.original_filename?.split('.').pop()?.toUpperCase() || 
                         material.file_type?.split('/')[1]?.toUpperCase() || 
                         'FILE'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg">
                        {getFileIcon(material.file_type, material.original_filename)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {material.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span>{material.subject_name}</span>
                          <span>•</span>
                          <span>{formatDate(material.created_at)}</span>
                          {favorites.includes(material.id) && (
                            <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(material.id)}
                          className="p-2 text-slate-400 hover:text-pink-500 rounded-lg"
                        >
                          <Heart className={`w-5 h-5 ${favorites.includes(material.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => setPreviewMaterial(material)}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(material)}
                          disabled={downloadingId === material.id}
                          className="p-2 text-slate-400 hover:text-green-600 rounded-lg disabled:opacity-50"
                        >
                          {downloadingId === material.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
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
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{previewMaterial.title}</h3>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {getFileIcon(previewMaterial.file_type, previewMaterial.original_filename)}
                <div>
                  <p className="font-medium text-slate-900">{previewMaterial.subject_name}</p>
                  <p className="text-sm text-slate-500">Uploaded {formatDate(previewMaterial.created_at)}</p>
                </div>
              </div>
              {previewMaterial.description && (
                <p className="text-slate-600 mb-4">{previewMaterial.description}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(previewMaterial)}
                  disabled={downloadingId === previewMaterial.id}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {downloadingId === previewMaterial.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloadingId === previewMaterial.id ? 'Downloading...' : 'Download'}
                </button>
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
