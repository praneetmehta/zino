# Layout Specification

This document describes the complete specification for creating layout definitions in the Zine Editor.

## Overview

Layouts define how content (images and text) is arranged on a page. They use a percentage-based coordinate system for responsiveness across different page sizes.

## File Structure

Layouts are stored as JSON files in the following structure:

```
src/layouts/definitions/
├── basic/          # Simple, fundamental layouts
├── editorial/      # Magazine-style layouts
├── grid/           # Grid-based layouts
└── combined/       # Layouts with pre-positioned text overlays
```

## JSON Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (kebab-case) |
| `name` | string | Human-readable display name |
| `icon` | string | Emoji or icon character |
| `slots` | array | Array of content slot definitions |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Category: `basic`, `editorial`, `grid`, `combined` |
| `textElements` | array | Pre-positioned text overlays |
| `aspectRatio` | object | Aspect ratio constraints |
| `metadata` | object | Additional metadata |

## Slot Definition

Slots define areas where images can be placed.

### Properties

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `x` | number | 0-100 | X position (percentage) |
| `y` | number | 0-100 | Y position (percentage) |
| `width` | number | 0-100 | Width (percentage) |
| `height` | number | 0-100 | Height (percentage) |
| `type` | string | - | `"image"` or `"text"` |
| `zIndex` | number | - | Stacking order (optional) |
| `backgroundColor` | string | - | Default background color (optional) |

### Example

```json
{
  "x": 0,
  "y": 0,
  "width": 50,
  "height": 100,
  "type": "image",
  "zIndex": 1
}
```

## Text Element Definition

Text elements are pre-positioned text overlays that come with the layout.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier within the layout |
| `x` | number | X position (0-100%) |
| `y` | number | Y position (0-100%) |
| `width` | number | Width (0-100%) |
| `height` | number | Height (0-100%) |
| `content` | string | Default text content |
| `style` | object | Text styling properties |
| `zIndex` | number | Stacking order |
| `locked` | boolean | Whether element is locked |

### Style Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `fontSize` | number | Font size in pixels | `24` |
| `fontWeight` | number | Font weight (100-900) | `700` |
| `fontFamily` | string | Font family name | `"Arial Black"` |
| `color` | string | Text color | `"#000000"` |
| `backgroundColor` | string | Background color | `"#FFFFFF"` or `"rgba(0,0,0,0.5)"` |
| `textAlign` | string | Text alignment | `"left"`, `"center"`, `"right"` |
| `lineHeight` | number | Line height multiplier | `1.5` |
| `letterSpacing` | string | Letter spacing | `"0.1em"` |
| `writingMode` | string | Text direction | `"vertical-rl"`, `"horizontal-tb"` |
| `textShadow` | string | CSS text shadow | `"2px 2px 4px rgba(0,0,0,0.5)"` |
| `padding` | string/number | Padding | `"12px"` or `12` |

### Example

```json
{
  "id": "hero-title",
  "x": 10,
  "y": 70,
  "width": 80,
  "height": 15,
  "content": "HEADLINE TEXT",
  "style": {
    "fontSize": 48,
    "fontWeight": 900,
    "fontFamily": "Arial Black",
    "color": "#FFFFFF",
    "textAlign": "center",
    "lineHeight": 1.2,
    "textShadow": "2px 2px 8px rgba(0,0,0,0.8)"
  },
  "zIndex": 100,
  "locked": false
}
```

## Aspect Ratio Constraints

Optionally restrict layouts to specific page aspect ratios.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `min` | number | Minimum aspect ratio (width/height) |
| `max` | number | Maximum aspect ratio (width/height) |

### Example

```json
{
  "aspectRatio": {
    "min": 1.2,
    "max": 1.8
  }
}
```

This layout will only appear for pages with aspect ratios between 1.2 and 1.8 (e.g., landscape-oriented pages).

## Metadata

Additional information about the layout.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `author` | string | Creator name |
| `created` | string | ISO 8601 date |
| `tags` | array | Search tags |
| `description` | string | Detailed description |

### Example

```json
{
  "metadata": {
    "author": "Zine Editor",
    "created": "2025-01-15T00:00:00Z",
    "tags": ["magazine", "hero", "overlay"],
    "description": "Full-page hero image with overlay text at the bottom"
  }
}
```

## Complete Examples

### Basic Layout: Two Column

```json
{
  "id": "two-column",
  "name": "Two Column",
  "icon": "⬜|⬜",
  "category": "basic",
  "slots": [
    {
      "x": 0,
      "y": 0,
      "width": 50,
      "height": 100,
      "type": "image"
    },
    {
      "x": 50,
      "y": 0,
      "width": 50,
      "height": 100,
      "type": "image"
    }
  ]
}
```

### Combined Layout: Hero with Caption

```json
{
  "id": "hero-caption",
  "name": "Hero + Caption",
  "icon": "🖼️",
  "category": "combined",
  "slots": [
    {
      "x": 0,
      "y": 0,
      "width": 100,
      "height": 100,
      "type": "image"
    }
  ],
  "textElements": [
    {
      "id": "hero-title",
      "x": 8,
      "y": 65,
      "width": 84,
      "height": 12,
      "content": "POWERFUL HEADLINE",
      "style": {
        "fontSize": 48,
        "fontWeight": 900,
        "fontFamily": "Arial Black",
        "color": "#FFFFFF",
        "textAlign": "left",
        "lineHeight": 1.1,
        "textShadow": "2px 2px 8px rgba(0,0,0,0.8)"
      },
      "zIndex": 100,
      "locked": false
    },
    {
      "id": "hero-caption",
      "x": 8,
      "y": 78,
      "width": 50,
      "height": 8,
      "content": "A compelling caption that provides context.",
      "style": {
        "fontSize": 14,
        "fontWeight": 400,
        "fontFamily": "Georgia",
        "color": "#FFFFFF",
        "textAlign": "left",
        "lineHeight": 1.5,
        "backgroundColor": "rgba(0,0,0,0.6)",
        "padding": "12px"
      },
      "zIndex": 100,
      "locked": false
    }
  ],
  "metadata": {
    "author": "Zine Editor",
    "tags": ["hero", "caption", "overlay"],
    "description": "Full-page hero image with title and caption overlay"
  }
}
```

## Design Guidelines

### Positioning
- Use percentage-based coordinates for responsiveness
- Keep margins from edges (recommended: 5-10% minimum)
- Consider bleed and safety margins

### Slot Sizing
- Minimum recommended slot size: 10% width and height
- Avoid very thin slots (< 5%) as they're hard to interact with
- Total slot area shouldn't exceed 100% per dimension

### Text Overlays
- Use high contrast colors for readability
- Add text shadows for text over images
- Consider semi-transparent backgrounds
- Test with different image backgrounds

### Z-Index Management
- Images: 0-50
- Text overlays: 50-150
- UI elements: 150+

### Performance
- Limit text elements to 5-7 per layout
- Avoid excessive nesting
- Keep JSON files under 5KB

## Validation

Layouts are automatically validated on load. Common errors:

- **Invalid coordinates**: x, y, width, height must be 0-100
- **Missing required fields**: id, name, icon, slots
- **Invalid types**: type must be "image" or "text"
- **Duplicate IDs**: Each layout and text element needs unique ID

Check browser console for validation errors during development.

## Best Practices

1. **Naming Conventions**
   - Use descriptive, unique IDs (kebab-case)
   - Clear, concise names for UI display
   - Relevant icons that represent the layout visually

2. **Testing**
   - Test with different aspect ratios
   - Verify text readability on various backgrounds
   - Check PDF export quality
   - Test drag-and-drop interactions

3. **Documentation**
   - Add descriptive metadata
   - Include usage tags
   - Document intended use cases

4. **Accessibility**
   - Ensure sufficient color contrast
   - Provide default content that's editable
   - Consider text size for readability

## Migration from Legacy Format

If you have layouts in the old JavaScript format, convert them to JSON:

**Old (layoutDefinitions.js):**
```javascript
{
  id: 'my-layout',
  name: 'My Layout',
  icon: '⬜',
  slots: [/* ... */]
}
```

**New (definitions/basic/my-layout.json):**
```json
{
  "id": "my-layout",
  "name": "My Layout",
  "icon": "⬜",
  "category": "basic",
  "slots": []
}
```

Save as JSON with double-quoted strings and no trailing commas.

## Future Extensions

Planned features for the layout specification:

- **Layout variants**: Light/dark theme variants
- **Responsive breakpoints**: Different layouts per screen size
- **Animation presets**: Entry/exit animations
- **Export templates**: Custom PDF export settings per layout
- **Layout inheritance**: Base layouts with extensions
- **Conditional rendering**: Show/hide elements based on content

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-15  
**Schema Location**: `src/layouts/schema.json`
