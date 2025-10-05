/**
 * DEPRECATED: This file is being phased out in favor of JSON-based layouts.
 * 
 * All layouts have been migrated to individual JSON files in:
 * src/layouts/definitions/{category}/{layout-id}.json
 * 
 * The new system uses:
 * - layoutLoader.js for dynamic imports
 * - schema.json for validation
 * - Individual JSON files for each layout
 * 
 * This file is kept temporarily for backward compatibility.
 * It will be removed in a future version.
 * 
 * Please use: import { layoutDefinitions, layoutCategories } from '../layouts/layoutLoader'
 */

console.warn('⚠️ layoutDefinitions.js is deprecated. Use layoutLoader.js instead.')

// Re-export from the new loader for backward compatibility
export { layoutDefinitions, layoutCategories, getLayoutById } from './layoutLoader'
