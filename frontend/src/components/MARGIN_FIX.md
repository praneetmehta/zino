# Margin Implementation Fix

**Date**: December 30, 2024  
**Issue**: Margins were only applied to outer edges, not between adjacent slots

---

## Problem

Previously, margins were applied using CSS insets on the `.page-inner` container:
```javascript
pageInnerStyle: {
  top: `${(bleed + margin) / height * 100}%`,
  left: `${(bleed + margin) / width * 100}%`,
  // ...
}
```

This created margin around the **entire page content**, but slots positioned at 0-50% and 50-100% were directly adjacent with no gap between them.

**Visual Before:**
```
┌─────────────────────────┐
│ Page                    │
│  ┌──────────────────┐   │ ← margin (container inset)
│  │ ┌──────┬──────┐  │   │
│  │ │Slot1 │Slot2 │  │   │ ← NO GAP
│  │ └──────┴──────┘  │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

---

## Solution

Applied margins at the **individual slot level** using CSS `calc()`:

### Changes Made

**1. Updated `getSlotStyle()` function:**
```javascript
const getSlotStyle = (slot) => {
  const { scale } = getScaledDimensions(cfg, 600)
  const marginPx = toScaledPx(cfg.margin, cfg.unit, scale)
  
  return {
    left: `calc(${slot.x}% + ${marginPx}px)`,
    top: `calc(${slot.y}% + ${marginPx}px)`,
    width: `calc(${slot.width}% - ${marginPx * 2}px)`,
    height: `calc(${slot.height}% - ${marginPx * 2}px)`,
  }
}
```

**2. Updated `pageInnerStyle()` function:**
- Removed margin from insets
- Now only applies bleed values
```javascript
const pageInnerStyle = computed(() => {
  // Apply only bleed insets (margins now handled per-slot)
  const topInset = (bleedTop / cfg.height) * 100
  // ... (no longer includes cfg.margin)
})
```

### How It Works

Each slot now gets:
- **Margin added** to its position: `x% + marginPx`
- **2× margin subtracted** from its size: `width% - 2×marginPx`

This creates:
- **Single margin** at outer edges (margin from page edge)
- **Double margin gaps** between adjacent slots (margin + margin = 2× gap)

**Visual After:**
```
┌─────────────────────────┐
│ Page                    │
│  ┌margin──────margin┐   │ ← bleed only
│  │  ┌────┐ gap ┌────┐  │
│  │  │Slot1│    │Slot2│  │ ← 2× margin gap
│  │  └────┘    └────┘  │
│  └──────────────────┘   │
└─────────────────────────┘
```

---

## Benefits

✅ **Universal**: Works for all layouts (2-col, 3-col, grids, custom)  
✅ **Automatic gaps**: No need to modify layout definitions  
✅ **WYSIWYG**: PDF export captures the rendered result via html2canvas  
✅ **Maintainable**: Single function handles all margin logic  
✅ **Uses unit conversion utility**: Leverages the standardized `toScaledPx()` function

---

## Math Example

For a postcard with 10mm margin on a 148mm width page:

**Slot 1 (x: 0%, width: 50%):**
- `left: calc(0% + 10mm) = 10mm from left edge`
- `width: calc(50% - 20mm) = 74mm - 20mm = 54mm wide`
- Ends at: 10mm + 54mm = 64mm

**Slot 2 (x: 50%, width: 50%):**
- `left: calc(50% + 10mm) = 74mm + 10mm = 84mm from left edge`
- `width: calc(50% - 20mm) = 74mm - 20mm = 54mm wide`
- Ends at: 84mm + 54mm = 138mm (10mm from right edge)

**Gap between slots:** 84mm - 64mm = **20mm** (2× the 10mm margin) ✓

---

## Files Modified

- `frontend/src/components/Canvas.vue`
  - `getSlotStyle()` - Added per-slot margin application
  - `pageInnerStyle()` - Removed margin from insets (bleed only)

---

## Testing

To test, set a margin value (e.g., 10mm) in Page Settings and verify:
- Equal margin from page edges to content
- Double margin gap between adjacent slots
- PDF export matches canvas display
