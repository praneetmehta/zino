# Element Context Menu

## Overview
Unified floating context menu that consolidates all element controls into a clean side panel, replacing scattered inline controls for a cleaner, more organized UI.

## Problem Solved
**Before**: Multiple overlapping controls on each element (fit toggle, color picker, margin slider, layer buttons) made the canvas cluttered and hard to use.

**After**: Click any element to open a comprehensive context menu on the right side with all relevant controls organized by category.

## Features

### Unified Control Panel
- **Single Location**: All controls in one floating panel
- **Context-Aware**: Shows only relevant controls for selected element type
- **Clean Canvas**: No overlapping buttons or controls on elements
- **Better Space Usage**: Sidebar doesn't interfere with canvas

### Element Selection
- **Click to Select**: Click any slot or text element to select it
- **Visual Feedback**: Selected elements show accent border and glow
- **Hover States**: Elements highlight on hover to indicate clickability

### Context Menu Sections

#### For All Elements
- **Layer Controls**: Bring to Front / Send to Back
- **Delete Button**: Remove element

#### For Image Slots
- **Image Fit**: Toggle between Cover and Contain
- **Background Color**: Color picker with clear option
- **Inner Margin**: Slider control (0-100px)

#### For Text Elements
- **Font**: Dropdown with Sans Serif, Serif, Display, System fonts
- **Size & Weight**: Number input and weight selector
- **Alignment**: Left, Center, Right buttons
- **Colors**: Text color and background color pickers

## Implementation

### Component Structure
```
ElementContextMenu.vue
├── Menu Header (title + close button)
├── Menu Body (scrollable)
│   ├── Layer Section (all elements)
│   ├── Element-Specific Sections
│   │   ├── Slot Controls (fit, color, margin)
│   │   └── Text Controls (font, size, alignment, colors)
│   └── Delete Section
└── Slide-in Animation
```

### Selection Logic
```javascript
// Slot selection
const selectSlot = (pageId, index) => {
  selectedElement.value = page.slots[index]
  selectedElementType.value = 'slot'
  selectedElementRef.value = { pageId, index }
  contextMenuVisible.value = true
}

// Text selection
const selectTextElement = (pageId, elementId) => {
  selectedElement.value = textElement
  selectedElementType.value = 'text'
  selectedElementRef.value = { pageId, elementId }
  contextMenuVisible.value = true
}
```

### Event Handlers
All context menu actions route through centralized handlers:
- `handleContextBringToFront()` - Layer management
- `handleContextSendToBack()` - Layer management
- `handleContextToggleFit()` - Slot-specific
- `handleContextSetBackgroundColor()` - Slot-specific
- `handleContextSetInnerMargin()` - Slot-specific
- `handleContextUpdateStyle()` - Text-specific
- `handleContextDelete()` - Element removal

## User Experience

### Workflow
1. User clicks on image slot or text element
2. Element gets selected (visual highlight)
3. Context menu slides in from right
4. User adjusts settings in organized sections
5. Changes apply immediately
6. Click close or another element to dismiss

### Visual Design
- **Position**: Fixed right side, 280px width
- **Animation**: Slide-in from right with fade
- **Backdrop**: Blur effect with transparency
- **Sections**: Clearly labeled with dividers
- **Controls**: Consistent styling across all inputs

## Benefits

### Cleaner UI
- No overlapping controls on canvas
- Elements are clearly visible
- Reduced visual clutter
- Professional appearance

### Better Organization
- Controls grouped by function
- Logical section ordering
- Consistent layout
- Easy to scan

### Improved Workflow
- Single place for all controls
- No hunting for buttons
- Clear visual hierarchy
- Faster editing

### Scalability
- Easy to add new element types
- Consistent pattern for all elements
- Extensible architecture
- Future-proof design

## Technical Details

### State Management
```javascript
const contextMenuVisible = ref(false)
const selectedElement = ref(null)
const selectedElementType = ref(null) // 'slot' or 'text'
const selectedElementRef = ref(null) // { pageId, index/elementId }
```

### CSS Classes
```css
.slot.selected {
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.slot:hover {
  border-color: var(--accent);
  border-style: solid;
  cursor: pointer;
}
```

### Component Props
```javascript
{
  isVisible: Boolean,
  selectedElement: Object,
  elementType: String, // 'slot' or 'text'
  position: Object // { right, top }
}
```

### Component Events
```javascript
[
  'close',
  'bring-to-front',
  'send-to-back',
  'toggle-fit',
  'set-background-color',
  'set-inner-margin',
  'update-style',
  'delete'
]
```

## Removed Components

### Inline Slot Controls (Removed)
- Fit toggle button
- Layer control buttons
- Color picker group
- Inner margin slider

**Result**: ~50 lines of template code removed, cleaner DOM structure

### Benefits of Removal
- Faster rendering (fewer DOM nodes)
- No z-index conflicts
- Cleaner export (no controls to hide)
- Better performance

## Future Enhancements

### Phase 1: Enhanced Selection
- [ ] Multi-select (Shift+Click)
- [ ] Select all of type
- [ ] Deselect on canvas click
- [ ] Keyboard navigation (Tab)

### Phase 2: Context Menu Features
- [ ] Duplicate element button
- [ ] Copy/paste style
- [ ] Element info (size, position)
- [ ] Quick presets

### Phase 3: Advanced Controls
- [ ] Opacity slider
- [ ] Rotation control
- [ ] Border/stroke options
- [ ] Shadow effects

### Phase 4: Layout Builder Integration
When layout builder is implemented, the context menu will support:
- [ ] Custom overlay elements
- [ ] Shape controls
- [ ] Group management
- [ ] Component library

## Testing Checklist

- [x] Click slot opens context menu
- [x] Click text opens context menu
- [x] Selected element shows visual highlight
- [x] Context menu shows correct controls for element type
- [x] Layer controls work (bring to front/send to back)
- [x] Slot controls work (fit, color, margin)
- [x] Text controls work (font, size, alignment, colors)
- [x] Delete button removes element
- [x] Close button dismisses menu
- [x] Clicking another element switches selection
- [x] Menu slides in/out smoothly
- [x] Controls don't appear during PDF export

## Files Modified

### Created
- `src/components/ElementContextMenu.vue` - New context menu component

### Modified
- `src/components/Canvas.vue`
  - Added context menu state management
  - Added selection handlers
  - Added context menu event handlers
  - Removed inline slot controls
  - Added ElementContextMenu component to template
  - Updated slot click to trigger selection
  - Updated text edit to trigger selection
  - Added `.selected` CSS class

---

**Created**: January 15, 2025  
**Status**: ✅ Complete and functional  
**Impact**: Major UX improvement, cleaner UI, better organization
