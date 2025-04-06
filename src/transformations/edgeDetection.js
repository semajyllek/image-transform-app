import { applyGrayscale } from './basicTransforms';

/**
 * Applies Sobel edge detection algorithm to an image
 * Uses horizontal and vertical gradient kernels to detect edges
 * 
 * @param {ImageData} imageData - The image data to process
 * @returns {ImageData} The processed image data with edges highlighted
 */
export const applySobelEdgeDetection = (imageData) => {
  // First convert to grayscale
  const grayscaleData = applyGrayscale(imageData);
  const data = grayscaleData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Create a new array for the result
  const resultData = new Uint8ClampedArray(data.length);
  
  // Sobel kernels
  const kernelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];
  
  const kernelY = [
    -1, -2, -1,
     0,  0,  0,
     1,  2,  1
  ];
  
  // Apply convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      let sumX = 0;
      let sumY = 0;
      
      // Apply kernel to neighboring pixels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          const dataIndex = ((y + ky) * width + (x + kx)) * 4;
          
          sumX += data[dataIndex] * kernelX[kernelIndex];
          sumY += data[dataIndex] * kernelY[kernelIndex];
        }
      }
      
      // Calculate gradient magnitude
      const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
      
      // Set the result pixel
      resultData[pixelIndex] = magnitude;
      resultData[pixelIndex + 1] = magnitude;
      resultData[pixelIndex + 2] = magnitude;
      resultData[pixelIndex + 3] = 255; // Full opacity
    }
  }
  
  // Handle border pixels (leave them as black)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Skip non-border pixels
      if (x !== 0 && x !== width - 1 && y !== 0 && y !== height - 1) {
        continue;
      }
      
      const pixelIndex = (y * width + x) * 4;
      resultData[pixelIndex] = 0;
      resultData[pixelIndex + 1] = 0;
      resultData[pixelIndex + 2] = 0;
      resultData[pixelIndex + 3] = 255;
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Applies Canny edge detection algorithm to an image
 * More advanced edge detection with multi-stage processing
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} lowThreshold - Lower threshold for edge detection
 * @param {number} highThreshold - Higher threshold for edge detection
 * @returns {ImageData} The processed image data with edges highlighted
 */
export const applyCannyEdgeDetection = (imageData, lowThreshold, highThreshold) => {
  // Step 1: Apply Gaussian blur (simplified - using a negative sharpening as blur)
  const blurredData = applyGaussianBlur(imageData);
  
  // Step 2: Apply Sobel operators
  const sobelData = applySobelEdgeDetection(blurredData);
  
  // Step 3: Non-maximum suppression and edge tracking
  const width = imageData.width;
  const height = imageData.height;
  const data = sobelData.data;
  const resultData = new Uint8ClampedArray(data.length);
  
  // Apply double threshold
  for (let i = 0; i < data.length; i += 4) {
    const magnitude = data[i];
    
    if (magnitude > highThreshold) {
      // Strong edge
      resultData[i] = 255;
      resultData[i + 1] = 255;
      resultData[i + 2] = 255;
    } else if (magnitude > lowThreshold) {
      // Weak edge
      resultData[i] = 128;
      resultData[i + 1] = 128;
      resultData[i + 2] = 128;
    } else {
      // Not an edge
      resultData[i] = 0;
      resultData[i + 1] = 0;
      resultData[i + 2] = 0;
    }
    
    resultData[i + 3] = 255; // Full opacity
  }
  
  // Apply hysteresis (connecting weak edges to strong ones)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      // Only process weak edges
      if (resultData[pixelIndex] === 128) {
        let hasStrongNeighbor = false;
        
        // Check 8-connected neighborhood
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (ky === 0 && kx === 0) continue; // Skip center pixel
            
            const neighborIndex = ((y + ky) * width + (x + kx)) * 4;
            if (resultData[neighborIndex] === 255) {
              hasStrongNeighbor = true;
              break;
            }
          }
          if (hasStrongNeighbor) break;
        }
        
        // If connected to a strong edge, make this a strong edge
        // Otherwise, remove this weak edge
        if (hasStrongNeighbor) {
          resultData[pixelIndex] = 255;
          resultData[pixelIndex + 1] = 255;
          resultData[pixelIndex + 2] = 255;
        } else {
          resultData[pixelIndex] = 0;
          resultData[pixelIndex + 1] = 0;
          resultData[pixelIndex + 2] = 0;
        }
      }
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Applies a simple Gaussian blur to an image
 * Used as a preprocessing step for Canny edge detection
 * 
 * @param {ImageData} imageData - The image data to process
 * @returns {ImageData} The blurred image data
 */
const applyGaussianBlur = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const resultData = new Uint8ClampedArray(data);
  
  // Gaussian kernel (5x5)
  const kernel = [
    2, 4, 5, 4, 2,
    4, 9, 12, 9, 4,
    5, 12, 15, 12, 5,
    4, 9, 12, 9, 4,
    2, 4, 5, 4, 2
  ];
  
  // Normalize the kernel
  const kernelSum = kernel.reduce((sum, val) => sum + val, 0);
  const normalizedKernel = kernel.map(val => val / kernelSum);
  
  // Apply convolution with Gaussian kernel
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      
      // Apply kernel to neighborhood
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const kernelIndex = (ky + 2) * 5 + (kx + 2);
          const dataIndex = ((y + ky) * width + (x + kx)) * 4;
          
          sumR += data[dataIndex] * normalizedKernel[kernelIndex];
          sumG += data[dataIndex + 1] * normalizedKernel[kernelIndex];
          sumB += data[dataIndex + 2] * normalizedKernel[kernelIndex];
        }
      }
      
      // Set the blurred pixel
      resultData[pixelIndex] = Math.round(sumR);
      resultData[pixelIndex + 1] = Math.round(sumG);
      resultData[pixelIndex + 2] = Math.round(sumB);
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Calculates the gradient direction at each pixel
 * Used for non-maximum suppression in Canny edge detection
 * 
 * @param {number} gx - Gradient in x direction
 * @param {number} gy - Gradient in y direction
 * @returns {number} Direction quantized to one of 4 directions (0, 45, 90, 135 degrees)
 */
const getGradientDirection = (gx, gy) => {
  const angle = Math.atan2(gy, gx) * (180 / Math.PI);
  
  // Convert angle to positive
  const positiveAngle = (angle + 180) % 180;
  
  // Quantize to 4 directions (horizontal, vertical, +45, -45)
  if ((positiveAngle >= 0 && positiveAngle < 22.5) || (positiveAngle >= 157.5 && positiveAngle < 180)) {
    return 0; // horizontal
  } else if (positiveAngle >= 22.5 && positiveAngle < 67.5) {
    return 45; // +45 degrees
  } else if (positiveAngle >= 67.5 && positiveAngle < 112.5) {
    return 90; // vertical
  } else {
    return 135; // -45 degrees
  }
};