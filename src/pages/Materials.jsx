// E-tab Materials Page
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const Materials = () => {
  const { subjectId } = useParams();
  const { hasRole } = useAuth();
  const { addToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setMaterials([
        { id: 1, title: 'Lecture 1: Introduction', type: 'pdf', size: '2.4 MB', week: 1, uploadedAt: '2024-01-15', downloads: 45, status: 'published' },
        { id: 2, title: 'Week 1 Lab Exercise', type: 'docx', size: '156 KB', week: 1, uploadedAt: '2024-01-16', downloads: 32, status: 'published' },
        { id: 3, title: 'Lecture 2: Data Structures', type: 'pdf', size: '3.1 MB', week: 2, uploadedAt: '2024-01-22', downloads: 28, status: 'published' },
        { id: 4, title: 'Assignment 1 Brief', type: 'pdf', size: '450 KB', week: 2, uploadedAt: '2024-01-23', downloads: 56, status: 'draft' },
        { id: 5, title: 'Week 2 Tutorial Recording', type: 'mp4', size: '156 MB', week: 2, uploadedAt: '2024-01-24', downloads: 18, status: 'published' },
      ]);
      setLoading(false);
    }, 800);
  }, [subjectId]);

  const columns = [
    { 
      key: 'title', 
      title: 'Material',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
            {row.type === 'pdf' ? '📄' : row.type === 'mp4' ? '🎬' : '📝'}
          </div>
          <div>
            <p className="font-medium text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{row.size}</p>
          </div>
        </div>
      )
    },
    { key: 'week', title: 'Week', render: (v) => `Week ${v}` },
    { 
      key: 'status', 
      title: 'Status',
      render: (v) => (
        <Badge variant={v === 'published' ? 'success' : 'warning'}>
          {v}
        </Badge>
      )
    },
    { key: 'downloads', title: 'Downloads' },
    { 
      key: 'uploadedAt', 
      title: 'Uploaded',
      render: (v) => new Date(v).toLocaleDateString()
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleDownload(row)}>
            Download
          </Button>
          {hasRole(['teacher', 'admin']) && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedMaterial(row)}>
              Edit
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleDownload = (material) => {
    addToast(`Downloading ${material.title}...`, 'info');
    // Actual download logic here
  };

  const handleUpload = (e) => {
    e.preventDefault();
    addToast('Material uploaded successfully!', 'success');
    setIsUploadModalOpen(false);
  };

  const weeks = [...new Set(materials.map(m => m.week))].sort();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Course Materials</h1>
          <p className="text-slate-500 mt-1">Access and manage learning resources</p>
        </div>
        {hasRole(['teacher', 'admin']) && (
          <Button onClick={() => setIsUploadModalOpen(true)} leftIcon="+">
            Upload Material
          </Button>
        )}
      </div>

      {/* Week Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium whitespace-nowrap">
          All Weeks
        </button>
        {weeks.map(week => (
          <button 
            key={week}
            className="px-4 py-2 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:bg-slate-50 whitespace-nowrap"
          >
            Week {week}
          </button>
        ))}
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={materials}
            onRowClick={(row) => setSelectedMaterial(row)}
          />
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload New Material"
        description="Add a new learning resource to this subject"
        size="lg"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Week</label>
              <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
                {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
                <option value="new">New Week</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-slate-600 font-medium">Drop files here or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">Supports PDF, DOC, MP4, up to 100MB</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Upload Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};