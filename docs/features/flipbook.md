# Flipbook Generation Algorithm

## Overview

The flipbook feature provides an interactive 3D page-turning preview of zines. It supports both **folded** and **flat** binding modes with different page layout strategies.

## Brief Pseudocode

```
FUNCTION generateFlipbook(pages, bindingMode):
  IF bindingMode == FOLDED:
    FOR EACH page IN pages:
      Split page into [leftHalf, rightHalf]
      Create flipbookPage showing rightHalf on front
      Set back to show leftHalf of NEXT page
  ELSE IF bindingMode == FLAT:
    FOR i = 0 TO pages.length STEP 2:
      leftPage = pages[i]      // Odd page (1, 3, 5...)
      rightPage = pages[i+1]   // Even page (2, 4, 6...)
      Create flipbookPage showing rightPage on front
      Set back to show NEXT leftPage
    IF pages.length is ODD:
      Add empty page placeholder
  
  RETURN flipbookPages
```

## Detailed Algorithm

### 1. Initialization

```
INPUT:
  - pages: Array of editor pages
  - zineConfig: { width, height, bindingType, ... }

OUTPUT:
  - flipbookPages: Array of renderable flipbook pages
  - rightPageContents: Map of page front content
  - backPageContents: Map of page back content
```

### 2. Binding Mode Detection

```
FUNCTION isFoldedMode():
  RETURN zineConfig.bindingType === 'folded'

BINDING MODES:
  - FOLDED: Each editor page represents a full spread (2 physical pages)
  - FLAT: Each editor page represents a single physical page
```

### 3. Dimension Calculations

```
FUNCTION calculateDimensions(zineConfig, bindingMode):
  editorPageWidth = zineConfig.width
  height = zineConfig.height
  
  IF bindingMode == FOLDED:
    // Editor width IS the full spread
    fullSpreadWidth = editorPageWidth      // e.g., 148mm
    singlePageWidth = editorPageWidth / 2  // e.g., 74mm
  ELSE:
    // Editor width IS a single page
    singlePageWidth = editorPageWidth      // e.g., 100mm
    fullSpreadWidth = editorPageWidth * 2  // e.g., 200mm
  
  // Calculate display scale
  maxDisplayWidth = bindingMode == FOLDED ? 600px : 900px
  scale = maxDisplayWidth / fullSpreadWidth
  
  openWidthPx = fullSpreadWidth * scale
  closedWidthPx = singlePageWidth * scale
  displayHeightPx = height * scale
  
  RETURN { openWidthPx, closedWidthPx, displayHeightPx, scale }
```

### 4. Page Rendering (Parallel Processing)

```
FUNCTION renderPages(pages):
  pageImages = {}
  concurrency = 3  // Render 3 pages at a time
  
  FOR i = 0 TO pages.length STEP concurrency:
    batch = pages.slice(i, i + concurrency)
    
    // Render batch in parallel
    promises = batch.map(page => capturePage(page.id))
    results = AWAIT Promise.all(promises)
    
    // Store results
    FOR EACH (page, result) IN zip(batch, results):
      IF result IS NOT NULL:
        pageImages[page.id] = result
  
  RETURN pageImages

FUNCTION capturePage(pageId):
  pageElement = querySelector(`.page-canvas[data-page-id="${pageId}"]`)
  
  // Prepare for capture
  pageElement.classList.add('export-mode')
  hideGuides(pageElement)
  handleImagePositioning(pageElement)
  
  // Capture with html2canvas
  canvas = AWAIT html2canvas(pageElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  
  // Cleanup
  restoreGuides(pageElement)
  restoreImagePositioning(pageElement)
  pageElement.classList.remove('export-mode')
  
  RETURN canvas.toDataURL('image/png')
```

### 5. Content Generation - Folded Mode

