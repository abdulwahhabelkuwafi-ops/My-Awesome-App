
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imagePreviewUrl: string | null;
  isProcessing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imagePreviewUrl, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const uploaderContent = imagePreviewUrl ? (
    <img src={imagePreviewUrl} alt="CT Scan Preview" className="max-h-full max-w-full object-contain rounded-lg" />
  ) : (
    <div className="flex flex-col items-center justify-center text-center">
      <UploadIcon className="w-16 h-16 text-accent mb-4" />
      <p className="font-semibold text-highlight">Drag & drop your CT scan here</p>
      <p className="text-sm text-gray-400 mt-1">or click to browse</p>
    </div>
  );

  return (
    <div className="flex-grow flex items-center justify-center">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragEvents}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`w-full h-80 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
        ${isDragging ? 'border-brand bg-primary' : 'border-accent hover:border-highlight'}
        ${imagePreviewUrl ? 'p-2' : 'p-4'}
        ${isProcessing ? 'cursor-not-allowed' : ''}`}
      >
        {uploaderContent}
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          disabled={isProcessing}
        />
      </label>
    </div>
  );
};
