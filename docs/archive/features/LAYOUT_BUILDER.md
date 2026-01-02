# Layout Builder

## Overview
A visual tool for creating custom page layouts by defining image slot positions and sizes. Users can drag, resize, and position slots to create unique layouts for their zines.

## Features

### Visual Editor
- **Live Preview**: Real-time preview of the layout as you build
- **Drag & Drop**: Click and drag slots to reposition them
- **Resize Handles**: Corner handles for resizing slots
- **Grid Snapping**: Precise positioning with percentage-based coordinates

### Controls

#### Layout Settings
- **Name**: Custom name for the layout
- **Category**: Organize layouts (Basic, Editorial, Portfolio, Magazine, Custom)
- **Page Dimensions**: Set width and height in millimeters

#### Slot Management
- **Add Slot**: Create new image slots
- **Select Slot**: Click to select and edit
- **Delete Slot**: Remove unwanted slots
- **Position Controls**: Fine-tune X, Y, Width, Height with inputs

### Interaction

#### Drag to Move
1. Click on a slot
2. Drag to new position
3. Release to place

#### Resize
1. Select a slot
2. Grab corner handle (NW, NE, SW, SE)
3. Drag to resize
4. Release to apply

#### Keyboard Shortcuts
- **Click slot**: Select
- **Click canvas**: Deselect
- **Drag slot**: Move
- **Drag handle**: Resize

## Usage

### Creating a Layout

1. **Open Layout Builder**
   - From landing page, click "Layout Builder"
   - Or navigate from editor

2. **Set Layout Properties**
   - Enter layout name
   - Choose category
   - Set page dimensions (default: 148mm × 210mm)

3. **Add Slots**
   - Click "Add Image Slot"
   - Position using drag or input fields
   - Resize using handles or input fields
   - Repeat for all desired slots

4. **Save Layout**
   - Click "Save Layout"
   - Layout saved to localStorage
   - Available in layout selector

### Layout Structure

```javascript
{
  id: 'custom-1234567890',
  name: 'My Custom Layout',
  category: 'custom',
  width: 148,  // mm
  height: 210, // mm
  slots: [
    {
      x: 10,      // percentage
      y: 10,      // percentage
      width: 80,  // percentage
      height: 40  // percentage
    }
  ],
  textElements: []
}
```

## Technical Details

### Coordinate System
- **Percentage-based**: All positions use percentages (0-100%)
- **Origin**: Top-left corner (0, 0)
- **Bounds**: Slots constrained within page boundaries

### Slot Properties
- **x**: Horizontal position from left edge (%)
- **y**: Vertical position from top edge (%)
- **width**: Slot width (%)
- **height**: Slot height (%)

### Constraints
- **Minimum size**: 5% × 5%
- **Maximum size**: 100% × 100%
- **Boundary check**: Slots cannot exceed page edges

## Storage

### LocalStorage
Custom layouts stored in browser localStorage:
```javascript
localStorage.setItem('customLayouts', JSON.stringify([...layouts]))
```

### Retrieval
Layouts loaded on app initialization:
```javascript
const customLayouts = JSON.parse(localStorage.getItem('customLayouts') || '[]')
```

## UI Components

### Controls Panel (Left)
- Layout name input
- Category selector
- Dimension inputs
- Add slot button
- Selected slot controls
- Slots list

### Canvas Preview (Center)
- Scaled page preview
- Interactive slots
- Selection indicators
- Resize handles

### Header (Top)
- Back button
- Title
- Save button

## Styling

### Visual Feedback
- **Hover**: Border color changes to accent
- **Selected**: Solid border, accent color
- **Dragging**: Cursor changes to move
- **Resizing**: Cursor changes to resize direction

### Colors
- **Slot border**: Dashed when unselected, solid when selected
- **Slot background**: Translucent accent color
- **Handles**: Accent color with white border
- **Labels**: Accent color, semi-transparent

## Future Enhancements

### Phase 1: Advanced Features
- [ ] Snap to grid
- [ ] Alignment guides
- [ ] Duplicate slot
- [ ] Slot templates
- [ ] Undo/redo

### Phase 2: Export/Import
- [ ] Export layout as JSON
- [ ] Import layout from file
- [ ] Share layouts
- [ ] Layout marketplace

### Phase 3: Smart Features
- [ ] Auto-arrange slots
- [ ] Suggested layouts
- [ ] Layout variations
- [ ] AI-powered layout generation

### Phase 4: Collaboration
- [ ] Cloud storage
- [ ] Share with team
- [ ] Version history
- [ ] Comments and feedback

## Best Practices

### Layout Design
1. **Leave margins**: Don't place slots at exact edges
2. **Consider bleed**: Account for trim area
3. **Balance composition**: Distribute slots evenly
4. **Test with images**: Preview with actual content

### Slot Sizing
1. **Aspect ratios**: Consider common image ratios (16:9, 4:3, 1:1)
2. **Minimum size**: Keep slots large enough for content
3. **Overlap**: Avoid overlapping slots unless intentional
4. **Consistency**: Use similar sizes for cohesive layouts

### Organization
1. **Naming**: Use descriptive layout names
2. **Categories**: Group similar layouts
3. **Documentation**: Note intended use case
4. **Testing**: Try layout with different content

## Examples

### Single Hero Image
```javascript
{
  name: 'Hero',
  slots: [
    { x: 5, y: 5, width: 90, height: 90 }
  ]
}
```

### Two Column
```javascript
{
  name: 'Two Column',
  slots: [
    { x: 5, y: 5, width: 42.5, height: 90 },
    { x: 52.5, y: 5, width: 42.5, height: 90 }
  ]
}
```

### Magazine Grid
```javascript
{
  name: 'Magazine Grid',
  slots: [
    { x: 5, y: 5, width: 90, height: 40 },
    { x: 5, y: 50, width: 42.5, height: 45 },
    { x: 52.5, y: 50, width: 42.5, height: 45 }
  ]
}
```

---

**Created**: January 15, 2025  
**Status**: ✅ Fully functional  
**Next**: Advanced features and cloud storage
