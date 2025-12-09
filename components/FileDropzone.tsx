import React, { useCallback, useState } from 'react';
import { Upload, FileVideo, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
}

const MAX_SIZE_MB = 15;

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileAccepted, isLoading }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndAccept = (file: File) => {
    setError(null);
    
    if (!file.type.startsWith('video/')) {
      setError("Please upload a valid video file.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds limit of ${MAX_SIZE_MB}MB.`);
      return;
    }

    onFileAccepted(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAccept(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAccept(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-700 rounded-full">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Upload Video</h3>
            <p className="text-gray-400 mt-2">Drag & drop or click to browse</p>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
             <FileVideo className="w-4 h-4" />
             Max size: {MAX_SIZE_MB}MB (Demo Limit)
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
