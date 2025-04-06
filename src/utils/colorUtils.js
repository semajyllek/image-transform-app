/**
 * Utility functions for color manipulation and conversion
 */

/**
 * Converts HSV (Hue, Saturation, Value) color to RGB (Red, Green, Blue)
 * 
 * @param {number} h - Hue value (0-360)
 * @param {number} s - Saturation value (0-1)
 * @param {number} v - Value/Brightness (0-1)
 * @returns {Array} RGB values as [r, g, b] with each component in range 0-255
 */
export const hsvToRgb = (h, s, v) => {
	let r, g, b;
	
	// Make sure h is within 0-360
	h = ((h % 360) + 360) % 360;
	
	// Handle special case of s=0 (grayscale)
	if (s === 0) {
	  r = g = b = v;
	  return [
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255)
	  ];
	}
	
	const i = Math.floor(h / 60) % 6;
	const f = h / 60 - Math.floor(h / 60);
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	
	switch (i) {
	  case 0:
		r = v;
		g = t;
		b = p;
		break;
	  case 1:
		r = q;
		g = v;
		b = p;
		break;
	  case 2:
		r = p;
		g = v;
		b = t;
		break;
	  case 3:
		r = p;
		g = q;
		b = v;
		break;
	  case 4:
		r = t;
		g = p;
		b = v;
		break;
	  case 5:
		r = v;
		g = p;
		b = q;
		break;
	  default:
		r = v;
		g = p;
		b = q;
		break;
	}
	
	return [
	  Math.round(r * 255),
	  Math.round(g * 255),
	  Math.round(b * 255)
	];
  };
  
  /**
   * Converts RGB color to HSV
   * 
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @returns {Array} HSV values as [h, s, v] where h is 0-360, s and v are 0-1
   */
  export const rgbToHsv = (r, g, b) => {
	// Normalize RGB values to 0-1 range
	r /= 255;
	g /= 255;
	b /= 255;
	
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	
	let h, s, v;
	
	// Calculate hue
	if (delta === 0) {
	  h = 0; // No color, just grayscale
	} else if (max === r) {
	  h = ((g - b) / delta) % 6;
	} else if (max === g) {
	  h = (b - r) / delta + 2;
	} else {
	  h = (r - g) / delta + 4;
	}
	
	h = Math.round(h * 60);
	if (h < 0) h += 360;
	
	// Calculate saturation
	s = max === 0 ? 0 : delta / max;
	
	// Value is the max
	v = max;
	
	return [h, s, v];
  };
  
  /**
   * Calculates the luminance (perceived brightness) of an RGB color
   * Uses the formula from WCAG 2.0
   * 
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @returns {number} Luminance value (0-1)
   */
  export const getLuminance = (r, g, b) => {
	// Convert RGB to relative luminance using coefficients that match human perception
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  
  /**
   * Calculates color distance between two RGB colors using Euclidean distance
   * 
   * @param {number} r1 - Red component of first color (0-255)
   * @param {number} g1 - Green component of first color (0-255)
   * @param {number} b1 - Blue component of first color (0-255)
   * @param {number} r2 - Red component of second color (0-255)
   * @param {number} g2 - Green component of second color (0-255)
   * @param {number} b2 - Blue component of second color (0-255)
   * @returns {number} Euclidean distance between the colors in RGB space
   */
  export const getColorDistance = (r1, g1, b1, r2, g2, b2) => {
	return Math.sqrt(
	  Math.pow(r2 - r1, 2) +
	  Math.pow(g2 - g1, 2) +
	  Math.pow(b2 - b1, 2)
	);
  };
  
  /**
   * Generates an array of distinct colors using the golden ratio
   * This ensures colors are spread evenly around the color wheel
   * 
   * @param {number} count - Number of colors to generate
   * @param {number} saturation - Saturation value (0-1), default 0.8
   * @param {number} value - Brightness value (0-1), default 0.9
   * @returns {Array} Array of RGB colors as [r, g, b] arrays
   */
  export const generateDistinctColors = (count, saturation = 0.8, value = 0.9) => {
	const colors = [];
	const goldenRatioConjugate = 0.618033988749895;
	let h = Math.random(); // Start with random hue
	
	for (let i = 0; i < count; i++) {
	  h += goldenRatioConjugate;
	  h %= 1; // Keep h in the range [0, 1)
	  
	  // Convert to HSV and then to RGB
	  const rgb = hsvToRgb(h * 360, saturation, value);
	  colors.push(rgb);
	}
	
	return colors;
  };
  
  /**
   * Creates a color that preserves the relative luminance of the original
   * but changes the hue and saturation
   * 
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @param {number} targetHue - Desired hue (0-360)
   * @param {number} targetSaturation - Desired saturation (0-1)
   * @returns {Array} RGB values as [r, g, b] with each component in range 0-255
   */
  export const preserveLuminance = (r, g, b, targetHue, targetSaturation) => {
	// Get current luminance
	const luminance = getLuminance(r, g, b);
	
	// Convert to HSV
	const [currentHue, currentSat, currentVal] = rgbToHsv(r, g, b);
	
	// Try different values to match luminance
	let bestDiff = Infinity;
	let bestRgb = [0, 0, 0];
	
	// Test different values from 0.1 to 1.0
	for (let testValue = 0.1; testValue <= 1.0; testValue += 0.05) {
	  const testRgb = hsvToRgb(targetHue, targetSaturation, testValue);
	  const testLum = getLuminance(testRgb[0], testRgb[1], testRgb[2]);
	  
	  const diff = Math.abs(testLum - luminance);
	  if (diff < bestDiff) {
		bestDiff = diff;
		bestRgb = testRgb;
	  }
	}
	
	return bestRgb;
  };