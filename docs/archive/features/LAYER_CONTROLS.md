# Layer Controls (Z-Index Management)

## Overview
Added layer controls to manage the stacking order (z-index) of elements on pages, allowing users to bring elements to front or send them to back.

## Features

### Element Types Supported
- **Text Elements**: Floating text boxes
- **Image Slots**: Layout-based image containers

### Controls

#### Design
- **Style**: Minimal white buttons with shadows
- **Icons**: Line font up/down arrows (↑ ↓)
- **Size**: 28-32px square buttons
- **Appearance**: Clean, modern, non-intrusive

#### Text Elements
- **Location**: Text Toolbar (appears when editing text)
- **Buttons**:
  - ↑ **Bring to Front**: Moves text element above all other page elements
  - ↓ **Send to Back**: Moves text element below all other page elements

#### Image Slots
- **Location**: Fixed position, top-right of slot (appears on hover)
- **Buttons**:
  - ↑ **Bring to Front**: Moves image slot above all other page elements
  - ↓ **Send to Back**: Moves image slot below all other page elements
- **Behavior**: Fade in on hover, positioned absolutely

## Implementation

### Store Actions

#### Text Elements
```javascript
bringTextElementToFront(pageId, elementId)
sendTextElementToBack(pageId, elementId)
```

#### Image Slots
```javascript
bringSlotToFront(pageId, slotIndex)
sendSlotToBack(pageId, slotIndex)
```

### Z-Index Calculation
- **Bring to Front**: Sets z-index to `max(all elements) + 1`
- **Send to Back**: Sets z-index to `min(all elements) - 1`
- **Default**: Elements start at z-index 0
- **Cross-type**: Text and slots share the same z-index space

### Rendering
```javascript
// Text elements
boxStyle: {
  zIndex: element.zIndex || 0
}

// Image slots
slotStyle: {
  zIndex: slot.zIndex !== undefined ? slot.zIndex : 0
}
```

## User Workflow

### Overlapping Text on Image
1. Add image to slot
2. Add floating text element
3. Text appears on top by default
4. Click image slot controls → ⬆️ to bring image to front
5. Image now covers text

### Creating Layered Compositions
1. Place multiple images in different slots
2. Add text elements
3. Use layer controls to arrange stacking order
4. Create depth and visual hierarchy

### PDF Export
- Z-index is preserved during export
- html2canvas captures elements in correct stacking order
- Layering appears identical in exported PDF

## Technical Details

### Z-Index Storage
```javascript
// Text element
{
  id: 'text-123',
  x: 10,
  y: 20,
  zIndex: 5,  // Added property
  content: 'Hello',
  style: { ... }
}

// Image slot
{
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  zIndex: 3,  // Added property
  assetId: 'asset-456'
}
```

### CSS Application
```css
.floating-text-box {
  position: absolute;
  z-index: var(--element-z-index);
}

.slot {
  position: absolute;
  z-index: var(--slot-z-index);
}
```

### UI Controls Styling
```css
/* Minimal white button design */
.layer-btn-minimal {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 300;
  line-height: 1;
  color: #1a1d23;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.layer-btn-minimal:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

/* Fixed position for slot controls */
.layer-controls-slot {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 100;
}

.slot:hover .layer-controls-slot {
  opacity: 1;
  pointer-events: auto;
}
```

## Use Cases

### Magazine Layout
- Place background image
- Add foreground image (bring to front)
- Add text overlay (bring to front)
- Create depth with layered elements

### Collage Effect
- Multiple overlapping images
- Adjust z-index to create visual interest
- Text elements weave between images

### Typography Focus
- Large background text (send to back)
- Smaller foreground text (bring to front)
- Images in middle layer

## Keyboard Shortcuts (Future)
- [ ] `Cmd/Ctrl + ]` - Bring to front
- [ ] `Cmd/Ctrl + [` - Send to back
- [ ] `Cmd/Ctrl + Shift + ]` - Bring forward one layer
- [ ] `Cmd/Ctrl + Shift + [` - Send backward one layer

## Known Limitations

1. **No Fine Control**: Only "to front" or "to back", no incremental layering
   - Future: Add "bring forward" and "send backward" for single-step changes

2. **No Layer Panel**: Can't see all elements and their order
   - Future: Add layers panel showing all elements with drag-to-reorder

3. **No Layer Locking**: Elements can be accidentally reordered
   - Future: Add lock icon to prevent z-index changes

## Testing Checklist

- [x] Text element bring to front works
- [x] Text element send to back works
- [x] Image slot bring to front works
- [x] Image slot send to back works
- [x] Z-index persists across page changes
- [x] Z-index saved in project JSON
- [x] Z-index preserved in PDF export
- [x] Controls appear in correct locations
- [x] Hover states work properly
- [x] No conflicts between text and slot z-indexes

## Future Enhancements

### Phase 1: Fine Control
- [ ] Bring forward (z-index + 1)
- [ ] Send backward (z-index - 1)
- [ ] Numeric z-index input

### Phase 2: Layer Panel
- [ ] Visual layer list
- [ ] Drag to reorder
- [ ] Layer visibility toggle
- [ ] Layer naming

### Phase 3: Advanced Features
- [ ] Layer groups
- [ ] Blend modes
- [ ] Opacity control
- [ ] Layer effects (shadow, glow)

---

**Created**: January 15, 2025  
**Status**: ✅ Complete and functional  
**Impact**: Enhanced creative control over element stacking
