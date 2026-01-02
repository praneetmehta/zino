# Documentation Reorganization Plan

## Current State
We have 22+ markdown files scattered in the root directory, plus organized docs in `/docs` folder.

## Proposed Structure

```
docs/
├── README.md                          # Main documentation hub
├── getting-started/
│   ├── quick-start.md                # Local development setup
│   ├── deployment.md                 # Production deployment guide
│   └── oauth-setup.md                # OAuth configuration
├── architecture/
│   ├── overview.md                   # System architecture
│   ├── frontend.md                   # Frontend architecture
│   ├── backend.md                    # Backend architecture
│   └── database.md                   # Database schema
├── features/
│   ├── editor.md                     # Core editor features
│   ├── templates.md                  # Template system
│   ├── layouts.md                    # Layout system
│   ├── media.md                      # Media management
│   ├── export.md                     # PDF export
│   └── authentication.md             # Auth system
├── api/
│   ├── overview.md                   # API overview
│   ├── books.md                      # Books endpoints
│   ├── templates.md                  # Templates endpoints
│   ├── uploads.md                    # Upload endpoints
│   └── admin.md                      # Admin endpoints
├── development/
│   ├── contributing.md               # Contribution guidelines
│   ├── code-style.md                 # Code standards
│   └── testing.md                    # Testing guide
└── archive/
    ├── features/                     # Old feature docs
    ├── fixes/                        # Bug fix docs
    └── migration/                    # Migration docs
```

## Files to Consolidate

### Keep & Merge into Main Docs

**Architecture (→ `architecture/overview.md`)**
- ARCHITECTURE.md
- ARCHITECTURE_CORRECTED.md

**Getting Started (→ `getting-started/`)**
- QUICK_START.md
- OAUTH_QUICKSTART.md
- DEPLOYMENT_CHECKLIST.md
- PRODUCTION_SETUP.md

**Deployment (→ `getting-started/deployment.md`)**
- RAILWAY_DEPLOYMENT.md
- RAILWAY_POSTGRES_DEPLOYMENT.md
- RAILWAY_QUICK_START.md
- PRODUCTION_READY_SUMMARY.md

**OAuth Setup (→ `getting-started/oauth-setup.md`)**
- GOOGLE_OAUTH_SETUP.md
- GOOGLE_ONE_TAP_SETUP.md
- OAUTH_IMPLEMENTATION_SUMMARY.md
- AUTH_UI_GUIDE.md

**Features (→ `features/`)**
- TEMPLATES.md → features/templates.md
- GUTTER_BINDING.md → features/editor.md
- IMAGE_UPLOAD_IMPLEMENTATION.md → features/media.md

### Archive (Move to `archive/`)

**Completed Phases**
- PHASE_1_COMPLETE.md
- FINAL_SUMMARY.md
- PRODUCTION_READY_SUMMARY.md

**Specific Fixes**
- CORS_FIX.md
- docs/fixes/DARK_MODE_FIX.md

**Migration Docs**
- docs/migration/MIGRATION.md
- docs/migration/MIGRATION_COMPLETE.md

**Feature Implementation Docs**
- docs/features/CONTEXT_MENU.md
- docs/features/LANDING_PAGE.md
- docs/features/LAYER_CONTROLS.md
- docs/features/LAYOUT_BUILDER.md
- docs/features/LIBRARY_MODAL.md
- docs/features/MEDIA_POOL_ENHANCEMENTS.md
- docs/features/PDF_EXPORT_PROGRESS.md
- frontend/BUGFIXES.md

### Keep in Root
- README.md (main project readme)
- README_PRODUCTION.md (can merge into getting-started/deployment.md)

## Implementation Steps

1. ✅ Create new directory structure
2. ✅ Create comprehensive main docs
3. ✅ Move and consolidate files
4. ✅ Update cross-references
5. ✅ Archive old docs
6. ✅ Update root README to point to docs
7. ✅ Delete redundant files

## Benefits

- **Single source of truth** for each topic
- **Easier to maintain** - no duplicate info
- **Better discoverability** - logical hierarchy
- **Cleaner root directory** - only essential files
- **Historical record** - archived docs preserved
