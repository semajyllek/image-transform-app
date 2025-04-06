import { hsvToRgb } from '../utils/colorUtils';

/**
 * Performs color-based image segmentation
 * Identifies regions of similar color and applies distinct colors to each segment
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} tolerance - Color similarity tolerance (1-50)
 * @param {number} minSize - Minimum segment size in pixels
 * @param {string} colorScheme - Coloring method to use for segments
 * @returns {ImageData} The processed image data with colored segments
 */
export const applySegmentation = (imageData, tolerance, minSize, colorScheme) => {
  const width = imageData.width;
  const height = imageData.height;
  const data = new Uint8ClampedArray(imageData.data);
  const resultData = new Uint8ClampedArray(data);
  
  // Create a map to track which segment each pixel belongs to
  const segmentMap = new Array(width * height).fill(-1);
  
  // A map to track segment size
  const segmentSizes = {};
  
  // A map to track segment average color
  const segmentColors = {};
  
  // Stack for flood fill algorithm
  const stack = [];
  
  // Current segment ID
  let currentSegment = 0;
  
  // Flood fill function
  const floodFill = (x, y, baseR, baseG, baseB) => {
    stack.push([x, y]);
    segmentMap[y * width + x] = currentSegment;
    
    // Initialize segment color and size tracking
    segmentSizes[currentSegment] = 1;
    segmentColors[currentSegment] = {
      r: baseR,
      g: baseG,
      b: baseB,
      count: 1
    };
    
    while (stack.length > 0) {
      const pos = stack.pop();
      const cx = pos[0];
      const cy = pos[1];
      const pixelIndex = (cy * width + cx) * 4;
      
      // Check neighboring pixels (4-connected)
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];
      
      for (let i = 0; i < directions.length; i++) {
        const nx = cx + directions[i][0];
        const ny = cy + directions[i][1];
        
        // Skip if out of bounds
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          continue;
        }
        
        // Skip if already assigned to a segment
        const neighborIndex = ny * width + nx;
        if (segmentMap[neighborIndex] !== -1) {
          continue;
        }
        
        // Get neighbor color
        const nIndex = neighborIndex * 4;
        const nr = data[nIndex];
        const ng = data[nIndex + 1];
        const nb = data[nIndex + 2];
        
        // Calculate color difference
        const colorDiff = Math.sqrt(
          Math.pow(baseR - nr, 2) +
          Math.pow(baseG - ng, 2) +
          Math.pow(baseB - nb, 2)
        );
        
        // If color is similar enough, add to segment
        if (colorDiff <= tolerance) {
          stack.push([nx, ny]);
          segmentMap[neighborIndex] = currentSegment;
          segmentSizes[currentSegment]++;
          
          // Update average color
          segmentColors[currentSegment].r += nr;
          segmentColors[currentSegment].g += ng;
          segmentColors[currentSegment].b += nb;
          segmentColors[currentSegment].count++;
        }
      }
    }
    
    // Calculate average color for segment
    const segColor = segmentColors[currentSegment];
    segColor.r = Math.round(segColor.r / segColor.count);
    segColor.g = Math.round(segColor.g / segColor.count);
    segColor.b = Math.round(segColor.b / segColor.count);
    
    // Move to next segment
    currentSegment++;
  };
  
  // Process all pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      
      // Skip if already assigned to a segment
      if (segmentMap[index] !== -1) {
        continue;
      }
      
      // Get pixel color
      const pixelIndex = index * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      
      // Start a new segment
      floodFill(x, y, r, g, b);
    }
  }
  
  // Merge small segments with neighbors
  const mergeMap = {};
  for (let i = 0; i < currentSegment; i++) {
    mergeMap[i] = i; // Initially, each segment points to itself
  }
  
  // Find small segments and merge them
  for (let i = 0; i < currentSegment; i++) {
    if (segmentSizes[i] < minSize) {
      // Find neighbors of this segment
      const neighbors = new Set();
      
      // Look for neighbors in the segment map
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          
          if (segmentMap[index] === i) {
            // Check neighboring pixels
            const directions = [
              [-1, 0], [1, 0], [0, -1], [0, 1]
            ];
            
            for (let j = 0; j < directions.length; j++) {
              const nx = x + directions[j][0];
              const ny = y + directions[j][1];
              
              // Skip if out of bounds
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                continue;
              }
              
              const neighborSegment = segmentMap[ny * width + nx];
              if (neighborSegment !== i && neighborSegment !== -1) {
                neighbors.add(mergeMap[neighborSegment]);
              }
            }
          }
        }
      }
      
      // Find closest neighbor by color
      let bestNeighbor = -1;
      let minColorDiff = Infinity;
      
      const neighborArray = Array.from(neighbors);
      for (let j = 0; j < neighborArray.length; j++) {
        const neighborSegment = neighborArray[j];
        const colorDiff = Math.sqrt(
          Math.pow(segmentColors[i].r - segmentColors[neighborSegment].r, 2) +
          Math.pow(segmentColors[i].g - segmentColors[neighborSegment].g, 2) +
          Math.pow(segmentColors[i].b - segmentColors[neighborSegment].b, 2)
        );
        
        if (colorDiff < minColorDiff) {
          minColorDiff = colorDiff;
          bestNeighbor = neighborSegment;
        }
      }
      
      // Merge with best neighbor if found
      if (bestNeighbor !== -1) {
        mergeMap[i] = bestNeighbor;
      }
    }
  }
  
  // Apply merge mapping (flatten merge chains)
  for (let i = 0; i < currentSegment; i++) {
    let target = i;
    while (mergeMap[target] !== target) {
      target = mergeMap[target];
    }
    mergeMap[i] = target;
  }
  
  // Collect unique segments after merging
  const uniqueSegments = new Set();
  for (let i = 0; i < currentSegment; i++) {
    uniqueSegments.add(mergeMap[i]);
  }
  const segmentList = Array.from(uniqueSegments);
  
  // Generate distinct colors for each segment
  const colors = assignColorsToSegments(segmentList, segmentColors, colorScheme);
  
  // Apply colors to the result image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const pixelSegment = segmentMap[index];
      
      if (pixelSegment !== -1) {
        const mergedSegment = mergeMap[pixelSegment];
        const color = colors[mergedSegment];
        
        if (color) {
          const pixelIndex = index * 4;
          resultData[pixelIndex] = color.r;
          resultData[pixelIndex + 1] = color.g;
          resultData[pixelIndex + 2] = color.b;
        }
      }
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Assigns colors to segments based on the specified color scheme
 * 
 * @param {Array} segmentList - List of segment IDs
 * @param {Object} segmentColors - Map of segment colors
 * @param {string} colorScheme - Color scheme to use
 * @returns {Object} Map of segment IDs to color objects
 */
const assignColorsToSegments = (segmentList, segmentColors, colorScheme) => {
  const colors = {};
  
  switch (colorScheme) {
    case 'rainbow':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i / segmentList.length) * 360;
        const rgb = hsvToRgb(hue, 0.8, 0.9);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    case 'pastel':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i / segmentList.length) * 360;
        const rgb = hsvToRgb(hue, 0.4, 0.95);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    case 'grayscale':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const value = 255 - Math.round((i / segmentList.length) * 220);
        colors[segment] = { r: value, g: value, b: value };
      }
      break;
      
    case 'highContrast':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i * 137.5) % 360; // Golden angle to maximize contrast
        const rgb = hsvToRgb(hue, 1, 1);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    case 'preserveBrightness':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const origColor = segmentColors[segment];
        // Calculate brightness
        const brightness = (origColor.r * 0.299 + origColor.g * 0.587 + origColor.b * 0.114) / 255;
        
        // Generate a random hue but preserve brightness
        const hue = Math.random() * 360;
        const rgb = hsvToRgb(hue, 0.8, brightness);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    default:
      // Default to rainbow
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i / segmentList.length) * 360;
        const rgb = hsvToRgb(hue, 0.8, 0.9);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
  }
  
  return colors;
};