```
FUNCTION generateFoldedContent(pages, pageImages):
  rightContents = {}
  backContents = {}
  
  // Front cover
  rightContents['cover-page'] = renderCoverPage()
  
  // Back of cover shows LEFT HALF of first page
  IF pages.length > 0:
    firstPageImage = pageImages[pages[0].id]
    backContents['cover-page'] = cropImage(firstPageImage, 
      position: 'left',     // Show left 50%
      width: '200%',        // Image is 2x container width
      objectPosition: '0% 0%'
    )
  
  // Process each editor page
  FOR EACH (page, index) IN pages:
    pageImage = pageImages[page.id]
    
    // RIGHT HALF on front
    rightContents[page.id] = cropImage(pageImage,
      position: 'right',          // Show right 50%
      width: '200%',              // Image is 2x container width
      objectPosition: '100% 0%',  // Align right
      marginLeft: '-100%'         // Shift to show right half
    )
    
    // LEFT HALF of NEXT page on back
    nextIndex = index + 1
    IF nextIndex < pages.length:
      nextPageImage = pageImages[pages[nextIndex].id]
      backContents[page.id] = cropImage(nextPageImage,
        position: 'left',
        width: '200%',
        objectPosition: '0% 0%'
      )
    ELSE:
      // Last page - show back cover
      backContents[page.id] = renderBackCover()
  
  RETURN { rightContents, backContents }
```

### 6. Content Generation - Flat Mode

```
FUNCTION generateFlatContent(pages, pageImages):
  rightContents = {}
  backContents = {}
  
  // Front cover
  rightContents['cover-page'] = renderCoverPage()
  
  // Back of cover shows FULL first page
  IF pages.length > 0:
    firstPageImage = pageImages[pages[0].id]
    backContents['cover-page'] = showFullImage(firstPageImage)
  
  // Process pages in pairs
  FOR i = 0 TO pages.length STEP 2:
    leftPageIndex = i      // Pages 1, 3, 5... (index 0, 2, 4...)
    rightPageIndex = i + 1 // Pages 2, 4, 6... (index 1, 3, 5...)
    
    leftPage = pages[leftPageIndex]
    rightPage = pages[rightPageIndex]
    
    IF rightPage EXISTS:
      // Use right page as flipbook page key
      rightPageImage = pageImages[rightPage.id]
      
      // Show FULL right page on front
      rightContents[rightPage.id] = showFullImage(rightPageImage)
      
      // Show NEXT left page on back
      nextLeftPageIndex = i + 2
      nextLeftPage = pages[nextLeftPageIndex]
      
      IF nextLeftPage EXISTS:
        nextLeftImage = pageImages[nextLeftPage.id]
        backContents[rightPage.id] = showFullImage(nextLeftImage)
      ELSE:
        // No more pages - show back cover
        backContents[rightPage.id] = renderBackCover()
  
  // Handle odd number of pages
  IF pages.length % 2 == 1:
    lastPage = pages[pages.length - 1]
    emptyPageId = 'empty-page-' + lastPage.id
    
    // Show empty page on front
    rightContents[emptyPageId] = renderEmptyPage()
    
    // Show back cover on back
    backContents[emptyPageId] = renderBackCover()
  
  RETURN { rightContents, backContents }
```

### 7. Flipbook Pages Filtering

```
FUNCTION getFlipbookPages(pages, bindingMode, rightContents):
  IF bindingMode == FOLDED:
    // All pages are rendered
    RETURN pages
  ELSE:
    // Only pages with rightContents are rendered
    filteredPages = pages.filter(page => 
      rightContents[page.id] EXISTS
    )
    
    // Add dummy page for odd count
    IF pages.length % 2 == 1:
      lastPage = pages[pages.length - 1]
      dummyPage = {
        id: 'empty-page-' + lastPage.id,
        isEmpty: true
      }
      filteredPages.push(dummyPage)
    
    RETURN filteredPages
```

### 8. Book Container Positioning

```
FUNCTION calculateBookPosition(pageIndex, flipbookPages, dimensions):
  { openWidthPx, closedWidthPx } = dimensions
  
  isBackCover = pageIndex > flipbookPages.length
  
  IF pageIndex == 0:
    // Front cover: spine at left edge
    translateX = -closedWidthPx
    clipPath = bindingMode == FOLDED ? 'inset(0 0 0 50%)' : 'none'
  
  ELSE IF isBackCover:
    // Back cover: spine at right edge
    translateX = closedWidthPx
    clipPath = 'none'
  
  ELSE:
    // Open book: spine at center
    translateX = 0
    clipPath = 'none'
  
  RETURN {
    width: openWidthPx,
    transform: `translateX(${translateX}px)`,
    clipPath: clipPath,
    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
  }
```

### 9. Page Flip Animation

