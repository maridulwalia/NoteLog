import React, { useState } from 'react';
import { Image, X } from 'lucide-react';

interface BackgroundImage {
  url: string;
  title: string;
}

interface BackgroundGalleryProps {
  onSelectBackground: (image: BackgroundImage) => void;
  onClose: () => void;
}

const BackgroundGallery: React.FC<BackgroundGalleryProps> = ({ onSelectBackground, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<BackgroundImage | null>(null);

  const backgroundImages: BackgroundImage[] = [
    {
      url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Abstract Art'
    },
    {
      url: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Starry Night'
    },
    {
      url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Snowy Mountains'
    },
    {
      url: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Aurora Borealis'
    },
    {
      url: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Autumn Leaves'
    },
    {
      url: 'https://images.pexels.com/photos/1172253/pexels-photo-1172253.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Lake View'
    },
    {
      url: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Beautiful Flowers'
    },
    {
      url: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Rope Bridge'
    },
    {
      url: 'https://images.pexels.com/photos/1415810/pexels-photo-1415810.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Swimmer'
    },
    {
      url: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Stone Field'
    },
    {
      url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Hilltop Stars'
    },
    {
      url: 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Mount Fuji'
    }
  ];

  const handleImageSelect = (image: BackgroundImage) => {
    setSelectedImage(image);
  };

  const handleConfirmSelection = () => {
    if (selectedImage) {
      onSelectBackground(selectedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Image size={24} />
            Choose Background
          </h2>
          <button
          title='Close'
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                onClick={() => handleImageSelect(image)}
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                  selectedImage?.url === image.url
                    ? 'ring-4 ring-blue-500 scale-105 shadow-xl'
                    : 'hover:shadow-lg border border-white/20'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-36 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3 text-sm font-medium">
                  {image.title}
                </div>
                {selectedImage?.url === image.url && (
                  <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-blue-500 text-white rounded-full p-3 shadow-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedImage}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              Create Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundGallery;