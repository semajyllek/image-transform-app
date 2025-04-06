import React, { useState, useRef, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import ImagePreview from './components/ImagePreview';

// Import transformation functions
import { 
  applyContrast, 
  applyBrightness, 
  applySharpen, 
  applyGrayscale, 
  applyThreshold 
} from './transformations/basicTransforms';
import { 
  applySobelEdgeDetection, 
  applyCannyEdgeDetection 
} from './transformations/edgeDetection';
import { 
  applySegmentation 
} from './transformations/segmentation';

/**
 * Main component for the Image Transformation App
 * Coordinates transformation operations and manages state
 */
const ImageTransformApp = () => {
  // Image state
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  
  // Transformation state
  const [activeTransformations, setActiveTransformations] = useState([]);
  const [currentTransform, setCurrentTransform] = useState({
    type: 'contrast',
    params: {
      contrastValue: 100,
      brightnessValue: 100,
      sharpnessValue: 0,
      thresholdValue: 128,
      cannyLow: 50,
      cannyHigh: 150,
      segmentTolerance: 20,
      segmentMinSize: 100,
      colorScheme: 'rainbow'
    }
  });
  
  // Canvas references for image processing
  const canvasRef = useRef(null);
  const processedCanvasRef = useRef(null);
  
  /**
   * Handles image file uploads
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          // Clear any active transformations when uploading a new image
          setActiveTransformations([]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Updates parameters for the current transformation
   */
  const updateCurrentTransformParam = (paramName, value) => {
    setCurrentTransform(prev => ({
      ...prev,
      params: {
        ...prev.params,
        [paramName]: value
      }
    }));
  };

  /**
   * Effect to reapply all transformations when active transformations change
   * or when a new image is loaded
   */
  useEffect(() => {
    if (originalImage && canvasRef.current && processedCanvasRef.current) {
      applyAllTransformations();
    }
  }, [originalImage, activeTransformations]);

  /**
   * Adds the current transform configuration to the active stack
   */
  const addCurrentTransform = () => {
    setActiveTransformations(prev => [...prev, { ...currentTransform }]);
  };

  /**
   * Removes a transformation from the stack by index
   */
  const removeTransform = (index) => {
    setActiveTransformations(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Applies all active transformations in sequence
   */
  const applyAllTransformations = () => {
    // Draw original image on canvas first
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    
    // Start with the original image data
    let currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Apply each transformation in sequence
    for (const transform of activeTransformations) {
      currentImageData = applyTransformation(currentImageData, transform);
    }
    
    // Display the final result
    const processedCanvas = processedCanvasRef.current;
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const processedCtx = processedCanvas.getContext('2d');
    processedCtx.putImageData(currentImageData, 0, 0);
    setProcessedImage(processedCanvas.toDataURL('image/png'));
  };

  /**
   * Applies a single transformation based on its type and parameters
   */
  const applyTransformation = (imageData, transform) => {
    const { type, params } = transform;
    
    switch (type) {
      case 'contrast':
        return applyContrast(imageData, params.contrastValue);
      case 'brightness':
        return applyBrightness(imageData, params.brightnessValue);
      case 'sharpening':
        return applySharpen(imageData, params.sharpnessValue);
      case 'threshold':
        return applyThreshold(imageData, params.thresholdValue);
      case 'grayscale':
        return applyGrayscale(imageData);
      case 'edges':
        return applySobelEdgeDetection(imageData);
      case 'canny':
        return applyCannyEdgeDetection(imageData, params.cannyLow, params.cannyHigh);
      case 'segmentation':
        return applySegmentation(
          imageData,
          params.segmentTolerance,
          params.segmentMinSize,
          params.colorScheme
        );
      default:
        return imageData; // Return original if transform type not recognized
    }
  };

  /**
   * Saves the processed image as a file
   */
  const handleSaveImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * Clears all transformations
   */
  const resetImage = () => {
    if (originalImage) {
      setActiveTransformations([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Image Transformation App</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left panel - controls */}
        <ControlPanel 
          currentTransform={currentTransform}
          setCurrentTransform={setCurrentTransform}
          updateCurrentTransformParam={updateCurrentTransformParam}
          handleImageUpload={handleImageUpload}
          addCurrentTransform={addCurrentTransform}
          removeTransform={removeTransform}
          resetImage={resetImage}
          activeTransformations={activeTransformations}
          hasImage={!!originalImage}
        />
        
        {/* Right panel - images */}
        <ImagePreview 
          originalImage={originalImage}
          processedImage={processedImage}
          handleSaveImage={handleSaveImage}
          canvasRef={canvasRef}
          processedCanvasRef={processedCanvasRef}
        />
      </div>
    </div>
  );
};

export default ImageTransformApp;