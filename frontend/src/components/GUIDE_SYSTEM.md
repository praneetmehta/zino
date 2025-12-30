# Visual Guide System

**Date**: December 30, 2024  
**Enhancement**: Added per-slot margin guides to complement page-level guides

---

## Overview

The guide system provides visual indicators for different spacing zones in the zine editor, helping users understand margins, bleed areas, and slot boundaries.

---

## Guide Levels

### 1. Page-Level Guides (on `.page`)

These guides are positioned absolutely on the page and show overall page boundaries:

#### **Bleed Guide** (Red Dashed)
```css
.guide-bleed {
  border: 1px dashed rgba(239, 68, 68, 0.8);
}
```
- **Purpose**: Shows the trim line where the page will be cut after printing
- **Position**: Inset by `bleed` value from page edges
- **Use Case**: Ensures no important content is within the bleed zone

#### **Margin Guide** (Green Dashed)
```css
.guide-margin {
  border: 1px dashed rgba(34, 197, 94, 0.8);
}
```
- **Purpose**: Shows the safe area where content should stay
- **Position**: Inset by `bleed + margin` from page edges
- **Use Case**: The overall content boundary for the entire page

#### **Fold Guide** (Vertical Center Line)
```css
.guide-fold {
  position: absolute;
  left: 50%;
  width: 1px;
  background: rgba(139, 92, 246, 0.4);
}
```
- **Purpose**: Shows where the page will be folded
- **Position**: Center of the page (50%)
- **Use Case**: Helps align content across the fold line

---

### 2. Slot-Level Guides (on `.slot`)

These guides are positioned on individual slots to show their margin boundaries:

#### **Outer Margin Guide** (Green Dashed) - **NEW**
```css
.slot-outer-margin-guide {
  position: absolute;
  inset: 0;
  border: 1px dashed rgba(34, 197, 94, 0.7);
  border-radius: 2px;
}
```
- **Purpose**: Shows the actual slot boundary with applied margins
- **Position**: Covers the entire slot area (inset: 0)
- **Display Condition**: Only when `zineStore.ui.showGuides` is true AND `margin > 0`
- **Use Case**: Visualizes where each placeholder starts/ends with margins applied
- **Color**: Green (matches the page margin guide color)

#### **Inner Margin Guide** (Blue Dashed)
```css
.slot-inner-margin-guide {
  position: absolute;
  border: 1px dashed rgba(59, 130, 246, 0.6);
}
```
- **Purpose**: Shows padding inside the slot (innerMarginPx property)
- **Position**: Inset by `slot.innerMarginPx` pixels
- **Display Condition**: Only when `showGuides` is true AND `innerMarginPx > 0`
- **Use Case**: Per-slot padding for fine-tuning content spacing within a placeholder
- **Color**: Blue (different from outer margin)

---

## Visual Hierarchy

When guides are enabled, you'll see:

```
┌─────────────────────────────────────────┐
│ Page                                    │
│  ┌─── Red (Bleed) ──────────────────┐  │
│  │ ┌─ Green (Page Margin) ────────┐ │  │
│  │ │  ┌─ Green (Slot) ──┐  gap  ┌─│─┤  │
│  │ │  │ ┌ Blue (Inner)─┐│       │ │ │  │
│  │ │  │ │   Content   ││       │ │ │  │
│  │ │  │ └─────────────┘│       │ │ │  │
│  │ │  └─────────────────┘       └─┘ │  │
│  │ └──────────────────────────────┘ │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Legend:**
- **Red**: Bleed area (will be trimmed)
- **Green (outer)**: Safe margins (page-level and slot-level)
- **Blue**: Inner slot padding
- **Gap**: Space between slots (2× margin)

---

## Implementation

### HTML Structure

```vue
<div class="page">
  <!-- Page-level guides -->
  <div v-if="showGuides" class="guides">
    <div class="guide guide-bleed" :style="bleedGuideStyle"></div>
    <div class="guide guide-margin" :style="marginGuideStyle"></div>
    <div class="guide guide-fold"></div>
  </div>
  
  <div class="page-inner">
    <!-- Slot with guides -->
    <div class="slot" :style="getSlotStyle(slot)">
      <!-- Outer margin guide (NEW) -->
      <div v-if="showGuides && margin" class="slot-outer-margin-guide"></div>
      
      <!-- Inner margin guide -->
      <div v-if="showGuides && slot.innerMarginPx" 
           class="slot-inner-margin-guide" 
           :style="{ inset: `${slot.innerMarginPx}px` }">
      </div>
      
      <div class="slot-inner">
        <!-- Content here -->
      </div>
    </div>
  </div>
