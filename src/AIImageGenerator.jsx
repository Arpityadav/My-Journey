import React, { useState, useEffect } from 'react';
// Import Bedrock client library components
import { invokeModel } from './utils/client-bedrock-runtime';

const AIImageGenerator = () => {
  const [inputValue, setInputValue] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    setError(null); // Clear previous error
    setIsLoading(true);

    try {
      const params = {
        modelId: process.env.MODEL_ID || 'amazon.titan-image-generator-v1', // Use environment variable fallback
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          textToImageParams: {
            text: inputValue,
          },
          taskType: "TEXT_IMAGE",
          imageGenerationConfig: {
            cfgScale: 8, // Adjust image quality and detail as needed
            seed: 0, // Set a seed for consistent results (optional)
            quality: 'standard', // Choose 'premium' for higher quality (may incur additional costs)
            width: 1024, // Adjust image dimensions
            height: 1024,
            numberOfImages: 1,
          },
        }),
      };

      const response = await invokeModel(params);
      // console.log(res);
      const responseBody = new TextDecoder().decode(response.body);
      const data = JSON.parse(responseBody);
      setGeneratedImage(data.images[0]); // Assuming there's only one image
    } catch (err) {
      console.error('Error generating AI image:', err);
      setError(err.message); // Set error message for display
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear generated image on every new prompt
    if (!inputValue) {
      setGeneratedImage(null);
    }
  }, [inputValue]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-8">Generate an AI Image</h1>
      <textarea
        className="w-96 h-48 border border-gray-300 rounded-md p-2 mb-4"
        placeholder="Enter text here..."
        value={inputValue}
        onChange={handleChange}
      ></textarea>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSubmit}
        disabled={isLoading} // Disable button while loading
      >
        {isLoading ? 'Generating image, this may take a while...' : 'Generate'}
      </button>
      {generatedImage && (
        <img src={`data:image/png;base64,${generatedImage}`} alt="Generated AI Image" className='my-8 h-64' />
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p className="text-sm mt-2">
        Using AWS Bedrock with Amazon-Titan-Image-Generator.
      </p>
    </div>
  );
};

export default AIImageGenerator;
