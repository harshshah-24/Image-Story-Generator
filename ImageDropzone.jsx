import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../App.css';

function ImageDropzone({ onImageUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true, // Allow multiple files
    maxFiles: 5, // Limit to 5 images
  });

  return (
    <div className="relative w-full max-w-md sm:max-w-lg md:max-w-4xl">
      <div
        {...getRootProps()}
        className={`p-6 bg-gray-900/80 border-2 border-dashed rounded-xl transition-all duration-500 backdrop-blur-sm space-bg ${
          isDragActive ? 'border-purple-400 shadow-purple-500/50' : 'border-indigo-500/50 shadow-md'
        } hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 group`}
      >
        <input {...getInputProps()} id="image-upload" />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <span className="text-4xl">{isDragActive ? '🌠' : '📖'}</span>
          <p className="text-indigo-200 text-sm sm:text-base font-serif">
            {isDragActive
              ? 'Drop your images to launch a cosmic tale!'
              : 'Drag images here or click to explore the galaxy (up to 5 images)'}
          </p>
          <button className="relative bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm sm:text-base py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 font-serif overflow-hidden">
            <span className="relative z-10">Browse Files</span>
            <span className="absolute inset-0 sparkle-effect"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageDropzone;