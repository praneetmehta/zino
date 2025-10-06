# Element Specification System

## Overview
A comprehensive system for defining, creating, and managing draggable elements in Zino. This system provides a scalable architecture for supporting multiple element types with unique behaviors and properties.

## Architecture

### Element Types
```javascript
ELEMENT_TYPES = {
  TEXT: 'text',
  SHAPE: 'shape',
  QR_CODE: 'qr-code',
  // Future: IMAGE, ICON, CHART, BARCODE, etc.
}
```

### Element Spec Structure
Each element spec defines:
- **id**: Unique identifier
- **type**: Element type (text, shape, qr-code, etc.)
- **name**: Display name
- **category**: Grouping category
- **preview**: Preview text/icon
- **previewStyle**: CSS for preview display
- **defaultProps**: Default properties when created

## Text Element Specs

### Editorial Hero
- **Purpose**: Large, bold headlines for editorial content
- **Font**: Inter, 72px, weight 900
- **Use Case**: Magazine covers, feature articles
- **Default**: "Editorial Hero"

### Bold Number
- **Purpose**: Large decorative numbers
- **Font**: Inter, 120px, weight 900, centered
- **Use Case**: Page numbers, statistics, dates
- **Default**: "01"

### Magazine Title
- **Purpose**: Elegant serif headlines
- **Font**: Playfair Display, 64px, weight 900
- **Use Case**: Magazine-style layouts, luxury content
- **Default**: "Magazine Title"

### Heading
- **Purpose**: Standard section headings
- **Font**: Inter, 32px, weight 700
- **Use Case**: Article sections, chapter titles
- **Default**: "Heading Text"

### Body Text
- **Purpose**: Readable paragraph text
- **Font**: Inter, 16px, weight 400
- **Use Case**: Article content, descriptions
- **Default**: Lorem ipsum paragraph

### Caption
- **Purpose**: Small descriptive text
- **Font**: Inter, 12px, weight 400, gray color
- **Use Case**: Image captions, footnotes
- **Default**: "Image caption or description"

## Usage

### Creating Elements from Specs

```javascript
import { createElementFromSpec } from '@/utils/elementSpecs'

// Create element at specific position
const element = createElementFromSpec('editorial-hero', { x: 10, y: 10 })

// Add to page
zineStore.addTextElement(pageId, element)
```

### Drag & Drop Integration

```javascript
// In MediaPanel - drag start
const handleTextTemplateDragStart = (event, elementSpec) => {
  event.dataTransfer.setData('elementSpec', JSON.stringify({
    specId: elementSpec.id,
    type: elementSpec.type
  }))
}

// In Canvas - drop handler
const handlePageDrop = (event, pageId) => {
  const { specId, type } = JSON.parse(event.dataTransfer.getData('elementSpec'))
  const element = createElementFromSpec(specId, dropPosition)
  if (type === 'text') {
    zineStore.addTextElement(pageId, element)
  }
}
```

### Getting Specs by Category

```javascript
import { getElementSpecsByCategory } from '@/utils/elementSpecs'

// Get all text elements
const textElements = getElementSpecsByCategory('text')

// Get all shapes (future)
const shapes = getElementSpecsByCategory('shape')
```

## Benefits

### 1. Unique Element Behavior
Each spec creates elements with distinct properties:
- Different default content
- Unique styling
- Appropriate sizing
- Specific use cases

### 2. Scalability
Easy to add new element types:
```javascript
// Add new text style
TEXT_ELEMENT_SPECS['quote'] = {
  id: 'quote',
  type: ELEMENT_TYPES.TEXT,
  name: 'Quote',
  // ... properties
}

// Add new element type
SHAPE_ELEMENT_SPECS['circle'] = {
  id: 'circle',
  type: ELEMENT_TYPES.SHAPE,
  // ... properties
}
```

### 3. Consistency
- Centralized element definitions
- Predictable behavior
- Easy maintenance
- Type safety

### 4. Extensibility
Future element types can be added:
- **Shapes**: Rectangles, circles, lines, polygons
- **QR Codes**: Dynamic QR code generation
- **Barcodes**: Various barcode formats
- **Icons**: Icon library integration
- **Charts**: Data visualization
- **Images**: Smart image placeholders

## Future Enhancements

### Phase 1: Shape Elements
```javascript
SHAPE_ELEMENT_SPECS = {
  'rectangle': {
    id: 'rectangle',
    type: ELEMENT_TYPES.SHAPE,
    defaultProps: {
      width: 30,
      height: 20,
      fill: '#000000',
      stroke: 'none',
      borderRadius: 0
    }
  },
  'circle': { /* ... */ },
  'line': { /* ... */ }
}
```

### Phase 2: QR Code Elements
```javascript
QR_CODE_SPECS = {
  'qr-code': {
    id: 'qr-code',
    type: ELEMENT_TYPES.QR_CODE,
    defaultProps: {
      width: 15,
      height: 15,
      data: 'https://example.com',
      errorCorrection: 'M'
    }
  }
}
```

### Phase 3: Smart Templates
- Pre-composed element groups
- Layout templates with multiple elements
- Style presets that apply to multiple elements

### Phase 4: Custom Elements
- User-defined element specs
- Save custom configurations
- Share element libraries

## Implementation Details

### File Structure
```
src/utils/elementSpecs.js
├── ELEMENT_TYPES (constants)
├── TEXT_ELEMENT_SPECS (text elements)
├── SHAPE_ELEMENT_SPECS (shapes)
├── QR_CODE_SPECS (qr codes)
├── getElementSpecsByCategory()
├── getElementSpecById()
└── createElementFromSpec()
```

### Integration Points
1. **MediaPanel**: Displays element specs as draggable items
2. **Canvas**: Handles drop events and creates elements
3. **Store**: Manages element state
4. **Context Menu**: Element-specific controls

## Testing Checklist

- [x] Each text spec creates unique element
- [x] Default content is spec-specific
- [x] Styling matches spec definition
- [x] Drag & drop works for all specs
- [x] Elements are properly sized
- [x] Preview displays correctly
- [ ] Shape elements (future)
- [ ] QR code elements (future)

---

**Created**: January 15, 2025  
**Status**: ✅ Implemented for text elements  
**Next**: Shape and QR code elements
