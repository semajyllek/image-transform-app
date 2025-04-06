import React from 'react';

/**
 * TransformationControls component that renders the appropriate controls
 * based on the selected transformation type
 * 
 * @param {Object} props - Component props
 * @param {Object} props.currentTransform - Current transformation settings
 * @param {Function} props.updateParam - Function to update transformation parameters
 */
const TransformationControls = ({ currentTransform, updateParam }) => {
  const { type, params } = currentTransform;
  
  // Renders a slider control with label
  const renderSlider = (label, param, min, max, description = null) => (
    <div className="mb-4">
      <label className="block text-gray-700 font-bold mb-2">
        {label}: {params[param]}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={params[param]}
        onChange={(e) => updateParam(param, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );

  // Component for selecting color scheme in segmentation
  const ColorSchemeSelector = () => (
    <div className="mb-4">
      <label className="block text-gray-700 font-bold mb-2">
        Color Scheme
      </label>
      <select
        value={params.colorScheme}
        onChange={(e) => updateParam('colorScheme', e.target.value)}
        className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      >
        <option value="rainbow">Rainbow</option>
        <option value="pastel">Pastel</option>
        <option value="grayscale">Grayscale</option>
        <option value="highContrast">High Contrast</option>
        <option value="preserveBrightness">Preserve Brightness</option>
      </select>
    </div>
  );

  // Render different controls based on transformation type
  switch (type) {
    case 'contrast':
      return renderSlider('Contrast', 'contrastValue', 0, 200);
      
    case 'brightness':
      return renderSlider('Brightness', 'brightnessValue', 0, 200, 'Value in %');
      
    case 'sharpening':
      return renderSlider('Sharpness', 'sharpnessValue', 0, 10);
      
    case 'threshold':
      return renderSlider('Threshold', 'thresholdValue', 0, 255);
      
    case 'canny':
      return (
        <>
          {renderSlider('Low Threshold', 'cannyLow', 0, 255)}
          {renderSlider('High Threshold', 'cannyHigh', 0, 255)}
        </>
      );
      
    case 'segmentation':
      return (
        <>
          {renderSlider(
            'Color Tolerance', 
            'segmentTolerance', 
            1, 
            50, 
            'Lower values create more segments, higher values merge similar colors'
          )}
          {renderSlider(
            'Minimum Segment Size', 
            'segmentMinSize', 
            10, 
            500, 
            'Smaller segments get merged with neighbors'
          )}
          <ColorSchemeSelector />
        </>
      );
      
    default:
      return null;
  }
};

export default TransformationControls;