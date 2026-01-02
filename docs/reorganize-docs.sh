#!/bin/bash

# Documentation Reorganization Script
# This script moves old documentation files to the archive

echo "📚 Starting documentation reorganization..."

# Create archive directories if they don't exist
mkdir -p docs/archive/features
mkdir -p docs/archive/fixes
mkdir -p docs/archive/migration
mkdir -p docs/archive/root-docs

# Move root-level docs to archive
echo "Moving root-level documentation to archive..."
mv ARCHITECTURE.md docs/archive/root-docs/ 2>/dev/null
mv ARCHITECTURE_CORRECTED.md docs/archive/root-docs/ 2>/dev/null
mv AUTH_UI_GUIDE.md docs/archive/root-docs/ 2>/dev/null
mv CORS_FIX.md docs/archive/root-docs/ 2>/dev/null
mv DEPLOYMENT_CHECKLIST.md docs/archive/root-docs/ 2>/dev/null
mv FINAL_SUMMARY.md docs/archive/root-docs/ 2>/dev/null
mv GOOGLE_OAUTH_SETUP.md docs/archive/root-docs/ 2>/dev/null
mv GOOGLE_ONE_TAP_SETUP.md docs/archive/root-docs/ 2>/dev/null
mv GUTTER_BINDING.md docs/archive/root-docs/ 2>/dev/null
mv IMAGE_UPLOAD_IMPLEMENTATION.md docs/archive/root-docs/ 2>/dev/null
mv OAUTH_IMPLEMENTATION_SUMMARY.md docs/archive/root-docs/ 2>/dev/null
mv OAUTH_QUICKSTART.md docs/archive/root-docs/ 2>/dev/null
mv PHASE_1_COMPLETE.md docs/archive/root-docs/ 2>/dev/null
mv PRODUCTION_READY_SUMMARY.md docs/archive/root-docs/ 2>/dev/null
mv PRODUCTION_SETUP.md docs/archive/root-docs/ 2>/dev/null
mv QUICK_START.md docs/archive/root-docs/ 2>/dev/null
mv RAILWAY_DEPLOYMENT.md docs/archive/root-docs/ 2>/dev/null
mv RAILWAY_POSTGRES_DEPLOYMENT.md docs/archive/root-docs/ 2>/dev/null
mv RAILWAY_QUICK_START.md docs/archive/root-docs/ 2>/dev/null
mv README_PRODUCTION.md docs/archive/root-docs/ 2>/dev/null
mv TEMPLATES.md docs/archive/root-docs/ 2>/dev/null

# Move existing docs/features to archive
echo "Moving feature docs to archive..."
mv docs/features/COMPREHENSIVE_GUIDES.md docs/archive/features/ 2>/dev/null
mv docs/features/CONTEXT_MENU.md docs/archive/features/ 2>/dev/null
mv docs/features/LANDING_PAGE.md docs/archive/features/ 2>/dev/null
mv docs/features/LAYER_CONTROLS.md docs/archive/features/ 2>/dev/null
mv docs/features/LAYOUT_BUILDER.md docs/archive/features/ 2>/dev/null
mv docs/features/LIBRARY_MODAL.md docs/archive/features/ 2>/dev/null
mv docs/features/MEDIA_POOL_ENHANCEMENTS.md docs/archive/features/ 2>/dev/null
mv docs/features/PDF_EXPORT_PROGRESS.md docs/archive/features/ 2>/dev/null

# Move fixes to archive
echo "Moving fix docs to archive..."
mv docs/fixes/DARK_MODE_FIX.md docs/archive/fixes/ 2>/dev/null

# Move migration docs to archive
echo "Moving migration docs to archive..."
mv docs/migration/MIGRATION.md docs/archive/migration/ 2>/dev/null
mv docs/migration/MIGRATION_COMPLETE.md docs/archive/migration/ 2>/dev/null

# Move frontend bugfixes
echo "Moving frontend bugfixes to archive..."
mv frontend/BUGFIXES.md docs/archive/fixes/ 2>/dev/null

# Clean up empty directories
rmdir docs/features 2>/dev/null
rmdir docs/fixes 2>/dev/null
rmdir docs/migration 2>/dev/null

echo "✅ Documentation reorganization complete!"
echo ""
echo "📁 New structure:"
echo "  docs/"
echo "    ├── README.md (main hub)"
echo "    ├── getting-started/"
echo "    ├── architecture/"
echo "    ├── features/"
echo "    ├── api/"
echo "    ├── development/"
echo "    └── archive/ (old docs preserved)"
echo ""
echo "Next steps:"
echo "1. Review docs/README.md"
echo "2. Create remaining documentation files"
echo "3. Update root README.md to link to docs/"
echo "4. Commit changes"
