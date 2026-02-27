// Material card with Cloudinary-optimized thumbnails
import React from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { fill, limitFit } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';

const MaterialCard = ({ material, onClick, onDownload }) => {
  const cld = new Cloudinary({
    cloud: { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME }
  });

  const getThumbnail = () => {
    const { cloudinary_resource_type, file_url, file_type } = material;

    // Generate optimized thumbnail based on type
    if (cloudinary_resource_type === 'image') {
      const img = cld.image(file_url);
      img.resize(fill().width(400).height(250)).delivery(format(auto()));
      return <AdvancedImage cldImg={img} className="w-full h-full object-cover" />;
    }

    if (cloudinary_resource_type === 'video') {
      // Video thumbnail using first frame
      const videoThumb = cld.image(file_url);
      videoThumb.resize(fill().width(400).height(250)).format('jpg');
      return (
        <div className="relative">
          <AdvancedImage cldImg={videoThumb} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    if (file_type === 'pdf') {
      // PDF thumbnail using first page
      const pdfThumb = cld.image(file_url);
      pdfThumb.resize(fill().width(400).height(250)).format('jpg').page(1);
      return (
        <div className="relative">
          <AdvancedImage cldImg={pdfThumb} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            PDF
          </div>
        </div>
      );
    }

    // Default file icon
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📄</div>
          <span className="text-xs text-gray-500 uppercase">{file_type}</span>
        </div>
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="h-40 bg-gray-200 overflow-hidden">
        {getThumbnail()}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
              {material.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Week {material.week_number || 'N/A'} • {material.file_type?.toUpperCase()}
            </p>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Download"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{material.download_count} downloads</span>
          <span>{material.view_count} views</span>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;