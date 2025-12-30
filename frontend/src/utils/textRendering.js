// Shared text rendering configuration
export const FONT_STACK = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Standard text styles
export const DEFAULT_TEXT_STYLE = {
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 400,
  lineHeight: 1.5,
  textAlign: 'left',
  color: '#000000',
  backgroundColor: 'transparent',
  padding: 10
};

// Convert CSS pixels to mm (1in = 96px = 25.4mm)
export const pxToMm = (px) => (px * 25.4) / 96;

// Convert CSS pixels to PDF points (1in = 96px = 72pt)
export const pxToPt = (px) => (px * 72) / 96;

// Map CSS font families to PDF fonts
export const mapFontToPdf = (fontFamily = 'Inter') => {
  const fontMap = {
    'Inter': 'helvetica',
    'Roboto': 'helvetica',
    'Montserrat': 'helvetica',
    'Poppins': 'helvetica',
    'Raleway': 'helvetica',
    'Work Sans': 'helvetica',
    'DM Sans': 'helvetica',
    'Space Grotesk': 'helvetica',
    'Arial': 'helvetica',
    'Helvetica': 'helvetica',
    'Playfair Display': 'times',
    'Lora': 'times',
    'Merriweather': 'times',
    'Crimson Text': 'times',
    'Libre Baskerville': 'times',
    'Georgia': 'times',
    'Times New Roman': 'times',
    'Bebas Neue': 'helvetica',
    'Oswald': 'helvetica',
    'Courier New': 'courier',
    'monospace': 'courier',
    'system-ui': 'helvetica',
  };
  return fontMap[fontFamily] || 'helvetica';
};

// Get font weight style for PDF
export const getPdfFontWeight = (weight = 400) => {
  return weight >= 700 ? 'bold' : 'normal';
};
