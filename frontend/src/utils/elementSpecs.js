/**
 * Element Specification System
 * 
 * Defines all draggable elements that can be added to pages.
 * Each element has a unique type, default properties, and behavior.
 */

export const ELEMENT_TYPES = {
  TEXT: 'text',
  SHAPE: 'shape',
  QR_CODE: 'qr-code',
  // Future: IMAGE, ICON, CHART, etc.
}

export const TEXT_ELEMENT_SPECS = {
  'editorial-hero': {
    id: 'editorial-hero',
    type: ELEMENT_TYPES.TEXT,
    name: 'Editorial Hero',
    category: 'text',
    preview: 'Aa',
    previewStyle: { 
      fontSize: '32px', 
      fontWeight: '900', 
      fontFamily: 'Inter' 
    },
    defaultProps: {
      width: 60,
      height: 20,
      content: 'Editorial Hero',
      style: {
        fontSize: 72,
        fontWeight: 900,
        textAlign: 'left',
        padding: 30,
        lineHeight: 0.9,
        color: '#000000',
        fontFamily: 'Inter'
      }
    }
  },
  
  'bold-number': {
    id: 'bold-number',
    type: ELEMENT_TYPES.TEXT,
    name: 'Bold Number',
    category: 'text',
    preview: '01',
    previewStyle: { 
      fontSize: '28px', 
      fontWeight: '900', 
      fontFamily: 'Inter' 
    },
    defaultProps: {
      width: 25,
      height: 25,
      content: '01',
      style: {
        fontSize: 120,
        fontWeight: 900,
        textAlign: 'center',
        padding: 20,
        lineHeight: 0.8,
        color: '#000000',
        fontFamily: 'Inter'
      }
    }
  },
  
  'magazine-title': {
    id: 'magazine-title',
    type: ELEMENT_TYPES.TEXT,
    name: 'Magazine',
    category: 'text',
    preview: 'Aa',
    previewStyle: { 
      fontSize: '24px', 
      fontWeight: '900', 
      fontFamily: 'Playfair Display' 
    },
    defaultProps: {
      width: 50,
      height: 18,
      content: 'Magazine Title',
      style: {
        fontSize: 64,
        fontWeight: 900,
        textAlign: 'left',
        padding: 25,
        lineHeight: 0.95,
        color: '#000000',
        fontFamily: 'Playfair Display'
      }
    }
  },
  
  'heading': {
    id: 'heading',
    type: ELEMENT_TYPES.TEXT,
    name: 'Heading',
    category: 'text',
    preview: 'Aa',
    previewStyle: { 
      fontSize: '20px', 
      fontWeight: '700', 
      fontFamily: 'Inter' 
    },
    defaultProps: {
      width: 40,
      height: 12,
      content: 'Heading Text',
      style: {
        fontSize: 32,
        fontWeight: 700,
        textAlign: 'left',
        padding: 20,
        lineHeight: 1.3,
        color: '#000000',
        fontFamily: 'Inter'
      }
    }
  },
  
  'body-text': {
    id: 'body-text',
    type: ELEMENT_TYPES.TEXT,
    name: 'Body Text',
    category: 'text',
    preview: 'Aa',
    previewStyle: { 
      fontSize: '14px', 
      fontWeight: '400', 
      fontFamily: 'Inter' 
    },
    defaultProps: {
      width: 45,
      height: 25,
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      style: {
        fontSize: 16,
        fontWeight: 400,
        textAlign: 'left',
        padding: 20,
        lineHeight: 1.6,
        color: '#000000',
        fontFamily: 'Inter'
      }
    }
  },
  
  'caption': {
    id: 'caption',
    type: ELEMENT_TYPES.TEXT,
    name: 'Caption',
    category: 'text',
    preview: 'Aa',
    previewStyle: { 
      fontSize: '11px', 
      fontWeight: '400', 
      fontFamily: 'Inter', 
      color: '#666' 
    },
    defaultProps: {
      width: 35,
      height: 8,
      content: 'Image caption or description',
      style: {
        fontSize: 12,
        fontWeight: 400,
        textAlign: 'left',
        padding: 15,
        lineHeight: 1.8,
        color: '#666666',
        fontFamily: 'Inter'
      }
    }
  }
}

// Future shape specs
export const SHAPE_ELEMENT_SPECS = {
  // 'rectangle': { ... },
  // 'circle': { ... },
  // 'line': { ... },
}

// Future QR code specs
export const QR_CODE_SPECS = {
  // 'qr-code': { ... }
}

/**
 * Get all element specs by category
 */
export function getElementSpecsByCategory(category) {
  switch (category) {
    case 'text':
      return Object.values(TEXT_ELEMENT_SPECS)
    case 'shape':
      return Object.values(SHAPE_ELEMENT_SPECS)
    case 'qr-code':
      return Object.values(QR_CODE_SPECS)
    default:
      return []
  }
}

/**
 * Get element spec by ID
 */
export function getElementSpecById(id) {
  return TEXT_ELEMENT_SPECS[id] || 
         SHAPE_ELEMENT_SPECS[id] || 
         QR_CODE_SPECS[id] || 
         null
}

/**
 * Create element from spec
 */
export function createElementFromSpec(specId, position = { x: 10, y: 10 }) {
  const spec = getElementSpecById(specId)
  if (!spec) {
    console.error(`Element spec not found: ${specId}`)
    return null
  }
  
  return {
    type: spec.type,
    specId: spec.id,
    x: position.x,
    y: position.y,
    ...spec.defaultProps
  }
}
