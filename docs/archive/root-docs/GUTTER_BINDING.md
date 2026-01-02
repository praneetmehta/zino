# Gutter & Binding Implementation

## Overview

Zino now supports **gutter margins** for flat/stapled binding. The gutter is a binding margin added to the left edge of each page during PDF export, ensuring content doesn't get lost in the binding.

## Binding Types

### **Folded Binding** (`bindingType: 'folded'`)
- Traditional accordion/zine fold
- No gutter needed
- Pages fold naturally
- UI: Single column view

### **Flat Binding** (`bindingType: 'flat'`)
- Stapled, perfect bound, or spiral bound
- **Requires gutter margin** on left edge
- All pages bind on the same edge
- UI: Spread view (2 pages side-by-side)

## Configuration

### **Gutter Setting**
```javascript
zineConfig: {
  bindingType: 'flat',      // or 'folded'
  gutter: 0.25,             // inches (default: 0.25")
  // ... other settings
}
```

### **Default Values**
- **Gutter**: `0.25 inches` (6.35mm) - industry standard
- **Applied**: Only when `bindingType === 'flat'`
- **Location**: Left edge of every page

## Implementation Details

### **1. Store Configuration**
- Added `gutter` to `zineConfig` in `zineStore.js`
- Default: `0.25 inches`
- Persisted in project JSON

### **2. PDF Export (Export Only)**
The gutter is **only applied during PDF generation**, not in the UI:

#### **pdfExport.js** (Download PDF)
```javascript
// Calculate gutter in mm
const gutterMm = zineConfig.bindingType === 'flat' 
  ? (zineConfig.gutter || 0.25) * 25.4  // Convert inches to mm
  : 0

// Increase PDF width by gutter amount
const pdfWidth = width + gutterMm
const pdfHeight = height

// Offset content to the right
const xOffset = gutterMm
pdf.addImage(imgData, 'PNG', xOffset, 0, width, height)
```

#### **pdfPublish.js** (Publish to server)
- Same gutter logic as pdfExport.js
- Ensures published PDFs are print-ready

### **3. UI Behavior**
- ✅ **No gutter in editor** - users design freely
- ✅ **Gutter added at export** - automatic print preparation
- ✅ **Spread view** - shows pages side-by-side for flat binding
- ✅ **Single column** - shows pages stacked for folded binding

## Page Layout

### **Folded Binding**
```
┌─────────────┐
│   Page 1    │  No gutter
│   Content   │
└─────────────┘
┌─────────────┐
│   Page 2    │  No gutter
│   Content   │
└─────────────┘
```

### **Flat Binding (Export)**
```
┌──┬──────────┐
│G │ Page 1   │  Gutter on left
│U │ Content  │
│T │          │
│T │          │
│E │          │
│R │          │
└──┴──────────┘
┌──┬──────────┐
│G │ Page 2   │  Gutter on left
│U │ Content  │
│T │          │
│T │          │
│E │          │
│R │          │
└──┴──────────┘
```

## Print Specifications

### **Standard Gutter Sizes**
- **Stapled**: 0.25" (6.35mm)
- **Perfect Bound**: 0.375" (9.5mm)
- **Spiral Bound**: 0.5" (12.7mm)

### **PDF Output**
When `bindingType === 'flat'`:
- Page width = Design width + Gutter
- Content offset = Gutter amount
- All pages have left-edge binding margin
- Print-ready for commercial printers

## User Workflow

1. **Design** - Create pages without worrying about binding
2. **Configure** - Set `bindingType` to `flat` or `folded`
3. **Export** - Gutter automatically added for flat binding
4. **Print** - PDF is ready for commercial printing

## Future Enhancements

### **Optional: Print Preview Mode**
Add a toggle to show gutter in UI:
```javascript
ui: {
  showPrintPreview: false  // Toggle to preview gutter
}
```

### **Optional: Custom Gutter Per Page**
For advanced users who need different gutter on specific pages:
```javascript
page: {
  customGutter: 0.5  // Override default gutter
}
```

### **Optional: Gutter UI Control**
Add gutter slider to InitModal or Settings:
```html
<input 
  v-model.number="config.gutter" 
  type="number" 
  step="0.125"
  min="0"
  max="1"
/>
```

## Technical Notes

- Gutter is always measured in **inches** internally
- Converted to **mm** for PDF generation
- Applied as **left margin** (normalized binding edge)
- Does not affect UI rendering or canvas dimensions
- Automatically included in published PDFs

## Testing

To test gutter implementation:

1. Create a new project with `bindingType: 'flat'`
2. Add content close to the left edge
3. Export to PDF
4. Check PDF dimensions: should be `width + gutter`
5. Check content offset: should be shifted right by gutter amount
6. Verify left edge has blank margin for binding

## Print Shop Compatibility

The normalized single-edge binding approach is compatible with:
- ✅ Blurb
- ✅ Lulu
- ✅ Mixam
- ✅ PrintNinja
- ✅ Local print shops
- ✅ Any standard perfect/stapled binding service

Just upload the PDF and specify binding type!
