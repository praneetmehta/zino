# Comprehensive Guide System

## Overview
Enhanced guide system that shows multiple types of guides when enabled, including page bleed, margin, center fold lines, and slot inner margins.

## Guide Types

### 1. Page Bleed Guide (Red)
- **Color**: `rgba(239, 68, 68, 0.8)` - Red
- **Style**: 1px dashed border
- **Purpose**: Shows the outer boundary where content will be trimmed
- **Position**: Outer edge of page

### 2. Page Margin Guide (Green)
- **Color**: `rgba(34, 197, 94, 0.8)` - Green
- **Style**: 1px dashed border
- **Purpose**: Shows the safe area where important content should stay
- **Position**: Inside the bleed area

### 3. Center Fold Guide (Red)
- **Color**: `rgba(239, 68, 68, 0.6)` - Red (semi-transparent)
- **Style**: 1px solid lines
- **Purpose**: Shows where the page will fold in the center
- **Position**: Vertical and horizontal center lines

### 4. Slot Margin Guide (Blue)
- **Color**: `rgba(59, 130, 246, 0.6)` - Blue
- **Style**: 1px dashed border
- **Purpose**: Shows the inner margin/padding of image slots
- **Position**: Inside each slot (only when innerMarginPx > 0)
- **Visibility**: Only shown when guides are enabled AND slot has margin

## Toggle Behavior

**When Guides Enabled** (showGuides = true):
- ✅ Page bleed guide visible
- ✅ Page margin guide visible
- ✅ Center fold lines visible
- ✅ Slot margin guides visible (if slot has margin)

**When Guides Disabled** (showGuides = false):
- ❌ All guides hidden
- Clean canvas view

## Visual Hierarchy

```
Page
├── Bleed Guide (Red, outermost)
├── Margin Guide (Green, inside bleed)
├── Fold Guide (Red, center cross)
└── Slots
    └── Margin Guide (Blue, inside slot)
```

## Color Coding

| Guide Type | Color | Meaning |
|------------|-------|---------|
| Bleed | Red | Danger zone - will be trimmed |
| Margin | Green | Safe zone - keep content here |
| Fold | Red | Center fold line |
| Slot Margin | Blue | Image padding area |

## Implementation

### Template
```vue
<div v-if="zineStore.ui.showGuides" class="guides">
  <div class="guide guide-bleed" :style="bleedGuideStyle"></div>
  <div class="guide guide-margin" :style="marginGuideStyle"></div>
  <div class="guide guide-fold"></div>
</div>

<!-- Inside each slot -->
<div 
  v-if="zineStore.ui.showGuides && slot.innerMarginPx > 0" 
  class="slot-margin-guide" 
  :style="{ inset: `${slot.innerMarginPx}px` }"
></div>
```

### CSS
```css
/* Page guides */
.guide-bleed { 
  border-color: rgba(239, 68, 68, 0.8);
  border-width: 1px;
}

.guide-margin { 
  border-color: rgba(34, 197, 94, 0.8);
  border-width: 1px;
}

/* Fold lines (center cross) */
.guide-fold::before {
  /* Vertical center line */
  left: 50%;
  width: 1px;
  background: rgba(239, 68, 68, 0.6);
}

.guide-fold::after {
  /* Horizontal center line */
  top: 50%;
  height: 1px;
  background: rgba(239, 68, 68, 0.6);
}

/* Slot margin guide */
.slot-margin-guide {
  border: 1px dashed rgba(59, 130, 246, 0.6);
  pointer-events: none;
  z-index: 5;
}
```

## Use Cases

### Print Design
- **Bleed guide**: Ensures images extend beyond trim line
- **Margin guide**: Keeps text and important elements safe
- **Fold guide**: Helps align content across the fold

### Digital Layout
- **Margin guide**: Consistent padding
- **Slot margin**: Visual feedback for image padding
- **Fold guide**: Symmetry reference

### Quality Control
- Check if images reach bleed
- Verify text stays within margins
- Ensure fold-sensitive content is positioned correctly
- Confirm slot padding is consistent

## Benefits

### Professional Workflow
- Industry-standard guide system
- Clear visual feedback
- Prevents common print errors

### User Experience
- Toggle all guides with one button
- Color-coded for easy identification
- Non-intrusive (pointer-events: none)

### Print-Ready
- Bleed and margin guides match print standards
- Fold line helps with booklet/zine layout
- Reduces need for manual checking

## Future Enhancements

### Phase 1: Customization
- [ ] Adjustable guide colors
- [ ] Toggle individual guide types
- [ ] Custom guide positions

### Phase 2: Smart Guides
- [ ] Snap to guides
- [ ] Alignment guides between elements
- [ ] Distribution guides

### Phase 3: Advanced Features
- [ ] Ruler measurements
- [ ] Grid overlay
- [ ] Custom guide creation

---

**Created**: January 15, 2025  
**Status**: ✅ Complete and functional  
**Impact**: Professional print-ready guide system
