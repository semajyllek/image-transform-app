import React, { useRef, useEffect } from 'react';

/**
 * ImagePreview component for displaying original and processed images side by side
 * 
 * @param {Object} props - Component props
 * @param {Image} props.originalImage - The original image object
 * @param {string} props.processedImage - Data URL of the processed image
 * @param {Function} props.handleSaveImage - Function to save the processed image
 * @param {React.RefObject} props.canvasRef - Reference to the original canvas
 * @param {React.RefObject} props.processedCanvasRef - Reference to the processed canvas
 */
const ImagePreview = ({ 
  originalImage, 
  processedImage, 
  handleSaveImage, 
  canvasRef, 
  processedCanvasRef 
}) => {
  
  return (
    <div className="w-full">
      {/* Side-by-side image display */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Original Image Card */}
        <div className="bg-white rounded-lg shadow-lg p-4 flex-1">
          <h2 className="text-xl font-bold mb-4">Original Image</h2>
          <div className="w-full overflow-auto">
            {/* Hidden canvas used for image data processing */}
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto border border-gray-300" 
              style={{ display: 'none' }} 
            />
            
            {/* Display original image */}
            {originalImage ? (
              <img 
                src={originalImage.src} 
                alt="Original" 
                className="max-w-full h-auto mx-auto" 
              />
            ) : (
              <div className="flex items-center justify-center border border-gray-300 h-64">
                <p className="text-gray-500">No image uploaded yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Processed Image Card */}
        <div className="bg-white rounded-lg shadow-lg p-4 flex-1">
          <h2 className="text-xl font-bold mb-4">Processed Image</h2>
          <div className="w-full overflow-auto">
            {/* Hidden canvas used for processed image data */}
            <canvas 
              ref={processedCanvasRef} 
              className="max-w-full h-auto border border-gray-300" 
              style={{ display: 'none' }} 
            />
            
            {/* Display processed image */}
            {processedImage ? (
              <img 
                src={processedImage} 
                alt="Processed" 
                className="max-w-full h-auto mx-auto" 
              />
            ) : (
              <div className="flex items-center justify-center border border-gray-300 h-64">
                <p className="text-gray-500">No transformations applied yet</p>
              </div>
            )}
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSaveImage}
            disabled={!processedImage}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Processed Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;