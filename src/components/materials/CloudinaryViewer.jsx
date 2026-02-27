// Cloudinary-optimized media viewer for E-tab
import React, { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage, AdvancedVideo } from '@cloudinary/react';
import { fill, scale, limitFit } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';

const CloudinaryViewer = ({ material, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Cloudinary instance
  const cld = new Cloudinary({
    cloud: {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }
  });

  const renderContent = () => {
    const { cloudinary_resource_type, file_url, file_type, title } = material;

    switch (cloudinary_resource_type) {
      case 'image':
        const img = cld.image(file_url);
        img.resize(limitFit().width(1200)).delivery(format(auto())).delivery(quality(autoQuality()));
        
        return (
          <div className="flex justify-center items-center bg-gray-100 rounded-lg p-4">
            <AdvancedImage 
              cldImg={img} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
              onLoad={() => setLoading(false)}
            />
          </div>
        );

      case 'video':
        const video = cld.video(file_url);
        video.resize(scale().width(1280));
        
        return (
          <div className="bg-black rounded-lg overflow-hidden">
            <AdvancedVideo
              cldVid={video}
              controls
              className="w-full max-h-[80vh]"
              onLoadedData={() => setLoading(false)}
            />
          </div>
        );

      case 'raw':
        // PDFs, Office docs, ZIPs - show preview or download button
        if (file_type === 'pdf') {
          // Use Cloudinary's PDF to image conversion for preview
          const pdfThumb = cld.image(file_url);
          pdfThumb.resize(limitFit().width(800)).format('jpg').page(1);
          
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <AdvancedImage 
                  cldImg={pdfThumb} 
                  className="w-full rounded-lg shadow"
                  alt="PDF Preview"
                />
                <p className="text-center text-sm text-gray-500 mt-2">Page 1 preview</p>
              </div>
              <div className="flex justify-center">
                <a 
                  href={file_url} 
                  download 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Download PDF
                </a>
              </div>
            </div>
          );
        }
        
        // Office docs and other files - show download only
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-500 mb-6">This file type requires download to view</p>
            <a 
              href={file_url} 
              download 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download {file_type?.toUpperCase()}
            </a>
          </div>
        );

      default:
        return <div>Unsupported file type</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{material.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CloudinaryViewer;