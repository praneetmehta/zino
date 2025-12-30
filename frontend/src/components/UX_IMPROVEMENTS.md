# UX Improvements & User Prompts

**Date**: December 30, 2024  
**Focus**: Enhanced user guidance and unsaved changes protection

---

## 1. InitModal Enhancements

### Added Informative Help Text

**Modal Description:**
- Added subtitle explaining settings can be adjusted later

**Page Dimensions:**
- Changed label from "Page Dimensions" to "Page Dimensions (Full Spread)"
- Added highlighted info box: 💡 "For folded zines, enter the **full spread size** (both pages side-by-side), not individual page size."
- Uses blue accent background with border to stand out

**Bleed Field:**
- Enhanced description: "Extra space around the page edges that will be trimmed after printing. Standard is 3mm."

**Margin Field:**
- Changed label to "Margin (Safe Area)"
- Enhanced description: "Keep content within this distance from edges. Creates spacing between placeholders and around page edges. Typical: 5-10mm."

### Visual Changes
```vue
<p class="modal-description">
  Configure your zine's dimensions and spacing. 
  All settings can be adjusted later.
</p>

<small class="info-text">
  💡 For folded zines, enter the <strong>full spread size</strong> 
  (both pages side-by-side), not individual page size.
</small>
```

---

## 2. PageSettings Enhancements

### Margin Explanation

Updated margin help text to be more comprehensive:

```vue
<p class="help-text">
  <strong>How margins work:</strong><br>
  • Creates spacing around page edges<br>
  • Creates gaps between adjacent placeholders (2× margin)<br>
  • Typical values: 5-10mm for print, 10-20px for digital
</p>
```

**Key Points Explained:**
- Edge spacing behavior
- Gap calculation (2× margin between slots)
- Recommended values for different use cases

---

## 3. Unsaved Changes Warning System

### Browser-Level Protection

**beforeunload Event:**
- Warns user when closing tab/window with unsaved changes
- Standard browser dialog appears
- Only triggers if changes exist and project is initialized

```javascript
const handleBeforeUnload = (e) => {
  if (hasUnsavedChanges.value && zineStore.isInitialized) {
    e.preventDefault()
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return e.returnValue
  }
}
```

### In-App Navigation Protection

**Protected Actions:**
1. **Going Home** - "You have unsaved changes. Return to home anyway?"
2. **Starting New Project** - "You have unsaved changes. Start a new project anyway?"

Both require confirmation if unsaved changes exist.

### Change Tracking

**Watched Properties:**
```javascript
watch(
  () => [zineStore.pages, zineStore.mediaAssets, zineStore.zineConfig],
  () => {
    if (zineStore.isInitialized && view.value === 'editor') {
      hasUnsavedChanges.value = true
    }
  },
  { deep: true }
)
```

**Reset Conditions:**
- After successful save
- After loading a project
- After initializing new project
- After confirming discard

---

## 4. Visual Unsaved Indicator

### Header Badge

**Location:** Header info bar, after "Saved" timestamp

**Display:**
```
"Project Name" • Saved 5 mins ago • ● Unsaved
                                    ^^^^^^^^^
                                    Orange with pulse
```

**Visual Features:**
- Orange color (#f59e0b) for attention
- Pulsing dot animation (2s cycle)
- Tooltip: "You have unsaved changes"

**CSS Animation:**
```css
.unsaved-dot {
  color: #f59e0b;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## User Flow Examples

### Scenario 1: Creating New Zine
1. User sees clear instructions about full spread size
2. Margin explanation helps set appropriate values
3. User creates pages and edits content
4. Header shows "● Unsaved" indicator
5. User clicks "💾 Save to Library"
6. Indicator disappears, "Saved just now" appears

### Scenario 2: Attempting to Leave
1. User makes changes (unsaved indicator appears)
2. User clicks browser close button
3. Browser shows: "You have unsaved changes. Are you sure you want to leave?"
4. User can cancel or proceed

### Scenario 3: Starting Fresh
1. User is editing a project (unsaved changes)
2. User clicks "← Menu" in header
3. Dialog: "You have unsaved changes. Return to home anyway?"
4. User chooses "Cancel" → stays in editor
5. User saves, then clicks "← Menu" again
6. No warning, goes directly to landing page

---

## Benefits

✅ **Reduced Data Loss**: Multiple layers of protection prevent accidental work loss  
✅ **Clear Guidance**: Users understand dimensions, margins, and their effects  
✅ **Visual Feedback**: Always know save status at a glance  
✅ **Non-Intrusive**: Warnings only appear when necessary  
✅ **Consistent UX**: Familiar browser-standard dialogs

---

## Technical Implementation

### Files Modified

1. **InitModal.vue**
   - Added modal description
   - Enhanced field labels and help text
   - Added info-text styling for highlighted tips

2. **PageSettings.vue**
   - Expanded margin help text
   - Added bullet points explaining behavior

3. **App.vue**
   - Added `hasUnsavedChanges` reactive state
   - Implemented deep watch on store data
   - Added `beforeunload` event listener
   - Added confirmation dialogs to navigation
   - Reset flag on save/load/init

4. **Header.vue**
   - Added `hasUnsavedChanges` prop
   - Added unsaved indicator display
   - Added pulse animation CSS

---

## Future Enhancements

Potential improvements:
- [ ] Auto-save draft to localStorage
- [ ] Show last auto-save time
- [ ] Undo/redo functionality
- [ ] Dirty indicator per page
- [ ] Save shortcut (Cmd+S / Ctrl+S)
- [ ] Replace prompts with custom modal dialogs
- [ ] Save status: "Saving..." → "Saved!" animation

---

## Testing Checklist

- [x] Warning appears when closing tab with unsaved changes
- [x] Warning appears when navigating home with unsaved changes  
- [x] Warning appears when starting new project with unsaved changes
- [x] No warning after saving
- [x] No warning on fresh project load
- [x] Unsaved indicator visible in header
- [x] Indicator disappears after save
- [x] Help text visible and readable in InitModal
- [x] Margin explanation clear in PageSettings

---

**Status**: ✅ Complete and Tested