</div>
```

### Toggle Guides

Users can toggle guides on/off via:
1. **Header switch**: "Guides" toggle in the header
2. **Keyboard shortcut**: ⌘K → Type "guides"
3. **Store method**: `zineStore.toggleGuides()`

---

## Export Behavior

**All guides are hidden during PDF export:**

```css
.export-mode .guides,
.export-mode .slot-outer-margin-guide,
.export-mode .slot-inner-margin-guide {
  display: none !important;
}
```

This ensures clean PDF output without any guide overlays.

---

## Benefits

### Before Enhancement
- ✗ Only page-level margin guide visible
- ✗ Couldn't see individual slot boundaries
- ✗ Hard to visualize gaps between adjacent slots
- ✗ Unclear where margins were actually applied

### After Enhancement
- ✅ Each slot has its own boundary guide
- ✅ Easy to see margin spacing between slots
- ✅ Visual confirmation of the 2× margin gap
- ✅ Clear distinction between page margin and slot margins
- ✅ Color-coded guides (green for margins, blue for padding)

---

## Use Cases

### 1. **Setting Up Margins**
- Turn on guides
- Adjust margin value in Page Settings
- See green outlines around each slot update in real-time
- Verify gaps between slots are correct (2× margin value)

### 2. **Debugging Layout Issues**
- If slots appear too close or overlapping
- Enable guides to see actual boundaries
- Check if margins are applied correctly

### 3. **Fine-Tuning Slot Padding**
- Adjust `innerMarginPx` for individual slots
- Blue guide shows the padding zone inside the slot
- Independent from the outer green margin guide

### 4. **Print Preparation**
- Red bleed guide shows trim area
- Green page margin shows overall safe zone
- Green slot guides show placeholder boundaries
- Ensures content won't be cut off

---

## Color Reference

| Color | Guide Type | Purpose |
|-------|-----------|---------|
| 🔴 Red | Bleed | Trim line (will be cut) |
| 🟢 Green | Page Margin | Overall safe area |
| 🟢 Green | Slot Outer | Slot boundary with margin |
| 🔵 Blue | Slot Inner | Padding inside slot |
| 🟣 Purple | Fold Line | Center crease |

---

## Technical Notes

### Why Green for Both Page and Slot Margins?
- Both represent "safe zones" / "margin areas"
- Consistent color helps users understand they serve similar purposes
- Different opacity helps distinguish them
- Page margin: `rgba(34, 197, 94, 0.8)` (80% opacity)
- Slot margin: `rgba(34, 197, 94, 0.7)` (70% opacity)

### Z-Index Layering
```
z-index: 10 - Page-level guides
z-index: 5  - Slot-level guides  
z-index: 0  - Content
```

This ensures guides always appear above content but page guides are above slot guides.

---

## Future Enhancements

Potential improvements:
- [ ] Customizable guide colors
- [ ] Guide thickness options
- [ ] Hover to highlight specific guide type
- [ ] Keyboard shortcut to cycle through guide levels
- [ ] Guide opacity slider
- [ ] Option to show/hide specific guide types independently

---

**Status**: ✅ Implemented and Tested
