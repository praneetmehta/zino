# Landing Page Integration

## Overview
The Ziner app now features a creative landing page that serves as the entry point, replacing the immediate InitModal popup with a more engaging user experience.

## Features

### Landing Page (`LandingPage.vue`)
- **Hero Section**: Compelling headline with preview cards showing layout examples
- **Action Cards**: Four main navigation options
  - **Blank Canvas**: Start a new book with postcard presets
  - **Library**: Browse and load saved books from backend
  - **Layout Builder**: External link to layout documentation
  - **Guides & Examples**: Documentation and best practices

### Navigation Flow
```
Landing Page (view='landing')
    ↓
    ├─→ Create New → Init Modal (view='init') → Editor (view='editor')
    ├─→ Load Book → Backend List → Editor (view='editor')
    ├─→ Layout Builder → External Link
    └─→ Docs → External Link
```

### View States
The app uses a `view` ref to manage three states:
- **`landing`**: Shows LandingPage component
- **`init`**: Shows InitModal for project configuration
- **`editor`**: Shows full editor workspace (Header, Canvas, Panels)

## Backend Integration

### Save Flow
1. User clicks "Save to Library" in Header
2. Prompts for book ID and title
3. Sends payload to `POST /books` with:
   - `id`: Unique book identifier
   - `title`: Human-readable title
   - `data`: Complete project JSON (zineConfig, pages, mediaAssets)
   - `metadata`: Page count, media count
4. Updates `projectMeta` in store with saved info
5. Displays "last saved" timestamp in Header

### Load Flow
1. User clicks "Load from Library" (Landing or Header)
2. Fetches book list from `GET /books`
3. Displays prompt with formatted list (id, title, last updated)
4. User selects book ID
5. Fetches full book from `GET /books/:id`
6. Imports data into store via `importFromJSON()`
7. Navigates to editor view

## UI Enhancements

### Header Updates
- **Back Button**: "← Menu" button appears when `showBack` prop is true
- **Project Info**: Shows title and "Saved X mins ago" when available
- **Docs Button**: Quick access to documentation
- **Loading States**: Save/Load buttons show progress indicators

### Theme Integration
- Landing page respects light/dark theme from store
- Theme toggle available in landing header
- Smooth transitions between views

## File Structure
```
src/
├── components/
│   ├── LandingPage.vue       # New landing page
│   ├── Header.vue             # Updated with back button
│   ├── InitModal.vue          # Unchanged, now postcard default
│   └── ...
├── App.vue                    # View routing logic
└── api/
    └── books.js               # Backend API client
```

## Key Changes in App.vue

### State Management
```javascript
const view = ref('landing') // landing | init | editor
const isSaving = ref(false)
const isLoadingRemote = ref(false)
```

### Navigation Functions
- `startNewProject()`: landing → init
- `goHome()`: any → landing (resets store)
- `handleInitialize()`: init → editor
- `handleLoad()`: any → editor (after loading)
- `handleSave()`: saves and stays in editor

### Computed Properties
- `lastSavedSummary`: Formatted string for landing page display

## Design Philosophy

### Creative & Expressive
- Gradient backgrounds with subtle image overlay
- Preview cards showing real layout examples
- Engaging copy that emphasizes experimentation
- Modern glassmorphism effects

### User-Centric
- Clear call-to-action buttons
- Loading states for async operations
- Last saved project info for quick resume
- Breadcrumb navigation (back button)

### Future-Ready
- Placeholder for layout builder (external link for now)
- Extensible card grid for new features
- Backend-first architecture

## Testing Checklist

- [ ] Landing page loads with correct theme
- [ ] "Create a Book" navigates to InitModal
- [ ] "Open from Library" shows book list
- [ ] Loading a book populates editor correctly
- [ ] Back button returns to landing and resets state
- [ ] Save flow updates "last saved" timestamp
- [ ] Theme toggle works on landing page
- [ ] External links open in new tab
- [ ] Responsive layout on mobile/tablet

## Known Limitations

1. **Payload Size**: Large projects with many base64 images may exceed backend limit (currently 150MB)
   - **Solution**: Increase `JSON_BODY_LIMIT` env var or implement media compression
2. **Prompt-Based Selection**: Load flow uses `window.prompt()` for book selection
   - **Future**: Replace with modal UI component
3. **No Search/Filter**: Book list shows all books unsorted
   - **Future**: Add search, tags, date filters

## Environment Variables

```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:4876

# Backend (server/.env or inline)
PORT=4876
JSON_BODY_LIMIT=150mb
```

## Next Steps

### Phase 1: UX Polish
- Replace prompts with modal dialogs
- Add book thumbnails/previews
- Implement search and filtering
- Add keyboard shortcuts (Cmd+N, Cmd+O)

### Phase 2: Backend Enhancements
- Add book tags and categories
- Implement version history
- Add collaborative features
- Cloud storage for media assets

### Phase 3: Layout Builder
- Visual layout composer
- Drag-and-drop grid builder
- Export custom layouts to JSON
- Share layouts with community

---

**Last Updated**: 2025-01-15  
**Status**: ✅ Complete and functional
