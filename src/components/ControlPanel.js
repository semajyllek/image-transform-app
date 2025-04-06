import React from 'react';
import TransformationControls from './TransformationControls';

/**
 * ControlPanel component that provides the user interface for
 * uploading images and configuring transformations
 * 
 * @param {Object} props - Component props
 * @param {Object} props.currentTransform - Current transformation settings
 * @param {Function} props.setCurrentTransform - Function to update the current transformation
 * @param {Function} props.updateCurrentTransformParam - Function to update transformation parameters
 * @param {Function} props.handleImageUpload - Function to handle image uploads
 * @param {Function} props.addCurrentTransform - Function to add current transform to active stack
 * @param {Function} props.removeTransform - Function to remove a transform from the stack
 * @param {Function} props.resetImage - Function to clear all transformations
 * @param {Array} props.activeTransformations - List of active transformations
 * @param {boolean} props.hasImage - Whether an image is currently loaded
 */
const ControlPanel = ({
  currentTransform,
  setCurrentTransform,
  updateCurrentTransformParam,
  handleImageUpload,
  addCurrentTransform,
  removeTransform,
  resetImage,
  activeTransformations,
  hasImage
}) => {
  // List of available transformations
  const transformOptions = [
    { value: 'contrast', label: 'Contrast' },
    { value: 'brightness', label: 'Brightness' },
    { value: 'sharpening', label: 'Sharpening' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'threshold', label: 'Threshold' },
    { value: 'edges', label: 'Edge Detection (Sobel)' },
    { value: 'canny', label: 'Edge Detection (Canny)' },
    { value: 'segmentation', label: 'Color by Segment' }
  ];

  return (
    <div className="w-full md:w-1/3 bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Image Upload Section */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Upload an image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      
      {/* Transformation Selection Section */}
      <div className="my-6 border-t border-gray-200 pt-4">
        <h2 className="text-xl font-bold mb-4">Add Transformation</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Select transformation
          </label>
          <select
            value={currentTransform.type}
            onChange={(e) => setCurrentTransform({
              ...currentTransform,
              type: e.target.value
            })}
            className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {transformOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Transformation-specific controls */}
        <TransformationControls 
          currentTransform={currentTransform}
          updateParam={updateCurrentTransformParam}
        />
        
        {/* Add Transformation Button */}
        <button
          onClick={addCurrentTransform}
          disabled={!hasImage}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
        >
          Add Transformation
        </button>
      </div>
      
      {/* Active Transformations Section */}
      {activeTransformations.length > 0 && (
        <div className="my-6 border-t border-gray-200 pt-4">
          <h2 className="text-xl font-bold mb-4">Active Transformations</h2>
          <ul className="space-y-2">
            {activeTransformations.map((transform, index) => {
              // Find the label for this transformation type
              const transformOption = transformOptions.find(
                option => option.value === transform.type
              );
              const label = transformOption ? transformOption.label : transform.type;
              
              return (
                <li key={index} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                  <span className="font-medium">{index + 1}. {label}</span>
                  <button
                    onClick={() => removeTransform(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            onClick={resetImage}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md w-full"
          >
            Reset All Transformations
          </button>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;