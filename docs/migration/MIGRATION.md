# Layout System Migration Guide

This guide explains the migration from JavaScript-based layout definitions to JSON-based layouts.

## Overview

The layout system has been migrated from:
- **Old**: Single JavaScript file (`layoutDefinitions.js`) with all layouts
- **New**: Individual JSON files in categorized folders with dynamic loading

## Benefits

### 1. **Modularity**
- Each layout is a separate file
- Easy to add, modify, or remove layouts
- Better version control (smaller diffs)

### 2. **Schema Validation**
- JSON Schema ensures data consistency
- Validation errors caught at load time
- Type safety for layout properties

### 3. **Hot Module Replacement**
- Vite automatically reloads changed layouts
- No app restart needed during development
- Faster iteration cycle

### 4. **Future-Ready**
- Backend can serve layouts dynamically
- Community layouts can be loaded remotely
- Layout gallery integration ready

## Migration Status

### ✅ Completed
- [x] JSON Schema specification created
- [x] Layout loader with Vite glob imports
- [x] All 18 layouts migrated to JSON
- [x] Canvas.vue updated to use new loader
- [x] Documentation (README, LAYOUT_SPEC, MIGRATION)
- [x] PlantUML architecture diagrams
- [x] Old `layoutDefinitions.js` replaced with deprecation notice

### 🚧 Recommended Next Steps
- [ ] Add unit tests for layout validation
- [ ] Create layout preview thumbnails
- [ ] Test all layouts in production build

### 📋 Remaining Layouts to Migrate

#### Basic Category
- [x] full-page.json
- [x] two-horizontal.json
- [x] two-vertical.json

#### Editorial Category
- [x] three-column.json
- [x] two-thirds-left.json
- [x] two-thirds-right.json
- [x] asymmetric-grid.json
- [x] sidebar-left.json
- [x] sidebar-right.json

#### Grid Category
- [x] grid-2x2.json
- [x] grid-3x3.json
- [x] grid-2x3.json
- [x] hero-bottom.json

#### Combined Category
- [x] halloween-spread.json
- [x] hero-caption.json
- [x] split-screen.json
- [x] minimalist-feature.json
- [x] editorial-stack.json

✅ **All layouts migrated!**

## How to Migrate a Layout

### Step 1: Create JSON File

Create a new file in the appropriate category folder:
```
src/layouts/definitions/{category}/{layout-id}.json
```

### Step 2: Convert JavaScript to JSON

**Old Format (layoutDefinitions.js):**
```javascript
{
  id: 'my-layout',
  name: 'My Layout',
  icon: '⬜',
  slots: [
    {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      type: 'image',
    }
  ]
}
```

**New Format (my-layout.json):**
```json
{
  "id": "my-layout",
  "name": "My Layout",
  "icon": "⬜",
  "category": "basic",
  "slots": [
    {
      "x": 0,
      "y": 0,
      "width": 100,
      "height": 100,
      "type": "image"
    }
  ]
}
```

**Key Changes:**
1. Use double quotes for all strings
2. Remove trailing commas
3. Add `"category"` field
4. Remove JavaScript comments

### Step 3: Test the Layout

1. Start the dev server: `npm run dev`
2. Check browser console for validation errors
3. Test layout in the UI
4. Verify PDF export works correctly

### Step 4: Remove from Old File

Once confirmed working, remove the layout from `layoutDefinitions.js`.

## Validation

Layouts are automatically validated on load using the JSON Schema at `src/layouts/schema.json`.

Common validation errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `Layout must have an id` | Missing required field | Add `"id"` property |
| `x must be between 0 and 100` | Invalid coordinate | Check slot positions |
| `Duplicate IDs` | Same ID used twice | Use unique layout IDs |
| `Invalid category` | Wrong category name | Use: basic, editorial, grid, combined |

Check the browser console for detailed validation messages.

## Testing Checklist

For each migrated layout:

- [ ] Layout appears in correct category
- [ ] Icon displays correctly
- [ ] Slots render in correct positions
- [ ] Images can be dropped into slots
- [ ] Text elements appear if included
- [ ] PDF export works without errors
- [ ] No console errors or warnings

## Rollback Plan

If issues occur, the old system can be restored:

1. Revert Canvas.vue import:
```javascript
import { layoutDefinitions, layoutCategories } from '../layouts/layoutDefinitions'
```

2. Keep `layoutDefinitions.js` until full migration complete

3. Both systems can coexist during transition

## Future Enhancements

After migration is complete:

### Phase 1: Cleanup
- Remove `layoutDefinitions.js`
- Add comprehensive validation tests
- Create layout preview thumbnails

### Phase 2: Tooling
- CLI tool to generate layouts
- Visual layout builder
- Layout validation script

### Phase 3: Backend Integration
- API to fetch community layouts
- User-submitted layouts
- Layout versioning system

## Questions?

For issues or questions about migration:
1. Check `LAYOUT_SPEC.md` for format details
2. Review sample layouts in `definitions/` folders
3. Check browser console for validation errors
4. Refer to JSON Schema: `schema.json`

---

**Last Updated**: 2025-01-15  
**Migration Status**: ✅ 100% Complete

All 18 layouts have been successfully migrated to JSON format!
