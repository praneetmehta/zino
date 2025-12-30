# Unit Conversion Utility

## Overview

The `unitConversion.js` utility provides standardized conversion between millimeters and pixels throughout the Ziner application. This ensures consistency across all components and prevents hardcoded conversion factors.

## Conversion Factor

**1mm = 3.7795275591px** (at 96 DPI standard screen resolution)

## API

### `mmToPx(mm)`
Convert millimeters to pixels.
```js
import { mmToPx } from './utils/unitConversion'
const pixels = mmToPx(100) // 377.95px
```

### `pxToMm(px)`
Convert pixels to millimeters.
```js
import { pxToMm } from './utils/unitConversion'
const millimeters = pxToMm(377.95) // 100mm
```

### `toPx(value, unit)`
Convert a value to pixels based on its unit type.
```js
import { toPx } from './utils/unitConversion'
const pixels1 = toPx(100, 'mm')  // 377.95px
const pixels2 = toPx(100, 'px')  // 100px
```

### `getScaledDimensions(config, maxWidth)`
Get scaled dimensions for display, with automatic scaling if width exceeds maxWidth.
```js
import { getScaledDimensions } from './utils/unitConversion'

const config = {
  width: 148,
  height: 100,
  unit: 'mm'
}

const { widthPx, heightPx, scale } = getScaledDimensions(config, 600)
// Returns scaled dimensions that fit within 600px width
```

### `toScaledPx(value, unit, scale)`
Convert a value to scaled pixels for display.
```js
import { toScaledPx } from './utils/unitConversion'

const marginPx = toScaledPx(10, 'mm', 0.8) // 10mm * 3.779 * 0.8 = 30.24px
```

## Usage in Components

### Canvas.vue
```js
import { getScaledDimensions, toScaledPx } from '../utils/unitConversion'

// Get page dimensions
const pageStyle = computed(() => {
  const { widthPx, heightPx } = getScaledDimensions(zineStore.zineConfig, 600)
  return {
    width: `${widthPx}px`,
    height: `${heightPx}px`,
  }
})

// Convert margin for display
const marginPx = toScaledPx(config.margin, config.unit, scale)
```

### pdfExport.js
```js
import { toPx } from './unitConversion'

const pageDimensions = {
  width: toPx(zineConfig.width, zineConfig.unit),
  height: toPx(zineConfig.height, zineConfig.unit)
}
```

## Migration Status

### ✅ Completed
- `Canvas.vue` - pageStyle, pageWidthPx, pageHeightPx
- `pdfExport_old.js` - page dimensions and font size calculations
- Created centralized utility module

### 🔄 Pending
- Slot margin/gap calculations (to be implemented next)
- Any other components using hardcoded conversion factors

## Benefits

1. **Consistency**: Single source of truth for conversion factors
2. **Maintainability**: Easy to update conversion logic in one place
3. **Clarity**: Clear function names make code more readable
4. **Testability**: Utility functions can be easily unit tested
5. **Flexibility**: Easy to add support for other units (inches, points, etc.)

## Future Enhancements

- Add support for other units (inches, points, picas)
- Add DPI configuration for print vs screen
- Add validation and error handling
- Add unit tests for all conversion functions
