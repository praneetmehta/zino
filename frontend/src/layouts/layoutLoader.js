/**
 * Layout Loader
 * Dynamically imports all layout JSON files from the definitions directory
 * 
 * Directory Structure:
 * layouts/
 *   definitions/
 *     basic/
 *       full-page.json
 *       two-horizontal.json
 *       ...
 *     editorial/
 *       ...
 *     grid/
 *       ...
 *     combined/
 *       halloween-spread.json
 *       hero-caption.json
 *       ...
 */

// Import all JSON layout files using Vite's glob import
// This automatically reads all .json files from the definitions directory
// Including custom layouts from the custom folder
const layoutModules = import.meta.glob('./definitions/**/*.json', { eager: true })

// Layout categories configuration
export const layoutCategories = {
  basic: {
    name: 'Basic',
    icon: '📄',
    layouts: []
  },
  cover: {
    name: 'Cover Page',
    icon: '📄',
    layouts: []
  },
  editorial: {
    name: 'Editorial',
    icon: '📰',
    layouts: []
  },
  grid: {
    name: 'Grid',
    icon: '⬜',
    layouts: []
  },
  combined: {
    name: 'Image + Text',
    icon: '🖼️',
    layouts: []
  },
  custom: {
    name: 'Custom',
    icon: '⭐',
    layouts: []
  }
}

// Load and organize all layouts
export const layoutDefinitions = []

for (const path in layoutModules) {
  const layout = layoutModules[path].default || layoutModules[path]
  layoutDefinitions.push(layout)
  console.log(layout)
  // Add to appropriate category
  const category = layout.category || 'basic'
  if (layoutCategories[category]) {
    console.log("Pushed %s to %s", layout.id, category)
    layoutCategories[category].layouts.push(layout.id)
  }
}

// Helper function to get layout by id
export function getLayoutById(id) {
  return layoutDefinitions.find(layout => layout.id === id)
}

// Helper function to get layouts by category
export function getLayoutsByCategory(category) {
  return layoutDefinitions.filter(layout => layout.category === category)
}

// Helper function to get layouts by aspect ratio compatibility
export function getLayoutsByAspectRatio(aspectRatio) {
  return layoutDefinitions.filter(layout => {
    if (!layout.aspectRatio) return true // No constraints = compatible with all
    const { min, max } = layout.aspectRatio
    if (min && aspectRatio < min) return false
    if (max && aspectRatio > max) return false
    return true
  })
}

// Helper function to add custom layouts (for future extensibility)
export function addCustomLayout(layout) {
  layoutDefinitions.push(layout)
  const category = layout.category || 'basic'
  if (layoutCategories[category]) {
    layoutCategories[category].layouts.push(layout.id)
  }
}

// Validation function to check if layout matches schema
export function validateLayout(layout) {
  const errors = []
  
  if (!layout.id) errors.push('Layout must have an id')
  if (!layout.name) errors.push('Layout must have a name')
  if (!layout.icon) errors.push('Layout must have an icon')
  if (!layout.slots || !Array.isArray(layout.slots) || layout.slots.length === 0) {
    errors.push('Layout must have at least one slot')
  }
  
  // Validate slots
  layout.slots?.forEach((slot, index) => {
    if (typeof slot.x !== 'number' || slot.x < 0 || slot.x > 100) {
      errors.push(`Slot ${index}: x must be between 0 and 100`)
    }
    if (typeof slot.y !== 'number' || slot.y < 0 || slot.y > 100) {
      errors.push(`Slot ${index}: y must be between 0 and 100`)
    }
    if (typeof slot.width !== 'number' || slot.width <= 0 || slot.width > 100) {
      errors.push(`Slot ${index}: width must be between 0 and 100`)
    }
    if (typeof slot.height !== 'number' || slot.height <= 0 || slot.height > 100) {
      errors.push(`Slot ${index}: height must be between 0 and 100`)
    }
    if (!slot.type) {
      errors.push(`Slot ${index}: type is required`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

console.log(`✓ Loaded ${layoutDefinitions.length} layouts from ${Object.keys(layoutModules).length} files`)