```
FUNCTION getRightPageStyle(pageIndex, currentPageIndex, totalPages):
  // Z-index calculation for stacking order
  IF pageIndex == currentPageIndex:
    zIndex = totalPages * 2  // Current page on top
  ELSE IF pageIndex < currentPageIndex:
    zIndex = pageIndex  // Flipped pages behind
  ELSE:
    zIndex = totalPages * 2 - (pageIndex - currentPageIndex)  // Future pages
  
  // Rotation for flipped pages
  rotation = pageIndex < currentPageIndex ? -180deg : 0deg
  
  RETURN {
    zIndex: zIndex,
    transform: `rotateY(${rotation}deg)`,
    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  }
```

## Data Flow Diagram

```
┌─────────────────┐
│  Editor Pages   │
│  (zineStore)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Detect Binding  │
│ Mode (Folded/   │
│ Flat)           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calculate       │
│ Dimensions      │
│ (spread width,  │
│ page width)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Render Pages    │
│ (Parallel       │
│ html2canvas)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate        │
│ Content Maps    │
│ (right/back)    │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌────────┐      ┌──────────┐     ┌──────────┐
    │ Folded │      │   Flat   │     │  Empty   │
    │  Mode  │      │   Mode   │     │   Page   │
    │ (Split │      │  (Full   │     │ (Odd     │
    │ Pages) │      │  Pages)  │     │  Count)  │
    └────┬───┘      └─────┬────┘     └─────┬────┘
         │                │                 │
         └────────┬───────┴─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Filter Flipbook │
         │ Pages           │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Render 3D       │
         │ Flipbook with   │
         │ Animations      │
         └─────────────────┘
```

## Page Layout Examples

### Folded Mode (6 pages)

```
Editor Pages: [P1, P2, P3, P4, P5, P6]
Each page is a full spread (148mm wide)

Flipbook Spreads:
1. Cover → [P1-left | P1-right]
2. [P1-right | P2-left] → [P2-left | P2-right]
3. [P2-right | P3-left] → [P3-left | P3-right]
4. [P3-right | P4-left] → [P4-left | P4-right]
5. [P4-right | P5-left] → [P5-left | P5-right]
6. [P5-right | P6-left] → [P6-left | P6-right]
7. [P6-right | Back Cover]

Total: 7 flipbook pages
```

### Flat Mode (6 pages)

```
Editor Pages: [P1, P2, P3, P4, P5, P6]
Each page is a single page (100mm wide)

Flipbook Spreads:
1. Cover → [P1 | P2]
2. [P2 | P3] → [P3 | P4]
3. [P4 | P5] → [P5 | P6]
4. [P6 | Back Cover]

Total: 4 flipbook pages
```

### Flat Mode (5 pages - odd count)

```
Editor Pages: [P1, P2, P3, P4, P5]

Flipbook Spreads:
1. Cover → [P1 | P2]
2. [P2 | P3] → [P3 | P4]
3. [P4 | P5] → [P5 | Empty]
4. [Empty | Back Cover]

Total: 4 flipbook pages
```

## Performance Optimizations

### 1. Parallel Rendering
- Render 3 pages concurrently using `Promise.all`
- Prevents browser from being overwhelmed
- 3x faster than sequential rendering

### 2. Efficient Image Handling
- Use `html2canvas` with scale: 2 (balance quality/performance)
- PNG format for lossless quality
- Cache rendered images in memory

### 3. Smart Content Generation
- Only generate content for pages that will be rendered
- Filter pages based on binding mode
- Lazy load page content on demand

### 4. CSS Optimizations
- Use `transform` for animations (GPU accelerated)
- `backface-visibility: hidden` for smooth flips
- `will-change` hints for browser optimization

## Edge Cases

### 1. Empty Zine
```
IF pages.length == 0:
  Show only cover and back cover
```

### 2. Single Page
```
IF pages.length == 1:
  Folded: Show as split spread
  Flat: Show page + empty page + back cover
```

### 3. Very Large Zines (50+ pages)
```
Consider pagination or virtual scrolling
Current implementation loads all pages upfront
```

### 4. Image Loading Failures
```
IF capturePage returns NULL:
  Show placeholder with page number
  Continue rendering other pages
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (with CORS considerations)
- **Mobile**: Supported but may be slower

## Future Enhancements

1. **Virtual Rendering**: Only render visible pages
2. **Progressive Loading**: Show low-res preview first
3. **Thumbnail Navigation**: Jump to specific pages
4. **Zoom Controls**: Zoom in/out on pages
5. **Sound Effects**: Page turn sounds
6. **Texture Overlays**: Paper texture effects

---

*Last updated: January 2026*
