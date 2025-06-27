import { useState } from 'react';
import ImageDropzone from './components/ImageDropzone';
import axios from 'axios';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [story, setStory] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/generate-story', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImages(response.data.imageUrls);
      setStory(response.data.story);
      setStoryTitle(response.data.title || 'A Cosmic Adventure');
    } catch (error) {
      console.error('Error generating story:', error);
      setStory(error.response?.data?.error || 'Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyStoryToClipboard = () => {
    navigator.clipboard.writeText(story);
    alert('Story copied to clipboard!');
  };

  return (
    <div className="min-h-screen h-full bg-gray-900 text-gray-100 flex flex-col justify-center items-center night-sky relative z-10">
      {/* Centered Content */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-900 via-purple-200 to-purple-900 bg-[length:500%_auto] animated-gradient text-transparent bg-clip-text mb-6 drop-shadow-lg font-serif text-center whitespace-nowrap">
          Image Story Generator
        </h1>

        <div className="w-full px-4">
          <ImageDropzone onImageUpload={handleImageUpload} />
        </div>

        {loading && (
          <div className="mt-6 text-indigo-200 font-serif text-center">
            Generating story...
          </div>
        )}

        {images.length > 0 && !loading && (
          <div className="mt-6 w-full px-4">
            <div className="image-grid grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
              {images.map((imageUrl, index) => (
                <div key={index} className="aspect-w-1 aspect-h-1 w-full">
                  <img
                    src={`http://localhost:5000${imageUrl}`}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-lg border border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/30 hover:border-purple-500/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {story && !loading && (
          <div className="mt-6 w-full px-4">
            <div
              className="w-full bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-purple-500/20 transition-all duration-300 hover:shadow-purple-500/30 hover:border-purple-500/50 cursor-pointer select-text"
              onClick={copyStoryToClipboard}
              title="Click to copy the story"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-purple-400 mb-3 font-serif text-center">
                {storyTitle}
              </h2>
              <p className="text-gray-300 leading-relaxed text-center">{story}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;