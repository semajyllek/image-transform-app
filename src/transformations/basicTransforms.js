/**
 * This file contains basic image transformations like
 * contrast, brightness, sharpening, grayscale, and threshold.
 */

/**
 * Adjusts the contrast of an image
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} contrast - Contrast value (0-200), where 100 is unchanged
 * @returns {ImageData} The processed image data
 */
export const applyContrast = (imageData, contrast) => {
	const data = new Uint8ClampedArray(imageData.data);
	const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
	
	for (let i = 0; i < data.length; i += 4) {
	  // Apply contrast adjustment to RGB channels
	  data[i] = clamp(factor * (data[i] - 128) + 128);
	  data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
	  data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
	  // Alpha channel remains unchanged
	}
	
	return new ImageData(data, imageData.width, imageData.height);
  };
  
  /**
   * Adjusts the brightness of an image
   * 
   * @param {ImageData} imageData - The image data to process
   * @param {number} brightness - Brightness value (0-200), where 100 is unchanged
   * @returns {ImageData} The processed image data
   */
  export const applyBrightness = (imageData, brightness) => {
	const data = new Uint8ClampedArray(imageData.data);
	const factor = brightness / 100;
	
	for (let i = 0; i < data.length; i += 4) {
	  // Apply brightness adjustment to RGB channels
	  data[i] = clamp(data[i] * factor);
	  data[i + 1] = clamp(data[i + 1] * factor);
	  data[i + 2] = clamp(data[i + 2] * factor);
	  // Alpha channel remains unchanged
	}
	
	return new ImageData(data, imageData.width, imageData.height);
  };
  
  /**
   * Applies sharpening filter to an image
   * 
   * @param {ImageData} imageData - The image data to process
   * @param {number} amount - Sharpening intensity (0-10)
   * @returns {ImageData} The processed image data
   */
  export const applySharpen = (imageData, amount) => {
	// If amount is 0, return the original image data
	if (amount === 0) return imageData;
	
	const data = new Uint8ClampedArray(imageData.data);
	const width = imageData.width;
	const height = imageData.height;
	const factor = amount / 10;
	
	// Create a new array for the result
	const resultData = new Uint8ClampedArray(data);
	
	// Sharpen kernel
	const kernel = [
	  0, -factor, 0,
	  -factor, 1 + 4 * factor, -factor,
	  0, -factor, 0
	];
	
	// Apply convolution
	for (let y = 1; y < height - 1; y++) {
	  for (let x = 1; x < width - 1; x++) {
		const pixelIndex = (y * width + x) * 4;
		
		// Process each color channel
		for (let c = 0; c < 3; c++) {
		  let sum = 0;
		  
		  // Apply the kernel
		  for (let ky = -1; ky <= 1; ky++) {
			for (let kx = -1; kx <= 1; kx++) {
			  const kernelIndex = (ky + 1) * 3 + (kx + 1);
			  const dataIndex = ((y + ky) * width + (x + kx)) * 4 + c;
			  sum += data[dataIndex] * kernel[kernelIndex];
			}
		  }
		  
		  resultData[pixelIndex + c] = clamp(sum);
		}
	  }
	}
	
	return new ImageData(resultData, width, height);
  };
  
  /**
   * Converts an image to grayscale
   * 
   * @param {ImageData} imageData - The image data to process
   * @returns {ImageData} The processed grayscale image data
   */
  export const applyGrayscale = (imageData) => {
	const data = new Uint8ClampedArray(imageData.data);
	
	for (let i = 0; i < data.length; i += 4) {
	  // Calculate luminance using perceptual factors
	  const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
	  
	  // Set all RGB channels to the same grayscale value
	  data[i] = avg;
	  data[i + 1] = avg;
	  data[i + 2] = avg;
	  // Alpha channel remains unchanged
	}
	
	return new ImageData(data, imageData.width, imageData.height);
  };
  
  /**
   * Applies threshold filter to an image
   * Converts to binary black and white based on threshold
   * 
   * @param {ImageData} imageData - The image data to process
   * @param {number} threshold - Threshold value (0-255)
   * @returns {ImageData} The processed image data
   */
  export const applyThreshold = (imageData, threshold) => {
	// First convert to grayscale
	const grayscaleData = applyGrayscale(imageData);
	const data = grayscaleData.data;
	
	for (let i = 0; i < data.length; i += 4) {
	  // Apply threshold: set to black or white
	  const value = data[i] < threshold ? 0 : 255;
	  data[i] = value;
	  data[i + 1] = value;
	  data[i + 2] = value;
	  // Alpha channel remains unchanged
	}
	
	return new ImageData(data, imageData.width, imageData.height);
  };
  
  /**
   * Inverts the colors of an image
   * 
   * @param {ImageData} imageData - The image data to process
   * @returns {ImageData} The processed image data with inverted colors
   */
  export const applyInvert = (imageData) => {
	const data = new Uint8ClampedArray(imageData.data);
	
	for (let i = 0; i < data.length; i += 4) {
	  // Invert RGB channels
	  data[i] = 255 - data[i];
	  data[i + 1] = 255 - data[i + 1];
	  data[i + 2] = 255 - data[i + 2];
	  // Alpha channel remains unchanged
	}
	
	return new ImageData(data, imageData.width, imageData.height);
  };
  
  /**
   * Utility function to clamp a value between 0 and 255
   * Used to ensure valid color values
   * 
   * @param {number} value - The value to clamp
   * @returns {number} The clamped value (0-255)
   */
  const clamp = (value) => {
	return Math.min(255, Math.max(0, value));
  };