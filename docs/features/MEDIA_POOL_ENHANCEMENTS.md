# Media Pool Usage Indicator

## Overview
Enhanced the Media Pool to visually indicate which images are currently in use across all pages.

## Features

### Visual Indicators

#### 1. **Green Border Highlight**
- Images in use display a smooth green border (`#10b981`)
- 3px outset glow effect with subtle transparency
- Smooth transition animation (0.3s ease)

#### 2. **Usage Badge**
- Green badge in top-right corner
- Shows checkmark (✓) and usage count
- Example: "✓ 3" means image used 3 times
- Only appears on images currently in use

### Technical Implementation

#### Usage Detection
```javascript
const isAssetInUse = (assetId) => {
  return zineStore.pages.some(page => 
    page.slots.some(slot => String(slot.assetId) === String(assetId))
  )
}
```

#### Usage Count
```javascript
const getAssetUsageCount = (assetId) => {
  let count = 0
  zineStore.pages.forEach(page => {
    page.slots.forEach(slot => {
      if (String(slot.assetId) === String(assetId)) {
        count++
      }
    })
  })
  return count
}
```

### Styling

#### Border & Shadow
```css
.media-item.in-use {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15), 
              var(--shadow-sm), 
              inset 0 1px 0 rgba(255,255,255,0.1);
}
```

#### Usage Badge
```css
.usage-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}
```

## User Benefits

### 1. **Visual Feedback**
- Instantly see which images are placed in the zine
- Identify unused assets at a glance
- Understand image reuse patterns

### 2. **Asset Management**
- Safely delete unused images
- Avoid accidentally removing images in use
- Track popular/frequently used assets

### 3. **Workflow Efficiency**
- No need to check each page manually
- Quick visual scan of media pool
- Better organization of assets

## Use Cases

### Scenario 1: Cleaning Up
User has uploaded 20 images but only used 8. The green borders make it easy to identify and delete the 12 unused images.

### Scenario 2: Reuse Tracking
User wants to know if an image appears multiple times. The badge shows "✓ 4" indicating it's used on 4 different slots.

### Scenario 3: Safe Deletion
User hovers over delete button. Green border warns them the image is in use, preventing accidental removal.

## Design Choices

### Color: Green (#10b981)
- **Positive indicator**: Green = "in use" = good
- **Contrast**: Stands out against light/dark themes
- **Accessibility**: High contrast ratio
- **Consistency**: Matches success states elsewhere

### Border Style
- **2px solid**: Thin but visible
- **Outset glow**: 3px rgba shadow for depth
- **Smooth transition**: 0.3s ease for polish

### Badge Position
- **Top-right**: Doesn't obscure image
- **Above overlay**: z-index 10
- **Pointer-events none**: Doesn't interfere with drag

## Performance

### Reactive Updates
- Usage check runs on every render
- Computed per asset (not cached globally)
- Efficient: O(pages × slots) per asset
- Acceptable for typical zine sizes (< 50 pages)

### Optimization Opportunities
For very large projects (100+ pages):
- Cache usage map in store
- Update on slot changes only
- Use computed property for entire map

## Testing Checklist

- [x] Unused images have no border/badge
- [x] Images in use show green border
- [x] Badge shows correct count
- [x] Border appears when image dropped
- [x] Border disappears when image removed
- [x] Count updates when image reused
- [x] Smooth transition animations
- [x] Works in light/dark themes
- [x] Badge doesn't interfere with drag
- [x] Delete button still accessible

## Future Enhancements

### Phase 1: Enhanced Indicators
- [ ] Different colors for usage intensity (1 use vs 5+ uses)
- [ ] Tooltip showing which pages use the image
- [ ] Click badge to highlight pages using image

### Phase 2: Smart Filtering
- [ ] Filter: Show only used images
- [ ] Filter: Show only unused images
- [ ] Sort by usage count

### Phase 3: Bulk Operations
- [ ] Select all unused images
- [ ] Bulk delete unused
- [ ] Export only used images

## Code Changes

### Modified Files
- `src/components/MediaPanel.vue`
  - Added `isAssetInUse()` function
  - Added `getAssetUsageCount()` function
  - Added `.in-use` class binding
  - Added usage badge element
  - Updated styles for border and badge

### Lines Changed
- Template: +3 lines (badge element, class binding)
- Script: +15 lines (usage functions)
- Style: +17 lines (border, badge styles)

---

**Created**: January 15, 2025  
**Status**: ✅ Complete and functional  
**Impact**: Improved asset management UX
