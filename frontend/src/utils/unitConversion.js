/**
 * Unit conversion utilities for the Ziner application
 * Provides consistent conversion between millimeters and pixels
 */

// Standard conversion factor: 1mm = 3.7795275591px (at 96 DPI)
const MM_TO_PX_RATIO = 3.7795275591

/**
 * Convert millimeters to pixels
 * @param {number} mm - Value in millimeters
 * @returns {number} Value in pixels
 */
export function mmToPx(mm) {
  return mm * MM_TO_PX_RATIO
}

/**
 * Convert pixels to millimeters
 * @param {number} px - Value in pixels
 * @returns {number} Value in millimeters
 */
export function pxToMm(px) {
  return px / MM_TO_PX_RATIO
}

/**
 * Convert a value based on the unit type
 * @param {number} value - The value to convert
 * @param {string} unit - The unit type ('mm' or 'px')
 * @returns {number} Value in pixels
 */
export function toPx(value, unit) {
  return unit === 'mm' ? mmToPx(value) : value
}

/**
 * Get scaled dimensions for display
 * Converts to pixels and applies scaling if needed to fit within maxWidth
 * @param {Object} config - Zine configuration object
 * @param {number} config.width - Width value
 * @param {number} config.height - Height value
 * @param {string} config.unit - Unit type ('mm' or 'px')
 * @param {number} maxWidth - Maximum width in pixels for display
 * @returns {Object} { widthPx, heightPx, scale }
 */
export function getScaledDimensions(config, maxWidth = 600) {
  if (!config) {
    return { widthPx: 0, heightPx: 0, scale: 1 }
  }

  const widthPx = toPx(config.width, config.unit)
  const heightPx = toPx(config.height, config.unit)
  const scale = widthPx > maxWidth ? maxWidth / widthPx : 1

  return {
    widthPx: widthPx * scale,
    heightPx: heightPx * scale,
    scale,
  }
}

/**
 * Convert a margin/bleed value to scaled pixels for display
 * @param {number} value - The margin/bleed value
 * @param {string} unit - The unit type ('mm' or 'px')
 * @param {number} scale - The scale factor from getScaledDimensions
 * @returns {number} Scaled value in pixels
 */
export function toScaledPx(value, unit, scale = 1) {
  const px = toPx(value, unit)
  return px * scale
}
